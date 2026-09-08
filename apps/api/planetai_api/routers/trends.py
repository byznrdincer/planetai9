from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from planetai_shared.db import models
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api import schemas, serializers
from planetai_api.db import get_db

router = APIRouter()


def build_trends(db: Session, *, window: str, limit: int) -> list[schemas.TopicTrend]:
    latest_ts = db.scalar(
        select(models.TopicTrendSnapshot.captured_at)
        .where(models.TopicTrendSnapshot.window == window)
        .order_by(models.TopicTrendSnapshot.captured_at.desc())
        .limit(1)
    )
    if latest_ts is None:
        return []
    snaps = db.scalars(
        select(models.TopicTrendSnapshot)
        .where(
            models.TopicTrendSnapshot.window == window,
            models.TopicTrendSnapshot.captured_at == latest_ts,
        )
        .order_by(models.TopicTrendSnapshot.rank)
        .limit(limit)
    ).all()

    out: list[schemas.TopicTrend] = []
    for snap in snaps:
        topic = db.get(models.Topic, snap.topic_id)
        samples = db.scalars(
            select(models.Event)
            .join(models.EventTopic, models.EventTopic.event_id == models.Event.id)
            .where(models.EventTopic.topic_id == topic.id, models.Event.status == "active")
            .order_by(models.Event.importance.desc())
            .limit(3)
        ).all()
        out.append(
            schemas.TopicTrend(
                topic=schemas.TopicRef(slug=topic.slug, name=topic.name),
                window=window,
                rank=snap.rank,
                event_count=snap.event_count,
                weighted_score=float(snap.weighted_score),
                delta_pct=float(snap.delta_pct),
                sample_events=[serializers.event_card(db, e) for e in samples],
            )
        )
    return out


@router.get("/trends", response_model=list[schemas.TopicTrend])
def trends(
    db: Session = Depends(get_db),
    window: str = Query("24h", pattern="^(24h|7d)$"),
    limit: int = Query(12, ge=1, le=30),
) -> list[schemas.TopicTrend]:
    return build_trends(db, window=window, limit=limit)


@router.get("/trends/{slug}", response_model=schemas.TopicTrend)
def trend_detail(slug: str, window: str = "24h", db: Session = Depends(get_db)):
    topic = db.scalar(select(models.Topic).where(models.Topic.slug == slug))
    if topic is None:
        raise HTTPException(404, "topic not found")
    for t in build_trends(db, window=window, limit=100):
        if t.topic.slug == slug:
            return t
    raise HTTPException(404, "no trend snapshot for topic")
