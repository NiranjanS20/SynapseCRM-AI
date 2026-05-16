from __future__ import annotations

from pathlib import Path

from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def _sql(path: str) -> str:
    return Path(__file__).resolve().parents[2].joinpath(path).read_text(encoding="utf-8")


def upgrade() -> None:
    op.execute(_sql("schemas/001_init.sql"))


def downgrade() -> None:
    op.execute("drop table if exists embeddings cascade; drop table if exists documents cascade; drop table if exists outreach_campaigns cascade; drop table if exists agent_logs cascade; drop table if exists analytics cascade; drop table if exists reminders cascade; drop table if exists workflows cascade; drop table if exists activities cascade; drop table if exists conversations cascade; drop table if exists leads cascade; drop table if exists memberships cascade; drop table if exists users cascade; drop table if exists organizations cascade;")
