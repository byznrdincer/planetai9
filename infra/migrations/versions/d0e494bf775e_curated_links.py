"""curated_links

Revision ID: d0e494bf775e
Revises: 2a7b5ee4195e
Create Date: 2026-09-10 11:57:22.048586
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "d0e494bf775e"
down_revision: str | None = "2a7b5ee4195e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:

    op.create_table(
        "curated_links",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("collection", sa.String(length=30), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("kind", sa.String(length=30), nullable=False),
        sa.Column("note_tr", sa.Text(), nullable=True),
        sa.Column("note_en", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_curated_links")),
        sa.UniqueConstraint("collection", "name", name="curated_links_collection_name"),
    )
    op.create_index(
        "ix_curated_links_collection", "curated_links", ["collection", "sort_order"], unique=False
    )


def downgrade() -> None:

    op.drop_index("ix_curated_links_collection", table_name="curated_links")
    op.drop_table("curated_links")
