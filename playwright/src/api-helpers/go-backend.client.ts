import type { APIRequestContext, APIResponse } from "@playwright/test";

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
 * GoBackendClient — thin helper around Playwright's APIRequestContext
 * to call the Go backend directly (e.g. seeding data, resetting state).
 */

const GO_BACKEND_URL =
  process.env.GO_BACKEND_URL ?? "http://localhost:8080";

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


  /* ── Test data management ───────────────────────── */

  /**
   * Seed test data in the Go backend (user accounts, products, etc.)
   */
  async seedTestData(payload?: Record<string, unknown>) {
    const response = await this.request.post(`${GO_BACKEND_URL}/api/test/seed`, {
      data: payload ?? {},
    });
    if (!response.ok()) {
      throw new Error(
        `Failed to seed test data: ${response.status()} ${await response.text()}`
      );
    }
    return response.json();
  }

  /**
   * Reset the test database / state between tests
   */
  async resetTestState() {
    const response = await this.request.post(
      `${GO_BACKEND_URL}/api/test/reset`
    );
    if (!response.ok()) {
      throw new Error(
        `Failed to reset test state: ${response.status()} ${await response.text()}`
      );
    }
  }

  /* ── Auth helpers ───────────────────────────────── */

  /**
   * Create a test user directly via the API (bypassing the UI).
   */
  async createTestUser(user: {
    email: string;
    password: string;
    name?: string;
  }) {
    const response = await this.request.post(
      `${GO_BACKEND_URL}/api/test/users`,
      { data: user }
    );
    if (!response.ok()) {
      throw new Error(
        `Failed to create test user: ${response.status()} ${await response.text()}`
      );
    }
    return response.json();
  }

  /* ── Generic typed request helpers ──────────────── */

  async get<T = unknown>(path: string, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.get(`${GO_BACKEND_URL}${path}`, {
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }

  async post<T = unknown>(path: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.post(`${GO_BACKEND_URL}${path}`, {
      data,
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }

  async put<T = unknown>(path: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.put(`${GO_BACKEND_URL}${path}`, {
      data,
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }

  async patch<T = unknown>(path: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.patch(`${GO_BACKEND_URL}${path}`, {
      data,
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }

  async delete<T = unknown>(path: string, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const response = await this.request.delete(`${GO_BACKEND_URL}${path}`, {
      headers: options?.headers,
    });
    return this.parseResponse<T>(response);
  }
}
