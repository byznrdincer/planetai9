"""Collector contract: a Source row in, a list of RawItem out."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

import httpx

from planetai_shared.db import models
from planetai_shared.settings import get_settings

_settings = get_settings()


@dataclass(slots=True)
class RawItem:
    source_id: str
    external_id: str
    url: str
    title: str
    summary: str | None = None
    published_at: datetime | None = None
    author: str | None = None
    image_url: str | None = None
    lang: str = "en"
    extra: dict = field(default_factory=dict)


class FetchResult:
    """What a collector returns for one poll: items plus caching headers."""

    def __init__(
        self,
        items: list[RawItem],
        *,
        etag: str | None = None,
        last_modified: str | None = None,
        not_modified: bool = False,
    ):
        self.items = items
        self.etag = etag
        self.last_modified = last_modified
        self.not_modified = not_modified


class BaseCollector:
    kind: str = "base"

    def __init__(self, source: models.Source):
        self.source = source

    def fetch(self) -> FetchResult:  # pragma: no cover - interface
        raise NotImplementedError


def http_client() -> httpx.Client:
    return httpx.Client(
        headers={"User-Agent": _settings.user_agent},
        timeout=_settings.http_timeout_sec,
        follow_redirects=True,
    )
