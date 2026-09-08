"""Rule-based category + topic assignment (no LLM)."""

from __future__ import annotations

import re
from functools import lru_cache

from planetai_shared.enums import Category

from planetai_ingest import config
from planetai_ingest.pipeline.entities import EntityHit


@lru_cache
def _rules() -> dict:
    return config.category_rules()


def _kw_hit(keywords: list[str], text: str) -> bool:
    return any(re.search(r"(?<![a-z0-9])" + re.escape(k.lower()), text) for k in keywords)


def classify_category(
    *, title: str, summary: str, source_kind: str, source_slug: str, hits: list[EntityHit]
) -> str:
    text = f"{title}\n{summary}".lower()
    entity_types = {h.entity_type for h in hits}
    scores: dict[str, float] = {}
    for rule in _rules().get("rules", []):
        when = rule.get("when", {})
        ok = True
        if "source_kind" in when:
            ok &= source_kind in when["source_kind"]
        if "source_slug" in when:
            ok &= source_slug in when["source_slug"]
        if "entity_type" in when:
            ok &= bool(entity_types & set(when["entity_type"]))
        if "keywords" in when:
            ok &= _kw_hit(when["keywords"], text)
        if ok:
            for cat, weight in rule.get("add", {}).items():
                scores[cat] = scores.get(cat, 0.0) + float(weight)
    if not scores:
        return _rules().get("default", Category.COMPANIES.value)
    return max(scores, key=scores.get)


def match_topics(*, title: str, summary: str, topics: list[dict]) -> list[tuple[str, float]]:
    """Return [(topic_id, weight)] for topics whose keywords appear."""
    text = f"{title}\n{summary}".lower()
    out: list[tuple[str, float]] = []
    for topic in topics:
        n = sum(1 for k in topic["keywords"] if _kw_hit([k], text))
        if n:
            out.append((topic["id"], float(min(n, 3))))
    return out
