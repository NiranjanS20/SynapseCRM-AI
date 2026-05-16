"""Membership request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

Role = Literal["owner", "admin", "manager", "sales", "viewer"]


class MembershipCreate(BaseModel):
    user_id: str | None = None
    email: EmailStr | None = None
    role: Role = "viewer"


class MembershipUpdate(BaseModel):
    role: Role


class InviteRequest(BaseModel):
    email: EmailStr
    role: Role = "viewer"


class MembershipResponse(BaseModel):
    id: UUID
    organization_id: UUID
    user_id: str
    role: str
    status: str
    created_at: datetime
    # Joined fields
    user_email: str | None = None
    user_name: str | None = None
    user_avatar: str | None = None

    model_config = {"from_attributes": True}
