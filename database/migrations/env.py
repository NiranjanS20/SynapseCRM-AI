from __future__ import annotations

import os
from pathlib import Path

from alembic import context
from sqlalchemy import create_engine, pool
from dotenv import load_dotenv

config = context.config
target_metadata = None

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

database_url = os.environ.get("DATABASE_URL") or os.environ.get("SQLALCHEMY_DATABASE_URL") or config.get_main_option("sqlalchemy.url")
if database_url:
    if database_url.startswith("postgresql+asyncpg://"):
        database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")
    config.set_main_option("sqlalchemy.url", database_url)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(config.get_main_option("sqlalchemy.url"), poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
