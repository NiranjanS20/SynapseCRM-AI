from __future__ import annotations

from abc import ABC, abstractmethod
from typing import AsyncGenerator

from backend.app.ai.schemas.ai import AIRequest, AIResponse

class BaseProvider(ABC):
    @abstractmethod
    async def generate(self, request: AIRequest) -> AIResponse:
        """Generate a complete response."""
        pass

    @abstractmethod
    async def stream(self, request: AIRequest) -> AsyncGenerator[str, None]:
        """Stream the response tokens."""
        pass
