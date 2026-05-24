import { test, expect } from "../../src/fixtures/base-test";

test.describe("Check-in @engagement", () => {
  test("should display checkin button on profile", async ({
    profilePage,
    page,
  }) => {
    await profilePage.goto();

    const checkinBtn = page.locator('[data-testid="checkin-btn"]');
    await expect(checkinBtn).toBeVisible();
  });

  test("should perform daily check-in", async ({ profilePage, page }) => {
    await profilePage.goto();

    const checkinBtn = page.locator('[data-testid="checkin-btn"]');
    test.skip(!(await checkinBtn.isEnabled()), "Checkin already done today");

    await profilePage.performCheckin();

    // Should show success feedback
    const success = page.locator(
      '[data-testid="checkin-success"], [data-testid="toast"]'
    );
    await expect(success).toBeVisible({ timeout: 5_000 });
  });

  test("should show points after check-in", async ({
    profilePage,
  }) => {
    await profilePage.goto();

    const points = await profilePage.getPoints();
    expect(typeof points).toBe("number");
    expect(points).toBeGreaterThanOrEqual(0);
  });

  test("should display streak information", async ({ profilePage, page }) => {
    await profilePage.goto();

    const streak = page.locator('[data-testid="checkin-streak"]');
    if (await streak.isVisible()) {
      await expect(streak).not.toBeEmpty();
    }
  });

  test("should display username", async ({ profilePage }) => {
    await profilePage.goto();

    const username = await profilePage.getUsername();
    expect(username).toBeTruthy();
  });
});
