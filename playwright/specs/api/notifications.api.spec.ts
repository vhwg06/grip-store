import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";
import { EngagementApiHelper } from "../../src/api-helpers/engagement.api";

test.describe("Notifications API @api", () => {
  let client: GoBackendClient;
  let engagementApi: EngagementApiHelper;
  const token = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
    engagementApi = new EngagementApiHelper(client);
  });

  test.describe("GET /v1/user/notifications", () => {
    test("should return notifications with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<Array<{ id: string; type: string; title: string; read: boolean }>>("/v1/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty("id");
        expect(response.data[0]).toHaveProperty("type");
        expect(response.data[0]).toHaveProperty("title");
        expect(response.data[0]).toHaveProperty("read");
      }
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/user/notifications");

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/user/notifications/unread-count", () => {
    test("should return unread count with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<{ count: number }>(
        "/v1/user/notifications/unread-count",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("count");
      expect(typeof response.data.count).toBe("number");
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/user/notifications/unread-count");

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/user/notifications/:id/read", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post(
        "/v1/user/notifications/fake-id/read"
      );

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/user/notifications/read-all", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post(
        "/v1/user/notifications/read-all"
      );

      expect(response.status).toBe(401);
    });
  });

  test.describe("DELETE /v1/user/notifications", () => {
    test("should return 401 without auth", async () => {
      const response = await client.delete("/v1/user/notifications");

      expect(response.status).toBe(401);
    });
  });
});
