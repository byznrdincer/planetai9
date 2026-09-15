from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from planetai_shared.db import models
from planetai_shared.settings import get_settings
from pydantic import BaseModel, Field, HttpUrl, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api.db import get_db
from planetai_api.ratelimit import limiter
from planetai_api.routers.marketplace import _bust_home_cache, require_admin
from planetai_api.services.manual_event import PUBLIC_BUCKETS, create_event_from_submission

router = APIRouter()
_settings = get_settings()

STATUSES = {"pending", "approved", "rejected"}
MAX_IMAGES = 5


class SubmissionOut(BaseModel):
    id: uuid.UUID
    title: str
    url: str | None
    description: str | None
    summary: str | None
    image_url: str | None
    image_urls: list[str]
    category: str
    status: str
    submitter_name: str | None
    submitter_email: str | None
    submitter_phone: str | None
    event_slug: str | None
    created_at: datetime


class StatusChange(BaseModel):
    status: str


class SubmissionIn(BaseModel):
    """Public tip form — title/link/summary optional; body + name required."""

    title: str | None = Field(default=None, max_length=300)
    description: str = Field(min_length=40, max_length=8000)
    category: str
    submitter_name: str = Field(min_length=2, max_length=120)
    submitter_email: str | None = Field(default=None, max_length=200)
    submitter_phone: str | None = Field(default=None, max_length=40)
    image_urls: list[str] = Field(default_factory=list, max_length=MAX_IMAGES)
    # legacy optional fields kept for older clients
    url: HttpUrl | None = None
    summary: str | None = Field(default=None, max_length=600)
    image_url: HttpUrl | None = None

    @field_validator("image_urls")
    @classmethod
    def _cap_images(cls, v: list[str]) -> list[str]:
        out: list[str] = []
        for u in v:
            s = (u or "").strip()
            if s and s not in out:
                out.append(s)
            if len(out) >= MAX_IMAGES:
                break
        return out


class SubmissionEdit(BaseModel):
    title: str | None = Field(default=None, min_length=4, max_length=300)
    description: str | None = Field(default=None, min_length=40, max_length=8000)
    category: str | None = None
    image_urls: list[str] | None = None
    submitter_name: str | None = Field(default=None, max_length=120)
    submitter_email: str | None = Field(default=None, max_length=200)
    submitter_phone: str | None = Field(default=None, max_length=40)


def _title_from_body(body: str, explicit: str | None) -> str:
    if explicit and explicit.strip():
        return explicit.strip()[:300]
    first = (body or "").strip().split("\n", 1)[0].strip()
    if len(first) >= 8:
        return first[:300]
    return (body.strip()[:80] + ("…" if len(body.strip()) > 80 else "")) or "Haber"


def _out(s: models.NewsSubmission) -> SubmissionOut:
    urls = list(s.image_urls or [])
    if s.image_url and s.image_url not in urls:
        urls = [s.image_url, *urls]
    return SubmissionOut(
        id=s.id,
        title=s.title,
        url=s.url,
        description=s.description,
        summary=s.summary,
        image_url=urls[0] if urls else s.image_url,
        image_urls=urls[:MAX_IMAGES],
        category=s.category,
        status=s.status,
        submitter_name=s.submitter_name,
        submitter_email=s.submitter_email,
        submitter_phone=s.submitter_phone,
        event_slug=s.event.slug if s.event else None,
        created_at=s.created_at,
    )


@router.post("/news-submissions", status_code=201)
@limiter.limit(_settings.rate_limit_submit)
def submit_news(request: Request, payload: SubmissionIn, db: Session = Depends(get_db)) -> dict:
    if payload.category not in PUBLIC_BUCKETS:
        raise HTTPException(422, f"category must be one of {PUBLIC_BUCKETS}")

    body = payload.description.strip()
    urls = list(payload.image_urls)
    if payload.image_url:
        u = str(payload.image_url)
        if u not in urls:
            urls.insert(0, u)

    submission = models.NewsSubmission(
        title=_title_from_body(body, payload.title),
        url=str(payload.url) if payload.url else None,
        description=body,
        summary=(payload.summary or "").strip() or None,
        image_url=urls[0] if urls else None,
        image_urls=urls[:MAX_IMAGES],
        category=payload.category,
        submitter_name=payload.submitter_name.strip(),
        submitter_email=(payload.submitter_email or "").strip() or None,
        submitter_phone=(payload.submitter_phone or "").strip() or None,
        status="pending",
    )
    db.add(submission)
    db.commit()
    return {"ok": True, "status": "pending"}


@router.get("/news-submissions/queue", response_model=list[SubmissionOut])
def moderation_queue(
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
    status: str | None = Query(None),
) -> list[SubmissionOut]:
    stmt = select(models.NewsSubmission)
    if status in STATUSES:
        stmt = stmt.where(models.NewsSubmission.status == status)
    rows = sorted(
        db.scalars(stmt).all(),
        key=lambda s: (s.status != "pending", -s.created_at.timestamp()),
    )
    return [_out(s) for s in rows]


@router.patch("/news-submissions/{submission_id}", response_model=SubmissionOut)
def edit_submission(
    submission_id: uuid.UUID,
    payload: SubmissionEdit,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> SubmissionOut:
    submission = db.get(models.NewsSubmission, submission_id)
    if submission is None:
        raise HTTPException(404, "gönderi bulunamadı")

    if payload.title is not None:
        submission.title = payload.title.strip()
    if payload.description is not None:
        submission.description = payload.description.strip()
    if payload.category is not None:
        if payload.category not in PUBLIC_BUCKETS:
            raise HTTPException(422, f"category must be one of {PUBLIC_BUCKETS}")
        submission.category = payload.category
    if payload.image_urls is not None:
        urls = [u.strip() for u in payload.image_urls if u and u.strip()][:MAX_IMAGES]
        submission.image_urls = urls
        submission.image_url = urls[0] if urls else None
    if payload.submitter_name is not None:
        submission.submitter_name = payload.submitter_name.strip() or None
    if payload.submitter_email is not None:
        submission.submitter_email = payload.submitter_email.strip() or None
    if payload.submitter_phone is not None:
        submission.submitter_phone = payload.submitter_phone.strip() or None

    # Keep the live Event in sync when already published
    if submission.event_id and submission.event is not None:
        ev = submission.event
        ev.title = submission.title
        ev.body_text = submission.description
        ev.summary = (submission.description or "")[:280] or None
        ev.image_url = submission.image_url
        ev.image_urls = list(submission.image_urls or [])
        if submission.event.articles:
            art = submission.event.articles[0]
            art.title = submission.title
            art.body_text = submission.description
            art.image_url = submission.image_url

    db.commit()
    db.refresh(submission)
    _bust_home_cache()
    return _out(submission)


@router.post("/news-submissions/{submission_id}/status", response_model=SubmissionOut)
def set_status(
    submission_id: uuid.UUID,
    payload: StatusChange,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
) -> SubmissionOut:
    if payload.status not in STATUSES:
        raise HTTPException(422, f"status must be one of {sorted(STATUSES)}")
    submission = db.get(models.NewsSubmission, submission_id)
    if submission is None:
        raise HTTPException(404, "gönderi bulunamadı")

    if payload.status == "approved" and submission.event_id is None:
        event = create_event_from_submission(db, submission)
        submission.event_id = event.id

    submission.status = payload.status
    db.commit()
    db.refresh(submission)
    _bust_home_cache()
    return _out(submission)
