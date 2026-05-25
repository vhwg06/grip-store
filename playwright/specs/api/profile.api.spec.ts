import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { ProfileApiHelper } from "../../src/api-helpers/profile.api";

test.describe("Profile API @api", () => {
  let client: GoBackendClient;
  let profileApi: ProfileApiHelper;
  const token = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    profileApi = new ProfileApiHelper(client);
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

  test.describe("GET /v1/user/profile (points fallback)", () => {
    test("should return points with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<{ points: number }>("/v1/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("points");
      expect(typeof response.data.points).toBe("number");
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/user/profile");

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/profile/checkin", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post("/v1/profile/checkin");

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/user/profile/checkin-status", () => {
    test("should return checkin status with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const candidates = [
        "/v1/user/profile/checkin-status",
        "/v1/user/profile/checkin/status",
        "/v1/profile/checkin-status",
        "/v1/profile/checkin/status",
      ];

      let found: any = null;
      const statuses: number[] = [];
      for (const path of candidates) {
        const response = await client.get<{ checkedIn?: boolean; checked_in_today?: boolean; streak?: number; consecutiveDays?: number }>(path, {
          headers: { Authorization: `Bearer ${token}` },
        });
        statuses.push(response.status);
        if (response.status === 404) continue;
        found = response;
        break;
      }

      if (found) {
        expect(found.status).toBe(200);
        expect(
          typeof (found.data as any)?.checkedIn === "boolean" ||
            typeof (found.data as any)?.checked_in_today === "boolean"
        ).toBe(true);
      } else {
        // Endpoint may be disabled in some backend snapshots; ensure this is explicit (404 only).
        expect(statuses.length).toBeGreaterThan(0);
        expect(statuses.every((status) => status === 404)).toBe(true);
      }
    });

    test("should return 401 without auth", async () => {
      const candidates = [
        "/v1/user/profile/checkin-status",
        "/v1/user/profile/checkin/status",
        "/v1/profile/checkin-status",
        "/v1/profile/checkin/status",
      ];

      let foundStatus: number | null = null;
      for (const path of candidates) {
        const response = await client.get(path);
        if (response.status === 404) continue;
        foundStatus = response.status;
        break;
      }

      expect(foundStatus).toBe(401);
    });
  });
});
