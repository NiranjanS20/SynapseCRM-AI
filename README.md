# SynapseCRM AI

SynapseCRM AI is a production-oriented multi-agent CRM platform that combines FastAPI, Next.js 15, Supabase, LangGraph, Redis, RabbitMQ, and pgvector into a single structured repository.

## Layout

- `backend` - FastAPI application, agent orchestration, auth, RAG, queueing, and realtime APIs.
- `frontend` - Next.js 15 SaaS dashboard with auth, analytics, leads, workflows, and realtime updates.
- `agents` - Individual agent implementations used by the orchestrator.
- `services` - Shared service layers for orchestration, memory, routing, RAG, auth, websocket, and analytics.
- `shared` - Cross-cutting schemas, prompts, constants, and utilities.
- `database` - PostgreSQL migrations, RLS policies, seed data, and functions for Supabase.
- `infrastructure` - Docker, Render, Vercel, monitoring, and deployment assets.

## Quick Start

1. Copy `.env.example` to `.env` and fill in Supabase, Groq, Gemini, Redis, and RabbitMQ credentials.
2. Start local dependencies with `docker compose up -d postgres redis rabbitmq`.
3. Run the backend from `backend` with `uvicorn backend.app.main:app --reload`.
4. Run the frontend from `frontend` with `npm run dev`.

## Production Notes

- Supabase is the primary PostgreSQL store.
- RLS enforces organization boundaries.
- Redis stores session/workflow state.
- RabbitMQ handles asynchronous workflow tasks and retries.
- WebSockets broadcast workflow and analytics events.

