"use client";

import { cn } from "@/utils/cn";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export function Select({ value, onChange, options, placeholder, className, id }: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 text-sm text-white",
        "focus:border-sage-500 focus:outline-none focus:ring-1 focus:ring-sage-500/30",
        "transition-colors appearance-none cursor-pointer",
        className
      )}
    >
      {placeholder && (
        <option value="" className="bg-slate-900 text-slate-400">
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-900">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
