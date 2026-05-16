"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userId: string;
  email: string;
  organizationIds: string[];
  role: string;
  setAuth: (payload: { token: string; userId: string; email: string; organizationIds: string[]; role: string }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: "",
      email: "",
      organizationIds: [],
      role: "member",
      setAuth: (payload) => {
        localStorage.setItem("synapsecrm_token", payload.token);
        set(payload);
      },
      clear: () => {
        localStorage.removeItem("synapsecrm_token");
        set({ token: null, userId: "", email: "", organizationIds: [], role: "member" });
      }
    }),
    {
      name: "synapsecrm-auth",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
