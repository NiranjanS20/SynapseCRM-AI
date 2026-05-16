from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.schemas.rag import IngestDocumentRequest, RetrievalRequest
from services.rag_service.rag_service import rag_service

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/ingest")
async def ingest_document(payload: IngestDocumentRequest, session: AsyncSession = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)) -> dict[str, int]:
    if payload.organization_id not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Organization access denied")
    chunks = await rag_service.ingest_document(session, payload.organization_id, payload.title, payload.content, metadata=payload.metadata, source_type=payload.source_type, source_uri=payload.source_uri, lead_id=payload.lead_id)
    return {"chunks_ingested": chunks}


@router.post("/search")
async def search(payload: RetrievalRequest, session: AsyncSession = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)) -> dict:
    if payload.organization_id not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Organization access denied")
    hits = await rag_service.similarity_search(session, payload.organization_id, payload.query, payload.top_k, payload.metadata_filter)
    return {"hits": [hit.model_dump() for hit in hits]}

