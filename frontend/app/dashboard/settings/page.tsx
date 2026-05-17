"use client";

import { useOrganization, useOrgMembers, useUpdateOrg, useRemoveMember } from "@/hooks/use-organizations";
import { useOrganizationStore } from "@/stores/organization-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Tabs } from "@/components/ui/tabs";
import { Settings, Users, Trash2 } from "lucide-react";
import { useState } from "react";

function OrgSettings() {
  const orgId = useOrganizationStore((s) => s.currentOrgId);
  const { data: org, isLoading } = useOrganization(orgId || undefined);
  const updateOrg = useUpdateOrg();
  const { toast } = useToast();
  const [name, setName] = useState("");

  if (isLoading) return <SkeletonCard />;
  if (!org) return <EmptyState title="No organization" description="Select an organization" />;

  const handleSave = async () => {
    if (!orgId || !name.trim()) return;
    try {
      await updateOrg.mutateAsync({ id: orgId, data: { name } });
      toast("Organization updated", "success");
    } catch { toast("Update failed", "error"); }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Organization Name</label>
        <Input defaultValue={org.name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Slug</label>
        <Input value={org.slug} disabled className="opacity-50" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Plan</label>
        <Badge variant="outline" className="capitalize">{org.plan}</Badge>
      </div>
      <Button onClick={handleSave} disabled={updateOrg.isPending || !name.trim()}>Save Changes</Button>
    </div>
  );
}

function MemberManagement() {
  const orgId = useOrganizationStore((s) => s.currentOrgId);
  const { data: members, isLoading } = useOrgMembers(orgId || undefined);
  const removeMember = useRemoveMember();
  const { toast } = useToast();

  if (isLoading) return <SkeletonCard />;

  return (
    <div className="space-y-4">
      {!members || members.length === 0 ? (
        <EmptyState title="No members" description="Invite team members to collaborate" />
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <Avatar name={m.user_name || m.user_email} size="sm" />
                <div>
                  <p className="text-sm font-medium text-white">{m.user_name || m.user_email || m.user_id}</p>
                  <p className="text-xs text-slate-500">{m.user_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">{m.role}</Badge>
                {m.role !== "owner" && (
                  <button onClick={async () => { await removeMember.mutateAsync({ orgId: orgId!, memberId: m.id }); toast("Member removed", "success"); }} className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400">Manage your organization and team</p>
      </div>
      <Tabs items={[
        { label: "Organization", value: "org", content: <OrgSettings /> },
        { label: "Members", value: "members", content: <MemberManagement /> },
      ]} defaultValue="org" />
    </div>
  );
}
