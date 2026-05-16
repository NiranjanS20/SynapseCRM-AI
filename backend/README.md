# SynapseCRM AI Backend

FastAPI backend for SynapseCRM AI.

## Responsibilities

- Supabase auth validation and JWT handling.
- Multi-agent orchestration through LangGraph.
- Lead, workflow, analytics, and RAG APIs.
- WebSocket fanout for realtime UI updates.
- Redis-backed session memory.
- RabbitMQ-ready workflow event infrastructure.

## Run locally

1. Copy `.env.example` to `.env`.
2. Install the backend dependencies from `requirements.txt`.
3. Run `uvicorn backend.app.main:app --reload` from the repo root with `PYTHONPATH=.`.

