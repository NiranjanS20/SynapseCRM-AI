"use client";

import { useEffect } from "react";
import type { WorkflowEvent } from "./types";
import { useRealtimeStore } from "@/stores/realtime-store";

function getWsBase() {
  return process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
}

export function useWorkflowSocket(organizationId: string) {
  const pushEvent = useRealtimeStore((state) => state.pushEvent);

  useEffect(() => {
    if (!organizationId) return;
    const socket = new WebSocket(`${getWsBase()}/ws?organization_id=${organizationId}`);

    socket.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data) as WorkflowEvent;
        pushEvent(parsed);
      } catch {
        return;
      }
    };

    return () => socket.close();
  }, [organizationId, pushEvent]);
}
