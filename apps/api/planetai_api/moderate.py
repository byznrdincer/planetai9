"""Tiny marketplace moderation CLI.

    uv run python -m planetai_api.moderate list
    uv run python -m planetai_api.moderate approve <slug>
    uv run python -m planetai_api.moderate reject <slug>
"""

from __future__ import annotations

import sys

from sqlalchemy import select

from planetai_shared.db import models
from planetai_shared.db.base import session_scope


def _cache_bust() -> None:
    try:
        import redis

        from planetai_shared.settings import get_settings

        client = redis.from_url(get_settings().redis_url)
        for key in client.scan_iter(match="home*"):
            client.delete(key)
    except Exception:  # noqa: BLE001
        pass


def main(argv: list[str]) -> int:
    if not argv or argv[0] not in {"list", "approve", "reject"}:
        print(__doc__)
        return 1
    cmd = argv[0]
    with session_scope() as db:
        if cmd == "list":
            rows = db.scalars(
                select(models.MarketplaceApp).order_by(models.MarketplaceApp.created_at.desc())
            ).all()
            for a in rows:
                print(f"[{a.status:8}] {a.category:6} {a.slug:32} {a.name}  <{a.url}>")
            return 0
        slug = argv[1] if len(argv) > 1 else ""
        app = db.scalar(select(models.MarketplaceApp).where(models.MarketplaceApp.slug == slug))
        if app is None:
            print(f"not found: {slug}")
            return 1
        app.status = "approved" if cmd == "approve" else "rejected"
        print(f"{slug} -> {app.status}")
    _cache_bust()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
