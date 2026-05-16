"""Organization routes."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.schemas.common import Envelope
from backend.app.schemas.organization import OrganizationCreate, OrganizationResponse, OrganizationUpdate
from backend.app.services.organization_service import organization_service

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=Envelope)
async def list_organizations(current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    orgs = await organization_service.list_for_user(session, current_user.id)
    return Envelope(data=[OrganizationResponse.model_validate(o) for o in orgs])


@router.post("", response_model=Envelope)
async def create_organization(payload: OrganizationCreate, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    existing = await organization_service.get_by_slug(session, payload.slug)
    if existing:
        raise HTTPException(status_code=409, detail="Organization slug already exists")
    org = await organization_service.create(session, name=payload.name, slug=payload.slug, owner_user_id=current_user.id, logo_url=payload.logo_url, industry=payload.industry, size=payload.size)
    return Envelope(data=OrganizationResponse.model_validate(org), message="Organization created")


@router.get("/{org_id}", response_model=Envelope)
async def get_organization(org_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(org_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    org = await organization_service.get(session, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return Envelope(data=OrganizationResponse.model_validate(org))


@router.patch("/{org_id}", response_model=Envelope)
async def update_organization(org_id: uuid.UUID, payload: OrganizationUpdate, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(org_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    updates = payload.model_dump(exclude_unset=True)
    org = await organization_service.update(session, org_id, **updates)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return Envelope(data=OrganizationResponse.model_validate(org), message="Organization updated")
