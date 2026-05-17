"use client";

import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  className?: string;
}

export function Pagination({ total, limit, offset, onPageChange, className }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between pt-4", className)}>
      <p className="text-sm text-slate-400">
        Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={currentPage === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-slate-300">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(offset + limit)}
          disabled={currentPage === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
