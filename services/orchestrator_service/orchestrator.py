from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from langgraph.graph import END, START, StateGraph

from agents.analytics_agent.agent import AnalyticsAgent
from agents.intent_agent.agent import IntentAgent
from agents.outreach_agent.agent import OutreachAgent
from agents.qualification_agent.agent import QualificationAgent
from agents.recommendation_agent.agent import RecommendationAgent
from agents.research_agent.agent import ResearchAgent
from agents.reminder_agent.agent import ReminderAgent
from agents.summary_agent.agent import SummaryAgent
from shared.schemas.workflow import WorkflowState
from services.analytics_service.analytics_service import analytics_service
from services.memory_service.memory_service import memory_service
from services.websocket_service.ws_manager import ws_manager

logger = logging.getLogger(__name__)


class OrchestratorService:
    def __init__(self) -> None:
        self.intent_agent = IntentAgent()
        self.research_agent = ResearchAgent()
        self.qualification_agent = QualificationAgent()
        self.recommendation_agent = RecommendationAgent()
        self.outreach_agent = OutreachAgent()
        self.reminder_agent = ReminderAgent()
        self.summary_agent = SummaryAgent()
        self.analytics_agent = AnalyticsAgent()
        self.graph = self._build_graph().compile()

    def _build_graph(self) -> StateGraph:
        graph = StateGraph(dict)
        graph.add_node("intent", self._intent_node)
        graph.add_node("research", self._research_node)
        graph.add_node("qualify", self._qualification_node)
        graph.add_node("recommend", self._recommendation_node)
        graph.add_node("outreach", self._outreach_node)
        graph.add_node("reminder", self._reminder_node)
        graph.add_node("summary", self._summary_node)
        graph.add_node("analytics", self._analytics_node)
        graph.add_edge(START, "intent")
        graph.add_edge("intent", "research")
        graph.add_edge("research", "qualify")
        graph.add_edge("qualify", "recommend")
        graph.add_edge("recommend", "outreach")
        graph.add_edge("outreach", "reminder")
        graph.add_edge("reminder", "summary")
        graph.add_edge("summary", "analytics")
        graph.add_edge("analytics", END)
        return graph

    async def _persist_state(self, state: dict[str, Any], stage: str) -> dict[str, Any]:
        state = {**state, "stage": stage, "updated_at": datetime.now(timezone.utc).isoformat()}
        await memory_service.set_session_value(state["session_id"], "workflow_state", state)
        return state

    async def _intent_node(self, state: dict[str, Any]) -> dict[str, Any]:
        result = await self.intent_agent.run(state)
        return await self._persist_state({**state, **result}, "intent")

    async def _research_node(self, state: dict[str, Any]) -> dict[str, Any]:
        result = await self.research_agent.run(state)
        return await self._persist_state({**state, **result}, "research")

    async def _qualification_node(self, state: dict[str, Any]) -> dict[str, Any]:
        result = await self.qualification_agent.run(state)
        return await self._persist_state({**state, **result}, "qualification")

    async def _recommendation_node(self, state: dict[str, Any]) -> dict[str, Any]:
        result = await self.recommendation_agent.run(state)
        return await self._persist_state({**state, **result}, "recommendation")

    async def _outreach_node(self, state: dict[str, Any]) -> dict[str, Any]:
        result = await self.outreach_agent.run(state)
        return await self._persist_state({**state, **result}, "outreach")

    async def _reminder_node(self, state: dict[str, Any]) -> dict[str, Any]:
        result = await self.reminder_agent.run(state)
        return await self._persist_state({**state, **result}, "reminder")

    async def _summary_node(self, state: dict[str, Any]) -> dict[str, Any]:
        result = await self.summary_agent.run(state)
        return await self._persist_state({**state, **result}, "summary")

    async def _analytics_node(self, state: dict[str, Any]) -> dict[str, Any]:
        result = await self.analytics_agent.run(state)
        analytics_service.emit_event("workflow.completed", state["organization_id"], {"workflow_id": state["workflow_id"], "stage": state.get("stage", "analytics")})
        await ws_manager.broadcast(state["organization_id"], "workflow.updated", {"workflow_id": state["workflow_id"], "status": "completed", "stage": state.get("stage", "analytics")})
        return await self._persist_state({**state, **result, "status": "completed"}, "analytics")

    async def run(self, state: WorkflowState | dict[str, Any]) -> dict[str, Any]:
        payload = state.model_dump() if isinstance(state, WorkflowState) else dict(state)
        payload.setdefault("status", "pending")
        payload.setdefault("session_id", payload["workflow_id"])
        return await self.graph.ainvoke(payload)


orchestrator_service = OrchestratorService()
