"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import type { SessionResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const session = await apiPost<SessionResponse>("/api/v1/auth/login", { email, password });
      setAuth({ token: session.access_token, userId: session.user_id, email: session.email, organizationIds: session.organization_ids, role: session.role });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">Welcome back</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Sign in</h1>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input placeholder="email@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <Button className="w-full" onClick={submit} disabled={loading}>{loading ? "Signing in..." : "Continue"}</Button>
        <p className="text-sm text-slate-400">Need an account? <a className="text-cyan-300" href="/register">Create one</a></p>
      </CardBody>
    </Card>
  );
}
