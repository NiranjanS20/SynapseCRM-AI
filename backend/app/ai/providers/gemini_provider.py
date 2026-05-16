from __future__ import annotations

import time
from typing import AsyncGenerator

from google import genai

from backend.app.core.config import settings
from backend.app.ai.providers.base import BaseProvider
from backend.app.ai.schemas.ai import AIRequest, AIResponse


class GeminiProvider(BaseProvider):
    def __init__(self) -> None:
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model_reasoning
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    async def generate(self, request: AIRequest) -> AIResponse:
        if not self.client:
            raise ValueError("Gemini API key not configured")

        start_time = time.perf_counter()

        # google-genai async methods are experimental, using sync with wrapper or async if supported
        # For simplicity in this demo, calling sync blocks inside async unless we use threadpool,
        # but google-genai has `aio` client support.
        
        system_instruction = request.system_prompt
        contents = [request.prompt]

        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=contents,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
            )
        )

        latency_ms = int((time.perf_counter() - start_time) * 1000)
        
        token_usage = {}
        if response.usage_metadata:
            token_usage = {
                "prompt_tokens": response.usage_metadata.prompt_token_count,
                "completion_tokens": response.usage_metadata.candidates_token_count,
                "total_tokens": response.usage_metadata.total_token_count,
            }

        return AIResponse(
            content=response.text or "",
            provider="gemini",
            model=self.model,
            latency_ms=latency_ms,
            token_usage=token_usage,
        )

    async def stream(self, request: AIRequest) -> AsyncGenerator[str, None]:
        if not self.client:
            raise ValueError("Gemini API key not configured")

        system_instruction = request.system_prompt
        contents = [request.prompt]

        response_stream = await self.client.aio.models.generate_content_stream(
            model=self.model,
            contents=contents,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
            )
        )
        
        async for chunk in response_stream:
            if chunk.text:
                yield chunk.text
