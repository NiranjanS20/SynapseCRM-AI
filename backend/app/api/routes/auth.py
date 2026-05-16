from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.core.security import create_internal_token
from backend.app.models import Membership, Organization, User
from backend.app.schemas.auth import LoginRequest, MeResponse, RegisterRequest, SessionResponse
from services.auth_service.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=SessionResponse)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_session)) -> SessionResponse:
    token_payload = await auth_service.register(payload.email, payload.password)
    user_id = token_payload.get("user", {}).get("id") or token_payload.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Supabase registration failed")

    org = Organization(name=payload.organization_name, slug=payload.organization_slug or payload.organization_name.lower().replace(" ", "-"))
    session.add(org)
    await session.flush()

    user = await session.get(User, user_id)
    if user is None:
        user = User(id=user_id, email=payload.email, full_name=payload.full_name)
        session.add(user)
        await session.flush()

    session.add(Membership(organization_id=org.id, user_id=user.id, role="owner"))
    access_token = create_internal_token({"sub": user.id, "email": user.email, "organization_id": str(org.id)})
    return SessionResponse(access_token=access_token, user_id=str(user.id), email=user.email, organization_ids=[str(org.id)], role="owner")


@router.post("/login", response_model=SessionResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)) -> SessionResponse:
    token_payload = await auth_service.login(payload.email, payload.password)
    access_token = token_payload.get("access_token")
    user_id = token_payload.get("user", {}).get("id") or token_payload.get("user_id") or token_payload.get("id")
    if not access_token or not user_id:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = await session.get(User, user_id)
    if user is None:
        user = User(id=user_id, email=payload.email)
        session.add(user)
        await session.flush()

    memberships = (await session.execute(select(Membership).where(Membership.user_id == user.id))).scalars().all()
    org_ids = [str(item.organization_id) for item in memberships]
    role = memberships[0].role if memberships else "member"
    return SessionResponse(access_token=access_token, user_id=str(user.id), email=user.email, organization_ids=org_ids, role=role)


@router.get("/me", response_model=MeResponse)
async def me(current_user: CurrentUser = Depends(get_current_user)) -> MeResponse:
    return MeResponse(user_id=current_user.id, email=current_user.email, organization_ids=current_user.organization_ids, role=current_user.role)

