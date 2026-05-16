import { createClient } from "@/lib/supabase/client";
import type { ApiEnvelope } from "@/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class ApiClientError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string = "unknown") {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestInit = {}, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = await getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(buildUrl(path, params), { ...options, headers, cache: "no-store" });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const body = await response.json();
      detail = body.detail || body.error || detail;
    } catch {}
    throw new ApiClientError(detail, response.status);
  }

  return response.json() as Promise<T>;
}

// ── HTTP Methods ───────────────────────────────────────────

export function apiGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  return request<ApiEnvelope<T>>(path, { method: "GET" }, params);
}

export function apiPost<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) {
  return request<ApiEnvelope<T>>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }, params);
}

export function apiPatch<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) {
  return request<ApiEnvelope<T>>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }, params);
}

export function apiDelete<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  return request<ApiEnvelope<T>>(path, { method: "DELETE" }, params);
}

export { ApiClientError };
