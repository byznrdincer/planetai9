"""Explainable importance scoring. 0..10, weighted sum of six factors."""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from planetai_shared.db import models
from planetai_shared.enums import importance_band

WEIGHTS = {
    "source_reliability": 0.15,
    "independent_sources": 0.22,
    "entity_impact": 0.20,
    "novelty": 0.12,
    "market_impact": 0.15,
    "velocity": 0.14,
}

_MARKET_KW = re.compile(
    r"\b(launch|launches|release|releases|released|announc\w+|unveil\w+|raises|"
    r"funding|valuation|acquir\w+|general availability|now available|ga\b|benchmark|"
    r"state[- ]of[- ]the[- ]art|sota|price|pricing|open[- ]weights?)\b",
    re.I,
)


@dataclass(slots=True)
class Factors:
    source_reliability: float = 0.0
    independent_sources: float = 0.0
    entity_impact: float = 0.0
    novelty: float = 0.0
    market_impact: float = 0.0
    velocity: float = 0.0

    def total(self) -> float:
        raw = sum(getattr(self, k) * w for k, w in WEIGHTS.items())
        return round(min(10.0, raw * 10.0), 2)


def score_event(db: Session, event: models.Event) -> tuple[float, str, Factors]:
    articles = db.scalars(
        select(models.Article).where(models.Article.event_id == event.id)
    ).all()
    sources = db.scalars(
        select(models.Source).where(
            models.Source.id.in_({a.source_id for a in articles})
        )
    ).all()

    f = Factors()

    f.source_reliability = max((float(s.trust_weight) for s in sources), default=0.4)

    n_sources = len({a.source_id for a in articles})
    f.independent_sources = min(n_sources, 6) / 6

    if event.primary_entity_id:
        ent = db.get(models.Entity, event.primary_entity_id)
        f.entity_impact = float(ent.tier) if ent else 0.3
    else:
        f.entity_impact = 0.25

    # novelty: how rare is (primary_entity, category) over the last 30 days
    if event.primary_entity_id:
        since = datetime.now(timezone.utc) - timedelta(days=30)
        prior = db.scalar(
            select(func.count())
            .select_from(models.Event)
            .where(
                models.Event.primary_entity_id == event.primary_entity_id,
                models.Event.category == event.category,
                models.Event.first_seen_at >= since,
                models.Event.id != event.id,
            )
        )
        f.novelty = 1.0 / (1.0 + (prior or 0))
    else:
        f.novelty = 0.5

    text = f"{event.title} {event.summary or ''}"
    hits = len(_MARKET_KW.findall(text))
    f.market_impact = min(1.0, 0.35 * hits)

    # velocity: sources gathered within 6h of first sighting
    fast = sum(
        1
        for a in articles
        if a.published_at and (a.published_at - event.first_seen_at) <= timedelta(hours=6)
    )
    f.velocity = min(1.0, fast / 4)

    total = f.total()
    return total, str(importance_band(total)), f


def persist_factors(db: Session, event: models.Event, factors: Factors, total: float) -> None:
    row = db.get(models.ImportanceFactors, event.id)
    if row is None:
        row = models.ImportanceFactors(event_id=event.id)
        db.add(row)
    for key, value in asdict(factors).items():
        setattr(row, key, round(value, 3))
    row.total = total
    row.computed_at = datetime.now(timezone.utc)
