from __future__ import annotations

from collections.abc import Iterator

from planetai_shared.db.base import SessionLocal
from sqlalchemy.orm import Session


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_lang(lang: str | None = None) -> str | None:
    """Normalize the ?lang= query param to a supported locale or None."""
    return lang if lang in ("tr", "en") else None
