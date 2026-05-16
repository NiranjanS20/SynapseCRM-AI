import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Lead, LeadCreate, LeadUpdate, LeadListParams, LeadPipelineGroup, PaginatedData } from "@/types";

const BASE = "/api/v1/leads";

export type QueryParams = {
  [key: string]: string | number | boolean | undefined;
};


export const leadsApi = {
  list: (params: LeadListParams) => apiGet<PaginatedData<Lead>>(BASE, params as Record<string, string | number | boolean | undefined>),
  get: (id: string, organizationId: string) => apiGet<Lead>(`${BASE}/${id}`, { organization_id: organizationId }),
  create: (data: LeadCreate) => apiPost<Lead>(BASE, data),
  update: (id: string, data: LeadUpdate, organizationId: string) => apiPatch<Lead>(`${BASE}/${id}`, data, { organization_id: organizationId }),
  delete: (id: string, organizationId: string) => apiDelete<void>(`${BASE}/${id}`, { organization_id: organizationId }),
  pipeline: (organizationId: string) => apiGet<LeadPipelineGroup[]>(`${BASE}/pipeline`, { organization_id: organizationId }),
};
