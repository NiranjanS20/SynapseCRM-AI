import { api } from "./index";
import type { ApiEnvelope, PaginatedData, Activity, ActivityCreate } from "@/types";

export const activitiesApi = {
  list(organizationId: string, params?: { limit?: number; offset?: number }) {
    return api.get<ApiEnvelope<PaginatedData<Activity>>>("/activities", {
      organization_id: organizationId,
      ...params,
    });
  },

  getLeadActivities(leadId: string, organizationId: string) {
    return api.get<ApiEnvelope<Activity[]>>(`/leads/${leadId}/activities`, {
      organization_id: organizationId,
    });
  },

  create(data: ActivityCreate) {
    return api.post<ApiEnvelope<Activity>>("/activities", data);
  },
};
