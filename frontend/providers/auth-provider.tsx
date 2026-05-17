"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, signInWithPopup, signOut as firebaseSignOut, getIdToken } from "firebase/auth";
import { auth, googleProvider, microsoftProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithMicrosoft: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Automatically handshake with backend
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const body = await res.json();
            // Set organization context from session response
            const orgIds = body.organization_ids || [];
            if (orgIds.length > 0) {
              const { useOrganizationStore } = await import("@/stores/organization-store");
              const currentOrg = useOrganizationStore.getState().currentOrgId;
              if (!currentOrg || !orgIds.includes(currentOrg)) {
                useOrganizationStore.getState().setCurrentOrg(orgIds[0]);
              }
            }
          }
        } catch (error) {
          console.error("Backend handshake failed:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithMicrosoft = async () => {
    await signInWithPopup(auth, microsoftProvider);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const getToken = async () => {
    if (!auth.currentUser) return null;
    return await getIdToken(auth.currentUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithMicrosoft, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
