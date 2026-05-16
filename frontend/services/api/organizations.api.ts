import { apiGet, apiPost, apiPatch } from "@/lib/api";
import type { Organization, OrganizationCreate, PaginatedData } from "@/types";

const BASE = "/api/v1/organizations";

export const organizationsApi = {
  list: () => apiGet<Organization[]>(BASE),
  get: (id: string) => apiGet<Organization>(`${BASE}/${id}`),
  create: (data: OrganizationCreate) => apiPost<Organization>(BASE, data),
  update: (id: string, data: Partial<OrganizationCreate>) => apiPatch<Organization>(`${BASE}/${id}`, data),
};
