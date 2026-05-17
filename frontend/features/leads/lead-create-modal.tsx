"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreateLead } from "@/hooks/use-leads";
import { useOrganizationStore } from "@/stores/organization-store";
import { useToast } from "@/components/ui/toast";

const sourceOptions = [
  { label: "Manual", value: "manual" },
  { label: "Website", value: "website" },
  { label: "Referral", value: "referral" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Cold Outreach", value: "cold_outreach" },
  { label: "Inbound", value: "inbound" },
  { label: "Event", value: "event" },
  { label: "Partner", value: "partner" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LeadCreateModal({ open, onClose }: Props) {
  const orgId = useOrganizationStore((s) => s.currentOrgId);
  const createLead = useCreateLead();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    job_title: "",
    phone: "",
    source: "manual",
    priority: "medium",
    estimated_value: "",
    notes: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !form.company) return;

    try {
      await createLead.mutateAsync({
        organization_id: orgId,
        name: form.name || undefined,
        email: form.email || undefined,
        company: form.company,
        job_title: form.job_title || undefined,
        phone: form.phone || undefined,
        source: form.source as any,
        priority: form.priority as any,
        estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : undefined,
        notes: form.notes || undefined,
      });
      toast("Lead created successfully", "success");
      setForm({ name: "", email: "", company: "", job_title: "", phone: "", source: "manual", priority: "medium", estimated_value: "", notes: "" });
      onClose();
    } catch {
      toast("Failed to create lead", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Lead" description="Add a new lead to your pipeline">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Contact Name</label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@company.com" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Company *</label>
            <Input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Inc" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Job Title</label>
            <Input value={form.job_title} onChange={(e) => update("job_title", e.target.value)} placeholder="VP of Sales" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Phone</label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Estimated Value</label>
            <Input type="number" value={form.estimated_value} onChange={(e) => update("estimated_value", e.target.value)} placeholder="10000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Source</label>
            <Select value={form.source} onChange={(v) => update("source", v)} options={sourceOptions} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Priority</label>
            <Select value={form.priority} onChange={(v) => update("priority", v)} options={priorityOptions} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Additional context..."
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sage-500 focus:outline-none focus:ring-1 focus:ring-sage-500/30"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createLead.isPending || !form.company}>
            {createLead.isPending ? "Creating..." : "Create Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
