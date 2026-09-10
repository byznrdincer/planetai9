from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from planetai_shared.db import models
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from planetai_api.db import get_db
from planetai_api.routers.marketplace import require_admin

router = APIRouter()

COLLECTIONS = {"tr_data", "tr_ecosystem"}


class LinkOut(BaseModel):
    id: uuid.UUID
    collection: str
    name: str
    url: str
    kind: str
    note_tr: str | None
    note_en: str | None
    sort_order: int
    enabled: bool


class LinkInput(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=4, max_length=600)
    kind: str = Field(default="", max_length=30)
    note_tr: str | None = Field(default=None, max_length=600)
    note_en: str | None = Field(default=None, max_length=600)
    sort_order: int = 0
    enabled: bool = True


def _out(r: models.CuratedLink) -> LinkOut:
    return LinkOut(
        id=r.id,
        collection=r.collection,
        name=r.name,
        url=r.url,
        kind=r.kind,
        note_tr=r.note_tr,
        note_en=r.note_en,
        sort_order=r.sort_order,
        enabled=r.enabled,
    )


def _check_collection(collection: str) -> None:
    if collection not in COLLECTIONS:
        raise HTTPException(404, "unknown collection")


@router.get("/curated/{collection}", response_model=list[LinkOut])
def list_links(collection: str, db: Session = Depends(get_db)) -> list[LinkOut]:
    """Public: enabled cards for a Türkiye-page collection, in display order."""
    _check_collection(collection)
    rows = db.scalars(
        select(models.CuratedLink)
        .where(
            models.CuratedLink.collection == collection,
            models.CuratedLink.enabled.is_(True),
        )
        .order_by(models.CuratedLink.sort_order, models.CuratedLink.name)
    ).all()
    return [_out(r) for r in rows]


# --- moderator management (X-Admin-Token or a moderator author's X-Author-Key) ---


@router.get("/curated/{collection}/manage", response_model=list[LinkOut])
def manage_list(
    collection: str,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[LinkOut]:
    _check_collection(collection)
    rows = db.scalars(
        select(models.CuratedLink)
        .where(models.CuratedLink.collection == collection)
        .order_by(models.CuratedLink.sort_order, models.CuratedLink.name)
    ).all()
    return [_out(r) for r in rows]


@router.post("/curated/{collection}", response_model=LinkOut, status_code=201)
def create_link(
    collection: str,
    payload: LinkInput,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> LinkOut:
    _check_collection(collection)
    if db.scalar(
        select(models.CuratedLink).where(
            models.CuratedLink.collection == collection,
            models.CuratedLink.name == payload.name,
        )
    ):
        raise HTTPException(409, "bu isimde bir kayıt zaten var")
    order = payload.sort_order or (
        db.scalar(
            select(func.coalesce(func.max(models.CuratedLink.sort_order), -1) + 1).where(
                models.CuratedLink.collection == collection
            )
        )
        or 0
    )
    row = models.CuratedLink(collection=collection, **payload.model_dump(exclude={"sort_order"}))
    row.sort_order = order
    db.add(row)
    db.commit()
    db.refresh(row)
    return _out(row)


@router.patch("/curated/{collection}/{link_id}", response_model=LinkOut)
def update_link(
    collection: str,
    link_id: uuid.UUID,
    payload: LinkInput,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> LinkOut:
    _check_collection(collection)
    row = db.get(models.CuratedLink, link_id)
    if row is None or row.collection != collection:
        raise HTTPException(404, "kayıt bulunamadı")
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return _out(row)


@router.delete("/curated/{collection}/{link_id}", status_code=204)
def delete_link(
    collection: str,
    link_id: uuid.UUID,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    _check_collection(collection)
    row = db.get(models.CuratedLink, link_id)
    if row is None or row.collection != collection:
        raise HTTPException(404, "kayıt bulunamadı")
    db.delete(row)
    db.commit()
