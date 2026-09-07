"""Upsert seed data (entities, relations, sources, topics) into the database.

Idempotent: safe to run on every ingest start."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session

from planetai_ingest import config
from planetai_shared.db import models
from planetai_shared.db.base import session_scope
from planetai_shared.enums import EntityType

log = logging.getLogger(__name__)


def _upsert_entity(db: Session, *, slug: str, name: str, type_: str, **extra) -> models.Entity:
    ent = db.scalar(select(models.Entity).where(models.Entity.slug == slug))
    if ent is None:
        ent = models.Entity(slug=slug, name=name, type=type_, first_seen_at=datetime.now(timezone.utc))
        db.add(ent)
    ent.name = name
    ent.type = type_
    for key, value in extra.items():
        if value is not None:
            setattr(ent, key, value)
    db.flush()
    return ent


def seed_entities(db: Session) -> None:
    data = config.entities()
    groups = {
        "companies": EntityType.COMPANY,
        "model_families": EntityType.MODEL,
        "products": EntityType.PRODUCT,
        "technologies": EntityType.TECHNOLOGY,
        "people": EntityType.PERSON,
        "institutions": EntityType.INSTITUTION,
    }
    # first pass: create everything so parents resolve
    by_slug: dict[str, models.Entity] = {}
    for group, etype in groups.items():
        for row in data.get(group, []):
            ent = _upsert_entity(
                db,
                slug=row["slug"],
                name=row["name"],
                type_=str(etype),
                aliases=row.get("aliases") or [],
                tier=row.get("tier"),
                description=row.get("desc"),
            )
            by_slug[row["slug"]] = ent
    # second pass: parent links
    for group in groups:
        for row in data.get(group, []):
            parent_slug = row.get("parent")
            if parent_slug and parent_slug in by_slug:
                by_slug[row["slug"]].parent_id = by_slug[parent_slug].id
    db.flush()


def seed_relations(db: Session) -> None:
    slug_to_id = dict(db.execute(select(models.Entity.slug, models.Entity.id)).all())
    existing = {
        (f, t, r)
        for f, t, r in db.execute(
            select(
                models.EntityRelation.from_entity_id,
                models.EntityRelation.to_entity_id,
                models.EntityRelation.relation,
            )
        ).all()
    }
    for frm, rel, to in config.entity_relations():
        fid, tid = slug_to_id.get(frm), slug_to_id.get(to)
        if not fid or not tid or (fid, tid, rel) in existing:
            continue
        db.add(models.EntityRelation(from_entity_id=fid, to_entity_id=tid, relation=rel))
    db.flush()


def seed_topics(db: Session) -> None:
    for row in config.topics():
        topic = db.scalar(select(models.Topic).where(models.Topic.slug == row["slug"]))
        if topic is None:
            topic = models.Topic(slug=row["slug"])
            db.add(topic)
        topic.name = row["name"]
        topic.kind = row.get("kind", "theme")
        topic.keywords = row.get("keywords") or []
    db.flush()


def seed_sources(db: Session) -> None:
    slug_to_id = dict(db.execute(select(models.Entity.slug, models.Entity.id)).all())
    for row in config.sources():
        slug = row.get("slug") or slugify(row["name"])
        src = db.scalar(select(models.Source).where(models.Source.slug == slug))
        if src is None:
            src = models.Source(slug=slug)
            db.add(src)
        src.name = row["name"]
        src.homepage_url = row["homepage_url"]
        src.feed_url = row.get("feed_url")
        src.kind = row["kind"]
        src.source_type = row["source_type"]
        src.trust_weight = row.get("trust_weight", 0.5)
        src.poll_interval_sec = row.get("poll_interval_sec", 900)
        src.enabled = row.get("enabled", True)
        src.entity_id = slug_to_id.get(row.get("entity"))
        src.config = row.get("config") or {}
    db.flush()


def run() -> None:
    with session_scope() as db:
        seed_entities(db)
        seed_relations(db)
        seed_topics(db)
        seed_sources(db)
    log.info("seed complete")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run()
