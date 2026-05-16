"""Conversation & message request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field

Channel = Literal["email", "meeting", "call", "chat", "manual_note"]
SenderType = Literal["user", "contact", "system", "ai"]


class ConversationCreate(BaseModel):
    organization_id: UUID
    lead_id: UUID
    channel: Channel = "email"
    subject: str | None = Field(default=None, max_length=255)
    message: str = Field(..., min_length=1)
    summary: str | None = None
    sender_email: str | None = None
    direction: str = "inbound"


class ConversationResponse(BaseModel):
    id: UUID
    organization_id: UUID
    lead_id: UUID
    channel: str
    direction: str
    subject: str | None = None
    message: str
    summary: str | None = None
    sender_email: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    message_count: int = 0
    # Joined lead info
    lead_name: str | None = None
    lead_company: str | None = None

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    sender_type: SenderType = "user"
    content: str = Field(..., min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_type: str
    content: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = {"from_attributes": True}
