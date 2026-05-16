import { apiGet } from "@/lib/api";
import type { SearchResults } from "@/types";

export const searchApi = {
  search: (organizationId: string, query: string, limit?: number) =>
    apiGet<SearchResults>("/api/v1/search", { organization_id: organizationId, q: query, limit }),
};
