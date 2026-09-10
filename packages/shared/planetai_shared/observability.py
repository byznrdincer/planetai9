"""Optional Sentry error monitoring, shared by the API and ingest services.

No-op unless ``PLANETAI_SENTRY_DSN`` is set.
"""

from __future__ import annotations

import logging

from planetai_shared.settings import get_settings

log = logging.getLogger(__name__)


def init_sentry(component: str) -> None:
    """Initialise Sentry for ``component`` ("api" | "ingest"). Safe to call once at startup."""
    settings = get_settings()
    if not settings.sentry_dsn:
        return
    try:
        import sentry_sdk
    except ModuleNotFoundError:  # sentry-sdk not installed in this image
        log.warning("PLANETAI_SENTRY_DSN set but sentry-sdk is not installed")
        return

    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.env,
        traces_sample_rate=settings.sentry_traces_sample_rate,
        send_default_pii=False,
    )
    sentry_sdk.set_tag("component", component)
    log.info("sentry initialised for %s (env=%s)", component, settings.env)
