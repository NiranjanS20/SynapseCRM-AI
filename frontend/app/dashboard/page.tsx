import { WidgetEngine } from "@/features/dashboard/widget-engine";
import { RevenueCard, ActiveLeadsCard, AgentStatusCard, AIReasoningCard } from "@/features/dashboard/widgets";

const dashboardWidgets = [
  { id: "revenue", component: RevenueCard, span: "col-span-1 md:col-span-1 lg:col-span-1" },
  { id: "leads", component: ActiveLeadsCard, span: "col-span-1 md:col-span-1 lg:col-span-1" },
  { id: "agent_status", component: AgentStatusCard, span: "col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2" },
  { id: "ai_insight", component: AIReasoningCard, span: "col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white tracking-tight">Overview</h1>
        <p className="text-slate-400">Welcome back. Your agents are currently managing 3 active deals.</p>
      </div>
      
      <WidgetEngine widgets={dashboardWidgets} />
    </div>
  );
}
