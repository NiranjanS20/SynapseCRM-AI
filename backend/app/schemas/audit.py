"""Audit log response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class AuditLogResponse(BaseModel):
    id: UUID
    organization_id: UUID
    user_id: str | None = None
    action: str
    entity_type: str
    entity_id: UUID | None = None
    before_state: dict[str, Any] | None = None
    after_state: dict[str, Any] | None = None
    created_at: datetime
    # Joined user info
    user_name: str | None = None
    user_email: str | None = None

    model_config = {"from_attributes": True}
