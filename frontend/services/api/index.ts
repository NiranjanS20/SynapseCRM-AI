import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

// ── Error Class ─────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown>;

  constructor(status: number, message: string, code = "api_error", details: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ── Organization Context ────────────────────────────────────
let _currentOrgId: string | null = null;

export function setCurrentOrgId(orgId: string | null) {
  _currentOrgId = orgId;
}

export function getCurrentOrgId(): string | null {
  return _currentOrgId;
}

// ── API Client ──────────────────────────────────────────────
class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (_currentOrgId) {
      headers["X-Organization-Id"] = _currentOrgId;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = response.statusText;
      let code = "api_error";
      let details = {};
      try {
        const body = await response.json();
        message = body.detail || body.message || body.error || message;
        code = body.code || code;
        details = body.details || {};
      } catch {
        // ignore parse errors
      }
      throw new ApiError(response.status, message, code, details);
    }
    return response.json();
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = `${API_BASE_URL}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const response = await fetch(url, { headers: await this.getHeaders() });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, params?: Record<string, string>): Promise<T> {
    let url = `${API_BASE_URL}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    const response = await fetch(url, {
      method: "DELETE",
      headers: await this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiService();
