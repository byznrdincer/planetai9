"""Match a freshly-parsed article to an existing Event, or signal 'new'."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from planetai_shared.db import models
from planetai_shared.settings import get_settings
from rapidfuzz import fuzz
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_ingest.text import clean_url, hamming

_settings = get_settings()


@dataclass(slots=True)
class ArticleDraft:
    title: str
    canonical_url: str
    simhash: int
    published_at: datetime
    anchor_entity_ids: frozenset[str]  # title-level entity ids


def find_event(db: Session, draft: ArticleDraft) -> models.Event | None:
    lookback = draft.published_at - timedelta(hours=_settings.dedup_lookback_hours)
    now_window = draft.published_at + timedelta(hours=_settings.dedup_lookback_hours)

    # 1. exact canonical url already ingested → reuse its event
    url = clean_url(draft.canonical_url)
    exact = db.scalar(
        select(models.Article).where(
            models.Article.canonical_url == url, models.Article.event_id.isnot(None)
        )
    )
    if exact is not None:
        return db.get(models.Event, exact.event_id)

    candidates = db.scalars(
        select(models.Event)
        .where(
            models.Event.status == "active",
            models.Event.last_activity_at >= lookback,
            models.Event.first_seen_at <= now_window,
        )
        .order_by(models.Event.last_activity_at.desc())
        .limit(200)
    ).all()

    title_thresh = _settings.dedup_title_similarity * 100
    for ev in candidates:
        # 2. strong title similarity within 48h
        sim = fuzz.token_set_ratio(draft.title.lower(), ev.title.lower())
        close_time = abs((draft.published_at - ev.last_activity_at).total_seconds()) <= 48 * 3600
        if sim >= title_thresh and close_time:
            return ev

        # 3. simhash near-duplicate + shared anchor entity
        if draft.anchor_entity_ids and draft.simhash:
            ev_anchor = {
                str(r)
                for r in db.scalars(
                    select(models.EventEntity.entity_id).where(
                        models.EventEntity.event_id == ev.id,
                        models.EventEntity.role == "primary",
                    )
                ).all()
            }
            if draft.anchor_entity_ids & ev_anchor:
                for art in db.scalars(
                    select(models.Article).where(
                        models.Article.event_id == ev.id, models.Article.dedup_simhash.isnot(None)
                    )
                ).all():
                    if (
                        hamming(draft.simhash, art.dedup_simhash)
                        <= _settings.dedup_simhash_max_distance
                    ):
                        return ev
                if sim >= 70 and close_time:
                    return ev
    return None
