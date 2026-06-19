import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

type NotificationItem = {
  id: number;
  type: string;
  titleKey?: string;
  contentKey?: string;
  isRead?: boolean;
};

function extractItems(payload: any): NotificationItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

test.describe("Notifications API @api", () => {
  let client: GoBackendClient;
  const token = process.env.TEST_USER_TOKEN;
  const adminToken = process.env.ADMIN_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  test.describe("Buyer inbox contract", () => {
    test("lists notifications for authenticated buyer", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<
        NotificationItem[] | { items?: NotificationItem[] }
      >("/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const items = extractItems(response.data);
      expect(Array.isArray(items)).toBe(true);
      if (items.length > 0) {
        expect(items[0]).toMatchObject({
          id: expect.any(Number),
          type: expect.any(String),
        });
      }
    });

    test("rejects inbox read without auth", async () => {
      const response = await client.get("/v1/notifications");
      expect(response.status).toBe(401);
    });

    test("returns unread count for authenticated buyer", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.get<{ count: number }>(
        "/v1/notifications/unread-count",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({ count: expect.any(Number) });
    });

    test("rejects unread count without auth", async () => {
      const response = await client.get("/v1/notifications/unread-count");
      expect(response.status).toBe(401);
    });

    test("marks one notification as read for authenticated buyer", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const listResponse = await client.get<
        NotificationItem[] | { items?: NotificationItem[] }
      >("/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(listResponse.status).toBe(200);

      const firstItem = extractItems(listResponse.data)[0];
      test.skip(!firstItem, "No seeded notification available");

      const response = await client.post(
        `/v1/notifications/${firstItem.id}/read`,
        undefined,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect(response.status).toBe(204);
    });

    test("rejects invalid notification id shape", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.post(
        "/v1/notifications/not-a-number/read",
        undefined,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect(response.status).toBe(400);
    });

    test("rejects mark-read without auth", async () => {
      const response = await client.post("/v1/notifications/940001/read");
      expect(response.status).toBe(401);
    });

    test("marks all notifications as read for authenticated buyer", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.post(
        "/v1/notifications/read-all",
        undefined,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect(response.status).toBe(204);
    });

    test("rejects mark-all-read without auth", async () => {
      const response = await client.post("/v1/notifications/read-all");
      expect(response.status).toBe(401);
    });

    test("clears notification inbox for authenticated buyer", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.delete("/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(204);
    });

    test("rejects inbox clear without auth", async () => {
      const response = await client.delete("/v1/notifications");
      expect(response.status).toBe(401);
    });
  });

  test.describe("Admin raw notification contract", () => {
    test("queues raw notification test send for admin", async () => {
      test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/notifications/test",
        {
          channel: "email",
          to: "test_buyer@example.com",
          subject: "Playwright notification contract",
          body: "Ping",
        },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        status: "queued",
        channel: "email",
      });
    });

    test("rejects raw notification test send without auth", async () => {
      const response = await client.post("/v1/admin/notifications/test", {
        channel: "email",
        to: "test_buyer@example.com",
      });

      expect(response.status).toBe(401);
    });

    test("rejects raw notification test send for non-admin caller", async () => {
      test.skip(!token, "TEST_USER_TOKEN not set");

      const response = await client.post(
        "/v1/admin/notifications/test",
        {
          channel: "email",
          to: "test_buyer@example.com",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect(response.status).toBe(403);
    });
  });
});
