from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from time import perf_counter
from typing import Any

from services.llm_router_service.router import llm_router_service

logger = logging.getLogger(__name__)


@dataclass
class AgentOutcome:
    name: str
    status: str
    output: dict[str, Any]
    latency_ms: int
    provider: str | None = None
    tokens_used: int = 0


class BaseWorkflowAgent(ABC):
    agent_name: str = "base"
    complexity: str = "medium"

    def __init__(self) -> None:
        self.router = llm_router_service

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        started_at = perf_counter()
        try:
            result = await self.execute(state)
            result.setdefault("agent_name", self.agent_name)
            result.setdefault("agent_latency_ms", int((perf_counter() - started_at) * 1000))
            return result
        except Exception as exc:
            logger.exception("agent_failed", extra={"agent": self.agent_name})
            return {**state, "agent_name": self.agent_name, "status": "failed", "error_message": str(exc)}

    async def ask_llm(self, system: str, prompt: str, temperature: float = 0.2) -> dict[str, Any]:
        response = await self.router.complete(system=system, prompt=prompt, complexity=self.complexity, temperature=temperature)
        try:
            return json.loads(response.content)
        except json.JSONDecodeError:
            return {"text": response.content, "provider": response.provider, "tokens_used": response.tokens_used}

    @abstractmethod
    async def execute(self, state: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
