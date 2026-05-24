import type { Page } from "@playwright/test";

/**
 * BasePage — common navigation and utility methods for all page objects.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = "/") {
    await this.page.goto(path);
    await this.page.waitForLoadState("domcontentloaded");
  }

  protected async waitForNetworkIdle() {
    await this.page.waitForLoadState("networkidle");
  }
}
