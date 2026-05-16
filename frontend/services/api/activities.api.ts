import { apiGet, apiPost } from "@/lib/api";
import type { Activity, ActivityCreate, PaginatedData } from "@/types";

const BASE = "/api/v1/activities";

export const activitiesApi = {
  listForOrg: (organizationId: string, params?: { type?: string; limit?: number; offset?: number }) =>
    apiGet<PaginatedData<Activity>>(BASE, { organization_id: organizationId, ...params }),
  listForLead: (leadId: string, organizationId: string, params?: { limit?: number; offset?: number }) =>
    apiGet<PaginatedData<Activity>>(`${BASE}/lead/${leadId}`, { organization_id: organizationId, ...params }),
  create: (data: ActivityCreate) => apiPost<Activity>(BASE, data),
};
