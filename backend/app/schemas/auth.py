"""Auth request/response schemas."""
from __future__ import annotations

from pydantic import BaseModel, EmailStr


class CurrentUser(BaseModel):
    id: str
    email: str
    organization_ids: list[str]
    role: str = "member"

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    organization_name: str
    organization_slug: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SessionResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    organization_ids: list[str]
    role: str


class MeResponse(BaseModel):
    user_id: str
    email: str
    organization_ids: list[str]
    role: str
