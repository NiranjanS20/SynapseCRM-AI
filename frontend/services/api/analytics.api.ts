import { apiGet } from "@/lib/api";
import type { AnalyticsDashboard, PipelineMetrics, ConversionMetrics, ActivityMetrics } from "@/types";

const BASE = "/api/v1/analytics";

export const analyticsApi = {
  overview: (organizationId: string) => apiGet<AnalyticsDashboard>(`${BASE}/overview`, { organization_id: organizationId }),
  pipeline: (organizationId: string) => apiGet<PipelineMetrics>(`${BASE}/pipeline`, { organization_id: organizationId }),
  conversion: (organizationId: string) => apiGet<ConversionMetrics>(`${BASE}/conversion`, { organization_id: organizationId }),
  activity: (organizationId: string, days?: number) => apiGet<ActivityMetrics>(`${BASE}/activity`, { organization_id: organizationId, days }),
};
