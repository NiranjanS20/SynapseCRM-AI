"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Bot, MessageSquare, Network } from "lucide-react";

export const RevenueCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
      <ArrowUpRight className="h-4 w-4 text-sage-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold text-white">$45,231.89</div>
      <p className="text-xs text-sage-400 mt-1">+20.1% from last month</p>
    </CardContent>
  </Card>
);

export const ActiveLeadsCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-400">Active Leads</CardTitle>
      <Network className="h-4 w-4 text-slate-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold text-white">+2350</div>
      <p className="text-xs text-slate-500 mt-1">+180 new leads this week</p>
    </CardContent>
  </Card>
);

export const AgentStatusCard = () => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-sage-400" />
        Agent Status
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent-success" />
          <span className="text-sm text-slate-300">Qualifier Agent</span>
        </div>
        <Badge variant="outline">Idle</Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent-warning animate-pulse" />
          <span className="text-sm text-slate-300">Negotiator Agent</span>
        </div>
        <Badge variant="secondary">Active (3)</Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent-success" />
          <span className="text-sm text-slate-300">Data Enrichment</span>
        </div>
        <Badge variant="outline">Idle</Badge>
      </div>
    </CardContent>
  </Card>
);

export const AIReasoningCard = () => (
  <Card className="h-full bg-sage-500/5 border-sage-500/20">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-sage-300">
        <MessageSquare className="h-5 w-5" />
        Latest AI Insight
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="rounded-md bg-slate-950/50 p-3 border border-white/5">
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Analysis:</span> Lead "Acme Corp" shows high intent based on recent API documentation views and pricing page interactions.
          </p>
        </div>
        <div className="rounded-md bg-slate-950/50 p-3 border border-white/5">
          <p className="text-sm text-sage-400 leading-relaxed">
            <span className="font-semibold text-sage-300">Recommendation:</span> Trigger "Enterprise Upsell" workflow. Dispatch Negotiator Agent to draft personalized email highlighting SLA guarantees.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);
