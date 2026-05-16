"""Audit log routes."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.schemas.audit import AuditLogResponse
from backend.app.schemas.common import Envelope, PaginatedResponse
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get("", response_model=Envelope)
async def list_audit_logs(
    organization_id: uuid.UUID, entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    items, total = await audit_service.list_logs(session, organization_id, entity_type=entity_type, entity_id=entity_id, limit=limit, offset=offset)
    return Envelope(data=PaginatedResponse(items=[AuditLogResponse(**i) for i in items], total=total, limit=limit, offset=offset, has_more=offset + limit < total))
