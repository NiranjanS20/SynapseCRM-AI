from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field


class Envelope(BaseModel):
    success: bool = True
    message: str | None = None
    request_id: str | None = None


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T] = Field(default_factory=list)
    total: int = 0
    limit: int = 25
    offset: int = 0


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    services: dict[str, str] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    error: str
    code: str
    details: dict[str, Any] = Field(default_factory=dict)
