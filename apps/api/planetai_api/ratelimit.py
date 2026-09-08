from __future__ import annotations

from planetai_shared.settings import get_settings
from slowapi import Limiter
from slowapi.util import get_remote_address

_settings = get_settings()

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[_settings.rate_limit_default],
    storage_uri=_settings.redis_url,
    strategy="fixed-window",
)
