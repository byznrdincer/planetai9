"""Tiny Redis JSON cache. Degrades to a no-op if Redis is unavailable."""

from __future__ import annotations

import json
import logging
from typing import Any

import redis

from planetai_shared.settings import get_settings

log = logging.getLogger(__name__)
_settings = get_settings()

try:
    _client: redis.Redis | None = redis.from_url(_settings.redis_url, decode_responses=True)
    _client.ping()
except Exception as exc:  # noqa: BLE001
    log.warning("redis unavailable, cache disabled: %s", exc)
    _client = None


def get(key: str) -> Any | None:
    if _client is None:
        return None
    try:
        raw = _client.get(key)
        return json.loads(raw) if raw else None
    except Exception:  # noqa: BLE001
        return None


def set(key: str, value: Any, ttl: int) -> None:
    if _client is None:
        return
    try:
        _client.setex(key, ttl, json.dumps(value, default=str))
    except Exception:  # noqa: BLE001
        pass


def invalidate(*prefixes: str) -> None:
    if _client is None:
        return
    try:
        for prefix in prefixes:
            for k in _client.scan_iter(match=f"{prefix}*"):
                _client.delete(k)
    except Exception:  # noqa: BLE001
        pass
