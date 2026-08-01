import type { APIRequestContext } from "@playwright/test";
import { testApiBaseUrl } from "../runtime/api-helpers/auth.helpers";

export { BACKEND_URL } from "./http-client";

type LoginPayload = {
  token?: string;
  access_token?: string;
  accessToken?: string;
  data?: { token?: string; access_token?: string; accessToken?: string };
};

export function extractAccessToken(payload: LoginPayload | null | undefined): string | null {
  return payload?.data?.accessToken ?? payload?.data?.access_token ?? payload?.data?.token
    ?? payload?.accessToken ?? payload?.access_token ?? payload?.token ?? null;
}

export async function loginForToken(
  request: Pick<APIRequestContext, "post">,
  email: string,
  password: string,
): Promise<string | null> {
  const baseUrl = testApiBaseUrl();
  const response = await request.post(`${baseUrl}/v1/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) return null;
  return extractAccessToken((await response.json()) as LoginPayload);
}

export async function requireConfiguredToken(
  request: Pick<APIRequestContext, "post">,
  tokenEnv: string,
  emailEnv: string,
  passwordEnv: string,
): Promise<string> {
  const configuredToken = process.env[tokenEnv]?.trim();
  if (configuredToken) return configuredToken;

  const email = process.env[emailEnv]?.trim();
  const password = process.env[passwordEnv]?.trim();
  if (!email || !password) {
    throw new Error(`Configure ${tokenEnv} or ${emailEnv}/${passwordEnv} before running API tests.`);
  }

  const token = await loginForToken(request, email, password);
  if (!token) throw new Error(`Unable to acquire token from ${testApiBaseUrl()}/v1/auth/login.`);
  return token;
}
