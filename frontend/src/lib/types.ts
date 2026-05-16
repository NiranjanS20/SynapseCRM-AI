export interface SessionResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  organization_ids: string[];
  role: string;
}

export interface LeadRecord {
  id: string;
  organization_id: string;
  assigned_user_id?: string | null;
  company_name: string;
  contact_name?: string | null;
  email?: string | null;
  score: number;
  stage: string;
  source: string;
  metadata: Record<string, unknown>;
  updated_at?: string | null;
}

export interface DashboardPayload {
  organization_ids: string[];
  generated_at: string;
  summary: Record<string, unknown>;
  outreach: Record<string, unknown>;
  pipeline: Record<string, unknown>;
  ai_performance: Record<string, unknown>;
}

export interface WorkflowEvent {
  event: string;
  data: {
    workflow_id: string;
    status?: string;
    stage?: string;
    lead_score?: number;
  };
}
