"""event translations + source/event lang

Revision ID: 239d0026ac5b
Revises: c3b0a209a128
Create Date: 2026-09-08 15:07:46.443094
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "239d0026ac5b"
down_revision: str | None = "c3b0a209a128"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# feeds that publish in Turkish — keep in sync with events router TR_SOURCE_SLUGS
TR_SOURCE_SLUGS = ("webrazzi", "shiftdelete", "techinside", "donanimhaber", "log-tr")


def upgrade() -> None:
    op.create_table(
        "event_translations",
        sa.Column("event_id", sa.Uuid(), nullable=False),
        sa.Column("target_lang", sa.String(length=8), nullable=False),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("body_text", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=12), nullable=False, server_default="pending"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("source_hash", sa.String(length=64), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("event_id", "target_lang"),
    )
    op.create_index("ix_event_translations_status", "event_translations", ["status", "target_lang"])

    # publishing language of a feed / of an event's stored text
    op.add_column(
        "sources", sa.Column("lang", sa.String(length=8), nullable=False, server_default="en")
    )
    op.add_column(
        "events", sa.Column("lang", sa.String(length=8), nullable=False, server_default="en")
    )

    bind = op.get_bind()
    # 1. mark the Turkish feeds
    bind.execute(
        sa.text("UPDATE sources SET lang = 'tr' WHERE slug = ANY(:slugs)"),
        {"slugs": list(TR_SOURCE_SLUGS)},
    )
    # 2. an event is 'tr' when its most-trusted article comes from a tr feed
    bind.execute(
        sa.text(
            """
            UPDATE events e SET lang = 'tr'
            WHERE EXISTS (
                SELECT 1 FROM articles a
                JOIN sources s ON s.id = a.source_id
                WHERE a.event_id = e.id AND s.lang = 'tr'
            )
            """
        )
    )

    # drop the server defaults now that every row is populated; app supplies the value
    op.alter_column("sources", "lang", server_default=None)
    op.alter_column("events", "lang", server_default=None)


def downgrade() -> None:
    op.drop_column("events", "lang")
    op.drop_column("sources", "lang")
    op.drop_index("ix_event_translations_status", table_name="event_translations")
    op.drop_table("event_translations")
