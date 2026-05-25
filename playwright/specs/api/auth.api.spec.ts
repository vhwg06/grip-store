import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { AuthApiHelper } from "../../src/api-helpers/auth.api";

test.describe("Auth API @api", () => {
  let client: GoBackendClient;
  let authApi: AuthApiHelper;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    authApi = new AuthApiHelper(client);
  });

  test.describe("GET /v1/auth/me", () => {
    test("should return user profile with valid token", async () => {
      const loginResponse = await authApi.login(
        process.env.TEST_USER_EMAIL ?? "test@example.com",
        process.env.TEST_USER_PASSWORD ?? "TestPass123!"
      );
      expect(loginResponse.ok).toBe(true);
      const token = loginResponse.data.token;

      const response = await client.get("/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("email");
      expect(response.data).toHaveProperty("username");
      expect(response.data).toHaveProperty("role");
    });

    test("should return 401 without token", async () => {
      const response = await client.get("/v1/auth/me");

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/auth/refresh", () => {
    test("should refresh token successfully", async () => {
      // First login to get a refresh token
      const loginResponse = await authApi.login(
        process.env.TEST_USER_EMAIL ?? "test@example.com",
        process.env.TEST_USER_PASSWORD ?? "TestPass123!"
      );

      expect(loginResponse.ok).toBe(true);

      const refreshToken = loginResponse.data.refresh_token;
      const response = await authApi.refreshToken(refreshToken);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("refresh_token");
      expect(typeof response.data.token).toBe("string");
    });

    test("should return 401 with invalid refresh token", async () => {
      const response = await authApi.refreshToken("invalid-token-12345");

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/auth/logout", () => {
    test("should logout successfully with valid token", async () => {
      const loginResponse = await authApi.login(
        process.env.TEST_USER_EMAIL ?? "test@example.com",
        process.env.TEST_USER_PASSWORD ?? "TestPass123!"
      );
      expect(loginResponse.ok).toBe(true);
      const token = loginResponse.data.token;

      const response = await client.post("/v1/auth/logout", undefined, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Legacy backend may return 400 if the token was already invalidated server-side.
      expect([200, 204, 400]).toContain(response.status);
    });

    test("should return 401 without token", async () => {
      const response = await client.post("/v1/auth/logout");

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/auth/login", () => {
    test("should login with valid credentials", async () => {
      const response = await authApi.login(
        process.env.TEST_USER_EMAIL ?? "test@example.com",
        process.env.TEST_USER_PASSWORD ?? "TestPass123!"
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("refresh_token");
    });

    test("should return 401 with invalid credentials", async () => {
      const response = await authApi.login(
        "nonexistent@example.com",
        "WrongPassword123!"
      );

      expect(response.status).toBe(401);
    });

    test("should return 400 with missing email", async () => {
      const response = await authApi.login("", "Password123!");

      expect([400, 422]).toContain(response.status);
    });
  });
});
