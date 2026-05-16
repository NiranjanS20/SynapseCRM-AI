"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import type { SessionResponse } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ fullName: "", organizationName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const session = await apiPost<SessionResponse>("/api/v1/auth/register", {
        full_name: form.fullName,
        organization_name: form.organizationName,
        email: form.email,
        password: form.password
      });
      setAuth({ token: session.access_token, userId: session.user_id, email: session.email, organizationIds: session.organization_ids, role: session.role });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">Start building</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Create workspace</h1>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input placeholder="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
        <Input placeholder="Organization name" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Input placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        <Button className="w-full" onClick={submit} disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
        <p className="text-sm text-slate-400">Already have an account? <a className="text-cyan-300" href="/login">Sign in</a></p>
      </CardBody>
    </Card>
  );
}
