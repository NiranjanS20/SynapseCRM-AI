"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api";
import type { DashboardPayload } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";

export default function AnalyticsPage() {
  const query = useQuery({ queryKey: ["analytics-dashboard"], queryFn: () => apiGet<DashboardPayload>("/api/v1/analytics/dashboard") });

  return (
    <div className="space-y-8">
      <SectionTitle title="AI Analytics" subtitle="Track pipeline activity, event throughput, and orchestration health in one view." />
      <Card>
        <CardBody>
          <pre className="overflow-auto rounded-2xl bg-black/30 p-4 text-xs text-slate-300">{JSON.stringify(query.data, null, 2)}</pre>
        </CardBody>
      </Card>
    </div>
  );
}
