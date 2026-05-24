import type { FullConfig } from "@playwright/test";

type LoginPayload = {
  token?: string;
  access_token?: string;
  data?: {
    token?: string;
    access_token?: string;
  };
};

async function loginForToken(baseUrl: string, email: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as LoginPayload;
    return payload.token ?? payload.access_token ?? payload.data?.token ?? payload.data?.access_token ?? null;
  } catch {
    return null;
  }
}

export default async function globalSetup(_config: FullConfig) {
  const backendUrl = process.env.GO_BACKEND_URL ?? "http://127.0.0.1:8080";

  if (!process.env.TEST_USER_TOKEN) {
    const userCandidates: Array<[string, string]> = [
      [process.env.TEST_USER_EMAIL ?? "test_buyer@example.com", process.env.TEST_USER_PASSWORD ?? "Password123!"],
      ["test@example.com", "Password123!"],
      ["test@example.com", "TestPass123!"],
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
