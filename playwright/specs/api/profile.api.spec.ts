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

  test.describe("GET /v1/user/profile", () => {
    test("should return user profile with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get("/v1/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("email");
      expect(response.data).toHaveProperty("username");
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/user/profile");

      expect(response.status).toBe(401);
    });
  });

  test.describe("PUT /v1/user/profile (email update)", () => {
    test("should return 401 without auth", async () => {
      const response = await client.put("/v1/user/profile", {
        email: "new@example.com",
      });

      expect(response.status).toBe(401);
    });
  });

  test.describe("PUT /v1/user/profile/notifications", () => {
    test("should return 401 without auth", async () => {
      const response = await client.put("/v1/user/profile/notifications", {
        email: true,
        push: false,
      });

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/user/profile/points", () => {
    test("should return points with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<{ points: number }>("/v1/user/profile/points", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("points");
      expect(typeof response.data.points).toBe("number");
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/user/profile/points");

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/user/profile/checkin", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post("/v1/user/profile/checkin");

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/user/profile/checkin-status", () => {
    test("should return checkin status with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<{ checked_in_today: boolean; streak: number }>("/v1/user/profile/checkin-status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("checked_in_today");
      expect(response.data).toHaveProperty("streak");
      expect(typeof response.data.checked_in_today).toBe("boolean");
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/user/profile/checkin-status");

      expect(response.status).toBe(401);
    });
  });
});
