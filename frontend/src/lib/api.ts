export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("synapsecrm_token");
}

export function buildUrl(path: string, params?: Record<string, string | number>) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url.toString();
}

async function request<T>(path: string, options: RequestInit = {}, params?: Record<string, string | number>): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(buildUrl(path, params), { ...options, headers, cache: "no-store" });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string, params?: Record<string, string | number>) {
  return request<T>(path, { method: "GET" }, params);
}

export function apiPost<T>(path: string, body?: unknown) {
  return request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}
