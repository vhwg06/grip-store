import type { APIRequestContext, APIResponse } from "@playwright/test";
import { testApiBaseUrl } from "./auth.helpers";

/**
 * Typed API response wrapper for consistent return types.
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  headers: Record<string, string>;
}

/**
 * Thin helper around Playwright's APIRequestContext for the real public API.
 */

export class GoBackendClient {
  constructor(private readonly request: APIRequestContext) {}

  /* ── Response parsing ───────────────────────────── */

  private async parseResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    let data: any;
    const contentType = response.headers()["content-type"] ?? "";
    if (contentType.includes("application/json")) {
      data = await response.json();
      // Centrally unpack the standard Go backend success envelope { data: ... }
      if (data && typeof data === "object" && "data" in data && !("error" in data)) {
        data = data.data;
      }
    } else {
      data = await response.text();
    }
    return {
      ok: response.ok(),
      status: response.status(),
      data: data as T,
      headers: response.headers(),
    };
  }


  /* ── Generic typed request helpers ──────────────── */

  async get<T = unknown>(path: string, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.get(`${testApiBaseUrl()}${path}`, {
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }

  async post<T = unknown>(path: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.post(`${testApiBaseUrl()}${path}`, {
      data,
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }

  async put<T = unknown>(path: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.put(`${testApiBaseUrl()}${path}`, {
      data,
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }

  async patch<T = unknown>(path: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.patch(`${testApiBaseUrl()}${path}`, {
      data,
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }

  async delete<T = unknown>(path: string, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.delete(`${testApiBaseUrl()}${path}`, {
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }
}
