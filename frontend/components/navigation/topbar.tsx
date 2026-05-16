"use client";

import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { CommandPalette } from "@/components/ui/command-palette";

export function Topbar() {
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-slate-950/80 px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <button 
          onClick={() => setCmdOpen(true)}
          className="flex w-full max-w-sm items-center gap-2 rounded-md border border-white/5 bg-slate-900/50 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-800/50 hover:text-slate-400 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search or jump to... (Cmd+K)</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent-danger border border-slate-950" />
        </button>
        <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-medium text-sage-400">
          U
        </div>
      </div>

      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
    </header>
  );
}
