"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, TrendingUp, Star } from "lucide-react";
import { useLead, useUpdateLead } from "@/hooks/use-leads";
import { useLeadActivities, useCreateActivity } from "@/hooks/use-activities";
import { useOrganizationStore } from "@/stores/organization-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";
import type { ActivityType } from "@/types";

const statusOptions = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

const activityIcons: Record<string, string> = {
  note: "📝",
  email: "📧",
  call: "📞",
  meeting: "📅",
  status_change: "🔄",
  ai_action: "🤖",
  task: "✅",
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const orgId = useOrganizationStore((s) => s.currentOrgId);
  const { data: lead, isLoading } = useLead(leadId);
  const { data: activities } = useLeadActivities(leadId);
  const updateLead = useUpdateLead();
  const createActivity = useCreateActivity();
  const { toast } = useToast();

  const [newNote, setNewNote] = useState("");

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    try {
      await updateLead.mutateAsync({ id: leadId, data: { status: newStatus as any } });
      toast("Status updated", "success");
    } catch {
      toast("Failed to update status", "error");
    }
  };

  const handleAddNote = async () => {
    if (!orgId || !newNote.trim()) return;
    try {
      await createActivity.mutateAsync({
        organization_id: orgId,
        lead_id: leadId,
        type: "note" as ActivityType,
        title: "Note added",
        description: newNote,
      });
      setNewNote("");
      toast("Note added", "success");
    } catch {
      toast("Failed to add note", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!lead) {
    return <EmptyState title="Lead not found" description="This lead may have been deleted." />;
  }

  const timelineContent = (
    <div className="space-y-4">
      {/* Add note */}
      <div className="flex gap-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sage-500 focus:outline-none"
        />
        <Button onClick={handleAddNote} disabled={!newNote.trim() || createActivity.isPending} className="self-end">
          Add
        </Button>
      </div>

      {/* Activity timeline */}
      {activities && activities.length > 0 ? (
        <div className="relative space-y-0">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5" />
          {(Array.isArray(activities) ? activities : []).map((activity) => (
            <div key={activity.id} className="relative flex gap-4 py-3 pl-10">
              <div className="absolute left-2.5 top-4 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-xs">
                {activityIcons[activity.type] || "•"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{activity.title || activity.type}</p>
                <p className="text-xs text-slate-400 mt-0.5">{activity.description}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No activity yet" description="Add notes or change the status to start the timeline" />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight">
            {lead.name || lead.company}
          </h1>
          <p className="text-sm text-slate-400">{lead.company}{lead.job_title ? ` · ${lead.job_title}` : ""}</p>
        </div>
        <Select value={lead.status} onChange={handleStatusChange} options={statusOptions} className="w-36" />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Info */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">Contact</h3>
          {lead.email && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mail className="h-3.5 w-3.5 text-slate-500" /> {lead.email}
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="h-3.5 w-3.5 text-slate-500" /> {lead.phone}
            </div>
          )}
          {lead.industry && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Building2 className="h-3.5 w-3.5 text-slate-500" /> {lead.industry}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">Metrics</h3>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            Score: <span className="font-semibold text-sage-400">{lead.lead_score}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            Value: <span className="font-semibold text-white">{lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Briefcase className="h-3.5 w-3.5 text-blue-400" />
            Source: <span className="capitalize">{lead.source}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">Details</h3>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            Created: {new Date(lead.created_at).toLocaleDateString()}
          </div>
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-sage-500/10 px-2.5 py-0.5 text-xs text-sage-400 border border-sage-500/20">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {lead.notes && <p className="text-xs text-slate-400 line-clamp-3">{lead.notes}</p>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        items={[
          { label: "Timeline", value: "timeline", content: timelineContent },
          {
            label: "Notes",
            value: "notes",
            content: <div className="text-sm text-slate-300">{lead.notes || <EmptyState title="No notes" description="Add notes via the timeline" />}</div>,
          },
        ]}
        defaultValue="timeline"
      />
    </div>
  );
}
