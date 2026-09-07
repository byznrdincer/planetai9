from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_api.db import get_db
from planetai_shared.db import models

router = APIRouter()

_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class Subscribe(BaseModel):
    email: str
    locale: str = "tr"
    source: str | None = None

    @field_validator("email")
    @classmethod
    def _valid(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL.match(v) or len(v) > 320:
            raise ValueError("geçersiz e-posta")
        return v


@router.post("/newsletter", status_code=201)
def subscribe(payload: Subscribe, db: Session = Depends(get_db)) -> dict:
    if not _EMAIL.match(payload.email):
        raise HTTPException(422, "geçersiz e-posta")
    existing = db.scalar(
        select(models.NewsletterSubscriber).where(
            models.NewsletterSubscriber.email == payload.email
        )
    )
    if existing is None:
        db.add(
            models.NewsletterSubscriber(
                email=payload.email,
                locale="en" if payload.locale == "en" else "tr",
                source=(payload.source or "web")[:40],
            )
        )
        db.commit()
    return {"ok": True}
