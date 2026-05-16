"""Lead service — CRUD, pipeline view, full-text search, soft delete."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Sequence

from sqlalchemy import Select, case, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models import Activity, Lead
from backend.app.services.audit_service import audit_service


class LeadService:

    def _base_query(self, org_id: uuid.UUID) -> Select:
        return select(Lead).where(Lead.organization_id == org_id, Lead.deleted_at.is_(None))

    async def list_leads(
        self, session: AsyncSession, org_id: uuid.UUID, *,
        status: str | None = None, priority: str | None = None,
        source: str | None = None, owner_id: str | None = None,
        q: str | None = None, sort_by: str = "created_at",
        sort_order: str = "desc", limit: int = 25, offset: int = 0,
    ) -> tuple[Sequence[Lead], int]:
        stmt = self._base_query(org_id)

        if status:
            stmt = stmt.where(Lead.status == status)
        if priority:
            stmt = stmt.where(Lead.priority == priority)
        if source:
            stmt = stmt.where(Lead.source == source)
        if owner_id:
            stmt = stmt.where(Lead.owner_id == owner_id)
        if q:
            search_vector = func.to_tsvector(
                "english",
                func.coalesce(Lead.name, "") + " " + func.coalesce(Lead.company, "") + " " + func.coalesce(Lead.email, "") + " " + func.coalesce(Lead.notes, ""),
            )
            search_query = func.plainto_tsquery("english", q)
            stmt = stmt.where(search_vector.op("@@")(search_query))

        # Count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await session.execute(count_stmt)).scalar() or 0

        # Sort
        sort_col = getattr(Lead, sort_by, Lead.created_at)
        stmt = stmt.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())
        stmt = stmt.limit(limit).offset(offset)

        result = await session.execute(stmt)
        return result.scalars().all(), total

    async def get(self, session: AsyncSession, lead_id: uuid.UUID, org_id: uuid.UUID) -> Lead | None:
        stmt = self._base_query(org_id).where(Lead.id == lead_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, session: AsyncSession, org_id: uuid.UUID, user_id: str, **data) -> Lead:
        lead = Lead(organization_id=org_id, **data)
        session.add(lead)
        await session.flush()

        # Activity log
        session.add(Activity(
            organization_id=org_id, lead_id=lead.id, user_id=user_id,
            type="status_change", title="Lead created",
            description=f"Lead created for {lead.company}",
        ))

        # Audit log
        await audit_service.log(session, org_id=org_id, user_id=user_id, action="lead.created", entity_type="lead", entity_id=lead.id, after_state=self._serialize(lead))

        await session.flush()
        return lead

    async def update(self, session: AsyncSession, lead_id: uuid.UUID, org_id: uuid.UUID, user_id: str, **data) -> Lead | None:
        lead = await self.get(session, lead_id, org_id)
        if lead is None:
            return None

        before = self._serialize(lead)
        status_changed = False

        for key, value in data.items():
            if value is not None and hasattr(lead, key):
                if key == "status" and getattr(lead, key) != value:
                    status_changed = True
                setattr(lead, key, value)

        if status_changed:
            session.add(Activity(
                organization_id=org_id, lead_id=lead.id, user_id=user_id,
                type="status_change", title=f"Status → {lead.status}",
                description=f"Lead status changed to {lead.status}",
                metadata_json={"from": before.get("status"), "to": lead.status},
            ))

        await audit_service.log(session, org_id=org_id, user_id=user_id, action="lead.updated", entity_type="lead", entity_id=lead.id, before_state=before, after_state=self._serialize(lead))
        await session.flush()
        return lead

    async def soft_delete(self, session: AsyncSession, lead_id: uuid.UUID, org_id: uuid.UUID, user_id: str) -> bool:
        lead = await self.get(session, lead_id, org_id)
        if lead is None:
            return False
        before = self._serialize(lead)
        lead.deleted_at = datetime.now(timezone.utc)
        lead.deleted_by = user_id
        await audit_service.log(session, org_id=org_id, user_id=user_id, action="lead.deleted", entity_type="lead", entity_id=lead.id, before_state=before)
        await session.flush()
        return True

    async def get_pipeline(self, session: AsyncSession, org_id: uuid.UUID) -> list[dict]:
        stmt = (
            select(
                Lead.status,
                func.count(Lead.id).label("count"),
                func.coalesce(func.sum(Lead.estimated_value), 0).label("total_value"),
            )
            .where(Lead.organization_id == org_id, Lead.deleted_at.is_(None))
            .group_by(Lead.status)
        )
        result = await session.execute(stmt)
        pipeline = []
        for row in result.all():
            leads_stmt = self._base_query(org_id).where(Lead.status == row.status).order_by(Lead.updated_at.desc())
            leads_result = await session.execute(leads_stmt)
            pipeline.append({
                "status": row.status,
                "count": row.count,
                "total_value": float(row.total_value),
                "leads": leads_result.scalars().all(),
            })
        return pipeline

    async def search(self, session: AsyncSession, org_id: uuid.UUID, query: str, limit: int = 20) -> Sequence[Lead]:
        search_vector = func.to_tsvector(
            "english",
            func.coalesce(Lead.name, "") + " " + func.coalesce(Lead.company, "") + " " + func.coalesce(Lead.email, "") + " " + func.coalesce(Lead.notes, ""),
        )
        search_query = func.plainto_tsquery("english", query)
        rank = func.ts_rank(search_vector, search_query)

        stmt = (
            self._base_query(org_id)
            .where(search_vector.op("@@")(search_query))
            .order_by(rank.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @staticmethod
    def _serialize(lead: Lead) -> dict[str, Any]:
        return {
            "id": str(lead.id), "name": lead.name, "email": lead.email,
            "company": lead.company, "status": lead.status, "priority": lead.priority,
            "lead_score": lead.lead_score, "estimated_value": float(lead.estimated_value) if lead.estimated_value else None,
            "source": lead.source, "owner_id": lead.owner_id,
        }


lead_service = LeadService()
