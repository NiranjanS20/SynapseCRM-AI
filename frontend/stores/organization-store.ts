import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCurrentOrgId } from "@/services/api";

interface OrganizationState {
  currentOrgId: string | null;
  setCurrentOrg: (orgId: string) => void;
  clearOrg: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      currentOrgId: null,
      setCurrentOrg: (orgId: string) => {
        setCurrentOrgId(orgId);
        set({ currentOrgId: orgId });
      },
      clearOrg: () => {
        setCurrentOrgId(null);
        set({ currentOrgId: null });
      },
    }),
    {
      name: "synapse-org",
      onRehydrateStorage: () => (state) => {
        if (state?.currentOrgId) {
          setCurrentOrgId(state.currentOrgId);
        }
      },
    }
  )
);
