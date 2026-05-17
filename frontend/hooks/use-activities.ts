"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/services/api/leads.api";
import { useOrganizationStore } from "@/stores/organization-store";
import type { LeadCreate, LeadUpdate, LeadListParams, LeadStatus, LeadPriority, LeadSource } from "@/types";

export function useLeads(params?: {
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  q?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["leads", orgId, params],
    queryFn: () =>
      leadsApi.list({
        organization_id: orgId!,
        ...params,
      } as LeadListParams),
    enabled: !!orgId,
    select: (res) => res.data,
  });
}

export function useLead(id: string | undefined) {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => leadsApi.get(id!, orgId!),
    enabled: !!id && !!orgId,
    select: (res) => res.data,
  });
}

export function useLeadPipeline() {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["leads", "pipeline", orgId],
    queryFn: () => leadsApi.pipeline(orgId!),
    enabled: !!orgId,
    select: (res) => res.data,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: LeadCreate) => leadsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeadUpdate }) =>
      leadsApi.update(id, data, orgId!),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", variables.id] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id, orgId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
