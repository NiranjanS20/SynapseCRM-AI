from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.models import Document, Embedding
from shared.schemas.rag import RetrievalHit

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    text: str
    metadata: dict[str, Any]


class RAGService:
    def __init__(self) -> None:
        self._model = None

    def _load_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(settings.embedding_model)
        return self._model

    def _embed(self, texts: list[str]) -> np.ndarray:
        model = self._load_model()
        embeddings = model.encode(texts, normalize_embeddings=True, batch_size=min(32, len(texts) or 1))
        return np.asarray(embeddings, dtype=np.float32)

    def _chunk_text(self, text: str, chunk_size: int = 1200, overlap: int = 200) -> list[str]:
        cleaned = text.strip()
        if not cleaned:
            return []
        chunks: list[str] = []
        start = 0
        while start < len(cleaned):
            end = min(len(cleaned), start + chunk_size)
            if end < len(cleaned):
                break_at = cleaned.rfind("\n", start, end)
                if break_at == -1:
                    break_at = cleaned.rfind(". ", start, end)
                if break_at > start + chunk_size // 2:
                    end = break_at + 1
            chunks.append(cleaned[start:end].strip())
            start = max(end - overlap, end)
        return [chunk for chunk in chunks if chunk]

    async def ingest_document(self, session: AsyncSession, organization_id: str, title: str, content: str, metadata: dict[str, Any] | None = None, source_type: str = "document", source_uri: str | None = None, lead_id: str | None = None) -> int:
        document = Document(
            organization_id=organization_id,
            lead_id=lead_id,
            title=title,
            source_type=source_type,
            source_uri=source_uri,
            content=content,
            checksum=str(hash(content)),
            metadata_json=metadata or {},
        )
        session.add(document)
        await session.flush()

        chunks = self._chunk_text(content)
        if not chunks:
            return 0
        embeddings = self._embed(chunks)
        for index, (chunk_text, embedding) in enumerate(zip(chunks, embeddings, strict=False)):
            session.add(
                Embedding(
                    organization_id=organization_id,
                    document_id=document.id,
                    lead_id=lead_id,
                    chunk_index=index,
                    chunk_text=chunk_text,
                    embedding=embedding.tolist(),
                    metadata_json={**(metadata or {}), "title": title, "source_type": source_type},
                )
            )
        await session.flush()
        return len(chunks)

    async def similarity_search(self, session: AsyncSession, organization_id: str, query: str, top_k: int = 6, metadata_filter: dict[str, Any] | None = None) -> list[RetrievalHit]:
        query_embedding = self._embed([query])[0].tolist()
        stmt = select(Embedding).where(Embedding.organization_id == organization_id).limit(top_k * 3)
        rows = (await session.execute(stmt)).scalars().all()
        scored: list[tuple[float, Embedding]] = []
        query_vector = np.asarray(query_embedding)
        for row in rows:
            metadata = dict(row.metadata_json or {})
            if metadata_filter and any(metadata.get(key) != value for key, value in metadata_filter.items()):
                continue
            score = float(np.dot(np.asarray(row.embedding), query_vector))
            scored.append((score, row))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [RetrievalHit(id=str(row.id), chunk_text=row.chunk_text, score=score, metadata=dict(row.metadata_json or {})) for score, row in scored[:top_k]]


rag_service = RAGService()

