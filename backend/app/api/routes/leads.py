from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import CurrentUser, get_current_user, get_session
from backend.app.models import Activity, Lead
from backend.app.schemas.lead import LeadCreateRequest, LeadResponse, WorkflowTriggerRequest
from services.orchestrator_service.orchestrator import orchestrator_service
from shared.schemas.workflow import WorkflowState

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=list[LeadResponse])
async def list_leads(organization_id: str, session: AsyncSession = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)) -> list[LeadResponse]:
    if organization_id not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Organization access denied")
    rows = (await session.execute(select(Lead).where(Lead.organization_id == organization_id).order_by(Lead.updated_at.desc()))).scalars().all()
    return [LeadResponse(id=str(row.id), organization_id=str(row.organization_id), assigned_user_id=row.assigned_user_id, company_name=row.company_name, contact_name=row.contact_name, email=row.email, source=row.source, stage=row.stage, metadata=row.metadata_json, score=row.score, updated_at=row.updated_at) for row in rows]


@router.post("", response_model=LeadResponse)
async def create_lead(payload: LeadCreateRequest, session: AsyncSession = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)) -> LeadResponse:
    if payload.organization_id not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Organization access denied")
    lead = Lead(
        organization_id=payload.organization_id,
        assigned_user_id=payload.assigned_user_id,
        company_name=payload.company_name,
        contact_name=payload.contact_name,
        email=str(payload.email) if payload.email else None,
        source=payload.source,
        stage=payload.stage,
        metadata_json=payload.metadata,
        score=15,
    )
    session.add(lead)
    await session.flush()
    session.add(Activity(organization_id=payload.organization_id, lead_id=lead.id, activity_type="lead.created", description=f"Lead created for {lead.company_name}", created_by_user_id=current_user.id))
    return LeadResponse(id=str(lead.id), organization_id=str(lead.organization_id), assigned_user_id=lead.assigned_user_id, company_name=lead.company_name, contact_name=lead.contact_name, email=lead.email, source=lead.source, stage=lead.stage, metadata=lead.metadata_json, score=lead.score, updated_at=lead.updated_at)


@router.post("/{lead_id}/trigger")
async def trigger_lead_workflow(lead_id: str, payload: WorkflowTriggerRequest, session: AsyncSession = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)) -> dict[str, str]:
    if payload.organization_id not in current_user.organization_ids:
        raise HTTPException(status_code=403, detail="Organization access denied")
    lead = await session.get(Lead, lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    workflow_id = f"wf_{lead.id}"
    state = WorkflowState(workflow_id=workflow_id, organization_id=payload.organization_id, lead_id=lead_id, session_id=workflow_id, source=payload.source, metadata={**payload.payload, "company_name": lead.company_name, "contact_name": lead.contact_name, "email": lead.email}, updated_at=datetime.now(timezone.utc))
    await orchestrator_service.run(state)
    return {"workflow_id": workflow_id, "status": "started"}

