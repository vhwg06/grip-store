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

  test.describe("GET /v1/notifications", () => {
    test("should return notifications with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<Array<{ id: string; type: string; title?: string; read?: boolean }> | { items?: unknown[] }>("/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const notifications = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as any)?.items)
          ? (response.data as any).items
          : [];
      expect(Array.isArray(notifications)).toBe(true);
      if (notifications.length > 0) {
        expect(notifications[0]).toHaveProperty("id");
        expect(notifications[0]).toHaveProperty("type");
      }
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/notifications");

      expect(response.status).toBe(401);
    });
  });

  test.describe("GET /v1/notifications/unread-count", () => {
    test("should return unread count with auth", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<{ count: number }>(
        "/v1/notifications/unread-count",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("count");
      expect(typeof response.data.count).toBe("number");
    });

    test("should return 401 without auth", async () => {
      const response = await client.get("/v1/notifications/unread-count");

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/notifications/:id/read", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post(
        "/v1/notifications/fake-id/read"
      );

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/notifications/read-all", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post(
        "/v1/notifications/read-all"
      );

      expect(response.status).toBe(401);
    });
  });

  test.describe("POST /v1/notifications/clear", () => {
    test("should return 401 without auth", async () => {
      const response = await client.post("/v1/notifications/clear");

      expect(response.status).toBe(401);
    });
  });
});
