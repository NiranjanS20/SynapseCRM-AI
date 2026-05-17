"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/services/api/analytics.api";
import { useOrganizationStore } from "@/stores/organization-store";

export function useAnalyticsOverview() {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["analytics", "overview", orgId],
    queryFn: () => analyticsApi.overview(orgId!),
    enabled: !!orgId,
    select: (res) => res.data,
  });
}

export function usePipelineMetrics() {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["analytics", "pipeline", orgId],
    queryFn: () => analyticsApi.pipeline(orgId!),
    enabled: !!orgId,
    select: (res) => res.data,
  });
}

export function useConversionMetrics() {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["analytics", "conversion", orgId],
    queryFn: () => analyticsApi.conversion(orgId!),
    enabled: !!orgId,
    select: (res) => res.data,
  });
}

export function useActivityMetrics() {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["analytics", "activity", orgId],
    queryFn: () => analyticsApi.activity(orgId!),
    enabled: !!orgId,
    select: (res) => res.data,
  });
}
