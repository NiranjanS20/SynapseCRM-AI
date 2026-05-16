"use client";

import { useAuthContext } from "@/providers/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth({ requireAuth = false } = {}) {
  const { user, loading, signInWithGoogle, signInWithMicrosoft, logout } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, requireAuth, router]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithMicrosoft,
    logout
  };
}
