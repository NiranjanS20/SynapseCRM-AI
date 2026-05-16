from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

import redis.asyncio as redis

from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class MemoryService:
    def __init__(self) -> None:
        self._redis: redis.Redis | None = None
        self._local: dict[str, dict[str, Any]] = {}

    async def _client(self) -> redis.Redis | None:
        if self._redis is None:
            try:
                self._redis = redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
                await self._redis.ping()
            except Exception as exc:
                logger.warning("redis_unavailable", extra={"error": str(exc)})
                self._redis = None
        return self._redis

    async def set_session_value(self, session_id: str, key: str, value: Any, ttl_seconds: int = 86400) -> None:
        client = await self._client()
        if client:
            await client.setex(f"session:{session_id}:{key}", ttl_seconds, json.dumps(value))
            return
        self._local.setdefault(session_id, {})[key] = value

    async def get_session_value(self, session_id: str, key: str) -> Any:
        client = await self._client()
        if client:
            raw = await client.get(f"session:{session_id}:{key}")
            return json.loads(raw) if raw else None
        return self._local.get(session_id, {}).get(key)

    async def append_history(self, session_id: str, role: str, content: str) -> None:
        history = await self.get_session_value(session_id, "history") or []
        history.append({"role": role, "content": content, "timestamp": datetime.now(timezone.utc).isoformat()})
        await self.set_session_value(session_id, "history", history[-50:])


memory_service = MemoryService()

