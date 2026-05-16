from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import (
    activities, analytics, audit, auth, conversations,
    health, leads, memberships, organizations, search,
)
from backend.app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("synapsecrm")


@asynccontextmanager
async def lifespan(app: FastAPI):
    from backend.app.auth.firebase import init_firebase
    logger.info("startup — %s v%s", settings.app_name, settings.app_version)
    init_firebase()
    yield
    logger.info("shutdown")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request middleware — logging + timing
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid4())
    start = time.perf_counter()
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = str(int((time.perf_counter() - start) * 1000))
    return response


# Global error handler
@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_error path=%s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "internal_server_error", "detail": "Unexpected backend error"},
    )


# ── Register routers ──────────────────────────────────────
prefix = settings.api_prefix

app.include_router(health.router, prefix=prefix)
app.include_router(auth.router, prefix=prefix)
app.include_router(organizations.router, prefix=prefix)
app.include_router(memberships.router, prefix=prefix)
app.include_router(leads.router, prefix=prefix)
app.include_router(activities.router, prefix=prefix)
app.include_router(conversations.router, prefix=prefix)
app.include_router(analytics.router, prefix=prefix)
app.include_router(audit.router, prefix=prefix)
app.include_router(search.router, prefix=prefix)

# Retain AI infrastructure routes if available
try:
    from backend.app.api.routes import rag, workflows
    app.include_router(rag.router, prefix=prefix)
    app.include_router(workflows.router, prefix=prefix)
except ImportError:
    pass
