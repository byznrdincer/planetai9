from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from planetai_api import schemas, serializers
from planetai_api.db import get_db
from planetai_shared.db import models
from planetai_shared.enums import Category

router = APIRouter()


@router.get("/sources", response_model=list[schemas.SourceRef])
def sources(db: Session = Depends(get_db)) -> list[schemas.SourceRef]:
    rows = db.scalars(
        select(models.Source)
        .where(models.Source.enabled.is_(True))
        .order_by(models.Source.trust_weight.desc())
    ).all()
    return [serializers.source_ref(s) for s in rows]


@router.get("/categories", response_model=list[schemas.CategoryCount])
def categories(db: Session = Depends(get_db)) -> list[schemas.CategoryCount]:
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    counts = dict(
        db.execute(
            select(models.Event.category, func.count())
            .where(models.Event.last_activity_at >= since, models.Event.status == "active")
            .group_by(models.Event.category)
        ).all()
    )
    return [
        schemas.CategoryCount(category=c.value, events_24h=int(counts.get(c.value, 0)))
        for c in Category
    ]


@router.get("/healthz")
def healthz(db: Session = Depends(get_db)) -> dict:
    last_run = db.scalar(
        select(models.IngestRun).order_by(models.IngestRun.started_at.desc()).limit(1)
    )
    return {
        "status": "ok",
        "events": db.scalar(select(func.count()).select_from(models.Event)),
        "articles": db.scalar(select(func.count()).select_from(models.Article)),
        "last_ingest_at": last_run.started_at.isoformat() if last_run else None,
    }
