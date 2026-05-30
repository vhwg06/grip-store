import { test, expect } from "../../src/fixtures/base-test";
import { GoBackendClient } from "../../src/api-helpers/go-backend.client";

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

test.describe("Admin Product Specs Management @admin", () => {
  test.use({
    storageState: "./playwright/src/fixtures/.auth/admin.json",
  });

  test("should allow adding, editing and deleting specs on product creation", async ({ page, request }) => {
    // 1. Go to the new product page
    await page.goto("/admin/product/new");
    await page.waitForLoadState("networkidle");

    const uniqueId = Date.now();
    const productName = `Daytona CNC Grip ${uniqueId}`;
    const productPrice = "180.00";
    const productSlug = `daytona-cnc-${uniqueId}`;

    // Fill basic details
    await page.locator('[data-testid="field-title"]').fill(productName);
    await page.locator('[data-testid="field-price"]').fill(productPrice);
    await page.locator('#slug').fill(productSlug);

    // 2. Dynamic Specs addition
    // Click "Thêm thông số" button
    const addSpecBtn = page.locator('[data-testid="add-spec-row-btn"]');
    await expect(addSpecBtn).toBeVisible();
    await addSpecBtn.click();

    // Fill key-value for first spec
    await page.locator('[data-testid="spec-key-0"]').fill("Chất liệu");
    await page.locator('[data-testid="spec-value-0"]').fill("Nhôm CNC Carbon");

    // Click "Thêm thông số" again for second spec
    await addSpecBtn.click();
    await page.locator('[data-testid="spec-key-1"]').fill("Chiều dài");
    await page.locator('[data-testid="spec-value-1"]').fill("125mm");

    // Click "Thêm thông số" again to test deletion
    await addSpecBtn.click();
    await page.locator('[data-testid="spec-key-2"]').fill("Xóa tôi");
    await page.locator('[data-testid="spec-value-2"]').fill("Sẽ bị xóa");

    // Delete the third spec row
    const deleteSpecBtn = page.locator('[data-testid="delete-spec-row-2"]');
    await expect(deleteSpecBtn).toBeVisible();
    await deleteSpecBtn.click();

    // 3. Save the product
    await page.locator('[data-testid="save-btn"]').click();
    await page.waitForLoadState("networkidle");

    // 4. Verify that the product is saved and specs are rendered correctly on details page
    // Navigate to the list or direct url to details
    // Since Next.js has client side navigation, let's navigate to the client-facing detail page
    // We'll search for this product in products list or go directly by slug
    const productId = await findProductIdByName(page, request, productName);
    expect(productId, "Created product not found via catalog API").toBeTruthy();
    await page.goto(`/products/placeholder?id=${encodeURIComponent(productId ?? "")}`);
    await page.waitForLoadState("networkidle");

    // 5. Verify the Specs Table on details page
    const specsTable = page.locator('[data-testid="product-specs-table"]');
    await expect(specsTable).toBeVisible();

    // Verify values in table
    const materialValue = page.locator('[data-testid="spec-val-Chất liệu"]');
    const lengthValue = page.locator('[data-testid="spec-val-Chiều dài"]');
    const deletedValue = page.locator('[data-testid="spec-val-Xóa tôi"]');

    await expect(materialValue).toHaveText("Nhôm CNC Carbon");
    await expect(lengthValue).toHaveText("125mm");
    await expect(deletedValue).toHaveCount(0); // Should not exist
  });
});
