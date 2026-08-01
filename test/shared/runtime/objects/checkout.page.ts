import { BasePage } from "./base.page";

export class CheckoutPage extends BasePage {
  async goto() {
    await super.goto("/checkout");
  }

  async fillEmail(email: string) {
    await this.page.locator('[data-testid="checkout-email"]').fill(email);
  }

  async selectPaymentMethod(method: string) {
    await this.page.locator(`[data-testid="payment-method-${method}"]`).click();
  }

  async placeOrder() {
    await this.page.locator('[data-testid="place-order-btn"]').click();
    await this.waitForNetworkIdle();
  }

  async getOrderConfirmation(): Promise<string | null> {
    const el = this.page.locator('[data-testid="order-confirmation"]');
    if (await el.isVisible()) {
      return el.innerText();
    }
    return null;
  }
}
