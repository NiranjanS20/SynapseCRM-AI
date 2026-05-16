"""Activity request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field

ActivityType = Literal["note", "email", "call", "meeting", "status_change", "ai_action", "workflow_action", "task"]


class ActivityCreate(BaseModel):
    organization_id: UUID
    lead_id: UUID
    type: ActivityType
    title: str | None = Field(default=None, max_length=255)
    description: str = Field(..., min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ActivityResponse(BaseModel):
    id: UUID
    organization_id: UUID
    lead_id: UUID
    user_id: str | None = None
    type: str
    title: str | None = None
    description: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    # Joined user info
    user_name: str | None = None
    user_avatar: str | None = None

    model_config = {"from_attributes": True}
