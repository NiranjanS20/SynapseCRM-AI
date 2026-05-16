"""Analytics routes — real DB aggregation."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.schemas.common import Envelope
from backend.app.services.crm_analytics_service import crm_analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=Envelope)
async def analytics_overview(organization_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    data = await crm_analytics_service.get_dashboard(session, organization_id)
    return Envelope(data=data)


@router.get("/pipeline", response_model=Envelope)
async def pipeline_metrics(organization_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    data = await crm_analytics_service.get_pipeline_metrics(session, organization_id)
    return Envelope(data=data)


@router.get("/conversion", response_model=Envelope)
async def conversion_metrics(organization_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    data = await crm_analytics_service.get_conversion_metrics(session, organization_id)
    return Envelope(data=data)


@router.get("/activity", response_model=Envelope)
async def activity_metrics(organization_id: uuid.UUID, days: int = 30, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    data = await crm_analytics_service.get_activity_metrics(session, organization_id, days=days)
    return Envelope(data=data)
