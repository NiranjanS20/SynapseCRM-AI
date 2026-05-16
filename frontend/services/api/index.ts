import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }

  async post<T>(path: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }
}

export const api = new ApiService();
