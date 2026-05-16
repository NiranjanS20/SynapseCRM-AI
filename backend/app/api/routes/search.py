"""Unified search route — PostgreSQL full-text search."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.models import Conversation, Lead
from backend.app.schemas.common import Envelope

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=Envelope)
async def unified_search(
    organization_id: uuid.UUID, q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")

    results = {"leads": [], "conversations": []}

    # Search leads
    lead_vector = func.to_tsvector("english", func.coalesce(Lead.name, "") + " " + func.coalesce(Lead.company, "") + " " + func.coalesce(Lead.email, ""))
    lead_query = func.plainto_tsquery("english", q)
    lead_rank = func.ts_rank(lead_vector, lead_query)
    lead_stmt = (
        select(Lead).where(Lead.organization_id == organization_id, Lead.deleted_at.is_(None), lead_vector.op("@@")(lead_query))
        .order_by(lead_rank.desc()).limit(limit)
    )
    leads = (await session.execute(lead_stmt)).scalars().all()
    results["leads"] = [{"id": str(l.id), "name": l.name, "company": l.company, "email": l.email, "status": l.status, "type": "lead"} for l in leads]

    # Search conversations
    conv_vector = func.to_tsvector("english", func.coalesce(Conversation.subject, "") + " " + func.coalesce(Conversation.summary, ""))
    conv_query = func.plainto_tsquery("english", q)
    conv_rank = func.ts_rank(conv_vector, conv_query)
    conv_stmt = (
        select(Conversation).where(Conversation.organization_id == organization_id, Conversation.deleted_at.is_(None), conv_vector.op("@@")(conv_query))
        .order_by(conv_rank.desc()).limit(limit)
    )
    convs = (await session.execute(conv_stmt)).scalars().all()
    results["conversations"] = [{"id": str(c.id), "subject": c.subject, "channel": c.channel, "lead_id": str(c.lead_id), "type": "conversation"} for c in convs]

    return Envelope(data=results)
