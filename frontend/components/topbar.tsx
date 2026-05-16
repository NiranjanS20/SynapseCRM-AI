"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const email = useAuthStore((state) => state.email);

  return (
    <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 md:px-8">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">SynapseCRM AI</div>
        <div className="mt-1 text-sm text-slate-400">{email || "Connected workspace"}</div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}</Button>
      </div>
    </div>
  );
}
