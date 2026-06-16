import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

test.describe("Media API Contract @api", () => {
  let client: GoBackendClient;
  const adminToken = process.env.ADMIN_USER_TOKEN;
  const userToken = process.env.TEST_USER_TOKEN;

  test.beforeEach(async ({ request }) => {
    client = new GoBackendClient(request);
  });

  test("should require auth for media listing", async () => {
    const response = await client.get("/v1/admin/media?page=1&pageSize=10");
    expect([401, 403]).toContain(response.status);
  });

  test("should reject non-admin media listing", async () => {
    test.skip(!userToken, "TEST_USER_TOKEN not set");

    const response = await client.get("/v1/admin/media?page=1&pageSize=10", {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    expect(response.status).toBe(403);
  });

  test("should list media assets for admin token", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.get("/v1/admin/media?page=1&pageSize=10", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status).toBe(200);
    const payload = response.data as any;
    const items = Array.isArray(payload) ? payload : payload?.items ?? payload?.data?.items ?? payload?.data ?? [];
    expect(Array.isArray(items)).toBe(true);
  });

  test("should return a presigned upload contract for admin token", async () => {
    test.skip(!adminToken, "ADMIN_USER_TOKEN not set");

    const response = await client.get("/v1/admin/media/presigned?fileName=contract.png&contentType=image/png", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status).toBe(200);
    const data = (response.data as any)?.data ?? response.data as any;
    expect(typeof data.upload_url).toBe("string");
    expect(typeof data.public_url).toBe("string");
    expect(typeof data.id).toBe("string");
  });
});
