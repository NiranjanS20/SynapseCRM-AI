from __future__ import annotations

from pathlib import Path

from alembic import op

revision = "0002_rls"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def _sql(path: str) -> str:
    return Path(__file__).resolve().parents[2].joinpath(path).read_text(encoding="utf-8")


def upgrade() -> None:
    op.execute(_sql("policies/002_rls.sql"))


def downgrade() -> None:
    pass
