import { api } from "./index";
import type { ApiEnvelope, SearchResults } from "@/types";

export const searchApi = {
  search(organizationId: string, query: string) {
    return api.get<ApiEnvelope<SearchResults>>("/search", {
      organization_id: organizationId,
      q: query,
    });
  },
};
