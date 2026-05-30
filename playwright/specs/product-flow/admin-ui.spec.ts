import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

/**
 * Product Flow - Admin UI
 * Source usecases: ./admin-ui.usecases.md
 */
async function findProductIdByName(page: any, request: any, productName: string) {
  const client = new GoBackendClient(request);
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(400);
    const response = await client.get<any>("/v1/catalog/products?limit=100");
    if (!response.ok) continue;
    const items = Array.isArray(response.data?.items) ? response.data.items : [];
    const found = items.find((item: any) => String(item?.title ?? item?.name ?? "").trim() === productName);
    if (found?.id) return String(found.id);
  }
  return null;
}

test.describe("Product Flow - Admin UI @product-flow", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("PF-ADMIN-UI-001 create product with specs and verify storefront detail", async ({ page, request }) => {
    const uniqueId = Date.now();
    const productName = `PF Admin UI Product ${uniqueId}`;
    const productSlug = `pf-admin-ui-${uniqueId}`;

    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    await page.locator('[data-testid="field-title"]').fill(productName);
    await page.locator('[data-testid="field-price"]').fill("199.99");
    await page.locator("#slug").fill(productSlug);

    const addSpecBtn = page.locator('[data-testid="add-spec-row-btn"]');
    await expect(addSpecBtn).toBeVisible();
    await addSpecBtn.click();
    await page.locator('[data-testid="spec-key-0"]').fill("Material");
    await page.locator('[data-testid="spec-value-0"]').fill("Aluminum");

    await addSpecBtn.click();
    await page.locator('[data-testid="spec-key-1"]').fill("Length");
    await page.locator('[data-testid="spec-value-1"]').fill("125mm");

    await page.locator('[data-testid="save-btn"]').click();
    await page.waitForLoadState("networkidle");

    const productId = await findProductIdByName(page, request, productName);
    expect(productId, "Created product not found via catalog API").toBeTruthy();
    await page.goto(`/products/placeholder?id=${encodeURIComponent(productId ?? "")}`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="product-specs-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="spec-val-Material"]')).toHaveText("Aluminum");
    await expect(page.locator('[data-testid="spec-val-Length"]')).toHaveText("125mm");
  });

  test("PF-ADMIN-UI-002 upload image during create shows preview contract", async ({ page }) => {
    const uniqueId = Date.now();
    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    await page.locator('[data-testid="field-title"]').fill(`PF Media Product ${uniqueId}`);
    await page.locator('[data-testid="field-price"]').fill("29.99");
    await page.locator("#slug").fill(`pf-media-${uniqueId}`);

    const fileInput = page.locator('input[data-testid="media-file-input"]').first();
    const mockFile = {
      name: "pf-admin-ui-image.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
    };
    await fileInput.setInputFiles(mockFile);

    await expect(page.locator('[data-testid="media-preview-image"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="media-preview-card"]').first()).toBeVisible();

    await page.locator('[data-testid="save-btn"]').click();
    await page.waitForLoadState("networkidle");
  });

  test("PF-ADMIN-UI-003 admin product list exposes and executes toggle/delete actions", async ({ adminPage, page }) => {
    await adminPage.goto();
    await adminPage.navigateTo("products");

    await expect(page.locator('[data-testid="admin-table"], [data-testid="admin-table-empty"]')).toBeVisible();

    const firstRow = page.locator('[data-item-id]').first();
    await expect(firstRow).toBeVisible();

    const toggleBtn = firstRow.locator('[data-testid="toggle-btn"]');
    const editBtn = firstRow.locator('[data-testid="edit-btn"]');
    const deleteBtn = firstRow.locator('[data-testid="delete-btn"]');

    await expect(toggleBtn).toBeVisible();
    await expect(editBtn).toBeVisible();
    await expect(deleteBtn).toBeVisible();

    await toggleBtn.click();
    await page.waitForLoadState("networkidle");

    await deleteBtn.click();
    const confirmBtn = page.locator('[data-testid="confirm-delete-btn"]');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForLoadState("networkidle");
    }
  });
});
