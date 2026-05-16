from __future__ import annotations

import logging
from typing import AsyncGenerator

from backend.app.ai.providers.base import BaseProvider
from backend.app.ai.providers.gemini_provider import GeminiProvider
from backend.app.ai.providers.groq_provider import GroqProvider
from backend.app.ai.providers.nvidia_provider import NVIDIAProvider
from backend.app.ai.schemas.ai import AIRequest, AIResponse

logger = logging.getLogger(__name__)

class LLMRouter:
    def __init__(self) -> None:
        self.providers: dict[str, BaseProvider] = {
            "gemini": GeminiProvider(),
            "groq": GroqProvider(),
            "nvidia": NVIDIAProvider(),
        }

    def _select_provider(self, request: AIRequest) -> list[str]:
        """
        Returns a list of provider names to try, in order of preference.
        """
        if request.provider_preference != "auto" and request.provider_preference in self.providers:
            # If user explicitly wants a provider, put it first, then fallback to others
            others = [p for p in self.providers.keys() if p != request.provider_preference]
            return [request.provider_preference] + others

        # Auto-routing strategy
        if request.task_type == "quick_reply":
            return ["groq", "nvidia", "gemini"]
        elif request.task_type == "deep_reasoning" or request.task_type == "agentic_workflow":
            return ["nvidia", "gemini", "groq"]
        elif request.task_type == "long_analysis":
            return ["gemini", "nvidia", "groq"]
        
        # Default fallback chain
        return ["nvidia", "gemini", "groq"]

    async def generate(self, request: AIRequest) -> AIResponse:
        routing_chain = self._select_provider(request)
        
        last_exception = None
        for provider_name in routing_chain:
            provider = self.providers.get(provider_name)
            if not provider:
                continue
            
            try:
                logger.info(f"Attempting generation with provider: {provider_name}")
                response = await provider.generate(request)
                return response
            except Exception as e:
                logger.warning(f"Provider {provider_name} failed: {e}")
                last_exception = e
                continue
                
        raise RuntimeError(f"All AI providers failed. Last error: {last_exception}")

    async def stream(self, request: AIRequest) -> AsyncGenerator[str, None]:
        routing_chain = self._select_provider(request)
        
        last_exception = None
        for provider_name in routing_chain:
            provider = self.providers.get(provider_name)
            if not provider:
                continue
            
            try:
                logger.info(f"Attempting streaming with provider: {provider_name}")
                # Note: If stream fails midway, fallbacks are hard to handle without buffering.
                # Here we assume the connection establishes successfully.
                stream_generator = provider.stream(request)
                # Test the first chunk to catch immediate auth/connection errors
                try:
                    first_chunk = await stream_generator.__anext__()
                    yield first_chunk
                except StopAsyncIteration:
                    return
                
                async for chunk in stream_generator:
                    yield chunk
                    
                return # Successfully streamed entirely
            except Exception as e:
                logger.warning(f"Provider {provider_name} stream failed: {e}")
                last_exception = e
                continue
                
        raise RuntimeError(f"All AI stream providers failed. Last error: {last_exception}")

llm_router = LLMRouter()
