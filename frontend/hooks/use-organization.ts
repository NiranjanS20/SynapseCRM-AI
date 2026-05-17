"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationsApi } from "@/services/api/organizations.api";
import type { OrganizationCreate } from "@/types";

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationsApi.list(),
    select: (res) => res.data,
  });
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: ["organization", id],
    queryFn: () => organizationsApi.get(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useOrgMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ["members", orgId],
    queryFn: () => organizationsApi.getMembers(orgId!),
    enabled: !!orgId,
    select: (res) => res.data,
  });
}

export function useUpdateOrg() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrganizationCreate> }) =>
      organizationsApi.update(id, data),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      qc.invalidateQueries({ queryKey: ["organization", variables.id] });
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      organizationsApi.removeMember(orgId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
