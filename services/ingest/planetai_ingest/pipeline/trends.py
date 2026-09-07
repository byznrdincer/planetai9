"""Trend engine: snapshot per topic per window, ranked by importance-weighted volume."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select

from planetai_shared.db import models
from planetai_shared.db.base import session_scope
from planetai_shared.enums import TrendWindow

log = logging.getLogger(__name__)
_WINDOW_HOURS = {TrendWindow.H24: 24, TrendWindow.D7: 24 * 7}
EPS = 1e-6


def compute_snapshots() -> int:
    now = datetime.now(timezone.utc)
    written = 0
    with session_scope() as db:
        topics = db.scalars(select(models.Topic)).all()
        for window, hours in _WINDOW_HOURS.items():
            since = now - timedelta(hours=hours)
            rows = []
            for topic in topics:
                agg = db.execute(
                    select(
                        func.count(models.Event.id),
                        func.coalesce(func.sum(models.Event.importance), 0),
                    )
                    .select_from(models.EventTopic)
                    .join(models.Event, models.Event.id == models.EventTopic.event_id)
                    .where(
                        models.EventTopic.topic_id == topic.id,
                        models.Event.first_seen_at >= since,
                        models.Event.status == "active",
                    )
                ).one()
                event_count, weighted = int(agg[0]), float(agg[1])
                prev = db.scalar(
                    select(models.TopicTrendSnapshot.weighted_score)
                    .where(
                        models.TopicTrendSnapshot.topic_id == topic.id,
                        models.TopicTrendSnapshot.window == str(window),
                    )
                    .order_by(models.TopicTrendSnapshot.captured_at.desc())
                    .limit(1)
                )
                prev = float(prev) if prev is not None else 0.0
                delta = (weighted - prev) / max(prev, EPS) * 100 if prev else (100.0 if weighted else 0.0)
                rows.append((topic.id, event_count, weighted, round(delta, 1)))

            rows.sort(key=lambda r: (r[2], r[1]), reverse=True)
            for rank, (topic_id, event_count, weighted, delta) in enumerate(rows, start=1):
                db.add(
                    models.TopicTrendSnapshot(
                        topic_id=topic_id,
                        window=str(window),
                        captured_at=now,
                        event_count=event_count,
                        weighted_score=round(weighted, 2),
                        delta_pct=delta,
                        rank=rank,
                    )
                )
                written += 1
    log.info("trend snapshots written: %d", written)
    return written


def refresh_top_signals() -> int:
    """Mark the ~5 highest-importance recent events as top signals (max 2 per category)."""
    now = datetime.now(timezone.utc)
    since = now - timedelta(hours=48)
    with session_scope() as db:
        db.query(models.Event).filter(models.Event.is_top_signal.is_(True)).update(
            {models.Event.is_top_signal: False}
        )
        candidates = db.scalars(
            select(models.Event)
            .where(
                models.Event.status == "active",
                models.Event.last_activity_at >= since,
                models.Event.importance >= 4.0,
            )
            .order_by(models.Event.importance.desc())
        ).all()
        per_cat: dict[str, int] = {}
        chosen = 0
        for ev in candidates:
            if chosen >= 6:
                break
            if per_cat.get(ev.category, 0) >= 2:
                continue
            ev.is_top_signal = True
            per_cat[ev.category] = per_cat.get(ev.category, 0) + 1
            chosen += 1
    return chosen
