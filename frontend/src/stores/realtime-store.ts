"use client";

import { create } from "zustand";
import type { WorkflowEvent } from "@/lib/types";

interface RealtimeState {
  events: WorkflowEvent[];
  pushEvent: (event: WorkflowEvent) => void;
  clear: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  events: [],
  pushEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 20) })),
  clear: () => set({ events: [] })
}));
