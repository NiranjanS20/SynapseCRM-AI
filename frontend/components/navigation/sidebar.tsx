"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { LayoutDashboard, Users, MessageSquare, Workflow, BarChart3, BrainCircuit, Network, Settings, Plug } from "lucide-react";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { name: "Workflows", href: "/dashboard/workflows", icon: Workflow },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const aiNav = [
  { name: "AI Insights", href: "/dashboard/insights", icon: BrainCircuit },
  { name: "Memory Graph", href: "/dashboard/memory", icon: Network },
];

const adminNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Integrations", href: "/dashboard/integrations", icon: Plug },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavGroup = ({ items, title }: { items: any[], title?: string }) => (
    <div className="mb-6">
      {title && <h4 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h4>}
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-sage-500/10 text-sage-400" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-slate-950 px-3 py-4 hidden md:block">
      <div className="flex h-full flex-col">
        <div className="mb-8 px-4 flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-sage-400 to-sage-600" />
          <span className="font-display font-semibold text-white tracking-tight">SynapseCRM</span>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <NavGroup items={mainNav} title="Main" />
          <NavGroup items={aiNav} title="Intelligence" />
          <NavGroup items={adminNav} title="Administration" />
        </div>
      </div>
    </aside>
  );
}
