from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class OrganizationBase(BaseModel):
    name: str
    slug: str
    plan: str = "free"


class LeadCreate(BaseModel):
    organization_id: str
    assigned_user_id: str | None = None
    company_name: str
    contact_name: str | None = None
    email: EmailStr | None = None
    stage: str = "new"
    source: str = "manual"
    metadata: dict[str, Any] = Field(default_factory=dict)


class LeadRead(LeadCreate):
    id: str
    score: int = 0
    updated_at: datetime | None = None


class ConversationCreate(BaseModel):
    organization_id: str
    lead_id: str
    channel: str = "email"
    direction: str = "inbound"
    subject: str | None = None
    message: str
    sender_email: EmailStr | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class AnalyticsMetric(BaseModel):
    name: str
    value: float
    period: str = "daily"
    dimensions: dict[str, Any] = Field(default_factory=dict)
