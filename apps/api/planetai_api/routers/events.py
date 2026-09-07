from __future__ import annotations

import base64
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api import schemas, serializers
from planetai_api.db import get_db
from planetai_shared.db import models

router = APIRouter()


def _encode_cursor(dt: datetime, id_: str) -> str:
    return base64.urlsafe_b64encode(f"{dt.isoformat()}|{id_}".encode()).decode()


def _decode_cursor(cursor: str) -> tuple[datetime, str]:
    raw = base64.urlsafe_b64decode(cursor.encode()).decode()
    ts, id_ = raw.split("|", 1)
    return datetime.fromisoformat(ts), id_


@router.get("/events", response_model=schemas.Page)
def list_events(
    db: Session = Depends(get_db),
    category: str | None = None,
    entity: str | None = None,
    source: str | None = None,
    importance_min: float | None = None,
    impact: str | None = None,
    sort: str = Query("recent", pattern="^(recent|importance)$"),
    cursor: str | None = None,
    limit: int = Query(20, ge=1, le=50),
) -> schemas.Page:
    stmt = select(models.Event).where(models.Event.status == "active")

    if category and category.lower() != "all":
        stmt = stmt.where(models.Event.category == category)
    if importance_min is not None:
        stmt = stmt.where(models.Event.importance >= importance_min)
    if impact:
        stmt = stmt.where(models.Event.impact == impact)
    if entity:
        ent = db.scalar(select(models.Entity).where(models.Entity.slug == entity))
        if ent is None:
            raise HTTPException(404, "unknown entity")
        stmt = stmt.join(
            models.EventEntity, models.EventEntity.event_id == models.Event.id
        ).where(models.EventEntity.entity_id == ent.id)
    if source:
        src = db.scalar(select(models.Source).where(models.Source.slug == source))
        if src is None:
            raise HTTPException(404, "unknown source")
        stmt = stmt.join(
            models.Article, models.Article.event_id == models.Event.id
        ).where(models.Article.source_id == src.id)

    if sort == "importance":
        stmt = stmt.order_by(models.Event.importance.desc(), models.Event.id.desc())
    else:
        stmt = stmt.order_by(models.Event.last_activity_at.desc(), models.Event.id.desc())
        if cursor:
            ts, id_ = _decode_cursor(cursor)
            stmt = stmt.where(models.Event.last_activity_at < ts)

    rows = db.scalars(stmt.limit(limit + 1)).unique().all()
    has_more = len(rows) > limit
    rows = rows[:limit]

    next_cursor = (
        _encode_cursor(rows[-1].last_activity_at, str(rows[-1].id))
        if has_more and sort == "recent"
        else None
    )
    return schemas.Page(
        data=[serializers.event_card(db, e) for e in rows],
        next_cursor=next_cursor,
        count=len(rows),
    )


@router.get("/events/{slug}", response_model=schemas.EventDetail)
def get_event(slug: str, db: Session = Depends(get_db)) -> schemas.EventDetail:
    event = db.scalar(select(models.Event).where(models.Event.slug == slug))
    if event is None or event.status != "active":
        raise HTTPException(404, "event not found")
    return serializers.event_detail(db, event)
