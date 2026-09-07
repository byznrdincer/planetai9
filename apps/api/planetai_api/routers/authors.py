from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api.db import get_db
from planetai_shared.db import models

router = APIRouter()


class AuthorRef(BaseModel):
    slug: str
    name: str
    role: str | None
    avatar_url: str | None


class AuthorDetail(AuthorRef):
    bio: str | None
    links: dict


class ColumnCard(BaseModel):
    slug: str
    title: str
    dek: str | None
    hero_image_url: str | None
    published_at: datetime
    author: AuthorRef


class ColumnDetail(ColumnCard):
    body: str


def _author_ref(a: models.Author) -> AuthorRef:
    return AuthorRef(slug=a.slug, name=a.name, role=a.role, avatar_url=a.avatar_url)


def _card(p: models.OpinionPost) -> ColumnCard:
    return ColumnCard(
        slug=p.slug,
        title=p.title,
        dek=p.dek,
        hero_image_url=p.hero_image_url,
        published_at=p.published_at,
        author=_author_ref(p.author),
    )


@router.get("/authors", response_model=list[AuthorRef])
def list_authors(db: Session = Depends(get_db)) -> list[AuthorRef]:
    rows = db.scalars(select(models.Author).order_by(models.Author.name)).all()
    return [_author_ref(a) for a in rows]


@router.get("/authors/{slug}")
def get_author(slug: str, db: Session = Depends(get_db)) -> dict:
    a = db.scalar(select(models.Author).where(models.Author.slug == slug))
    if a is None:
        raise HTTPException(404, "author not found")
    posts = db.scalars(
        select(models.OpinionPost)
        .where(models.OpinionPost.author_id == a.id, models.OpinionPost.status == "published")
        .order_by(models.OpinionPost.published_at.desc())
    ).all()
    return {
        "author": AuthorDetail(
            slug=a.slug, name=a.name, role=a.role, avatar_url=a.avatar_url, bio=a.bio, links=a.links or {}
        ).model_dump(),
        "columns": [_card(p).model_dump() for p in posts],
    }


@router.get("/columns", response_model=list[ColumnCard])
def list_columns(
    db: Session = Depends(get_db), limit: int = Query(30, ge=1, le=60)
) -> list[ColumnCard]:
    rows = db.scalars(
        select(models.OpinionPost)
        .where(models.OpinionPost.status == "published")
        .order_by(models.OpinionPost.published_at.desc())
        .limit(limit)
    ).all()
    return [_card(p) for p in rows]


@router.get("/columns/{slug}", response_model=ColumnDetail)
def get_column(slug: str, db: Session = Depends(get_db)) -> ColumnDetail:
    p = db.scalar(select(models.OpinionPost).where(models.OpinionPost.slug == slug))
    if p is None or p.status != "published":
        raise HTTPException(404, "column not found")
    return ColumnDetail(**_card(p).model_dump(), body=p.body)
