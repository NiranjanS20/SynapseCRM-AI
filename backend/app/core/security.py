from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.database import get_session
from backend.app.models import Membership, User

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: str
    email: str
    organization_ids: list[str]
    role: str = "member"


def create_internal_token(payload: dict[str, str], expires_minutes: int = 60) -> str:
    now = datetime.now(timezone.utc)
    claims = {
        **payload,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_minutes)).timestamp()),
        "aud": "authenticated",
        "iss": settings.supabase_url,
    }
    secret = settings.supabase_jwt_secret or settings.supabase_service_role_key or "dev-secret"
    return jwt.encode(claims, secret, algorithm="HS256")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    secret = settings.supabase_jwt_secret or settings.supabase_service_role_key or "dev-secret"
    try:
        payload = jwt.decode(credentials.credentials, secret, algorithms=["HS256"], options={"verify_aud": False})
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid subject")

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not provisioned")

    memberships = (await session.execute(select(Membership).where(Membership.user_id == user.id))).scalars().all()
    organization_ids = [str(row.organization_id) for row in memberships]
    role = memberships[0].role if memberships else "member"
    return CurrentUser(id=str(user.id), email=user.email, organization_ids=organization_ids, role=role)

