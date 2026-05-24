# Data Model: Playwright Automated Testing Architecture

**Date**: 2025-07-27 | **Plan**: [plan.md](./plan.md)

## Test Infrastructure Entities

### Page Object Classes

| Class | File | Responsibility |
|-------|------|----------------|
| `AuthPage` | `src/objects/auth.page.ts` | Login, signup, logout flows |
| `HomepagePage` | `src/objects/homepage.page.ts` | Hero, featured products, announcements |
| `ProductListPage` | `src/objects/product-list.page.ts` | Grid, filters, pagination, search |
| `ProductDetailPage` | `src/objects/product-detail.page.ts` | Product info, buy button, reviews |
| `CartPage` | `src/objects/cart.page.ts` | Cart items, quantity, totals |
| `CheckoutPage` | `src/objects/checkout.page.ts` | Order form, payment redirect |
| `OrdersPage` | `src/objects/orders.page.ts` | Order list, status, detail |
| `AdminPage` | `src/objects/admin.page.ts` | Admin panel navigation, CRUD |
| `ProfilePage` | `src/objects/profile.page.ts` | User info, settings, points |
| `ArticlePage` | `src/objects/article.page.ts` | Article list, detail, content |
| `WishlistPage` | `src/objects/wishlist.page.ts` | Wishlist management, voting |

### API Helper Classes

| Class | File | Responsibility |
|-------|------|----------------|
| `GoBackendClient` | `src/api-helpers/go-backend.client.ts` | Base client, seed/reset, generic HTTP |
| `AuthApiHelper` | `src/api-helpers/auth.api.ts` | Token refresh, login, me endpoint |
| `CatalogApiHelper` | `src/api-helpers/catalog.api.ts` | Products, categories, search, settings |
| `CheckoutApiHelper` | `src/api-helpers/checkout.api.ts` | Order creation, payment status, cancel |
| `OrdersApiHelper` | `src/api-helpers/orders.api.ts` | Order list, detail, refund requests |
| `AdminApiHelper` | `src/api-helpers/admin.api.ts` | Admin CRUD, settings, users |
| `ProfileApiHelper` | `src/api-helpers/profile.api.ts` | Profile, points, checkin |
| `EngagementApiHelper` | `src/api-helpers/engagement.api.ts` | Wishlist, reviews, notifications |

### Locator Maps

| Map | File | Covers |
|-----|------|--------|
| `AuthLocators` | `src/locators/auth.locators.ts` | Login, signup, avatar, logout |
| `CatalogLocators` | `src/locators/catalog.locators.ts` | Product cards, filters, pagination |
| `CartLocators` | `src/locators/cart.locators.ts` | Cart items, totals, checkout button |
| `CheckoutLocators` | `src/locators/checkout.locators.ts` | Order form, email, payment |
| `AdminLocators` | `src/locators/admin.locators.ts` | Admin nav, forms, tables, modals |
| `ProfileLocators` | `src/locators/profile.locators.ts` | Profile info, settings, points |
| `ContentLocators` | `src/locators/content.locators.ts` | Articles, about, contact pages |
| `EngagementLocators` | `src/locators/engagement.locators.ts` | Wishlist items, review forms |

### Fixture Types

```typescript
// Extended from base-test.ts
type CustomFixtures = {
  // Page Objects
  authPage: AuthPage;
  homepagePage: HomepagePage;
  productListPage: ProductListPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  ordersPage: OrdersPage;
  adminPage: AdminPage;
  profilePage: ProfilePage;

  // API Helpers
  apiClient: GoBackendClient;
  authApi: AuthApiHelper;
  catalogApi: CatalogApiHelper;
  checkoutApi: CheckoutApiHelper;
  ordersApi: OrdersApiHelper;
  adminApi: AdminApiHelper;

  // Utilities
  testUser: TestUserData;
  adminUser: TestUserData;
};

type TestUserData = {
  email: string;
  password: string;
  token: string;
  id: string;
};
```

### Playwright Projects

| Project | Browser | Purpose | Dependencies |
|---------|---------|---------|-------------|
| `setup` | — | Authenticate test users, save storageState | none |
| `api` | — | API-only tests (no browser) | setup |
| `chromium` | Chromium | Primary E2E tests | setup |
| `firefox` | Firefox | Cross-browser E2E | setup |
| `webkit` | WebKit | Cross-browser E2E | setup |
| `mobile-chrome` | Mobile Chrome (Pixel 5) | Mobile responsive E2E | setup |

### Test Tag Taxonomy

| Tag | Directory | Description |
|-----|-----------|-------------|
| `@auth` | `specs/auth/` | Authentication & session tests |
| `@browse` | `specs/browse/` | Product browsing & search tests |
| `@checkout` | `specs/checkout/` | Cart & checkout flow tests |
| `@admin` | `specs/admin/` | Admin panel tests |
| `@content` | `specs/content/` | Content/editorial page tests |
| `@engagement` | `specs/engagement/` | Wishlist, reviews, points tests |
| `@api` | `specs/api/` | API endpoint contract tests |

## Environment Configuration

```bash
# .env.test
GO_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Password123!
ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=AdminPass123!
TEST_USER_TOKEN=<pre-issued-jwt>
ADMIN_USER_TOKEN=<pre-issued-admin-jwt>
```

## File Naming Conventions

| Pattern | Use |
|---------|-----|
| `*.spec.ts` | E2E test files |
| `*.api.spec.ts` | API-only test files |
| `*.page.ts` | Page Object Model classes |
| `*.locators.ts` | Locator constant maps |
| `*.api.ts` | API helper classes (in `src/api-helpers/`) |
| `base-test.ts` | Custom fixture definition |
| `auth.setup.ts` | Global authentication setup |
