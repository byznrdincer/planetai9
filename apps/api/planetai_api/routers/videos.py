from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from planetai_shared.db import models
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api import schemas, serializers
from planetai_api.db import get_db

router = APIRouter()


@router.get("/videos", response_model=list[schemas.VideoCard])
def list_videos(
    db: Session = Depends(get_db),
    playlist: str | None = None,
    topic: str | None = None,
    limit: int = Query(24, ge=1, le=50),
) -> list[schemas.VideoCard]:
    stmt = select(models.Video)
    if playlist:
        stmt = stmt.where(models.Video.playlist == playlist)
    if topic:
        t = db.scalar(select(models.Topic).where(models.Topic.slug == topic))
        if t is None:
            raise HTTPException(404, "unknown topic")
        stmt = stmt.join(models.VideoLink, models.VideoLink.video_id == models.Video.id).where(
            models.VideoLink.target_type == "topic", models.VideoLink.target_id == t.id
        )
    stmt = stmt.order_by(models.Video.published_at.desc()).limit(limit)
    return [serializers.video_card(v) for v in db.scalars(stmt).unique().all()]


@router.get("/videos/{youtube_id}", response_model=schemas.VideoDetail)
def get_video(youtube_id: str, db: Session = Depends(get_db)) -> schemas.VideoDetail:
    video = db.scalar(select(models.Video).where(models.Video.youtube_id == youtube_id))
    if video is None:
        raise HTTPException(404, "video not found")

    links = db.scalars(select(models.VideoLink).where(models.VideoLink.video_id == video.id)).all()
    entity_ids = [ln.target_id for ln in links if ln.target_type == "entity"]
    topic_ids = [ln.target_id for ln in links if ln.target_type == "topic"]

    entities = db.scalars(select(models.Entity).where(models.Entity.id.in_(entity_ids))).all()
    topics = db.scalars(select(models.Topic).where(models.Topic.id.in_(topic_ids))).all()

    related_events = (
        db.scalars(
            select(models.Event)
            .join(models.EventEntity, models.EventEntity.event_id == models.Event.id)
            .where(
                models.EventEntity.entity_id.in_(entity_ids),
                models.Event.status == "active",
            )
            .order_by(models.Event.last_activity_at.desc())
            .limit(6)
        )
        .unique()
        .all()
    )

    base = serializers.video_card(video).model_dump()
    return schemas.VideoDetail(
        **base,
        related_events=[serializers.event_card(db, e) for e in related_events],
        related_entities=[serializers.entity_ref(e) for e in entities],
        related_topics=[schemas.TopicRef(slug=t.slug, name=t.name) for t in topics],
    )
