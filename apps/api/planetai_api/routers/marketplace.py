from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from planetai_shared.db import models
from planetai_shared.settings import get_settings
from pydantic import BaseModel, Field, HttpUrl
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api.db import get_db
from planetai_api.ratelimit import limiter

router = APIRouter()
_settings = get_settings()

CATEGORIES = {"mcp", "llm", "stt", "tts", "agent", "tool", "other"}
CATEGORY_LABEL = {
    "mcp": "MCP Sunucusu",
    "llm": "LLM",
    "stt": "Konuşma → Metin",
    "tts": "Metin → Konuşma",
    "agent": "Ajan",
    "tool": "Araç",
    "other": "Diğer",
}


class AppOut(BaseModel):
    slug: str
    name: str
    tagline: str
    description: str | None
    url: str
    repo_url: str | None
    category: str
    category_label: str
    pricing: str
    logo_url: str | None
    author_name: str
    author_url: str | None
    upvotes: int
    featured: bool


class AppSubmission(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    tagline: str = Field(min_length=8, max_length=240)
    description: str | None = Field(default=None, max_length=4000)
    url: HttpUrl
    repo_url: HttpUrl | None = None
    category: str
    pricing: str = "free"
    author_name: str = Field(min_length=2, max_length=120)
    author_url: HttpUrl | None = None
    submitter_email: str | None = Field(default=None, max_length=200)


def _to_out(a: models.MarketplaceApp) -> AppOut:
    return AppOut(
        slug=a.slug,
        name=a.name,
        tagline=a.tagline,
        description=a.description,
        url=a.url,
        repo_url=a.repo_url,
        category=a.category,
        category_label=CATEGORY_LABEL.get(a.category, a.category),
        pricing=a.pricing,
        logo_url=a.logo_url,
        author_name=a.author_name,
        author_url=a.author_url,
        upvotes=a.upvotes,
        featured=a.featured,
    )


@router.get("/marketplace", response_model=list[AppOut])
def list_apps(
    db: Session = Depends(get_db),
    category: str | None = Query(None),
) -> list[AppOut]:
    stmt = select(models.MarketplaceApp).where(models.MarketplaceApp.status == "approved")
    if category and category in CATEGORIES:
        stmt = stmt.where(models.MarketplaceApp.category == category)
    stmt = stmt.order_by(
        models.MarketplaceApp.featured.desc(),
        models.MarketplaceApp.upvotes.desc(),
        models.MarketplaceApp.created_at.desc(),
    )
    return [_to_out(a) for a in db.scalars(stmt).all()]


@router.post("/marketplace", status_code=201)
@limiter.limit(_settings.rate_limit_submit)
def submit_app(request: Request, payload: AppSubmission, db: Session = Depends(get_db)) -> dict:
    if payload.category not in CATEGORIES:
        raise HTTPException(422, f"category must be one of {sorted(CATEGORIES)}")
    if payload.pricing not in {"free", "freemium", "paid"}:
        raise HTTPException(422, "pricing must be free|freemium|paid")

    base = slugify(payload.name)[:120] or "app"
    slug = base
    if db.scalar(select(models.MarketplaceApp).where(models.MarketplaceApp.slug == slug)):
        slug = f"{base}-{uuid.uuid4().hex[:6]}"

    app = models.MarketplaceApp(
        slug=slug,
        name=payload.name.strip(),
        tagline=payload.tagline.strip(),
        description=(payload.description or "").strip() or None,
        url=str(payload.url),
        repo_url=str(payload.repo_url) if payload.repo_url else None,
        category=payload.category,
        pricing=payload.pricing,
        author_name=payload.author_name.strip(),
        author_url=str(payload.author_url) if payload.author_url else None,
        submitter_email=(payload.submitter_email or "").strip() or None,
        status="pending",
    )
    db.add(app)
    db.commit()
    return {"ok": True, "status": "pending", "slug": slug}
