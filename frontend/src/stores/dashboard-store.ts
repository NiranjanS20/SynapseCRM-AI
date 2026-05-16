"use client";

import { create } from "zustand";

interface DashboardState {
  selectedOrganizationId: string;
  setSelectedOrganizationId: (organizationId: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedOrganizationId: "",
  setSelectedOrganizationId: (organizationId) => set({ selectedOrganizationId: organizationId })
}));
