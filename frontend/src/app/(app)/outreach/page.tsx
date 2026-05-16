"use client";

import { Card, CardBody } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";

export default function OutreachPage() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Outreach Center" subtitle="Review AI-generated messaging, campaign health, and delivery readiness." />
      <Card>
        <CardBody>
          <p className="text-sm text-slate-400">Campaign orchestration and send pipeline can be connected to your email provider or CRM adapter here.</p>
        </CardBody>
      </Card>
    </div>
  );
}
