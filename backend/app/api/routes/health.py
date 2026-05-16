from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from shared.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", timestamp=datetime.now(timezone.utc), services={"api": "ready", "redis": "configured", "rabbitmq": "configured", "supabase": "configured"})


@router.get("/ready")
async def ready() -> dict[str, str]:
    return {"status": "ready"}
