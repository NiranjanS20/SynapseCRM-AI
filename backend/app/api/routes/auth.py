from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.auth.dependencies import get_current_user, verify_firebase_token
from backend.app.core.database import get_session
from backend.app.models import Membership, Organization, User
from backend.app.schemas.auth import CurrentUser, MeResponse, SessionResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/session", response_model=SessionResponse)
async def create_session(
    token_payload: dict = Depends(verify_firebase_token),
    session: AsyncSession = Depends(get_session),
) -> SessionResponse:
    """
    Called after the frontend successfully logs in via Firebase.
    Receives the Firebase JWT token (via HTTPBearer), validates it,
    and provisions the CRM user/organization if they don't exist.
    """
    firebase_uid = token_payload.get("uid")
    email = token_payload.get("email")
    full_name = token_payload.get("name")
    avatar_url = token_payload.get("picture")
    firebase_sign_in_provider = token_payload.get("firebase", {}).get("sign_in_provider")

    if not firebase_uid or not email:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    # Look for existing user by firebase_uid
    result = await session.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()

    is_new_user = False
    if not user:
        is_new_user = True
        # Generate internal UUID for User.id (or just use firebase_uid as string, but the user requested:
        # "Keep internal UUIDs for relational consistency, Firebase UID should act as external identity mapping")
        import uuid
        user_id = str(uuid.uuid4())
        
        user = User(
            id=user_id,
            firebase_uid=firebase_uid,
            email=email,
            full_name=full_name,
            avatar_url=avatar_url,
            auth_provider=firebase_sign_in_provider,
        )
        session.add(user)
        await session.flush()

    # Look for existing memberships
    memberships_result = await session.execute(select(Membership).where(Membership.user_id == user.id))
    memberships = memberships_result.scalars().all()

    org_ids = []
    role = "member"

    # If it's a new user (or somehow they have no memberships), auto-provision an organization
    if not memberships:
        org_name = f"{full_name or email.split('@')[0]}'s Workspace"
        org_slug = org_name.lower().replace(" ", "-").replace("'", "")
        # Add random suffix to slug to avoid collisions
        import random
        org_slug = f"{org_slug}-{random.randint(1000, 9999)}"

        org = Organization(name=org_name, slug=org_slug)
        session.add(org)
        await session.flush()

        membership = Membership(organization_id=org.id, user_id=user.id, role="owner")
        session.add(membership)
        await session.flush()
        
        org_ids = [str(org.id)]
        role = "owner"
    else:
        org_ids = [str(m.organization_id) for m in memberships]
        role = memberships[0].role

    await session.commit()

    return SessionResponse(
        access_token="firebase-handled", # Token is managed by frontend Firebase SDK
        user_id=str(user.id),
        email=user.email,
        organization_ids=org_ids,
        role=role,
    )


@router.get("/me", response_model=MeResponse)
async def get_me(current_user: CurrentUser = Depends(get_current_user)) -> MeResponse:
    """
    Returns the current CRM session context derived from the Firebase token.
    """
    return MeResponse(
        user_id=current_user.id,
        email=current_user.email,
        organization_ids=current_user.organization_ids,
        role=current_user.role,
    )
