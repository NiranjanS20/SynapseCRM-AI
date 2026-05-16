from __future__ import annotations

import asyncio
import json
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any

from fastapi import WebSocket


@dataclass
class ConnectionGroup:
    sockets: set[WebSocket] = field(default_factory=set)


class WebSocketManager:
    def __init__(self) -> None:
        self._groups: dict[str, ConnectionGroup] = defaultdict(ConnectionGroup)
        self._lock = asyncio.Lock()

    async def connect(self, organization_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._groups[organization_id].sockets.add(websocket)

    async def disconnect(self, organization_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            self._groups[organization_id].sockets.discard(websocket)

    async def broadcast(self, organization_id: str, event: str, data: dict[str, Any]) -> None:
        payload = json.dumps({"event": event, "data": data}, default=str)
        sockets = list(self._groups.get(organization_id, ConnectionGroup()).sockets)
        for websocket in sockets:
            try:
                await websocket.send_text(payload)
            except Exception:
                await self.disconnect(organization_id, websocket)


ws_manager = WebSocketManager()
