import { request as playwrightRequest, type FullConfig } from "@playwright/test";
import { BACKEND_URL, extractAccessToken } from "../api-helpers/auth.helpers";

async function loginForToken(baseUrl: string, email: string, password: string): Promise<string | null> {
  try {
    const api = await playwrightRequest.newContext();
    const response = await api.post(`${baseUrl}/v1/auth/login`, {
      data: { email, password },
    });
    if (!response.ok()) {
      await api.dispose();
      return null;
    }
    const payload = await response.json();
    await api.dispose();
    return extractAccessToken(payload);
  } catch {
    return null;
  }
}

export default async function globalSetup(_config: FullConfig) {
  const backendUrl = BACKEND_URL;

  if (!process.env.TEST_USER_TOKEN) {
    const userCandidates: Array<[string, string]> = [
      [process.env.TEST_USER_EMAIL ?? "test_buyer@example.com", process.env.TEST_USER_PASSWORD ?? "Password123!"],
      ["admin@example.com", "AdminPass123!"],
      ["admin@example.com", "Password123!"],
    ];
    for (const [email, password] of userCandidates) {
      const token = await loginForToken(backendUrl, email, password);
      if (token) {
        process.env.TEST_USER_TOKEN = token;
        break;
      }
    }
  }

  if (!process.env.ADMIN_USER_TOKEN) {
    const adminCandidates: Array<[string, string]> = [
      [process.env.ADMIN_USER_EMAIL ?? "test_admin@example.com", process.env.ADMIN_USER_PASSWORD ?? "Password123!"],
      ["test_admin@example.com", "Password123!"],
      ["admin@example.com", "AdminPass123!"],
      ["admin@example.com", "Password123!"],
    ];
    for (const [email, password] of adminCandidates) {
      const token = await loginForToken(backendUrl, email, password);
      if (token) {
        process.env.ADMIN_USER_TOKEN = token;
        break;
      }
    }
  }

  // Debug visibility for CI/local runs; confirms whether token-dependent tests can execute.
  console.log(
    `[global-setup] TEST_USER_TOKEN=${process.env.TEST_USER_TOKEN ? "set" : "missing"} ADMIN_USER_TOKEN=${process.env.ADMIN_USER_TOKEN ? "set" : "missing"}`
  );
}
