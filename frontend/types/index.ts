// ============================================================
// SynapseCRM AI — Core TypeScript Types
// Single source of truth for all frontend types
// ============================================================

// ── Enums / Unions ─────────────────────────────────────────

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost" | "churned";
export type LeadPriority = "low" | "medium" | "high" | "urgent";
export type LeadSource = "manual" | "website" | "referral" | "linkedin" | "cold_outreach" | "inbound" | "event" | "partner" | "other";
export type ActivityType = "note" | "email" | "call" | "meeting" | "status_change" | "ai_action" | "workflow_action" | "task";
export type Channel = "email" | "meeting" | "call" | "chat" | "manual_note";
export type SenderType = "user" | "contact" | "system" | "ai";
export type MemberRole = "owner" | "admin" | "manager" | "sales" | "viewer";

// ── API Envelope ───────────────────────────────────────────

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// ── Organization ───────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationCreate {
  name: string;
  slug: string;
  logo_url?: string;
  industry?: string;
  size?: string;
}

// ── Membership ─────────────────────────────────────────────

export interface Membership {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  status: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
  user_avatar?: string;
}

// ── Lead ───────────────────────────────────────────────────

export interface Lead {
  id: string;
  organization_id: string;
  owner_id?: string;
  name?: string;
  email?: string;
  company: string;
  job_title?: string;
  phone?: string;
  industry?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  lead_score: number;
  estimated_value?: number;
  tags: string[];
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LeadCreate {
  organization_id: string;
  name?: string;
  email?: string;
  company: string;
  job_title?: string;
  phone?: string;
  industry?: string;
  source?: LeadSource;
  status?: LeadStatus;
  priority?: LeadPriority;
  lead_score?: number;
  estimated_value?: number;
  tags?: string[];
  notes?: string;
  owner_id?: string;
}

export interface LeadUpdate {
  name?: string;
  email?: string;
  company?: string;
  job_title?: string;
  phone?: string;
  industry?: string;
  source?: LeadSource;
  status?: LeadStatus;
  priority?: LeadPriority;
  lead_score?: number;
  estimated_value?: number;
  tags?: string[];
  notes?: string;
  owner_id?: string;
}

export interface LeadPipelineGroup {
  status: string;
  count: number;
  total_value: number;
  leads: Lead[];
}

export interface LeadListParams {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  search?: string;
  organization_id: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  owner_id?: string;
  q?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// ── Activity ───────────────────────────────────────────────

export interface Activity {
  id: string;
  organization_id: string;
  lead_id: string;
  user_id?: string;
  type: ActivityType;
  title?: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface ActivityCreate {
  organization_id: string;
  lead_id: string;
  type: ActivityType;
  title?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

// ── Conversation ───────────────────────────────────────────

export interface Conversation {
  id: string;
  organization_id: string;
  lead_id: string;
  channel: Channel;
  direction: string;
  subject?: string;
  message: string;
  summary?: string;
  sender_email?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  message_count: number;
  lead_name?: string;
  lead_company?: string;
}

export interface ConversationCreate {
  organization_id: string;
  lead_id: string;
  channel?: Channel;
  subject?: string;
  message: string;
  summary?: string;
  sender_email?: string;
  direction?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ── Analytics ──────────────────────────────────────────────

export interface StageMetric {
  status: string;
  count: number;
  total_value: number;
}

export interface PipelineMetrics {
  total_leads: number;
  total_value: number;
  stages: StageMetric[];
}

export interface ConversionMetrics {
  total_new: number;
  total_won: number;
  total_lost: number;
  win_rate: number;
  avg_deal_value: number;
  avg_lead_score: number;
}

export interface ActivityMetrics {
  total_activities: number;
  by_type: Record<string, number>;
  by_day: Array<{ date: string; count: number }>;
}

export interface AnalyticsDashboard {
  pipeline: PipelineMetrics;
  conversion: ConversionMetrics;
  activity: ActivityMetrics;
  progression: {
    by_source: Record<string, number>;
    by_priority: Record<string, number>;
    created_over_time: Array<{ date: string; count: number }>;
  };
}

// ── Audit ──────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

// ── Search ─────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: "lead" | "conversation";
  name?: string;
  company?: string;
  email?: string;
  subject?: string;
  status?: string;
  channel?: string;
}

export interface SearchResults {
  leads: SearchResult[];
  conversations: SearchResult[];
}
