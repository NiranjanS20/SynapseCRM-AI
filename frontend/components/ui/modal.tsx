"use client";

import { Fragment } from "react";
import { cn } from "@/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-lg rounded-xl border border-white/10 bg-slate-900 shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || description) && (
            <div className="border-b border-white/5 px-6 py-4">
              {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
              {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}
