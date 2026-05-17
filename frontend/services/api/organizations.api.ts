import { api } from "./index";
import type { ApiEnvelope, Organization, OrganizationCreate, Membership } from "@/types";

export const organizationsApi = {
  list() {
    return api.get<ApiEnvelope<Organization[]>>("/organizations");
  },

  get(id: string) {
    return api.get<ApiEnvelope<Organization>>(`/organizations/${id}`);
  },

  create(data: OrganizationCreate) {
    return api.post<ApiEnvelope<Organization>>("/organizations", data);
  },

  update(id: string, data: Partial<OrganizationCreate>) {
    return api.patch<ApiEnvelope<Organization>>(`/organizations/${id}`, data);
  },

  getMembers(orgId: string) {
    return api.get<ApiEnvelope<Membership[]>>(`/organizations/${orgId}/members`);
  },

  addMember(orgId: string, email: string, role = "viewer") {
    return api.post<ApiEnvelope<Membership>>(`/organizations/${orgId}/members`, { email, role });
  },

  updateMemberRole(orgId: string, memberId: string, role: string) {
    return api.patch<ApiEnvelope<Membership>>(`/organizations/${orgId}/members/${memberId}`, { role });
  },

  removeMember(orgId: string, memberId: string) {
    return api.delete<ApiEnvelope<null>>(`/organizations/${orgId}/members/${memberId}`);
  },
};
