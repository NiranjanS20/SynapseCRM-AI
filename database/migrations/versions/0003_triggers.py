from __future__ import annotations

from pathlib import Path

from alembic import op

revision = "0003_triggers"
down_revision = "0002_rls"
branch_labels = None
depends_on = None


def _sql(path: str) -> str:
    return Path(__file__).resolve().parents[2].joinpath(path).read_text(encoding="utf-8")


def upgrade() -> None:
    op.execute(_sql("functions/003_triggers.sql"))


def downgrade() -> None:
    pass
