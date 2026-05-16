"""Audit service — centralized audit logging."""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models import AuditLog, User


class AuditService:

    async def log(self, session: AsyncSession, *, org_id: uuid.UUID, user_id: str, action: str, entity_type: str, entity_id: uuid.UUID | None = None, before_state: dict[str, Any] | None = None, after_state: dict[str, Any] | None = None) -> AuditLog:
        entry = AuditLog(
            organization_id=org_id, user_id=user_id, action=action,
            entity_type=entity_type, entity_id=entity_id,
            before_state=before_state, after_state=after_state,
        )
        session.add(entry)
        await session.flush()
        return entry

    async def list_logs(self, session: AsyncSession, org_id: uuid.UUID, *, entity_type: str | None = None, entity_id: uuid.UUID | None = None, limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
        base = select(AuditLog).where(AuditLog.organization_id == org_id)
        if entity_type:
            base = base.where(AuditLog.entity_type == entity_type)
        if entity_id:
            base = base.where(AuditLog.entity_id == entity_id)

        total = (await session.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0

        stmt = (
            select(AuditLog, User).outerjoin(User, User.id == AuditLog.user_id)
            .where(AuditLog.organization_id == org_id)
        )
        if entity_type:
            stmt = stmt.where(AuditLog.entity_type == entity_type)
        if entity_id:
            stmt = stmt.where(AuditLog.entity_id == entity_id)
        stmt = stmt.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset)

        result = await session.execute(stmt)
        items = []
        for entry, user in result.all():
            items.append({
                "id": entry.id, "organization_id": entry.organization_id,
                "user_id": entry.user_id, "action": entry.action,
                "entity_type": entry.entity_type, "entity_id": entry.entity_id,
                "before_state": entry.before_state, "after_state": entry.after_state,
                "created_at": entry.created_at,
                "user_name": user.full_name if user else None,
                "user_email": user.email if user else None,
            })
        return items, total


audit_service = AuditService()
