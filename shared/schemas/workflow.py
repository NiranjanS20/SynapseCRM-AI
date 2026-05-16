from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


WorkflowStatus = Literal["pending", "running", "retrying", "completed", "failed"]


class WorkflowState(BaseModel):
    workflow_id: str
    organization_id: str
    lead_id: str | None = None
    session_id: str | None = None
    status: WorkflowStatus = "pending"
    stage: str = "intake"
    source: str = "api"
    lead_score: int = 0
    priority: str = "medium"
    intent: str = "unknown"
    insights: dict[str, Any] = Field(default_factory=dict)
    memory: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    error_message: str | None = None
    updated_at: datetime | None = None


class WorkflowEvent(BaseModel):
    workflow_id: str
    organization_id: str
    event_type: str
    payload: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None


class AgentResult(BaseModel):
    agent_name: str
    status: Literal["success", "failed", "skipped"] = "success"
    output: dict[str, Any] = Field(default_factory=dict)
    latency_ms: int = 0
    provider: str | None = None
    tokens_used: int = 0
    error_message: str | None = None
