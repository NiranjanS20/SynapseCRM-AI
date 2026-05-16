"""Conversation service — conversations + threaded messages."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models import Activity, Conversation, ConversationMessage, Lead
from backend.app.services.audit_service import audit_service


class ConversationService:

    async def create(self, session: AsyncSession, org_id: uuid.UUID, user_id: str, **data) -> Conversation:
        conv = Conversation(organization_id=org_id, **data)
        session.add(conv)
        await session.flush()

        # Create initial message
        session.add(ConversationMessage(
            conversation_id=conv.id,
            sender_type="user",
            content=conv.message,
        ))

        # Activity log
        session.add(Activity(
            organization_id=org_id, lead_id=conv.lead_id, user_id=user_id,
            type=conv.channel, title=f"New {conv.channel}: {conv.subject or 'No subject'}",
            description=f"Conversation started via {conv.channel}",
        ))

        await audit_service.log(session, org_id=org_id, user_id=user_id, action="conversation.created", entity_type="conversation", entity_id=conv.id)
        await session.flush()
        return conv

    async def list_conversations(self, session: AsyncSession, org_id: uuid.UUID, *, lead_id: uuid.UUID | None = None, channel: str | None = None, limit: int = 25, offset: int = 0) -> tuple[list[dict], int]:
        base = select(Conversation).where(
            Conversation.organization_id == org_id,
            Conversation.deleted_at.is_(None),
        )
        if lead_id:
            base = base.where(Conversation.lead_id == lead_id)
        if channel:
            base = base.where(Conversation.channel == channel)

        total = (await session.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0

        stmt = (
            select(Conversation, Lead, func.count(ConversationMessage.id).label("msg_count"))
            .outerjoin(Lead, Lead.id == Conversation.lead_id)
            .outerjoin(ConversationMessage, ConversationMessage.conversation_id == Conversation.id)
            .where(Conversation.organization_id == org_id, Conversation.deleted_at.is_(None))
        )
        if lead_id:
            stmt = stmt.where(Conversation.lead_id == lead_id)
        if channel:
            stmt = stmt.where(Conversation.channel == channel)

        stmt = stmt.group_by(Conversation.id, Lead.id).order_by(Conversation.created_at.desc()).limit(limit).offset(offset)

        result = await session.execute(stmt)
        items = []
        for conv, lead, msg_count in result.all():
            items.append({
                "id": conv.id, "organization_id": conv.organization_id,
                "lead_id": conv.lead_id, "channel": conv.channel,
                "direction": conv.direction, "subject": conv.subject,
                "message": conv.message, "summary": conv.summary,
                "sender_email": conv.sender_email, "metadata": conv.metadata_json,
                "created_at": conv.created_at, "message_count": msg_count,
                "lead_name": lead.name if lead else None,
                "lead_company": lead.company if lead else None,
            })
        return items, total

    async def get(self, session: AsyncSession, conv_id: uuid.UUID, org_id: uuid.UUID) -> Conversation | None:
        stmt = select(Conversation).where(Conversation.id == conv_id, Conversation.organization_id == org_id, Conversation.deleted_at.is_(None))
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def add_message(self, session: AsyncSession, conv_id: uuid.UUID, org_id: uuid.UUID, user_id: str, *, sender_type: str = "user", content: str, metadata: dict | None = None) -> ConversationMessage:
        msg = ConversationMessage(
            conversation_id=conv_id, sender_type=sender_type,
            content=content, metadata_json=metadata or {},
        )
        session.add(msg)
        await session.flush()
        return msg

    async def list_messages(self, session: AsyncSession, conv_id: uuid.UUID, limit: int = 100, offset: int = 0) -> tuple[Sequence[ConversationMessage], int]:
        base = select(ConversationMessage).where(ConversationMessage.conversation_id == conv_id)
        total = (await session.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0
        stmt = base.order_by(ConversationMessage.created_at.asc()).limit(limit).offset(offset)
        result = await session.execute(stmt)
        return result.scalars().all(), total


conversation_service = ConversationService()
