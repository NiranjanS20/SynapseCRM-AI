"""Leads routes — full CRUD, pipeline, search via service layer."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.schemas.common import Envelope, PaginatedResponse
from backend.app.schemas.lead import LeadCreate, LeadListParams, LeadResponse, LeadUpdate
from backend.app.services.lead_service import lead_service

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=Envelope)
async def list_leads(
    organization_id: uuid.UUID, status: str | None = None,
    priority: str | None = None, source: str | None = None,
    owner_id: str | None = None, q: str | None = None,
    sort_by: str = "created_at", sort_order: str = "desc",
    limit: int = Query(25, ge=1, le=100), offset: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    leads, total = await lead_service.list_leads(
        session, organization_id, status=status, priority=priority,
        source=source, owner_id=owner_id, q=q,
        sort_by=sort_by, sort_order=sort_order, limit=limit, offset=offset,
    )
    items = [LeadResponse.model_validate(lead) for lead in leads]
    return Envelope(data=PaginatedResponse(items=items, total=total, limit=limit, offset=offset, has_more=offset + limit < total))


@router.get("/pipeline", response_model=Envelope)
async def get_pipeline(organization_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    pipeline = await lead_service.get_pipeline(session, organization_id)
    for group in pipeline:
        group["leads"] = [LeadResponse.model_validate(l) for l in group["leads"]]
    return Envelope(data=pipeline)


@router.post("", response_model=Envelope)
async def create_lead(payload: LeadCreate, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(payload.organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    data = payload.model_dump(exclude={"organization_id"})
    lead = await lead_service.create(session, payload.organization_id, current_user.id, **data)
    return Envelope(data=LeadResponse.model_validate(lead), message="Lead created")


@router.get("/{lead_id}", response_model=Envelope)
async def get_lead(lead_id: uuid.UUID, organization_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    lead = await lead_service.get(session, lead_id, organization_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return Envelope(data=LeadResponse.model_validate(lead))


@router.patch("/{lead_id}", response_model=Envelope)
async def update_lead(lead_id: uuid.UUID, payload: LeadUpdate, organization_id: uuid.UUID = Query(...), current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    updates = payload.model_dump(exclude_unset=True)
    lead = await lead_service.update(session, lead_id, organization_id, current_user.id, **updates)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return Envelope(data=LeadResponse.model_validate(lead), message="Lead updated")


@router.delete("/{lead_id}", response_model=Envelope)
async def delete_lead(lead_id: uuid.UUID, organization_id: uuid.UUID = Query(...), current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    deleted = await lead_service.soft_delete(session, lead_id, organization_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
    return Envelope(message="Lead deleted")
