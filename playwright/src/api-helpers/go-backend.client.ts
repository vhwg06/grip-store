import type { APIRequestContext } from "@playwright/test";

/**
 * GoBackendClient — thin helper around Playwright's APIRequestContext
 * to call the Go backend directly (e.g. seeding data, resetting state).
 */

const GO_BACKEND_URL =
  process.env.GO_BACKEND_URL ?? "http://localhost:8080";

export class GoBackendClient {
  constructor(private readonly request: APIRequestContext) {}

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

  /* ── Generic request helper ─────────────────────── */

  async get(path: string) {
    return this.request.get(`${GO_BACKEND_URL}${path}`);
  }

  async post(path: string, data?: Record<string, unknown>) {
    return this.request.post(`${GO_BACKEND_URL}${path}`, { data });
  }

  async put(path: string, data?: Record<string, unknown>) {
    return this.request.put(`${GO_BACKEND_URL}${path}`, { data });
  }

  async delete(path: string) {
    return this.request.delete(`${GO_BACKEND_URL}${path}`);
  }
}
