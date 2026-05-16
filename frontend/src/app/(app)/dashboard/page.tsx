"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { apiGet } from "@/lib/api";
import type { DashboardPayload, LeadRecord } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkflowSocket } from "@/lib/ws";
import { useRealtimeStore } from "@/stores/realtime-store";
import { Card, CardBody } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { SectionTitle } from "@/components/section-title";
import { StatusPill } from "@/components/status-pill";
import { EmptyState } from "@/components/empty-state";

export default function DashboardPage() {
  const organizationId = useAuthStore((state) => state.organizationIds[0] || "");
  const events = useRealtimeStore((state) => state.events);

  useWorkflowSocket(organizationId);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", organizationId],
    queryFn: () => apiGet<DashboardPayload>("/api/v1/analytics/dashboard"),
    enabled: Boolean(organizationId)
  });

  const leadsQuery = useQuery({
    queryKey: ["leads", organizationId],
    queryFn: () => apiGet<LeadRecord[]>("/api/v1/leads", { organization_id: organizationId }),
    enabled: Boolean(organizationId)
  });

  const metrics = useMemo(() => {
    const payload = dashboardQuery.data;
    return [
      { label: "Events", value: String(payload?.summary && typeof payload.summary === "object" ? (payload.summary as Record<string, unknown>).events_total ?? 0 : 0), delta: "+12%" },
      { label: "Outreach", value: String(payload?.outreach && typeof payload.outreach === "object" ? (payload.outreach as Record<string, unknown>).generated ?? 0 : 0), delta: "+5%" },
      { label: "Workflows", value: String(payload?.pipeline && typeof payload.pipeline === "object" ? (payload.pipeline as Record<string, unknown>).workflows ?? 0 : 0), delta: "+2%" }
    ];
  }, [dashboardQuery.data]);

  return (
    <div className="space-y-8">
      <SectionTitle title="AI Operating Dashboard" subtitle="Realtime lead intelligence, workflow execution, and sales analytics across every organization boundary." />

      <div className="grid gap-4 lg:grid-cols-3">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Leads</h3>
              <StatusPill status="healthy" />
            </div>
            {leadsQuery.data?.length ? (
              <div className="space-y-3">
                {leadsQuery.data.slice(0, 6).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <div>
                      <div className="font-medium text-white">{lead.company_name}</div>
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{lead.stage}</div>
                    </div>
                    <div className="text-right text-sm text-slate-300">{lead.email || "No email"}<div className="text-xs text-cyan-300">Score {lead.score}</div></div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No leads yet" description="Create a lead to activate the orchestrator, RAG, and outreach pipeline." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="mb-4 text-lg font-semibold text-white">Realtime events</h3>
            <div className="space-y-3">
              {events.length ? events.slice(0, 8).map((event, index) => (
                <div key={`${event.event}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <div className="font-medium text-white">{event.event}</div>
                  <div className="mt-1 text-xs text-slate-400">Workflow {event.data.workflow_id}</div>
                </div>
              )) : <p className="text-sm text-slate-400">Waiting for workflow activity.</p>}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
