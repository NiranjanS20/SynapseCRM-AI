"""Analytics service — real DB aggregation queries."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import case, cast, func, select, Date
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models import Activity, Conversation, Lead


class CRMAnalyticsService:

    async def get_pipeline_metrics(self, session: AsyncSession, org_id: uuid.UUID) -> dict:
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
        stages = [{"status": r.status, "count": r.count, "total_value": float(r.total_value)} for r in result.all()]
        return {
            "total_leads": sum(s["count"] for s in stages),
            "total_value": sum(s["total_value"] for s in stages),
            "stages": stages,
        }

    async def get_conversion_metrics(self, session: AsyncSession, org_id: uuid.UUID) -> dict:
        base = select(Lead).where(Lead.organization_id == org_id, Lead.deleted_at.is_(None))
        total_new = (await session.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0
        total_won = (await session.execute(select(func.count()).where(Lead.organization_id == org_id, Lead.deleted_at.is_(None), Lead.status == "won"))).scalar() or 0
        total_lost = (await session.execute(select(func.count()).where(Lead.organization_id == org_id, Lead.deleted_at.is_(None), Lead.status == "lost"))).scalar() or 0
        avg_value = (await session.execute(select(func.avg(Lead.estimated_value)).where(Lead.organization_id == org_id, Lead.deleted_at.is_(None), Lead.status == "won"))).scalar() or 0
        avg_score = (await session.execute(select(func.avg(Lead.lead_score)).where(Lead.organization_id == org_id, Lead.deleted_at.is_(None)))).scalar() or 0

        win_rate = (total_won / max(total_won + total_lost, 1)) * 100
        return {
            "total_new": total_new, "total_won": total_won, "total_lost": total_lost,
            "win_rate": round(win_rate, 1), "avg_deal_value": round(float(avg_value), 2),
            "avg_lead_score": round(float(avg_score), 1),
        }

    async def get_activity_metrics(self, session: AsyncSession, org_id: uuid.UUID, days: int = 30) -> dict:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        total = (await session.execute(
            select(func.count()).where(Activity.organization_id == org_id, Activity.created_at >= since, Activity.deleted_at.is_(None))
        )).scalar() or 0

        by_type_stmt = (
            select(Activity.type, func.count(Activity.id))
            .where(Activity.organization_id == org_id, Activity.created_at >= since, Activity.deleted_at.is_(None))
            .group_by(Activity.type)
        )
        by_type = {r[0]: r[1] for r in (await session.execute(by_type_stmt)).all()}

        by_day_stmt = (
            select(cast(Activity.created_at, Date).label("day"), func.count(Activity.id))
            .where(Activity.organization_id == org_id, Activity.created_at >= since, Activity.deleted_at.is_(None))
            .group_by("day").order_by("day")
        )
        by_day = [{"date": str(r[0]), "count": r[1]} for r in (await session.execute(by_day_stmt)).all()]

        return {"total_activities": total, "by_type": by_type, "by_day": by_day}

    async def get_progression_metrics(self, session: AsyncSession, org_id: uuid.UUID) -> dict:
        by_source_stmt = (
            select(Lead.source, func.count(Lead.id))
            .where(Lead.organization_id == org_id, Lead.deleted_at.is_(None))
            .group_by(Lead.source)
        )
        by_source = {r[0]: r[1] for r in (await session.execute(by_source_stmt)).all()}

        by_priority_stmt = (
            select(Lead.priority, func.count(Lead.id))
            .where(Lead.organization_id == org_id, Lead.deleted_at.is_(None))
            .group_by(Lead.priority)
        )
        by_priority = {r[0]: r[1] for r in (await session.execute(by_priority_stmt)).all()}

        over_time_stmt = (
            select(cast(Lead.created_at, Date).label("day"), func.count(Lead.id))
            .where(Lead.organization_id == org_id, Lead.deleted_at.is_(None))
            .group_by("day").order_by("day")
        )
        over_time = [{"date": str(r[0]), "count": r[1]} for r in (await session.execute(over_time_stmt)).all()]

        return {"by_source": by_source, "by_priority": by_priority, "created_over_time": over_time}

    async def get_dashboard(self, session: AsyncSession, org_id: uuid.UUID) -> dict:
        pipeline = await self.get_pipeline_metrics(session, org_id)
        conversion = await self.get_conversion_metrics(session, org_id)
        activity = await self.get_activity_metrics(session, org_id)
        progression = await self.get_progression_metrics(session, org_id)
        return {"pipeline": pipeline, "conversion": conversion, "activity": activity, "progression": progression}


crm_analytics_service = CRMAnalyticsService()
