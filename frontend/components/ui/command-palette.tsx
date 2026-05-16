"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setOpen(false)}
      />
      <Command 
        className="relative z-50 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 text-slate-200 shadow-2xl"
      >
        <div className="flex items-center border-b border-white/10 px-3">
          <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
          <Command.Input 
            autoFocus 
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="Type a command or search..." 
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden px-2 py-3">
          <Command.Empty className="py-6 text-center text-sm text-slate-500">
            No results found.
          </Command.Empty>
          <Command.Group heading="Suggestions" className="px-2 text-xs font-medium text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            <Command.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white">
              Search Leads
            </Command.Item>
            <Command.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white">
              Create Workflow
            </Command.Item>
            <Command.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white">
              View Analytics
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
