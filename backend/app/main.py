from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import analytics, auth, health, leads, rag, workflows
from backend.app.core.config import settings
from services.websocket_service.ws_manager import ws_manager

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("synapsecrm")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup", extra={"app": settings.app_name, "version": settings.app_version})
    yield
    logger.info("shutdown")


app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan, docs_url="/docs", redoc_url="/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, settings.next_public_api_base_url.replace("8000", "3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid4())
    start = time.perf_counter()
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = str(int((time.perf_counter() - start) * 1000))
    return response


@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_error", extra={"path": request.url.path, "request_id": getattr(request.state, "request_id", None)})
    return JSONResponse(status_code=500, content={"error": "internal_server_error", "detail": "Unexpected backend error"})


app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(leads.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)
app.include_router(rag.router, prefix=settings.api_prefix)
app.include_router(workflows.router, prefix=settings.api_prefix)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    organization_id = websocket.query_params.get("organization_id") or websocket.query_params.get("org")
    if not organization_id:
        await websocket.close(code=1008)
        return
    await ws_manager.connect(organization_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(organization_id, websocket)
    except Exception:
        await ws_manager.disconnect(organization_id, websocket)

