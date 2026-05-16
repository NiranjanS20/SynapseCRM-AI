"""Activity routes."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.schemas.activity import ActivityCreate, ActivityResponse
from backend.app.schemas.common import Envelope, PaginatedResponse
from backend.app.services.activity_service import activity_service

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("", response_model=Envelope)
async def list_activities(
    organization_id: uuid.UUID, type: str | None = None,
    limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    items, total = await activity_service.list_for_org(session, organization_id, type=type, limit=limit, offset=offset)
    return Envelope(data=PaginatedResponse(items=[ActivityResponse(**i) for i in items], total=total, limit=limit, offset=offset, has_more=offset + limit < total))


@router.get("/lead/{lead_id}", response_model=Envelope)
async def list_lead_activities(
    lead_id: uuid.UUID, organization_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    items, total = await activity_service.list_for_lead(session, organization_id, lead_id, limit=limit, offset=offset)
    return Envelope(data=PaginatedResponse(items=[ActivityResponse(**i) for i in items], total=total, limit=limit, offset=offset, has_more=offset + limit < total))


@router.post("", response_model=Envelope)
async def create_activity(payload: ActivityCreate, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(payload.organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    activity = await activity_service.create(
        session, payload.organization_id, payload.lead_id, current_user.id,
        type=payload.type, title=payload.title, description=payload.description, metadata=payload.metadata,
    )
    return Envelope(data=ActivityResponse.model_validate(activity), message="Activity created")
