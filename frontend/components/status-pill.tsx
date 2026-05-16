import { cn } from "@/lib/cn";

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "high" || status === "healthy" || status === "completed"
      ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/30"
      : status === "medium" || status === "running"
        ? "bg-amber-400/15 text-amber-200 border-amber-400/30"
        : "bg-white/8 text-slate-200 border-white/12";

  return <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", tone)}>{status}</span>;
}
