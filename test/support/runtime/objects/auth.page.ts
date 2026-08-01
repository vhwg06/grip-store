import type { Page } from "@playwright/test";
import { AuthLocators } from "../locators";

/**
 * AuthPage — Page Object for authentication flows.
 * Encapsulates navigation & interactions so specs stay clean.
 */
export class AuthPage {
  constructor(private readonly page: Page) {}

  /* ── Navigation ─────────────────────────────────── */

  async gotoLogin() {
    await this.page.goto("/login");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoSignUp() {
    await this.page.goto("/signup");
    await this.page.waitForLoadState("networkidle");
  }

  /* ── Actions ────────────────────────────────────── */

  async login(email: string, password: string) {
    const { loginPage } = AuthLocators;

    await this.page.locator(loginPage.emailInput).fill(email);
    await this.page.locator(loginPage.passwordInput).fill(password);
    await this.page.locator(loginPage.submitButton).click();
  }

  async signUp(name: string, email: string, password: string) {
    const { signUpPage } = AuthLocators;

    await this.page.locator(signUpPage.nameInput).fill(name);
    await this.page.locator(signUpPage.emailInput).fill(email);
    await this.page.locator(signUpPage.passwordInput).fill(password);
    await this.page.locator(signUpPage.confirmPasswordInput).fill(password);
    await this.page.locator(signUpPage.submitButton).click();
  }

  async logout() {
    await this.page.locator(AuthLocators.common.logoutButton).click();
  }

  /* ── Assertions helpers ─────────────────────────── */

  getErrorMessage() {
    return this.page.locator(AuthLocators.loginPage.errorMessage);
  }

  getUserAvatar() {
    return this.page.locator(AuthLocators.common.userAvatar);
  }

  async isLoggedIn(): Promise<boolean> {
    return this.page.locator(AuthLocators.common.userAvatar).isVisible();
  }
}
