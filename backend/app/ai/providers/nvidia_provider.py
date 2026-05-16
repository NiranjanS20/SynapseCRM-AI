from __future__ import annotations

import time
from typing import AsyncGenerator

from openai import AsyncOpenAI

from backend.app.core.config import settings
from backend.app.ai.providers.base import BaseProvider
from backend.app.ai.schemas.ai import AIRequest, AIResponse


class NVIDIAProvider(BaseProvider):
    def __init__(self) -> None:
        self.api_key = settings.nvidia_nim_api_key
        self.base_url = settings.nvidia_nim_base_url
        self.model = settings.nvidia_nim_model
        
        if self.api_key:
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
        else:
            self.client = None

    async def generate(self, request: AIRequest) -> AIResponse:
        if not self.client:
            raise ValueError("NVIDIA API key not configured")

        start_time = time.perf_counter()

        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})

        response = await self.client.chat.completions.create(
            model=self.model,
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
            provider="nvidia",
            model=self.model,
            latency_ms=latency_ms,
            token_usage=token_usage,
        )

    async def stream(self, request: AIRequest) -> AsyncGenerator[str, None]:
        if not self.client:
            raise ValueError("NVIDIA API key not configured")

        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})

        response_stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            stream=True,
        )
        
        async for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
