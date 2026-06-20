import type { APIRequestContext } from "@playwright/test";

export const BACKEND_URL = process.env.GO_BACKEND_URL ?? "https://grip.vn/api";

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
    throw new Error(`Unable to acquire ${role} token from ${BACKEND_URL}/v1/auth/login`);
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
  const response = await request.post(`${BACKEND_URL}/v1/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) return null;
  const payload = (await response.json()) as LoginPayload;
  return extractAccessToken(payload);
}

export async function getAdminToken(request: Pick<APIRequestContext, "post">): Promise<string> {
  const envToken = process.env.ADMIN_USER_TOKEN?.trim();
  if (envToken) return envToken;

  return requireToken(
    await loginForToken(
      request,
      process.env.ADMIN_USER_EMAIL ?? "test_admin@example.com",
      process.env.ADMIN_USER_PASSWORD ?? "Password123!",
    ),
    "admin",
  );
}

export async function getUserToken(request: Pick<APIRequestContext, "post">): Promise<string> {
  const envToken = process.env.TEST_USER_TOKEN?.trim();
  if (envToken) return envToken;

  return requireToken(
    await loginForToken(
      request,
      process.env.TEST_USER_EMAIL ?? "test_buyer@example.com",
      process.env.TEST_USER_PASSWORD ?? "Password123!",
    ),
    "user",
  );
}
