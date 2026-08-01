import type { APIRequestContext, APIResponse } from "@playwright/test";

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  headers: Record<string, string>;
}

export const BACKEND_URL = process.env.TEST_API_BASE_URL?.trim() ?? "";

function testApiBaseUrl(): string {
  const value = process.env.TEST_API_BASE_URL?.trim();
  if (!value) throw new Error("Set TEST_API_BASE_URL before running API scenarios.");
  return value.replace(/\/$/, "");
}

export class HttpClient {
  constructor(private readonly request: APIRequestContext) {}

  private async parse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    const contentType = response.headers()["content-type"] ?? "";
    const data = contentType.includes("application/json")
      ? ((await response.json()) as T)
      : ((await response.text()) as T);

    return {
      ok: response.ok(),
      status: response.status(),
      data,
      headers: response.headers(),
    };
  }

  async get<T = unknown>(path: string, headers?: Record<string, string>) {
    return this.parse<T>(await this.request.get(`${testApiBaseUrl()}${path}`, { headers }));
  }

  async post<T = unknown>(path: string, data?: unknown, headers?: Record<string, string>) {
    return this.parse<T>(await this.request.post(`${testApiBaseUrl()}${path}`, { data, headers }));
  }

  async patch<T = unknown>(path: string, data?: unknown, headers?: Record<string, string>) {
    return this.parse<T>(await this.request.patch(`${testApiBaseUrl()}${path}`, { data, headers }));
  }

  async delete<T = unknown>(path: string, headers?: Record<string, string>) {
    return this.parse<T>(await this.request.delete(`${testApiBaseUrl()}${path}`, { headers }));
  }
}
