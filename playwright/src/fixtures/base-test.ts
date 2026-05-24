import { test as base } from "@playwright/test";
import { AuthPage } from "../objects";
import { GoBackendClient } from "../api-helpers/go-backend.client";

/**
 * Custom Fixtures — injected into every spec via `test`.
 * Specs import `{ test, expect }` from this file instead of @playwright/test.
 */

type CustomFixtures = {
  authPage: AuthPage;
  apiClient: GoBackendClient;
};

export const test = base.extend<CustomFixtures>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  apiClient: async ({ request }, use) => {
    const client = new GoBackendClient(request);
    await use(client);
  },
});

export { expect } from "@playwright/test";
