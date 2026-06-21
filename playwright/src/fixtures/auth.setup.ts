import { test as setup, expect } from "@playwright/test";
import path from "path";

const USER_STATE_PATH = path.resolve(__dirname, ".auth/user.json");
const ADMIN_STATE_PATH = path.resolve(__dirname, ".auth/admin.json");

function normalizeBaseUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (url.hostname === "127.0.0.1") {
    url.hostname = "localhost";
  }
  return url.toString().replace(/\/$/, "");
}

const BASE_URL = normalizeBaseUrl(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000");
const BACKEND_URL = process.env.GO_BACKEND_URL ?? "https://grip.vn/api";
const ACCESS_TOKEN_KEY = "grip_store_access_token";
const REFRESH_TOKEN_KEY = "grip_store_refresh_token";
const EXPIRES_AT_KEY = "grip_store_access_token_expires_at";

function extractAuthTokens(payload: any) {
  const data = payload?.data ?? payload;
  const accessToken = data?.accessToken ?? data?.access_token ?? data?.token ?? null;
  const refreshToken = data?.refreshToken ?? data?.refresh_token ?? null;
  const expiresIn = Number(data?.expiresIn ?? data?.expires_in ?? 3600);
  return accessToken && refreshToken && Number.isFinite(expiresIn)
    ? { accessToken, refreshToken, expiresIn }
    : null;
}

async function persistAuthenticatedState(
  page: any,
  statePath: string,
  callbackPath: string,
  tokens: { accessToken: string; refreshToken: string; expiresIn: number },
) {
  const expiresAt = Date.now() + tokens.expiresIn * 1000;
  await page.context().addCookies([
    {
      name: ACCESS_TOKEN_KEY,
      value: tokens.accessToken,
      url: BASE_URL,
      sameSite: "Lax",
    },
    {
      name: REFRESH_TOKEN_KEY,
      value: tokens.refreshToken,
      url: BASE_URL,
      sameSite: "Lax",
    },
    {
      name: EXPIRES_AT_KEY,
      value: String(expiresAt),
      url: BASE_URL,
      sameSite: "Lax",
    },
  ]);

  await page.goto(`${BASE_URL}${callbackPath}`);
  await page.waitForLoadState("domcontentloaded");

  await page.context().storageState({ path: statePath });
}

setup("authenticate test user", async ({ page, request }) => {
  const email = process.env.TEST_USER_EMAIL ?? "test@example.com";
  const password = process.env.TEST_USER_PASSWORD ?? "TestPass123!";
  const response = await request.post(`${BACKEND_URL}/v1/auth/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const tokens = extractAuthTokens(await response.json());
  expect(tokens).toBeTruthy();

  await persistAuthenticatedState(page, USER_STATE_PATH, "/", tokens!);
});

setup("authenticate admin user", async ({ page, request }) => {
  const email = process.env.ADMIN_USER_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_USER_PASSWORD ?? "AdminPass123!";
  const response = await request.post(`${BACKEND_URL}/v1/auth/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const tokens = extractAuthTokens(await response.json());
  expect(tokens).toBeTruthy();

  await persistAuthenticatedState(page, ADMIN_STATE_PATH, "/admin/products", tokens!);
});
