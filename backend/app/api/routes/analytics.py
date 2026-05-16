from __future__ import annotations

from fastapi import APIRouter, Depends

from backend.app.api.deps import CurrentUser, get_current_user
from services.analytics_service.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def dashboard(current_user: CurrentUser = Depends(get_current_user)) -> dict:
    return {"organization_ids": current_user.organization_ids, **analytics_service.build_snapshot()}

