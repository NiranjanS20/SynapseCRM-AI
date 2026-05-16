import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Membership, PaginatedData } from "@/types";

export const membershipsApi = {
  list: (orgId: string) => apiGet<Membership[]>(`/api/v1/organizations/${orgId}/members`),
  add: (orgId: string, data: { user_id: string; role?: string }) => apiPost<Membership>(`/api/v1/organizations/${orgId}/members`, data),
  updateRole: (orgId: string, memberId: string, role: string) => apiPatch<Membership>(`/api/v1/organizations/${orgId}/members/${memberId}`, { role }),
  remove: (orgId: string, memberId: string) => apiDelete<void>(`/api/v1/organizations/${orgId}/members/${memberId}`),
};
