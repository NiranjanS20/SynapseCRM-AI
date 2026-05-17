import { api } from "./index";
import type { ApiEnvelope, AnalyticsDashboard, PipelineMetrics, ConversionMetrics, ActivityMetrics } from "@/types";

export const analyticsApi = {
  overview(organizationId: string) {
    return api.get<ApiEnvelope<AnalyticsDashboard>>("/analytics/overview", {
      organization_id: organizationId,
    });
  },

  pipeline(organizationId: string) {
    return api.get<ApiEnvelope<PipelineMetrics>>("/analytics/pipeline", {
      organization_id: organizationId,
    });
  },

  conversion(organizationId: string) {
    return api.get<ApiEnvelope<ConversionMetrics>>("/analytics/conversion", {
      organization_id: organizationId,
    });
  },

  activity(organizationId: string) {
    return api.get<ApiEnvelope<ActivityMetrics>>("/analytics/activity", {
      organization_id: organizationId,
    });
  },
};
