from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from enum import Enum
from time import perf_counter

import httpx

from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class TaskComplexity(str, Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"


@dataclass
class LLMResponse:
    content: str
    provider: str
    model: str
    tokens_used: int
    latency_ms: int


class LLMRouterService:
    def __init__(self) -> None:
        self._cache: dict[str, str] = {}

    async def complete(
        self,
        prompt: str,
        system: str,
        complexity: TaskComplexity = TaskComplexity.MEDIUM,
        temperature: float = 0.2,
        max_tokens: int = 1200,
        context: list[dict[str, str]] | None = None,
    ) -> LLMResponse:
        if complexity == TaskComplexity.SIMPLE:
            return await self._call_groq(prompt, system, settings.groq_model_fast, temperature, max_tokens, context or [])
        if complexity == TaskComplexity.MEDIUM and settings.groq_api_key:
            return await self._call_groq(prompt, system, settings.groq_model_reasoning, temperature, max_tokens, context or [])
        return await self._call_gemini(prompt, system, temperature, max_tokens)

    async def _call_groq(
        self,
        prompt: str,
        system: str,
        model: str,
        temperature: float,
        max_tokens: int,
        context: list[dict[str, str]],
    ) -> LLMResponse:
        if not settings.groq_api_key:
            return self._offline_response(prompt, system, "groq-offline")

        messages = [{"role": "system", "content": system}, *context, {"role": "user", "content": prompt}]
        start = perf_counter()
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json={"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens},
            )
        if response.status_code >= 400:
            logger.warning("groq_failed", extra={"status_code": response.status_code, "body": response.text})
            return await self._call_gemini(prompt, system, temperature, max_tokens)
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {}).get("total_tokens", 0)
        return LLMResponse(content=content, provider="groq", model=model, tokens_used=usage, latency_ms=int((perf_counter() - start) * 1000))

    async def _call_gemini(
        self,
        prompt: str,
        system: str,
        temperature: float,
        max_tokens: int,
    ) -> LLMResponse:
        if not settings.gemini_api_key:
            return self._offline_response(prompt, system, "gemini-offline")

        start = perf_counter()
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model_reasoning}:generateContent?key={settings.gemini_api_key}"
        )
        payload = {
            "system_instruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens},
        }
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds + 15) as client:
            response = await client.post(url, json=payload)
        if response.status_code >= 400:
            return self._offline_response(prompt, system, "fallback")
        data = response.json()
        content = data["candidates"][0]["content"]["parts"][0]["text"]
        usage = data.get("usageMetadata", {}).get("totalTokenCount", 0)
        return LLMResponse(content=content, provider="gemini", model=settings.gemini_model_reasoning, tokens_used=usage, latency_ms=int((perf_counter() - start) * 1000))

    def _offline_response(self, prompt: str, system: str, provider: str) -> LLMResponse:
        content = json.dumps({"provider": provider, "system": system[:120], "prompt": prompt[:200]}, ensure_ascii=True)
        return LLMResponse(content=content, provider=provider, model="offline", tokens_used=0, latency_ms=0)


llm_router_service = LLMRouterService()

