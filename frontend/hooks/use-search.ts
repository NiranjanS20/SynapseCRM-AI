"use client";

import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/services/api/search.api";
import { useOrganizationStore } from "@/stores/organization-store";

export function useSearch(query: string) {
  const orgId = useOrganizationStore((s) => s.currentOrgId);

  return useQuery({
    queryKey: ["search", orgId, query],
    queryFn: () => searchApi.search(orgId!, query),
    enabled: !!orgId && query.length >= 2,
    select: (res) => res.data,
  });
}
