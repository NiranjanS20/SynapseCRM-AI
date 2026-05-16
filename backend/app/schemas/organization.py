"""Organization request/response schemas."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=120, pattern=r"^[a-z0-9\-]+$")
    logo_url: str | None = None
    industry: str | None = None
    size: str | None = None


class OrganizationUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    logo_url: str | None = None
    industry: str | None = None
    size: str | None = None


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    logo_url: str | None = None
    industry: str | None = None
    size: str | None = None
    plan: str = "free"
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
