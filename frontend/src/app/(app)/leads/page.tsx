"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost } from "@/lib/api";
import type { LeadRecord } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/section-title";

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const organizationId = useAuthStore((state) => state.organizationIds[0] || "");
  const [draft, setDraft] = useState({ company_name: "", contact_name: "", email: "", metadata: "" });

  const leadsQuery = useQuery({
    queryKey: ["leads", organizationId],
    queryFn: () => apiGet<LeadRecord[]>("/api/v1/leads", { organization_id: organizationId }),
    enabled: Boolean(organizationId)
  });

  async function createLead() {
    await apiPost("/api/v1/leads", {
      organization_id: organizationId,
      company_name: draft.company_name,
      contact_name: draft.contact_name,
      email: draft.email,
      metadata: draft.metadata ? JSON.parse(draft.metadata) : {}
    });
    setDraft({ company_name: "", contact_name: "", email: "", metadata: "" });
    await queryClient.invalidateQueries({ queryKey: ["leads", organizationId] });
  }

  return (
    <div className="space-y-8">
      <SectionTitle title="Lead Intelligence" subtitle="Capture qualified leads and route them into the autonomous workflow engine." />

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardBody className="space-y-3">
            <Input placeholder="Company name" value={draft.company_name} onChange={(event) => setDraft({ ...draft, company_name: event.target.value })} />
            <Input placeholder="Contact name" value={draft.contact_name} onChange={(event) => setDraft({ ...draft, contact_name: event.target.value })} />
            <Input placeholder="Email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
            <Textarea placeholder='{"industry":"SaaS","notes":"inbound demo request"}' value={draft.metadata} onChange={(event) => setDraft({ ...draft, metadata: event.target.value })} />
            <Button onClick={createLead}>Create lead</Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="mb-4 text-lg font-semibold text-white">Workspace leads</div>
            <div className="space-y-3">
              {leadsQuery.data?.map((lead) => (
                <div key={lead.id} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{lead.company_name}</div>
                      <div className="text-sm text-slate-400">{lead.contact_name || "Unknown contact"}</div>
                    </div>
                    <div className="text-right text-xs uppercase tracking-[0.18em] text-cyan-300">{lead.stage}</div>
                  </div>
                  <div className="mt-3 text-sm text-slate-300">{lead.email || "No email captured"}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
