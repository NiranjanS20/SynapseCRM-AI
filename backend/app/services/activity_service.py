"""Activity service — create, list, timeline."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models import Activity, User


class ActivityService:

    async def create(self, session: AsyncSession, org_id: uuid.UUID, lead_id: uuid.UUID, user_id: str, *, type: str, title: str | None = None, description: str, metadata: dict | None = None) -> Activity:
        activity = Activity(
            organization_id=org_id, lead_id=lead_id, user_id=user_id,
            type=type, title=title, description=description,
            metadata_json=metadata or {},
        )
        session.add(activity)
        await session.flush()
        return activity

    async def list_for_lead(self, session: AsyncSession, org_id: uuid.UUID, lead_id: uuid.UUID, limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
        base = select(Activity).where(
            Activity.organization_id == org_id,
            Activity.lead_id == lead_id,
            Activity.deleted_at.is_(None),
        )
        total = (await session.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0

        stmt = (
            select(Activity, User)
            .outerjoin(User, User.id == Activity.user_id)
            .where(Activity.organization_id == org_id, Activity.lead_id == lead_id, Activity.deleted_at.is_(None))
            .order_by(Activity.created_at.desc())
            .limit(limit).offset(offset)
        )
        result = await session.execute(stmt)
        items = []
        for activity, user in result.all():
            items.append({
                "id": activity.id, "organization_id": activity.organization_id,
                "lead_id": activity.lead_id, "user_id": activity.user_id,
                "type": activity.type, "title": activity.title,
                "description": activity.description, "metadata": activity.metadata_json,
                "created_at": activity.created_at,
                "user_name": user.full_name if user else None,
                "user_avatar": user.avatar_url if user else None,
            })
        return items, total

    async def list_for_org(self, session: AsyncSession, org_id: uuid.UUID, *, type: str | None = None, limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
        base = select(Activity).where(Activity.organization_id == org_id, Activity.deleted_at.is_(None))
        if type:
            base = base.where(Activity.type == type)
        total = (await session.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0

        stmt = (
            select(Activity, User)
            .outerjoin(User, User.id == Activity.user_id)
            .where(Activity.organization_id == org_id, Activity.deleted_at.is_(None))
        )
        if type:
            stmt = stmt.where(Activity.type == type)
        stmt = stmt.order_by(Activity.created_at.desc()).limit(limit).offset(offset)

        result = await session.execute(stmt)
        items = []
        for activity, user in result.all():
            items.append({
                "id": activity.id, "organization_id": activity.organization_id,
                "lead_id": activity.lead_id, "user_id": activity.user_id,
                "type": activity.type, "title": activity.title,
                "description": activity.description, "metadata": activity.metadata_json,
                "created_at": activity.created_at,
                "user_name": user.full_name if user else None,
                "user_avatar": user.avatar_url if user else None,
            })
        return items, total


activity_service = ActivityService()
