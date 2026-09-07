from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from planetai_api import schemas, serializers
from planetai_api.db import get_db
from planetai_shared.db import models
from planetai_shared.enums import Category

router = APIRouter()


@router.get("/search", response_model=schemas.SearchResult)
def search(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=30),
) -> schemas.SearchResult:
    like = f"%{q.lower()}%"
    ts_query = func.plainto_tsquery("english", q)
    doc = func.to_tsvector(
        "english",
        func.coalesce(models.Event.title, "") + " " + func.coalesce(models.Event.summary, ""),
    )

    entities = db.scalars(
        select(models.Entity)
        .where(
            or_(
                func.lower(models.Entity.name).like(like),
                models.Entity.aliases.any(q),
            )
        )
        .order_by(models.Entity.tier.desc())
        .limit(limit)
    ).all()

    base = (
        select(models.Event)
        .where(models.Event.status == "active", doc.op("@@")(ts_query))
        .order_by(models.Event.importance.desc(), models.Event.last_activity_at.desc())
    )
    events = db.scalars(base.limit(limit)).all()
    research = db.scalars(
        base.where(models.Event.category == Category.RESEARCH.value).limit(limit)
    ).all()

    videos = db.scalars(
        select(models.Video)
        .where(
            or_(
                func.lower(models.Video.title).like(like),
                func.lower(func.coalesce(models.Video.description, "")).like(like),
            )
        )
        .order_by(models.Video.published_at.desc())
        .limit(limit)
    ).all()

    return schemas.SearchResult(
        query=q,
        entities=[serializers.entity_ref(e) for e in entities],
        events=schemas.Page(
            data=[serializers.event_card(db, e) for e in events],
            next_cursor=None,
            count=len(events),
        ),
        videos=[serializers.video_card(v) for v in videos],
        research=schemas.Page(
            data=[serializers.event_card(db, e) for e in research],
            next_cursor=None,
            count=len(research),
        ),
    )


@router.get("/search/suggest")
def suggest(q: str = Query(..., min_length=1), db: Session = Depends(get_db)) -> dict:
    like = f"%{q.lower()}%"
    entities = db.scalars(
        select(models.Entity)
        .where(func.lower(models.Entity.name).like(like))
        .order_by(models.Entity.tier.desc())
        .limit(6)
    ).all()
    topics = db.scalars(
        select(models.Topic).where(func.lower(models.Topic.name).like(like)).limit(4)
    ).all()
    return {
        "entities": [{"slug": e.slug, "name": e.name, "type": e.type} for e in entities],
        "topics": [{"slug": t.slug, "name": t.name} for t in topics],
    }
