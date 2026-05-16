"""Lead request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

LeadStatus = Literal["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost", "churned"]
LeadPriority = Literal["low", "medium", "high", "urgent"]
LeadSource = Literal["manual", "website", "referral", "linkedin", "cold_outreach", "inbound", "event", "partner", "other"]


class LeadCreate(BaseModel):
    organization_id: UUID
    name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    company: str = Field(..., min_length=1, max_length=255)
    job_title: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    industry: str | None = Field(default=None, max_length=100)
    source: LeadSource = "manual"
    status: LeadStatus = "new"
    priority: LeadPriority = "medium"
    lead_score: int = Field(default=0, ge=0, le=100)
    estimated_value: float | None = Field(default=None, ge=0)
    tags: list[str] = Field(default_factory=list)
    notes: str | None = None
    owner_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class LeadUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    company: str | None = Field(default=None, max_length=255)
    job_title: str | None = None
    phone: str | None = None
    industry: str | None = None
    source: LeadSource | None = None
    status: LeadStatus | None = None
    priority: LeadPriority | None = None
    lead_score: int | None = Field(default=None, ge=0, le=100)
    estimated_value: float | None = None
    tags: list[str] | None = None
    notes: str | None = None
    owner_id: str | None = None
    metadata: dict[str, Any] | None = None


class LeadResponse(BaseModel):
    id: UUID
    organization_id: UUID
    owner_id: str | None = None
    name: str | None = None
    email: str | None = None
    company: str
    job_title: str | None = None
    phone: str | None = None
    industry: str | None = None
    source: str
    status: str
    priority: str
    lead_score: int
    estimated_value: float | None = None
    tags: list[str] = Field(default_factory=list)
    notes: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListParams(BaseModel):
    organization_id: UUID
    status: LeadStatus | None = None
    priority: LeadPriority | None = None
    source: LeadSource | None = None
    owner_id: str | None = None
    q: str | None = None
    sort_by: str = "created_at"
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
    limit: int = Field(default=25, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class LeadPipelineGroup(BaseModel):
    status: str
    count: int
    total_value: float
    leads: list[LeadResponse]


# Compatibility alias for existing route imports
class WorkflowTriggerRequest(BaseModel):
    organization_id: str
    source: str = "manual"
    payload: dict[str, Any] = Field(default_factory=dict)
