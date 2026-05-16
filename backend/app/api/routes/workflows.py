from __future__ import annotations

from fastapi import APIRouter, Depends

from backend.app.api.deps import CurrentUser, get_current_user

router = APIRouter(prefix="/workflows", tags=["workflows"])


@router.get("/health")
async def workflow_health(current_user: CurrentUser = Depends(get_current_user)) -> dict[str, object]:
    return {"status": "healthy", "organizations": current_user.organization_ids}

