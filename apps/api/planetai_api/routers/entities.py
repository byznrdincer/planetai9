from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api import schemas, serializers
from planetai_api.db import get_db
from planetai_shared.db import models

router = APIRouter()


@router.get("/entities/{slug}", response_model=schemas.EntityDetail)
def get_entity(slug: str, db: Session = Depends(get_db)) -> schemas.EntityDetail:
    ent = db.scalar(select(models.Entity).where(models.Entity.slug == slug))
    if ent is None:
        raise HTTPException(404, "entity not found")

    out_rels = db.execute(
        select(models.EntityRelation, models.Entity)
        .join(models.Entity, models.Entity.id == models.EntityRelation.to_entity_id)
        .where(models.EntityRelation.from_entity_id == ent.id)
    ).all()
    in_rels = db.execute(
        select(models.EntityRelation, models.Entity)
        .join(models.Entity, models.Entity.id == models.EntityRelation.from_entity_id)
        .where(models.EntityRelation.to_entity_id == ent.id)
    ).all()

    relations = [
        schemas.EntityRelationOut(
            relation=r.relation, direction="out", entity=serializers.entity_ref(e)
        )
        for r, e in out_rels
    ] + [
        schemas.EntityRelationOut(
            relation=r.relation, direction="in", entity=serializers.entity_ref(e)
        )
        for r, e in in_rels
    ]

    latest_events = db.scalars(
        select(models.Event)
        .join(models.EventEntity, models.EventEntity.event_id == models.Event.id)
        .where(models.EventEntity.entity_id == ent.id, models.Event.status == "active")
        .order_by(models.Event.last_activity_at.desc())
        .limit(15)
    ).unique().all()

    videos = db.scalars(
        select(models.Video)
        .join(models.VideoLink, models.VideoLink.video_id == models.Video.id)
        .where(
            models.VideoLink.target_type == "entity",
            models.VideoLink.target_id == ent.id,
        )
        .order_by(models.Video.published_at.desc())
        .limit(8)
    ).unique().all()

    return schemas.EntityDetail(
        slug=ent.slug,
        name=ent.name,
        type=ent.type,
        description=ent.description,
        logo_url=ent.logo_url,
        website_url=ent.website_url,
        relations=relations,
        latest_events=[serializers.event_card(db, e) for e in latest_events],
        videos=[serializers.video_card(v) for v in videos],
    )
