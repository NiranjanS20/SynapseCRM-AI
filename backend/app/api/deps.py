"""Enhanced API dependencies — org context, role checking."""
from __future__ import annotations

import uuid

from fastapi import Depends, Header, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_session
from backend.app.schemas.auth import CurrentUser
from backend.app.auth.dependencies import get_current_user
from backend.app.services.membership_service import membership_service


async def get_org_id(
    organization_id: uuid.UUID = Query(..., alias="organization_id"),
    current_user: CurrentUser = Depends(get_current_user),
) -> uuid.UUID:
    """Extract and validate organization_id from query params."""
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organization access denied")
    return organization_id


async def get_org_id_header(
    x_organization_id: str = Header(..., alias="X-Organization-Id"),
    current_user: CurrentUser = Depends(get_current_user),
) -> uuid.UUID:
    """Extract org from header — for mutations."""
    if x_organization_id not in current_user.organization_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organization access denied")
    return uuid.UUID(x_organization_id)


def require_role(min_role: str = "viewer"):
    """Dependency factory: check user has minimum role in org."""
    async def _check(
        organization_id: uuid.UUID = Depends(get_org_id),
        current_user: CurrentUser = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
    ) -> CurrentUser:
        has_perm = await membership_service.check_permission(session, current_user.id, organization_id, min_role)
        if not has_perm:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Requires {min_role} role or above")
        return current_user
    return _check


__all__ = ["get_session", "get_current_user", "CurrentUser", "get_org_id", "get_org_id_header", "require_role"]
