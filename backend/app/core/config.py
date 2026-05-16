from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_ENV = Path(__file__).resolve().parents[4] / ".env"
ROOT_ENV_LOCAL = Path(__file__).resolve().parents[4] / ".env.local"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(str(ROOT_ENV), str(ROOT_ENV_LOCAL), ".env", ".env.local"), env_file_encoding="utf-8", extra="ignore")

    app_name: str = "SynapseCRM AI"
    app_version: str = "1.0.0"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    api_prefix: str = "/api/v1"

    database_url: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/synapsecrm_ai", alias="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    rabbitmq_url: str = Field(default="amqp://guest:guest@localhost:5672/", alias="RABBITMQ_URL")

    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_anon_key: str = Field(alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_jwt_secret: str = Field(default="", alias="SUPABASE_JWT_SECRET")

    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    api_base_url: str = Field(default="http://localhost:8000", alias="API_BASE_URL")
    next_public_api_base_url: str = Field(default="http://localhost:8000", alias="NEXT_PUBLIC_API_BASE_URL")
    next_public_ws_url: str = Field(default="ws://localhost:8000", alias="NEXT_PUBLIC_WS_URL")

    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    groq_model_fast: str = "llama-3.1-8b-instant"
    groq_model_reasoning: str = "llama-3.1-70b-versatile"
    gemini_model_reasoning: str = "gemini-1.5-flash"

    langsmith_api_key: str = Field(default="", alias="LANGSMITH_API_KEY")
    langsmith_project: str = Field(default="synapsecrm-ai", alias="LANGSMITH_PROJECT")

    rate_limit_per_minute: int = 120
    request_timeout_seconds: int = 30
    max_retries: int = 3
    heartbeat_interval_seconds: int = 30
    vector_top_k: int = 6
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    rls_tenant_claim: str = "organization_id"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
