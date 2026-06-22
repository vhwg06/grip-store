import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

test.describe("Profile API @api", () => {
  let client: GoBackendClient;
  const token = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  test.describe("GET /v1/profile", () => {
    test("should return user profile with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<Record<string, unknown>>("/v1/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      if ("user" in (response.data ?? {})) {
        expect((response.data as any).user).toHaveProperty("id");
      } else {
        expect(response.data).toHaveProperty("id");
      }
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/profile");

      expect(response.status).toBe(401);
    });
  });

  test.describe("PATCH /v1/profile/email", () => {
    test("should return 401 without auth", async () => {
      const response = await client.put("/v1/profile/email", {
        email: "new@example.com",
      });

      expect(response.status).toBe(401);
    });
  });

  test.describe("PATCH /v1/profile/notifications", () => {
    test("should return 401 without auth", async () => {
      const response = await client.put("/v1/profile/notifications", {
        enabled: true,
      });

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/user/profile", () => {
    test("should return legacy profile read model with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<Record<string, unknown>>("/v1/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeTruthy();
      expect(response.data).not.toHaveProperty("points");
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/user/profile");

      expect(response.status).toBe(401);
    });
  });

  test.describe("Removed loyalty/check-in routes", () => {
    test("should keep /v1/profile/checkin absent even with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");
      const response = await client.post("/v1/profile/checkin", undefined, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.status).toBe(404);
    });

    test("should keep check-in status read models absent", async () => {
      const candidates = [
        "/v1/user/profile/checkin-status",
        "/v1/user/profile/checkin/status",
        "/v1/profile/checkin-status",
        "/v1/profile/checkin/status",
      ];

      for (const path of candidates) {
        const response = await client.get(path);
        expect(response.status).toBe(404);
      }
    });
  });
});
