"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import { useOrganizationStore } from "@/stores/organization-store";

/**
 * OAuth callback handler.
 * Captures the authorization code from the URL, sends it to the backend,
 * then communicates result back to the opener window and closes.
 */
export default function OAuthCallbackPage({ params }: { params: Promise<{ provider: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Connecting...");
  const currentOrgId = useOrganizationStore((s) => s.currentOrgId);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(`Authorization denied: ${error}`);
      setTimeout(() => window.close(), 3000);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No authorization code received");
      setTimeout(() => window.close(), 3000);
      return;
    }

    const exchangeCode = async () => {
      try {
        const result = await api.post(`/integrations/${resolvedParams.provider}/callback`, {
          code,
          organization_id: currentOrgId,
          redirect_uri: window.location.origin + window.location.pathname,
        });

        setStatus("success");
        setMessage(`Connected successfully!`);

        // Notify opener window
        if (window.opener) {
          window.opener.postMessage(
            { type: "OAUTH_SUCCESS", provider: resolvedParams.provider, data: result },
            window.location.origin
          );
        }

        setTimeout(() => window.close(), 2000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Connection failed");

        if (window.opener) {
          window.opener.postMessage(
            { type: "OAUTH_ERROR", provider: resolvedParams.provider, error: err?.message },
            window.location.origin
          );
        }

        setTimeout(() => window.close(), 4000);
      }
    };

    exchangeCode();
  }, [searchParams, resolvedParams.provider, currentOrgId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center max-w-sm mx-4 shadow-2xl">
        {status === "processing" && (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-violet-500 mb-4" />
            <p className="text-white font-medium">Connecting {resolvedParams.provider}...</p>
            <p className="text-sm text-slate-400 mt-1">Exchanging authorization code</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">{message}</p>
            <p className="text-sm text-slate-400 mt-1">This window will close automatically</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-white font-medium">Connection Failed</p>
            <p className="text-sm text-red-400 mt-1">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
