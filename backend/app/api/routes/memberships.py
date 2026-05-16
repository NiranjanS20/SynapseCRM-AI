"""Membership routes."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.schemas.common import Envelope
from backend.app.schemas.membership import MembershipCreate, MembershipResponse, MembershipUpdate
from backend.app.services.membership_service import membership_service

router = APIRouter(prefix="/organizations/{org_id}/members", tags=["memberships"])


@router.get("", response_model=Envelope)
async def list_members(org_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(org_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    members = await membership_service.list_members(session, org_id)
    return Envelope(data=[MembershipResponse(**m) for m in members])


@router.post("", response_model=Envelope)
async def add_member(org_id: uuid.UUID, payload: MembershipCreate, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(org_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    has_perm = await membership_service.check_permission(session, current_user.id, org_id, "admin")
    if not has_perm:
        raise HTTPException(status_code=403, detail="Requires admin role")
    if not payload.user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    membership = await membership_service.add_member(session, org_id, payload.user_id, payload.role)
    return Envelope(data=MembershipResponse.model_validate(membership), message="Member added")


@router.patch("/{member_id}", response_model=Envelope)
async def update_member_role(org_id: uuid.UUID, member_id: uuid.UUID, payload: MembershipUpdate, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(org_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    has_perm = await membership_service.check_permission(session, current_user.id, org_id, "admin")
    if not has_perm:
        raise HTTPException(status_code=403, detail="Requires admin role")
    membership = await membership_service.update_role(session, member_id, payload.role)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    return Envelope(data=MembershipResponse.model_validate(membership), message="Role updated")


@router.delete("/{member_id}", response_model=Envelope)
async def remove_member(org_id: uuid.UUID, member_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(org_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    has_perm = await membership_service.check_permission(session, current_user.id, org_id, "owner")
    if not has_perm:
        raise HTTPException(status_code=403, detail="Requires owner role")
    removed = await membership_service.remove_member(session, member_id)
    if not removed:
        raise HTTPException(status_code=400, detail="Cannot remove member")
    return Envelope(message="Member removed")
