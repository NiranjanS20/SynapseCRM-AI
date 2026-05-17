"use client";

import { cn } from "@/utils/cn";
import { useState } from "react";

interface TabItem {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ items, defaultValue, className }: TabsProps) {
  const [active, setActive] = useState(defaultValue || items[0]?.value);
  const activeItem = items.find((i) => i.value === active);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-1 border-b border-white/5">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => setActive(item.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              active === item.value
                ? "text-sage-400"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {item.label}
            {active === item.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
      <div>{activeItem?.content}</div>
    </div>
  );
}
