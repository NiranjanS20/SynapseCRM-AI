"""Conversation routes — CRUD + threaded messages."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.schemas.common import Envelope, PaginatedResponse
from backend.app.schemas.conversation import ConversationCreate, ConversationResponse, MessageCreate, MessageResponse
from backend.app.services.conversation_service import conversation_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=Envelope)
async def list_conversations(
    organization_id: uuid.UUID, lead_id: uuid.UUID | None = None,
    channel: str | None = None,
    limit: int = Query(25, ge=1, le=100), offset: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    items, total = await conversation_service.list_conversations(session, organization_id, lead_id=lead_id, channel=channel, limit=limit, offset=offset)
    return Envelope(data=PaginatedResponse(items=[ConversationResponse(**i) for i in items], total=total, limit=limit, offset=offset, has_more=offset + limit < total))


@router.post("", response_model=Envelope)
async def create_conversation(payload: ConversationCreate, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(payload.organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    data = payload.model_dump(exclude={"organization_id"})
    conv = await conversation_service.create(session, payload.organization_id, current_user.id, **data)
    return Envelope(data=ConversationResponse.model_validate(conv), message="Conversation created")


@router.get("/{conv_id}", response_model=Envelope)
async def get_conversation(conv_id: uuid.UUID, organization_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    conv = await conversation_service.get(session, conv_id, organization_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return Envelope(data=ConversationResponse.model_validate(conv))


@router.get("/{conv_id}/messages", response_model=Envelope)
async def list_messages(conv_id: uuid.UUID, limit: int = Query(100, ge=1), offset: int = Query(0, ge=0), current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    messages, total = await conversation_service.list_messages(session, conv_id, limit=limit, offset=offset)
    items = [MessageResponse.model_validate(m) for m in messages]
    return Envelope(data=PaginatedResponse(items=items, total=total, limit=limit, offset=offset))


@router.post("/{conv_id}/messages", response_model=Envelope)
async def add_message(conv_id: uuid.UUID, payload: MessageCreate, organization_id: uuid.UUID = Query(...), current_user: CurrentUser = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if str(organization_id) not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    msg = await conversation_service.add_message(session, conv_id, organization_id, current_user.id, sender_type=payload.sender_type, content=payload.content, metadata=payload.metadata)
    return Envelope(data=MessageResponse.model_validate(msg), message="Message sent")
