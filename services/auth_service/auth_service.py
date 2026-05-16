from __future__ import annotations

from typing import Any

import httpx

from backend.app.core.config import settings


class AuthService:
    async def register(self, email: str, password: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            response = await client.post(
                f"{settings.supabase_url}/auth/v1/signup",
                headers={"apikey": settings.supabase_anon_key, "Content-Type": "application/json"},
                json={"email": email, "password": password},
            )
        response.raise_for_status()
        return response.json()

    async def login(self, email: str, password: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            response = await client.post(
                f"{settings.supabase_url}/auth/v1/token?grant_type=password",
                headers={"apikey": settings.supabase_anon_key, "Content-Type": "application/json"},
                json={"email": email, "password": password},
            )
        response.raise_for_status()
        return response.json()


auth_service = AuthService()

