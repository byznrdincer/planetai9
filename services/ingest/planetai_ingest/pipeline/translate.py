"""Machine-translate events between Turkish and English (Google Cloud Translation v2).

Design notes
------------
* The original text always stays on the ``events`` row. A translation lives in
  ``event_translations`` keyed by ``(event_id, target_lang)``. A missing or failed
  translation therefore never hides a story — the API just serves the original.
* Translation runs as its own ingest pass (CLI ``translate`` / scheduler job), not
  on page load. Results are cached in the DB until the source text changes
  (tracked with ``source_hash``).
* No credentials in code: the API key comes from ``PLANETAI_GOOGLE_TRANSLATE_API_KEY``.
  Unset ⇒ this module is a no-op.
* We ask Google for ``format=text`` and pass the source language explicitly so
  names, numbers and dates are preserved and no HTML is invented.
"""

from __future__ import annotations

import hashlib
import logging
from datetime import UTC, datetime, timedelta

import httpx
from planetai_shared.db import models
from planetai_shared.db.base import session_scope
from planetai_shared.settings import get_settings
from sqlalchemy import select
from sqlalchemy.orm import Session

log = logging.getLogger(__name__)

_API_URL = "https://translation.googleapis.com/language/translate/v2"
_SEP = "\n\n"
_BODY_CHAR_CAP = 12_000  # keep per-event cost bounded; longer bodies are truncated
_LANG_PAIR = {"tr": "en", "en": "tr"}
_SKIP_CATEGORIES = {"Research"}


class TranslateError(RuntimeError):
    pass


def _hash(*parts: str | None) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update((p or "").encode("utf-8"))
        h.update(b"\x1f")
    return h.hexdigest()


def _translate_batch(texts: list[str], source: str, target: str, api_key: str) -> list[str]:
    """Translate a list of strings in one request. Order is preserved."""
    if not any(t.strip() for t in texts):
        return list(texts)
    try:
        resp = httpx.post(
            _API_URL,
            params={"key": api_key},
            json={"q": texts, "source": source, "target": target, "format": "text"},
            timeout=httpx.Timeout(30.0, connect=8.0),
        )
    except httpx.HTTPError as exc:  # network / timeout
        raise TranslateError(f"request failed: {exc}") from exc
    if resp.status_code != 200:
        raise TranslateError(f"HTTP {resp.status_code}: {resp.text[:300]}")
    try:
        out = [t["translatedText"] for t in resp.json()["data"]["translations"]]
    except (KeyError, ValueError) as exc:
        raise TranslateError(f"unexpected response: {resp.text[:300]}") from exc
    if len(out) != len(texts):
        raise TranslateError("translation count mismatch")
    return out


def _translate_event(event: models.Event, target: str, api_key: str) -> dict:
    source = event.lang or "en"
    body = (event.body_text or "")[:_BODY_CHAR_CAP]
    segments = [s for s in body.split(_SEP) if s.strip()]

    payload = [event.title or "", event.summary or "", *segments]
    translated = _translate_batch(payload, source=source, target=target, api_key=api_key)

    title_t, summary_t, *body_parts = translated
    return {
        "title": title_t or None,
        "summary": summary_t or None,
        "body_text": _SEP.join(body_parts) if body_parts else None,
    }


def _candidates(db: Session, since: datetime, max_attempts: int) -> list[models.Event]:
    """Events that still need a translation into their opposite language.

    Only two languages exist, so the wanted translation row is always the one
    whose ``target_lang`` differs from the event's own ``lang``.
    """
    tr = models.EventTranslation
    done = select(tr.event_id).where(
        tr.event_id == models.Event.id,
        tr.target_lang != models.Event.lang,
        tr.status == "done",
    )
    exhausted = select(tr.event_id).where(
        tr.event_id == models.Event.id,
        tr.target_lang != models.Event.lang,
        tr.status == "failed",
        tr.attempts >= max_attempts,
    )
    stmt = (
        select(models.Event)
        .where(
            models.Event.status == "active",
            models.Event.lang.in_(list(_LANG_PAIR)),
            models.Event.last_activity_at >= since,
            models.Event.category.not_in(_SKIP_CATEGORIES),
            ~done.exists(),
            ~exhausted.exists(),
        )
        .order_by(models.Event.last_activity_at.desc())
    )
    return list(db.scalars(stmt).all())


def run(limit: int = 60) -> dict:
    """One translation pass. Returns a small stats dict."""
    settings = get_settings()
    stats = {"done": 0, "failed": 0, "skipped": 0}
    api_key = settings.google_translate_api_key
    if not api_key:
        log.info("translate: PLANETAI_GOOGLE_TRANSLATE_API_KEY unset — skipping")
        stats["skipped"] = 1
        return stats

    since = datetime.now(UTC) - timedelta(days=settings.translate_max_age_days)
    with session_scope() as db:
        events = _candidates(db, since, settings.translate_max_attempts)[:limit]
        log.info("translate: %d candidate event(s)", len(events))

        for event in events:
            target = _LANG_PAIR[event.lang]
            fp = _hash(event.title, event.summary, event.body_text)
            row = db.get(models.EventTranslation, (event.id, target))
            if row is None:
                row = models.EventTranslation(event_id=event.id, target_lang=target)
                db.add(row)
            if row.status == "done" and row.source_hash == fp:
                continue  # already fresh

            try:
                fields = _translate_event(event, target, api_key)
            except TranslateError as exc:
                row.status = "failed"
                row.attempts = (row.attempts or 0) + 1
                row.error = str(exc)[:1000]
                stats["failed"] += 1
                log.warning("translate %s -> %s failed: %s", event.slug, target, exc)
                db.flush()
                continue

            row.title = fields["title"]
            row.summary = fields["summary"]
            row.body_text = fields["body_text"]
            row.status = "done"
            row.attempts = (row.attempts or 0) + 1
            row.error = None
            row.source_hash = fp
            stats["done"] += 1
            db.flush()

    log.info("translate pass complete: %s", stats)
    return stats
