from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_session
from backend.app.schemas.auth import CurrentUser
from backend.app.models import Membership, User

bearer_scheme = HTTPBearer(auto_error=False)


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    try:
        # Verify the ID token while checking if the token is revoked
        decoded_token = auth.verify_id_token(credentials.credentials, check_revoked=True)
        return decoded_token
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))


async def get_current_user(
    token_payload: dict = Depends(verify_firebase_token),
    session: AsyncSession = Depends(get_session),
) -> CurrentUser:
    firebase_uid = token_payload.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    # We lookup the user by firebase_uid
    result = await session.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not provisioned")

    # Fetch memberships
    memberships = (await session.execute(select(Membership).where(Membership.user_id == user.id))).scalars().all()
    organization_ids = [str(row.organization_id) for row in memberships]
    role = memberships[0].role if memberships else "member"
    
    # Redefine CurrentUser later, assuming it is currently in core.security or defined here
    from backend.app.core.security import CurrentUser
    return CurrentUser(id=str(user.id), email=user.email, organization_ids=organization_ids, role=role)
