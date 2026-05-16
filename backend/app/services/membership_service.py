"""Membership service — member CRUD, role management, permission checks."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models import Membership, User


ROLE_HIERARCHY = {"owner": 5, "admin": 4, "manager": 3, "sales": 2, "viewer": 1}


class MembershipService:

    async def list_members(self, session: AsyncSession, org_id: uuid.UUID) -> list[dict]:
        stmt = (
            select(Membership, User)
            .join(User, User.id == Membership.user_id)
            .where(Membership.organization_id == org_id)
            .order_by(Membership.created_at)
        )
        result = await session.execute(stmt)
        members = []
        for membership, user in result.all():
            members.append({
                "id": membership.id,
                "organization_id": membership.organization_id,
                "user_id": membership.user_id,
                "role": membership.role,
                "status": membership.status,
                "created_at": membership.created_at,
                "user_email": user.email,
                "user_name": user.full_name,
                "user_avatar": user.avatar_url,
            })
        return members

    async def add_member(self, session: AsyncSession, org_id: uuid.UUID, user_id: str, role: str = "viewer") -> Membership:
        membership = Membership(organization_id=org_id, user_id=user_id, role=role)
        session.add(membership)
        await session.flush()
        return membership

    async def update_role(self, session: AsyncSession, membership_id: uuid.UUID, role: str) -> Membership | None:
        membership = await session.get(Membership, membership_id)
        if membership is None:
            return None
        membership.role = role
        await session.flush()
        return membership

    async def remove_member(self, session: AsyncSession, membership_id: uuid.UUID) -> bool:
        membership = await session.get(Membership, membership_id)
        if membership is None:
            return False
        if membership.role == "owner":
            return False  # Cannot remove owner
        await session.delete(membership)
        await session.flush()
        return True

    async def check_membership(self, session: AsyncSession, user_id: str, org_id: uuid.UUID) -> Membership | None:
        stmt = select(Membership).where(Membership.user_id == user_id, Membership.organization_id == org_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def check_permission(self, session: AsyncSession, user_id: str, org_id: uuid.UUID, min_role: str = "viewer") -> bool:
        membership = await self.check_membership(session, user_id, org_id)
        if membership is None:
            return False
        return ROLE_HIERARCHY.get(membership.role, 0) >= ROLE_HIERARCHY.get(min_role, 0)


membership_service = MembershipService()
