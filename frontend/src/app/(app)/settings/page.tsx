"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const clear = useAuthStore((state) => state.clear);

  return (
    <div className="space-y-8">
      <SectionTitle title="Workspace Settings" subtitle="Configure auth, environment toggles, and connected integrations." />
      <Card>
        <CardBody className="space-y-4">
          <p className="text-sm text-slate-400">Environment variables are read from `NEXT_PUBLIC_*` values and the backend `backend/.env` file.</p>
          <Button variant="secondary" onClick={clear}>Sign out</Button>
        </CardBody>
      </Card>
    </div>
  );
}

