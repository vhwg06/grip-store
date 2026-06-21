import { BasePage } from "./base.page";

export class AdminPage extends BasePage {
  private static readonly NAV_TIMEOUT_MS = 30_000;

  async goto() {
    await super.goto("/admin/products");
    await this.page.locator('[data-testid="admin-nav"]').first().waitFor({
      state: "visible",
      timeout: AdminPage.NAV_TIMEOUT_MS,
    });
    const loading = this.page.locator('[data-item-id="loading-placeholder"]');
    if (await loading.count() > 0) {
      await loading.waitFor({ state: "hidden", timeout: AdminPage.NAV_TIMEOUT_MS });
    }
  }

  async navigateTo(section: string) {
    await super.goto(`/admin/${section}`);
    await this.page.waitForURL(new RegExp(`/admin/${section}`), {
      timeout: AdminPage.NAV_TIMEOUT_MS,
    });
    await this.page.locator('[data-testid="admin-nav"]').first().waitFor({
      state: "visible",
      timeout: AdminPage.NAV_TIMEOUT_MS,
    });
    const loading = this.page.locator('[data-item-id="loading-placeholder"]');
    if (await loading.count() > 0) {
      await loading.waitFor({ state: "hidden", timeout: AdminPage.NAV_TIMEOUT_MS });
    }
  }

  async getTableRows(): Promise<number> {
    return this.page.locator('[data-testid="admin-table"] tbody tr').count();
  }

  async createItem(data: Record<string, string>) {
    await this.page.locator('[data-testid="create-btn"]').click();
    for (const [key, value] of Object.entries(data)) {
      await this.page.locator(`[data-testid="field-${key}"]`).fill(value);
    }
    await this.page.locator('[data-testid="save-btn"]').click();
    await this.page.waitForTimeout(250);
  }

  async editItem(id: string, data: Record<string, string>) {
    await this.page.locator(`[data-item-id="${id}"] [data-testid="edit-btn"]`).click();
    for (const [key, value] of Object.entries(data)) {
      await this.page.locator(`[data-testid="field-${key}"]`).fill(value);
    }
    await this.page.locator('[data-testid="save-btn"]').click();
    await this.page.waitForTimeout(250);
  }

  async deleteItem(id: string) {
    await this.page.locator(`[data-item-id="${id}"] [data-testid="delete-btn"]`).click();
    await this.page.locator('[data-testid="confirm-delete-btn"]').click();
    await this.page.waitForTimeout(250);
  }
}
