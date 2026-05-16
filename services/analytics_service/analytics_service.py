from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from typing import Any


class AnalyticsService:
    def __init__(self) -> None:
        self._events: list[dict[str, Any]] = []

    def emit_event(self, event_type: str, organization_id: str, payload: dict[str, Any] | None = None) -> None:
        self._events.append({
            "event_type": event_type,
            "organization_id": organization_id,
            "payload": payload or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    def build_snapshot(self) -> dict[str, Any]:
        counts = Counter(event["event_type"] for event in self._events)
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary": {"events_total": len(self._events), "by_type": dict(counts)},
            "outreach": {"generated": counts.get("outreach.generated", 0)},
            "pipeline": {"workflows": counts.get("workflow.completed", 0)},
            "ai_performance": {"events": counts.get("agent.completed", 0)},
        }


analytics_service = AnalyticsService()
