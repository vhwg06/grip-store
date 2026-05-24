# Tasks: Playwright Automated Testing (E2E + API)

**Input**: Design documents from `/specs/003-playwright-auto-test/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This feature IS the test implementation — all tasks produce test files or test infrastructure.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Test infrastructure**: `playwright/src/`
- **Test specs**: `playwright/specs/`
- **Config**: project root `playwright.config.ts`
- **CI**: `.github/workflows/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [ ] T001 Update `playwright.config.ts` to add `setup` project (storageState auth), `api` project (no browser, baseURL from GO_BACKEND_URL), and dependencies between projects
- [ ] T002 [P] Create `playwright/.env.test` with GO_BACKEND_URL, NEXT_PUBLIC_APP_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD, TEST_USER_TOKEN, ADMIN_USER_TOKEN
- [ ] T003 [P] Add `test:api` and `test:e2e` npm scripts to `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core test infrastructure that MUST be complete before ANY user story tests can be written

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create `playwright/src/fixtures/auth.setup.ts` global setup that logs in test user + admin user and saves storageState files
- [ ] T005 Extend `playwright/src/api-helpers/go-backend.client.ts` with `delete<T>(path)` method and typed `ApiResponse<T>` return type
- [ ] T006 Extend `playwright/src/fixtures/base-test.ts` with all new page object fixtures (homepagePage, productListPage, productDetailPage, cartPage, checkoutPage, ordersPage, adminPage, profilePage, articlePage, wishlistPage) and API helper fixtures (authApi, catalogApi, checkoutApi, ordersApi, adminApi, engagementApi, profileApi)
- [ ] T007 [P] Create `playwright/src/helpers/test-data.ts` with factory functions for test user data, product data, order data, and review data
- [ ] T008 [P] Create `playwright/src/helpers/wait-helpers.ts` with custom wait/retry utilities for network idle, element stable, toast disappear

**Checkpoint**: Foundation ready — `npx playwright test --project=setup` runs without error; storageState files are written

---

## Phase 3: User Story 1 — API Test Suite for Core Backend Endpoints (Priority: P1) 🎯 MVP

**Goal**: Cover all 54+ API endpoints with contract tests validating response shape, status codes, authentication enforcement, and error handling

**Independent Test**: `npx playwright test --project=api`

### API Helper Classes

- [ ] T009 [P] [US1] Create `AuthApiHelper` in `playwright/src/api-helpers/auth.api.ts` implementing IAuthApiHelper (refreshToken, logout, getMe)
- [ ] T010 [P] [US1] Create `CatalogApiHelper` in `playwright/src/api-helpers/catalog.api.ts` implementing ICatalogApiHelper (getProducts, getProduct, getBuyMeta, search, getCategories, getSettings, getAnnouncement)
- [ ] T011 [P] [US1] Create `CheckoutApiHelper` in `playwright/src/api-helpers/checkout.api.ts` implementing ICheckoutApiHelper (createOrder, getPaymentOrders, getPaymentParams, getOrderStatus, cancelOrder)
- [ ] T012 [P] [US1] Create `OrdersApiHelper` in `playwright/src/api-helpers/orders.api.ts` implementing IOrdersApiHelper (getOrders, getOrder, getOrderStatus, cancelOrder, requestRefund)
- [ ] T013 [P] [US1] Create `ProfileApiHelper` in `playwright/src/api-helpers/profile.api.ts` implementing IProfileApiHelper (getProfile, updateEmail, updateNotifications, getPoints, checkin, getCheckinStatus)
- [ ] T014 [P] [US1] Create `EngagementApiHelper` in `playwright/src/api-helpers/engagement.api.ts` implementing IEngagementApiHelper (wishlist CRUD, reviews, notifications)
- [ ] T015 [P] [US1] Create `AdminApiHelper` in `playwright/src/api-helpers/admin.api.ts` implementing IAdminApiHelper (products CRUD, cards, orders, users, settings, categories, notifications, data)

### API Test Specs

- [ ] T016 [P] [US1] Write `playwright/specs/api/auth.api.spec.ts` — tests for refresh, logout, me; 401 without token; token refresh success
- [ ] T017 [P] [US1] Write `playwright/specs/api/catalog.api.spec.ts` — tests for products list, product detail, search, categories, settings, announcement; 404 for invalid ID
- [ ] T018 [P] [US1] Write `playwright/specs/api/checkout.api.spec.ts` — tests for order creation, payment-orders, payment-params, status, cancel; 401 without auth; 400 with invalid data
- [ ] T019 [P] [US1] Write `playwright/specs/api/orders.api.spec.ts` — tests for list, detail, status, cancel, refund-request; 401 without auth; 404 for non-existent order
- [ ] T020 [P] [US1] Write `playwright/specs/api/profile.api.spec.ts` — tests for profile get, email update, notifications patch, points, checkin, checkin status; 401 without auth
- [ ] T021 [P] [US1] Write `playwright/specs/api/wishlist.api.spec.ts` — tests for list, add, vote, delete; 401 without auth; 404 for invalid product
- [ ] T022 [P] [US1] Write `playwright/specs/api/reviews.api.spec.ts` — tests for list (public), create (auth), admin delete; 401/403 enforcement
- [ ] T023 [P] [US1] Write `playwright/specs/api/notifications.api.spec.ts` — tests for list, unread-count, mark-read, mark-all-read, clear; 401 without auth
- [ ] T024 [P] [US1] Write `playwright/specs/api/admin.api.spec.ts` — tests for products CRUD, cards import/pull, orders management, users, settings, categories CRUD, broadcast, data import/repair; 403 without admin role

**Checkpoint**: `npx playwright test --project=api` passes all endpoint tests with response shape validation

---

## Phase 4: User Story 2 — E2E Product Browsing & Search (Priority: P1) 🎯 MVP

**Goal**: Verify customer-facing product browsing experience works end-to-end across browsers

**Independent Test**: `npx playwright test --grep @browse --project=chromium`

### Locators & Page Objects

- [ ] T025 [P] [US2] Create `CatalogLocators` in `playwright/src/locators/catalog.locators.ts` — product card, filter panel, sort dropdown, pagination, search input, result count
- [ ] T026 [P] [US2] Create `HomepagePage` in `playwright/src/objects/homepage.page.ts` implementing IHomepagePage — hero title, featured products, announcement banner
- [ ] T027 [P] [US2] Create `ProductListPage` in `playwright/src/objects/product-list.page.ts` implementing IProductListPage — product cards, filter, sort, paginate, search, result count
- [ ] T028 [P] [US2] Create `ProductDetailPage` in `playwright/src/objects/product-detail.page.ts` implementing IProductDetailPage — title, price, add-to-cart, reviews section

### E2E Test Specs

- [ ] T029 [US2] Write `playwright/specs/browse/homepage.spec.ts` — banner visible, category icons, product blocks render, announcement displays
- [ ] T030 [US2] Write `playwright/specs/browse/product-list.spec.ts` — product cards render, category filter works, price sort works, pagination navigates
- [ ] T031 [US2] Write `playwright/specs/browse/product-detail.spec.ts` — product info renders, image gallery works, tabs switch, add-to-cart clickable
- [ ] T032 [US2] Write `playwright/specs/browse/search.spec.ts` — search query returns results, empty state for no matches, result count matches
- [ ] T033 [US2] Update `playwright/src/locators/index.ts` barrel export with CatalogLocators
- [ ] T034 [US2] Update `playwright/src/objects/index.ts` barrel export with HomepagePage, ProductListPage, ProductDetailPage

**Checkpoint**: `npx playwright test specs/browse --project=chromium` passes

---

## Phase 5: User Story 3 — E2E Cart & Checkout Flow (Priority: P1) 🎯 MVP

**Goal**: Verify shopping cart and checkout flow works correctly

**Independent Test**: `npx playwright test --grep @checkout --project=chromium`

### Locators & Page Objects

- [ ] T035 [P] [US3] Create `CartLocators` in `playwright/src/locators/cart.locators.ts` — cart items list, quantity input, remove button, total, checkout button
- [ ] T036 [P] [US3] Create `CheckoutLocators` in `playwright/src/locators/checkout.locators.ts` — email input, payment method, place order button, confirmation
- [ ] T037 [P] [US3] Create `CartPage` in `playwright/src/objects/cart.page.ts` implementing ICartPage — get items, update quantity, remove item, get total, proceed to checkout
- [ ] T038 [P] [US3] Create `CheckoutPage` in `playwright/src/objects/checkout.page.ts` implementing ICheckoutPage — fill email, select payment, place order, get confirmation
- [ ] T039 [P] [US3] Create `OrdersPage` in `playwright/src/objects/orders.page.ts` implementing IOrdersPage — get orders list, view detail, cancel, request refund

### E2E Test Specs

- [ ] T040 [US3] Write `playwright/specs/checkout/cart.spec.ts` — add product to cart, view cart, update quantity, remove item, totals recalculate
- [ ] T041 [US3] Write `playwright/specs/checkout/order-flow.spec.ts` — complete purchase flow from cart to order confirmation, order appears in orders list
- [ ] T042 [US3] Update `playwright/src/locators/index.ts` with CartLocators, CheckoutLocators
- [ ] T043 [US3] Update `playwright/src/objects/index.ts` with CartPage, CheckoutPage, OrdersPage

**Checkpoint**: `npx playwright test specs/checkout --project=chromium` passes

---

## Phase 6: User Story 4 — E2E Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: Verify login, session persistence, token refresh, and logout work correctly across browsers

**Independent Test**: `npx playwright test --grep @auth --project=chromium`

### E2E Test Specs

- [ ] T044 [US4] Extend existing `playwright/specs/auth/login.spec.ts` with OAuth redirect initiation test, session persistence on refresh, logout invalidation
- [ ] T045 [US4] Create `playwright/specs/auth/signup.spec.ts` — registration form validation, successful signup, duplicate email error

**Checkpoint**: `npx playwright test specs/auth --project=chromium` passes

---

## Phase 7: User Story 5 — E2E Admin Panel (Priority: P2)

**Goal**: Verify admin CRUD operations for products, orders, and settings

**Independent Test**: `npx playwright test --grep @admin --project=chromium`

### Locators & Page Objects

- [ ] T046 [P] [US5] Create `AdminLocators` in `playwright/src/locators/admin.locators.ts` — nav links, form fields, table rows, modals, action buttons
- [ ] T047 [P] [US5] Create `AdminPage` in `playwright/src/objects/admin.page.ts` implementing IAdminPage — navigate sections, get table rows, create/edit/delete item

### E2E Test Specs

- [ ] T048 [US5] Write `playwright/specs/admin/products.spec.ts` — admin product list, create product, edit product, toggle visibility, delete product
- [ ] T049 [US5] Write `playwright/specs/admin/orders.spec.ts` — admin order list, view detail, update status, approve/reject refund
- [ ] T050 [US5] Write `playwright/specs/admin/settings.spec.ts` — settings page, update config, manage categories, view users
- [ ] T051 [US5] Update `playwright/src/locators/index.ts` with AdminLocators
- [ ] T052 [US5] Update `playwright/src/objects/index.ts` with AdminPage

**Checkpoint**: `npx playwright test specs/admin --project=chromium` passes with admin auth state

---

## Phase 8: User Story 6 — E2E Content Pages (Priority: P2)

**Goal**: Verify content pages render correctly (articles, about, contact)

**Independent Test**: `npx playwright test --grep @content --project=chromium`

### Locators & Page Objects

- [ ] T053 [P] [US6] Create `ContentLocators` in `playwright/src/locators/content.locators.ts` — article cards, article body, about gallery, contact form, map embed
- [ ] T054 [P] [US6] Create `ArticlePage` in `playwright/src/objects/article.page.ts` implementing IArticlePage — get articles list, view article, get title/content

### E2E Test Specs

- [ ] T055 [US6] Write `playwright/specs/content/articles.spec.ts` — article list renders, article detail renders, pagination works
- [ ] T056 [US6] Write `playwright/specs/content/about.spec.ts` — about page renders company info, gallery visible
- [ ] T057 [US6] Write `playwright/specs/content/contact.spec.ts` — contact page renders form, map, company info; form submission works
- [ ] T058 [US6] Update `playwright/src/locators/index.ts` with ContentLocators
- [ ] T059 [US6] Update `playwright/src/objects/index.ts` with ArticlePage

**Checkpoint**: `npx playwright test specs/content --project=chromium` passes

---

## Phase 9: User Story 7 — E2E Wishlist & Reviews (Priority: P3)

**Goal**: Verify wishlist management and product reviews for authenticated users

**Independent Test**: `npx playwright test --grep @engagement --project=chromium`

### Locators & Page Objects

- [ ] T060 [P] [US7] Create `EngagementLocators` in `playwright/src/locators/engagement.locators.ts` — wishlist items, add/remove buttons, vote button, review form, star rating
- [ ] T061 [P] [US7] Create `WishlistPage` in `playwright/src/objects/wishlist.page.ts` implementing IWishlistPage — get items, add item, remove item, vote item
- [ ] T062 [P] [US7] Create `ProfilePage` in `playwright/src/objects/profile.page.ts` implementing IProfilePage — get username, get points, update email, perform checkin

### E2E Test Specs

- [ ] T063 [US7] Write `playwright/specs/engagement/wishlist.spec.ts` — add product to wishlist, view wishlist, remove item, vote on item
- [ ] T064 [US7] Write `playwright/specs/engagement/reviews.spec.ts` — submit review with rating, review appears on product page
- [ ] T065 [US7] Write `playwright/specs/engagement/checkin.spec.ts` — daily check-in, points increment, streak tracking
- [ ] T066 [US7] Update `playwright/src/locators/index.ts` with EngagementLocators
- [ ] T067 [US7] Update `playwright/src/objects/index.ts` with WishlistPage, ProfilePage

**Checkpoint**: `npx playwright test specs/engagement --project=chromium` passes with authenticated state

---

## Phase 10: Cross-Browser & Visual Regression

**Purpose**: Ensure cross-browser compatibility and add visual snapshot assertions

- [ ] T068 [P] Run full suite on Firefox project — fix any Firefox-specific failures
- [ ] T069 [P] Run full suite on WebKit project — fix any WebKit-specific failures
- [ ] T070 [P] Run full suite on mobile-chrome project — fix any mobile viewport failures
- [ ] T071 Add `toHaveScreenshot()` assertions to homepage, product-detail, cart, and checkout specs for visual regression baseline
- [ ] T072 Add visual diff threshold configuration (`maxDiffPixelRatio`) to `playwright.config.ts`

**Checkpoint**: `npx playwright test` passes across all 4 browser projects; screenshot baselines committed

---

## Phase 11: CI/CD Integration

**Purpose**: Automated test execution in GitHub Actions pipeline

- [ ] T073 Create `.github/workflows/playwright.yml` with test sharding, artifact upload for failed reports, and 10-minute timeout
- [ ] T074 [P] Configure test sharding (minimum 4 shards) for parallel CI execution
- [ ] T075 Verify full suite completes within 10-minute budget on CI

**Checkpoint**: CI workflow runs successfully on push; total time <10 minutes (NFR-001)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 API Tests (Phase 3)**: Depends on Phase 2 (API helpers need base client extension)
- **US2 Browse E2E (Phase 4)**: Depends on Phase 2 (needs fixtures and page object base)
- **US3 Checkout E2E (Phase 5)**: Depends on Phase 2; uses ProductDetailPage from Phase 4
- **US4 Auth E2E (Phase 6)**: Depends on Phase 2 (uses existing AuthPage)
- **US5 Admin E2E (Phase 7)**: Depends on Phase 2
- **US6 Content E2E (Phase 8)**: Depends on Phase 2
- **US7 Engagement E2E (Phase 9)**: Depends on Phase 2
- **Cross-Browser (Phase 10)**: Depends on all E2E phases (4-9)
- **CI/CD (Phase 11)**: Depends on Phase 10

### User Story Dependencies

- **US1 (API Tests)**: Independent after Phase 2 — no dependency on other stories
- **US2 (Browse E2E)**: Independent after Phase 2
- **US3 (Checkout E2E)**: Depends on US2 for ProductDetailPage (add-to-cart starts from product page)
- **US4 (Auth E2E)**: Independent after Phase 2 — uses existing AuthPage
- **US5 (Admin E2E)**: Independent after Phase 2
- **US6 (Content E2E)**: Independent after Phase 2
- **US7 (Engagement E2E)**: Independent after Phase 2

### Parallel Opportunities

- **Phase 1**: T002, T003 can run in parallel
- **Phase 2**: T007, T008 can run in parallel
- **Phase 3**: All API helper tasks (T009–T015) can run in parallel; all API spec tasks (T016–T024) can run in parallel after helpers
- **Phase 4**: Locator/POM tasks (T025–T028) can run in parallel; then E2E specs sequentially
- **Phase 5**: Locator/POM tasks (T035–T039) can run in parallel
- **Phase 7**: T046, T047 can run in parallel
- **Phase 8**: T053, T054 can run in parallel
- **Phase 9**: T060–T062 can run in parallel
- **Phase 10**: T068, T069, T070 can run in parallel
- **After Phase 2 completes**: US1, US2, US4, US5, US6, US7 can all proceed in parallel (US3 waits for US2 ProductDetailPage)

---

## Summary

| Phase | Story | Tasks | Priority |
|-------|-------|-------|----------|
| 1 | Setup | 3 | — |
| 2 | Foundational | 5 | — |
| 3 | US1: API Tests | 16 | P1 🎯 |
| 4 | US2: Browse E2E | 10 | P1 🎯 |
| 5 | US3: Checkout E2E | 9 | P1 🎯 |
| 6 | US4: Auth E2E | 2 | P1 🎯 |
| 7 | US5: Admin E2E | 7 | P2 |
| 8 | US6: Content E2E | 7 | P2 |
| 9 | US7: Engagement E2E | 8 | P3 |
| 10 | Cross-Browser | 5 | — |
| 11 | CI/CD | 3 | — |
| **Total** | | **75** | |

**MVP Scope (P1)**: Phases 1–6 = 45 tasks delivering API coverage + core E2E flows
