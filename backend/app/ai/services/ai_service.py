from __future__ import annotations

from typing import AsyncGenerator

from backend.app.ai.router.llm_router import llm_router
from backend.app.ai.schemas.ai import AIRequest, AIResponse

class AIService:
    """
    Centralized service layer for AI generation. 
    Other modules MUST use this service instead of calling providers directly.
    """
    
    async def generate_response(self, request: AIRequest) -> AIResponse:
        """Generate a complete text response via the LLM router."""
        return await llm_router.generate(request)

    async def stream_response(self, request: AIRequest) -> AsyncGenerator[str, None]:
        """Stream a text response via the LLM router."""
        async for chunk in llm_router.stream(request):
            yield chunk

ai_service = AIService()
