"""Organization service — CRUD + multi-tenant resolution."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models import Membership, Organization


class OrganizationService:

    async def create(self, session: AsyncSession, *, name: str, slug: str, owner_user_id: str, logo_url: str | None = None, industry: str | None = None, size: str | None = None) -> Organization:
        org = Organization(name=name, slug=slug, logo_url=logo_url, industry=industry, size=size)
        session.add(org)
        await session.flush()
        # Auto-create owner membership
        session.add(Membership(organization_id=org.id, user_id=owner_user_id, role="owner"))
        await session.flush()
        return org

    async def get(self, session: AsyncSession, org_id: uuid.UUID) -> Organization | None:
        return await session.get(Organization, org_id)

    async def get_by_slug(self, session: AsyncSession, slug: str) -> Organization | None:
        result = await session.execute(select(Organization).where(Organization.slug == slug))
        return result.scalar_one_or_none()

    async def update(self, session: AsyncSession, org_id: uuid.UUID, **kwargs) -> Organization | None:
        org = await session.get(Organization, org_id)
        if org is None:
            return None
        for key, value in kwargs.items():
            if value is not None and hasattr(org, key):
                setattr(org, key, value)
        await session.flush()
        return org

    async def list_for_user(self, session: AsyncSession, user_id: str) -> Sequence[Organization]:
        stmt = (
            select(Organization)
            .join(Membership, Membership.organization_id == Organization.id)
            .where(Membership.user_id == user_id)
            .order_by(Organization.name)
        )
        result = await session.execute(stmt)
        return result.scalars().all()


organization_service = OrganizationService()
