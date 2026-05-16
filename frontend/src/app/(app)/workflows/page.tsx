"use client";

import { Card, CardBody } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { useRealtimeStore } from "@/stores/realtime-store";

export default function WorkflowsPage() {
  const events = useRealtimeStore((state) => state.events);

  return (
    <div className="space-y-8">
      <SectionTitle title="Workflow Monitor" subtitle="Trace each autonomous step as leads move through intent, research, qualification, outreach, and summary." />
      <Card>
        <CardBody>
          <div className="space-y-3">
            {events.length ? events.map((event, index) => (
              <div key={`${event.event}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-300">
                <span className="font-semibold text-white">{event.event}</span> for workflow <span className="text-cyan-300">{event.data.workflow_id}</span>
              </div>
            )) : <p className="text-sm text-slate-400">No workflow events yet.</p>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
