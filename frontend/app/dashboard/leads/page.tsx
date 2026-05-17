"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Filter } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { useOrganizationStore } from "@/stores/organization-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LeadCreateModal } from "@/features/leads/lead-create-modal";
import type { Lead, LeadStatus, LeadPriority } from "@/types";

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  qualified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  proposal: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  negotiation: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  won: "bg-green-500/10 text-green-400 border-green-500/20",
  lost: "bg-red-500/10 text-red-400 border-red-500/20",
  churned: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const priorityColors: Record<string, string> = {
  low: "text-slate-400",
  medium: "text-blue-400",
  high: "text-amber-400",
  urgent: "text-red-400",
};

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

const priorityOptions = [
  { label: "All Priorities", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export default function LeadsPage() {
  const router = useRouter();
  const orgId = useOrganizationStore((s) => s.currentOrgId);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [offset, setOffset] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const limit = 25;

  const { data, isLoading } = useLeads({
    q: search || undefined,
    status: (status || undefined) as LeadStatus | undefined,
    priority: (priority || undefined) as LeadPriority | undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    limit,
    offset,
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
    setOffset(0);
  };

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (lead) => (
        <div>
          <p className="font-medium text-white">{lead.name || "—"}</p>
          <p className="text-xs text-slate-500">{lead.email}</p>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      sortable: true,
      render: (lead) => <span>{lead.company}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (lead) => (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[lead.status] || ""}`}>
          {lead.status}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (lead) => (
        <span className={`text-xs font-medium uppercase ${priorityColors[lead.priority] || ""}`}>
          {lead.priority}
        </span>
      ),
    },
    {
      key: "lead_score",
      header: "Score",
      sortable: true,
      className: "text-right",
      render: (lead) => (
        <div className="text-right">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sage-500/10 text-xs font-bold text-sage-400">
            {lead.lead_score}
          </span>
        </div>
      ),
    },
    {
      key: "estimated_value",
      header: "Value",
      sortable: true,
      className: "text-right",
      render: (lead) => (
        <span className="text-right text-slate-300">
          {lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (lead) => (
        <span className="text-xs text-slate-500">
          {new Date(lead.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight">Leads</h1>
          <p className="text-slate-400 text-sm">
            {data ? `${data.total} total leads` : "Manage your sales pipeline"}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(v) => { setStatus(v); setOffset(0); }} options={statusOptions} placeholder="Status" className="w-40" />
        <Select value={priority} onChange={(v) => { setPriority(v); setOffset(0); }} options={priorityOptions} placeholder="Priority" className="w-40" />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Create your first lead to start building your pipeline"
          action={
            <Button onClick={() => setShowCreate(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Create Lead
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data.items}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(lead) => router.push(`/dashboard/leads/${lead.id}`)}
          />
          <Pagination
            total={data.total}
            limit={limit}
            offset={offset}
            onPageChange={setOffset}
          />
        </>
      )}

      {/* Create Modal */}
      <LeadCreateModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
