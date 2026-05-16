from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field

class AIRequest(BaseModel):
    prompt: str
    system_prompt: str | None = None
    task_type: Literal["quick_reply", "deep_reasoning", "long_analysis", "agentic_workflow", "general"] = "general"
    provider_preference: Literal["gemini", "groq", "nvidia", "auto"] = "auto"
    stream: bool = False
    metadata: dict[str, Any] = Field(default_factory=dict)

class AIResponse(BaseModel):
    content: str
    provider: str
    model: str
    latency_ms: int
    token_usage: dict[str, int] = Field(default_factory=dict)
    reasoning_content: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
