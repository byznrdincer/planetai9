"""Dictionary-based entity tagging with Aho-Corasick."""

from __future__ import annotations

import re
from dataclasses import dataclass

import ahocorasick
from planetai_shared.db import models
from planetai_shared.enums import EntityType
from sqlalchemy import select
from sqlalchemy.orm import Session

# most specific type wins when assigning the primary entity
_TYPE_RANK = {
    EntityType.MODEL: 5,
    EntityType.PRODUCT: 4,
    EntityType.TECHNOLOGY: 3,
    EntityType.PERSON: 3,
    EntityType.COMPANY: 2,
    EntityType.INSTITUTION: 2,
}
_WORD = re.compile(r"[a-z0-9]")


@dataclass(slots=True)
class EntityHit:
    entity_id: str
    entity_type: str
    name: str
    tier: float
    in_title: bool


class EntityIndex:
    def __init__(self, rows: list[tuple]):
        self._auto = ahocorasick.Automaton()
        self._meta: dict[str, dict] = {}
        for eid, etype, name, aliases, tier in rows:
            meta = {"id": str(eid), "type": str(etype), "name": name, "tier": float(tier or 0.4)}
            self._meta[str(eid)] = meta
            for phrase in [name, *(aliases or [])]:
                key = phrase.lower().strip()
                if len(key) >= 3:
                    self._auto.add_word(key, (key, meta))
        self._auto.make_automaton()

    @classmethod
    def from_db(cls, db: Session) -> EntityIndex:
        rows = db.execute(
            select(
                models.Entity.id,
                models.Entity.type,
                models.Entity.name,
                models.Entity.aliases,
                models.Entity.tier,
            )
        ).all()
        return cls(rows)

    def match(self, title: str, body: str) -> list[EntityHit]:
        title_l = f" {title.lower()} "
        full_l = f" {title.lower()}  {body.lower()} "
        found: dict[str, EntityHit] = {}
        for haystack, in_title in ((full_l, False), (title_l, True)):
            for end, (phrase, meta) in self._auto.iter(haystack):
                start = end - len(phrase) + 1
                if _boundary_ok(haystack, start, end):
                    hit = found.get(meta["id"])
                    if hit is None:
                        found[meta["id"]] = EntityHit(
                            meta["id"], meta["type"], meta["name"], meta["tier"], in_title
                        )
                    elif in_title:
                        hit.in_title = True
        return list(found.values())


def _boundary_ok(text: str, start: int, end: int) -> bool:
    before = text[start - 1] if start > 0 else " "
    after = text[end + 1] if end + 1 < len(text) else " "
    return not _WORD.match(before) and not _WORD.match(after)


def choose_primary(hits: list[EntityHit]) -> EntityHit | None:
    if not hits:
        return None
    return max(
        hits,
        key=lambda h: (h.in_title, _TYPE_RANK.get(h.entity_type, 0), h.tier),
    )
