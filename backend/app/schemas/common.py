"""Shared base schemas: pagination, envelope, errors, sorting."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field


# ── Envelope ──────────────────────────────────────────────

class ApiResponse(BaseModel, Generic[TypeVar("T")]):
    """Unused generic – kept for reference. Actual envelope below."""
    pass


class Envelope(BaseModel):
    success: bool = True
    data: Any = None
    message: str | None = None
    meta: dict[str, Any] | None = None


class ErrorDetail(BaseModel):
    error: str
    code: str
    details: dict[str, Any] = Field(default_factory=dict)


# ── Pagination ────────────────────────────────────────────

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T] = Field(default_factory=list)
    total: int = 0
    limit: int = 25
    offset: int = 0
    has_more: bool = False


class PaginationParams(BaseModel):
    limit: int = Field(default=25, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class SortParams(BaseModel):
    sort_by: str = "created_at"
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")


class SearchParams(BaseModel):
    q: str | None = None


# ── Health ────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    services: dict[str, str] = Field(default_factory=dict)
