"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "./navigation";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-r border-white/8 bg-black/20 px-4 py-6 backdrop-blur-xl">
      <div className="mb-10 px-2">
        <div className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">SynapseCRM</div>
        <div className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">AI Sales Intelligence</div>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-2xl px-4 py-3 text-sm transition",
                active ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:bg-white/8 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
