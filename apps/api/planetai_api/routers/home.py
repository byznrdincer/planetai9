from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api import cache, schemas, serializers
from planetai_api.db import get_db
from planetai_api.routers.trends import build_trends
from planetai_shared.db import models
from planetai_shared.enums import Category
from planetai_shared.settings import get_settings

router = APIRouter()
_settings = get_settings()


@router.get("/home", response_model=schemas.HomePayload)
def home(db: Session = Depends(get_db)) -> schemas.HomePayload:
    cached = cache.get("home:v1")
    if cached:
        return schemas.HomePayload.model_validate(cached)

    top_signals = db.scalars(
        select(models.Event)
        .where(models.Event.is_top_signal.is_(True), models.Event.status == "active")
        .order_by(models.Event.importance.desc())
        .limit(5)
    ).all()

    research_event_ids = (
        select(models.Article.event_id)
        .join(models.Source, models.Source.id == models.Article.source_id)
        .where(models.Source.kind == "arxiv", models.Article.event_id.isnot(None))
    )
    latest = db.scalars(
        select(models.Event)
        .where(
            models.Event.status == "active",
            models.Event.category != Category.RESEARCH.value,
            models.Event.id.not_in(research_event_ids),
        )
        .order_by(models.Event.last_activity_at.desc())
        .limit(20)
    ).all()

    videos = db.scalars(
        select(models.Video).order_by(models.Video.published_at.desc()).limit(8)
    ).all()

    since = datetime.now(timezone.utc) - timedelta(hours=24)
    timeline_events = db.scalars(
        select(models.Event)
        .where(
            models.Event.last_activity_at >= since,
            models.Event.status == "active",
            models.Event.id.not_in(research_event_ids),
        )
        .order_by(models.Event.last_activity_at.desc())
        .limit(25)
    ).all()

    payload = schemas.HomePayload(
        top_signals=[serializers.event_card(db, e) for e in top_signals],
        latest_news=[serializers.event_card(db, e) for e in latest],
        trending=build_trends(db, window="24h", limit=8),
        videos=[serializers.video_card(v) for v in videos],
        timeline=[
            schemas.TimelineItem(
                time=e.last_activity_at,
                slug=e.slug,
                title=e.title,
                category=e.category,
                impact=e.impact,
            )
            for e in timeline_events
        ],
    )
    cache.set("home:v1", payload.model_dump(), _settings.cache_ttl_home_sec)
    return payload
