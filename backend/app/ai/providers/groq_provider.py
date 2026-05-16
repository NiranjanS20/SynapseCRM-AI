from __future__ import annotations

import time
from typing import AsyncGenerator

from groq import AsyncGroq

from backend.app.core.config import settings
from backend.app.ai.providers.base import BaseProvider
from backend.app.ai.schemas.ai import AIRequest, AIResponse


class GroqProvider(BaseProvider):
    def __init__(self) -> None:
        self.api_key = settings.groq_api_key
        self.client = AsyncGroq(api_key=self.api_key) if self.api_key else None
        self.model_fast = settings.groq_model_fast
        self.model_reasoning = settings.groq_model_reasoning

    async def generate(self, request: AIRequest) -> AIResponse:
        if not self.client:
            raise ValueError("Groq API key not configured")

        start_time = time.perf_counter()

        model = self.model_reasoning if request.task_type == "deep_reasoning" else self.model_fast
        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})

        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
        )

        latency_ms = int((time.perf_counter() - start_time) * 1000)
        
        token_usage = {}
        if response.usage:
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }

        return AIResponse(
            content=response.choices[0].message.content or "",
            provider="groq",
            model=model,
            latency_ms=latency_ms,
            token_usage=token_usage,
        )

    async def stream(self, request: AIRequest) -> AsyncGenerator[str, None]:
        if not self.client:
            raise ValueError("Groq API key not configured")

        model = self.model_reasoning if request.task_type == "deep_reasoning" else self.model_fast
        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})

        response_stream = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
        )
        
        async for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
