"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, GoogleAuthProvider, OAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  session: any | null; // Keeping for compatibility
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithMicrosoft: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Set a lightweight cookie for Next.js middleware route protection
        // This won't perfectly validate on the edge without firebase-admin, 
        // but it provides optimistic route guarding
        const token = await currentUser.getIdToken();
        Cookies.set('firebase-auth', token, { expires: 1, path: '/' });
        setSession({ token });
      } else {
        Cookies.remove('firebase-auth', { path: '/' });
        setSession(null);
        // Do not redirect on initial load (loading is true) if unauthenticated,
        // let the middleware or page handle initial routing.
        if (!loading) {
          router.push("/login");
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, loading]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithMicrosoft = async () => {
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      prompt: 'consent',
      tenant: 'common',
    });
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithMicrosoft, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
