"""PlanetAI YouTube channel collector (YouTube Data API v3).

Writes rows straight to `videos` rather than `articles` — videos are a separate
surface. Returns [] gracefully when no API key/channel is configured."""

from __future__ import annotations

import logging
import re
from datetime import datetime

from dateutil import parser as dtparser
from sqlalchemy import select

from planetai_ingest.collectors.base import FetchResult, http_client
from planetai_shared.db import models
from planetai_shared.db.base import session_scope
from planetai_shared.settings import get_settings

log = logging.getLogger(__name__)
API = "https://www.googleapis.com/youtube/v3"
_ISO_DUR = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?")


def _duration_seconds(iso: str) -> int:
    m = _ISO_DUR.match(iso or "")
    if not m:
        return 0
    h, mi, s = (int(x) if x else 0 for x in m.groups())
    return h * 3600 + mi * 60 + s


class YouTubeCollector:
    kind = "youtube"

    def __init__(self, source: models.Source):
        self.source = source
        self.settings = get_settings()

    def fetch(self) -> FetchResult:
        s = self.settings
        if not s.youtube_api_key or not s.youtube_channel_id:
            log.warning("youtube: PLANETAI_YOUTUBE_API_KEY / CHANNEL_ID not set — skipping")
            return FetchResult([])

        with http_client() as client:
            ch = client.get(
                f"{API}/channels",
                params={"part": "contentDetails", "id": s.youtube_channel_id, "key": s.youtube_api_key},
            )
            ch.raise_for_status()
            ch_items = ch.json().get("items", [])
            if not ch_items:
                log.warning("youtube: channel %s not found", s.youtube_channel_id)
                return FetchResult([])
            uploads = ch_items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

            video_ids: list[str] = []
            page_token = None
            while len(video_ids) < 50:
                pl = client.get(
                    f"{API}/playlistItems",
                    params={
                        "part": "contentDetails",
                        "playlistId": uploads,
                        "maxResults": 50,
                        "pageToken": page_token or "",
                        "key": s.youtube_api_key,
                    },
                )
                pl.raise_for_status()
                body = pl.json()
                video_ids += [i["contentDetails"]["videoId"] for i in body.get("items", [])]
                page_token = body.get("nextPageToken")
                if not page_token:
                    break

            details = client.get(
                f"{API}/videos",
                params={
                    "part": "snippet,contentDetails,statistics",
                    "id": ",".join(video_ids[:50]),
                    "key": s.youtube_api_key,
                },
            )
            details.raise_for_status()
            rows = details.json().get("items", [])

        self._upsert(rows)
        return FetchResult([])  # side-effect collector

    @staticmethod
    def _upsert(rows: list[dict]) -> None:
        with session_scope() as db:
            for row in rows:
                yid = row["id"]
                snip = row.get("snippet", {})
                stats = row.get("statistics", {})
                video = db.scalar(select(models.Video).where(models.Video.youtube_id == yid))
                if video is None:
                    video = models.Video(youtube_id=yid)
                    db.add(video)
                video.title = snip.get("title", "")
                video.description = (snip.get("description") or "")[:5000]
                thumbs = snip.get("thumbnails", {})
                video.thumbnail_url = (
                    thumbs.get("maxres") or thumbs.get("high") or thumbs.get("default") or {}
                ).get("url")
                video.duration_sec = _duration_seconds(row.get("contentDetails", {}).get("duration"))
                video.published_at = _parse_dt(snip.get("publishedAt"))
                video.view_count = int(stats["viewCount"]) if stats.get("viewCount") else None
                video.topics = snip.get("tags", [])[:20]


def _parse_dt(value: str | None) -> datetime:
    return dtparser.parse(value) if value else datetime.now().astimezone()
