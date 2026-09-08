"""Re-run topic matching over existing events (e.g. after adding a new topic)."""

from __future__ import annotations

import logging

from planetai_shared.db import models
from planetai_shared.db.base import session_scope
from sqlalchemy import select

from planetai_ingest.pipeline import classify

log = logging.getLogger(__name__)


def run() -> int:
    added = 0
    with session_scope() as db:
        topics = [
            {"id": t.id, "keywords": t.keywords or []}
            for t in db.scalars(select(models.Topic)).all()
        ]
        events = db.scalars(select(models.Event).where(models.Event.status == "active")).all()
        for ev in events:
            have = set(
                db.scalars(
                    select(models.EventTopic.topic_id).where(models.EventTopic.event_id == ev.id)
                ).all()
            )
            for topic_id, weight in classify.match_topics(
                title=ev.title, summary=ev.summary or "", topics=topics
            ):
                if topic_id not in have:
                    db.add(models.EventTopic(event_id=ev.id, topic_id=topic_id, weight=weight))
                    added += 1
    log.info("retag: %d new event-topic links", added)
    return added


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run()
