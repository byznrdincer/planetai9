"""drop unused newsletter_subscribers

Revision ID: 2a7b5ee4195e
Revises: 239d0026ac5b
Create Date: 2026-09-08 20:16:31.619130
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "2a7b5ee4195e"
down_revision: str | None = "239d0026ac5b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # newsletter feature was removed (commit 9086069); the table was never wired up
    op.drop_table("newsletter_subscribers")


def downgrade() -> None:
    op.create_table(
        "newsletter_subscribers",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("email", sa.VARCHAR(length=320), nullable=False),
        sa.Column("locale", sa.VARCHAR(length=4), nullable=False),
        sa.Column("confirmed", sa.BOOLEAN(), nullable=False),
        sa.Column("source", sa.VARCHAR(length=40), nullable=True),
        sa.Column(
            "created_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_newsletter_subscribers"),
        sa.UniqueConstraint("email", name="uq_newsletter_subscribers_email"),
    )
