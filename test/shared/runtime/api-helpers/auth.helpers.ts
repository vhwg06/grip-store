import type { APIRequestContext } from "@playwright/test";

export const BACKEND_URL = process.env.TEST_API_BASE_URL?.trim() ?? "";

export function testApiBaseUrl(): string {
  const value = process.env.TEST_API_BASE_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || "https://grip.vn/api";
  return value.replace(/\/$/, "");
}

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    if (name === "ADMIN_USER_EMAIL") return "test_admin@example.com";
    if (name === "ADMIN_USER_PASSWORD") return "Password123!";
    if (name === "TEST_USER_EMAIL") return "test_buyer@example.com";
    if (name === "TEST_USER_PASSWORD") return "Password123!";
    throw new Error(`Set ${name} before running authenticated Cucumber scenarios.`);
  }
  return value;
}

type LoginPayload = {
  token?: string;
  access_token?: string;
  accessToken?: string;
  data?: {
    token?: string;
    access_token?: string;
    accessToken?: string;
  };
};

function requireToken(token: string | null, role: "admin" | "user"): string {
  if (!token) {
    throw new Error(`Unable to acquire ${role} token from ${testApiBaseUrl()}/v1/auth/login`);
  }
  return token;
}

export function extractAccessToken(payload: LoginPayload | null | undefined): string | null {
  return (
    payload?.data?.accessToken ??
    payload?.data?.access_token ??
    payload?.data?.token ??
    payload?.accessToken ??
    payload?.access_token ??
    payload?.token ??
    null
  );
}

export async function loginForToken(
  request: Pick<APIRequestContext, "post">,
  email: string,
  password: string,
): Promise<string | null> {
  const response = await request.post(`${testApiBaseUrl()}/v1/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) return null;
  const payload = (await response.json()) as LoginPayload;
  return extractAccessToken(payload);
}

let cachedAdminToken: string | null = null;
let cachedUserToken: string | null = null;

export async function getAdminToken(request: Pick<APIRequestContext, "post">): Promise<string> {
  const envToken = process.env.ADMIN_USER_TOKEN?.trim();
  if (envToken) return envToken;
  if (cachedAdminToken) return cachedAdminToken;

  const token = requireToken(
    await loginForToken(
      request,
      requiredEnv("ADMIN_USER_EMAIL"),
      requiredEnv("ADMIN_USER_PASSWORD"),
    ),
    "admin",
  );
  cachedAdminToken = token;
  return token;
}

export async function getUserToken(request: Pick<APIRequestContext, "post">): Promise<string> {
  const envToken = process.env.TEST_USER_TOKEN?.trim();
  if (envToken) return envToken;
  if (cachedUserToken) return cachedUserToken;

  const token = requireToken(
    await loginForToken(
      request,
      requiredEnv("TEST_USER_EMAIL"),
      requiredEnv("TEST_USER_PASSWORD"),
    ),
    "user",
  );
  cachedUserToken = token;
  return token;
}

