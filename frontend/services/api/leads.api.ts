import { api } from "./index";
import type { ApiEnvelope, PaginatedData, Lead, LeadCreate, LeadUpdate, LeadPipelineGroup, LeadListParams } from "@/types";

export const leadsApi = {
  list(params: LeadListParams) {
    return api.get<ApiEnvelope<PaginatedData<Lead>>>("/leads", params as Record<string, string | number | boolean | undefined>);
  },

  get(id: string, organizationId: string) {
    return api.get<ApiEnvelope<Lead>>(`/leads/${id}`, { organization_id: organizationId });
  },

  create(data: LeadCreate) {
    return api.post<ApiEnvelope<Lead>>("/leads", data);
  },

  update(id: string, data: LeadUpdate, organizationId: string) {
    return api.patch<ApiEnvelope<Lead>>(`/leads/${id}?organization_id=${organizationId}`, data);
  },

  delete(id: string, organizationId: string) {
    return api.delete<ApiEnvelope<null>>(`/leads/${id}`, { organization_id: organizationId });
  },

  pipeline(organizationId: string) {
    return api.get<ApiEnvelope<LeadPipelineGroup[]>>("/leads/pipeline", { organization_id: organizationId });
  },
};
