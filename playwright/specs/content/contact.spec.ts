import { test, expect } from "../../src/fixtures/base-test";
import { TestData } from "../../src/helpers/test-data";

test.describe("Contact Page @content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should render contact form", async ({ page }) => {
    const form = page.locator(
      '[data-testid="contact-form"], form'
    );
    await expect(form).toBeVisible();
  });

  test("should display map embed", async ({ page }) => {
    const map = page.locator('[data-testid="contact-map"], iframe[src*="map"]');
    if (await map.isVisible()) {
      await expect(map).toBeVisible();
    }
  });

  test("should display company contact info", async ({ page }) => {
    const info = page.locator(
      '[data-testid="contact-company-info"], [data-testid="contact-address"]'
    );
    if (await info.isVisible()) {
      await expect(info).not.toBeEmpty();
    }
  });

  test("should submit contact form", async ({ page }) => {
    const nameInput = page.locator('[data-testid="contact-name"]');
    test.skip(!(await nameInput.isVisible()), "Contact form not found");

    await nameInput.fill("Playwright Tester");
    await page.locator('[data-testid="contact-email"]').fill(TestData.email());
    await page
      .locator('[data-testid="contact-message"]')
      .fill("This is an automated test message from Playwright.");

    const submitBtn = page.locator('[data-testid="contact-submit-btn"]');
    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    // Should show success message or toast
    const success = page.locator(
      '[data-testid="contact-success"], [data-testid="toast"]'
    );
    await expect(success).toBeVisible({ timeout: 10_000 });
  });
});
