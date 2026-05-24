import { BasePage } from "./base.page";

export class ProfilePage extends BasePage {
  async goto() {
    await super.goto("/admin/profile");
  }

  async getUsername(): Promise<string> {
    return this.page.locator('[data-testid="profile-username"]').innerText();
  }

  async getPoints(): Promise<number> {
    const text = await this.page.locator('[data-testid="profile-points"]').innerText();
    return parseInt(text.replace(/[^\d]/g, ""), 10);
  }

  async updateEmail(email: string) {
    await this.page.locator('[data-testid="profile-email-input"]').fill(email);
    await this.page.locator('[data-testid="profile-save-btn"]').click();
    await this.waitForNetworkIdle();
  }

  async performCheckin() {
    await this.page.locator('[data-testid="checkin-btn"]').click();
    await this.waitForNetworkIdle();
  }
}
