"use client";

import { motion } from "framer-motion";
import { slideUp } from "@/lib/motion/slide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { signInWithGoogle, signInWithMicrosoft, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      // Router effect handles redirect
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setError(null);
      await signInWithMicrosoft();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Microsoft");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-sage-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial="initial"
        animate="animate"
        variants={slideUp}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-sage-400 to-sage-600" />
          <span className="font-display text-xl font-semibold text-white tracking-tight">SynapseCRM</span>
        </Link>

        <Card className="border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your intelligent workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full h-11 border-white/10 hover:bg-white/5" onClick={handleGoogleLogin} disabled={loading}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full h-11 border-white/10 hover:bg-white/5" onClick={handleMicrosoftLogin} disabled={loading}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21">
                  <path fill="#f25022" d="M1 1h9v9H1z" />
                  <path fill="#00a4ef" d="M1 11h9v9H1z" />
                  <path fill="#7fba00" d="M11 1h9v9h-9z" />
                  <path fill="#ffb900" d="M11 11h9v9h-9z" />
                </svg>
                Continue with Microsoft
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-center text-slate-500">
              Don't have an account? <Link href="/signup" className="text-sage-400 hover:text-sage-300 transition-colors">Sign up</Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
