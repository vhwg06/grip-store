# Feature Specification: Playwright Automated Testing (E2E & API)

**Feature Branch**: `003-playwright-auto-test`

**Created**: 2025-07-27

**Status**: Draft

**Input**: User description: "Dựa vào docs và specs/002-ecommerce-news-website và source code hiện tại, implement auto test (e2e, api test) using Playwright trong /playwright directory."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - API Test Suite for Core Backend Endpoints (Priority: P1)

A developer runs the Playwright API test suite to verify all backend REST API endpoints function correctly. Tests cover authentication (OAuth flow, token refresh, logout, me), catalog (products listing, search, categories, product detail, settings), checkout (order creation, payment status, order cancellation), and profile (points, check-in, email update). Each API test validates response shape, status codes, authentication enforcement, and error handling.

**Why this priority**: API tests are the foundation — they verify the contract between frontend and backend without UI complexity. They run fastest and catch regression in business logic immediately.

**Independent Test**: Can be fully tested by running `npx playwright test --project=api` against a running backend. Delivers confidence that all API contracts defined in `docs/migration/api-spec.md` are honored.

**Acceptance Scenarios**:

1. **Given** the test server is running, **When** the API test suite executes, **Then** all public endpoints (catalog, categories, settings, announcement) return 200 with correct JSON shape.
2. **Given** a valid user token, **When** authenticated endpoints are called (profile, orders, wishlist), **Then** they return 200 with user-specific data.
3. **Given** no authentication token, **When** protected endpoints are called, **Then** they return 401 Unauthorized.
4. **Given** invalid input data, **When** POST/PATCH endpoints are called, **Then** they return 400/422 with descriptive error messages.
5. **Given** a non-existent resource ID, **When** detail endpoints are called, **Then** they return 404 Not Found.

---

### User Story 2 - E2E Test Suite for Product Browsing & Search (Priority: P1)

A QA engineer runs the E2E test suite to verify the customer-facing product browsing experience works end-to-end across browsers. Tests cover homepage rendering (banners, category icons, product blocks), product listing page (filters, sort, pagination), product detail page (image gallery, tabs, add-to-cart), and search functionality.

**Why this priority**: Product browsing is the core user journey (P1 in spec 002). Verifying it end-to-end across Chromium, Firefox, and WebKit ensures the primary value proposition works everywhere.

**Independent Test**: Can be tested by running `npx playwright test --grep @browse` which opens the browser, navigates the site, interacts with product pages, and asserts UI states.

**Acceptance Scenarios**:

1. **Given** the website is loaded, **When** the homepage renders, **Then** the banner, category icons, and product blocks are visible.
2. **Given** a customer on the homepage, **When** they click a category icon, **Then** they navigate to the product listing page showing filtered products.
3. **Given** a customer on the product listing page, **When** they apply price filter and sort, **Then** products update according to the selected criteria.
4. **Given** a customer on the product listing page, **When** they click a product card, **Then** the product detail page loads with images, info tabs, and action buttons.
5. **Given** a customer on any page, **When** they search for a keyword, **Then** search results page shows matching products.

---

### User Story 3 - E2E Test Suite for Cart & Checkout Flow (Priority: P1)

A QA engineer runs the E2E test suite to verify the shopping cart and checkout flow works correctly. Tests cover adding products to cart, viewing cart contents, modifying quantities, removing items, and submitting an order request.

**Why this priority**: The cart-to-order funnel is the primary conversion path. Broken checkout means zero revenue.

**Independent Test**: Can be tested by running `npx playwright test --grep @checkout` which simulates a complete purchase journey from product selection to order confirmation.

**Acceptance Scenarios**:

1. **Given** a product detail page, **When** the user clicks "Add to Cart", **Then** the cart indicator updates and the product is in the cart.
2. **Given** items in the cart, **When** the user views the cart page, **Then** all added products are listed with correct prices and quantities.
3. **Given** items in the cart, **When** the user changes quantity or removes an item, **Then** the cart and total update accordingly.
4. **Given** a cart with items, **When** the user submits an order, **Then** an order confirmation is displayed with order ID and status "pending".
5. **Given** a pending order, **When** the user navigates to orders page, **Then** the order appears in the list with correct status.

---

### User Story 4 - E2E Test Suite for Authentication Flow (Priority: P1)

A QA engineer runs the authentication E2E tests to verify login, session persistence, token refresh, and logout work correctly across browsers. Tests cover OAuth redirect initiation, callback handling, authenticated state persistence, and session invalidation.

**Why this priority**: Authentication gates all personalized features (orders, profile, wishlist). A broken auth flow blocks all authenticated user journeys.

**Independent Test**: Can be tested by running `npx playwright test --grep @auth` which tests login flow, session state, and logout.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they click login, **Then** they are redirected to the OAuth provider.
2. **Given** a successful OAuth callback, **When** the user returns to the app, **Then** they are authenticated and see their profile info.
3. **Given** an authenticated user, **When** they refresh the page, **Then** their session persists via token refresh.
4. **Given** an authenticated user, **When** they click logout, **Then** their session is invalidated and they return to anonymous state.
5. **Given** an expired access token, **When** any authenticated page loads, **Then** the token is silently refreshed without user intervention.

---

### User Story 5 - E2E Test Suite for Admin Panel (Priority: P2)

A QA engineer runs E2E tests for the admin panel verifying product management (CRUD), order management, user management, and settings configuration.

**Why this priority**: Admin functionality is critical for operations but used by fewer users and changes less frequently than the customer-facing storefront.

**Independent Test**: Can be tested by running `npx playwright test --grep @admin` with an admin account.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they navigate to the admin products page, **Then** they see a list of all products with management controls.
2. **Given** an admin on the products page, **When** they create a new product with valid data, **Then** the product appears in the list and is accessible on the storefront.
3. **Given** an admin on the orders page, **When** they view order details, **Then** they see full order info including payment status and delivery data.
4. **Given** an admin on the settings page, **When** they update shop configuration, **Then** changes are reflected on the storefront.

---

### User Story 6 - E2E Test Suite for Content Pages (Priority: P2)

A QA engineer runs E2E tests for static and content pages: About page, Articles/News listing, Article detail, Contact page, and FAQ.

**Why this priority**: Content pages drive SEO and trust but are simpler in functionality. They primarily need rendering verification.

**Independent Test**: Can be tested by running `npx playwright test --grep @content` which navigates each content page and asserts correct rendering.

**Acceptance Scenarios**:

1. **Given** the articles page, **When** it loads, **Then** article cards are displayed with title, image, and description.
2. **Given** an article card, **When** the user clicks it, **Then** the full article content page renders correctly.
3. **Given** the contact page, **When** it loads, **Then** company info, map embed, and contact form are visible.
4. **Given** the about page, **When** it loads, **Then** company description and gallery are rendered.

---

### User Story 7 - E2E Test Suite for Wishlist & Reviews (Priority: P3)

A QA engineer runs E2E tests for wishlist management and product reviews.

**Why this priority**: These are engagement features that depend on core product browsing and auth being functional first.

**Independent Test**: Can be tested by running `npx playwright test --grep @engagement` with an authenticated user.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they add a product to their wishlist, **Then** it appears on their wishlist page.
2. **Given** a user with a delivered order, **When** they submit a review, **Then** the review appears on the product detail page.
3. **Given** a user viewing their wishlist, **When** they remove an item, **Then** it disappears from the wishlist.

---

### Edge Cases

- What happens when the backend is unreachable? (Tests should handle timeout gracefully)
- How do tests handle concurrent test execution with shared database state?
- What happens when OAuth provider is unavailable? (Mock/stub for CI environment)
- How do tests handle products with zero stock?
- What happens when a user's session expires mid-test?
- How do tests handle slow network conditions? (Configurable timeouts)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Test suite MUST cover all API endpoints defined in `docs/migration/api-spec.md` with request/response validation.
- **FR-002**: Test suite MUST include E2E tests for all P1 user journeys from `specs/002-ecommerce-news-website/spec.md`.
- **FR-003**: E2E tests MUST run across Chromium, Firefox, and WebKit browsers.
- **FR-004**: E2E tests MUST include mobile viewport testing (mobile-chrome equivalent).
- **FR-005**: Test suite MUST support running against both local development and staging environments via environment variables.
- **FR-006**: API tests MUST validate response status codes, JSON schema shape, and authentication enforcement.
- **FR-007**: E2E tests MUST use Page Object Model (POM) pattern for maintainability.
- **FR-008**: Test suite MUST generate HTML reports in `playwright/reports/`.
- **FR-009**: Test suite MUST support test tagging (@auth, @browse, @checkout, @admin, @content, @engagement, @api) for selective execution.
- **FR-010**: Test suite MUST include test fixtures for authenticated user state to avoid repeated login flows.
- **FR-011**: Test suite MUST handle test data setup/teardown without polluting production databases.
- **FR-012**: API tests MUST test error responses (400, 401, 403, 404, 422) in addition to success paths.
- **FR-013**: Test configuration MUST support CI/CD execution (headless mode, retry on flake, parallel workers).
- **FR-014**: Test suite MUST include visual regression checks for critical pages (homepage, product detail, cart).

### Non-Functional Requirements

- **NFR-001**: Full test suite execution MUST complete within 10 minutes on CI.
- **NFR-002**: Individual test MUST have a maximum timeout of 30 seconds.
- **NFR-003**: Test code MUST follow TypeScript strict mode with proper typing.
- **NFR-004**: Test reports MUST include screenshots on failure and trace files for debugging.
- **NFR-005**: Flaky test rate MUST be below 5% (max 2 retries configured).

### Technical Architecture

- **TA-001**: All test files reside in `/playwright` directory structure:
  - `/playwright/tests/api/` — API endpoint tests
  - `/playwright/tests/e2e/` — E2E browser tests
  - `/playwright/fixtures/` — Shared test fixtures and auth state
  - `/playwright/pages/` — Page Object Model classes
  - `/playwright/helpers/` — Utility functions (API helpers, data generators)
  - `/playwright/reports/` — Generated test reports (gitignored)
  - `/playwright/test-results/` — Test artifacts (gitignored)
- **TA-002**: Playwright config file at project root: `playwright.config.ts`
- **TA-003**: Environment variables via `.env.test` or CI environment:
  - `BASE_URL` — Application URL under test
  - `API_URL` — Backend API URL  
  - `TEST_USER_TOKEN` — Pre-authenticated test user token (for API tests)
  - `ADMIN_USER_TOKEN` — Pre-authenticated admin token (for admin tests)
- **TA-004**: API tests use Playwright's `request` context (no browser required).
- **TA-005**: E2E tests use shared `storageState` for authenticated sessions to reduce login overhead.

### Key Entities

- **Test Suite**: A collection of related tests grouped by feature area (auth, catalog, checkout, admin).
- **Page Object**: Encapsulates page-specific locators and actions (e.g., `ProductListPage`, `CartPage`, `AdminDashboard`).
- **Test Fixture**: Reusable setup/teardown logic (authenticated state, test data, API helpers).
- **Test Tag**: Category labels (@auth, @browse, @checkout, etc.) for selective test execution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: API test suite covers 100% of endpoints defined in `docs/migration/api-spec.md` (Auth: 5, Catalog: 6, Checkout: 6, Orders: 4, Profile: 6, Wishlist: 4, Reviews: 3, Notifications: 5, Admin: 15 = ~54 endpoint tests minimum).
- **SC-002**: E2E test suite covers all P1 user journeys with at least 3 scenarios each (Browse: 6, Product Detail: 5, Cart/Checkout: 5, Auth: 5 = ~21 E2E tests minimum).
- **SC-003**: Tests pass consistently across Chromium, Firefox, and WebKit with < 5% flake rate.
- **SC-004**: Full test suite runs in under 10 minutes on CI with parallel execution.
- **SC-005**: Test reports provide clear pass/fail visualization with failure screenshots and traces.
- **SC-006**: New developers can run the full test suite locally with a single command (`npx playwright test`).

## Assumptions

- The Go backend API is already running and accessible at the configured `API_URL` (external service, not managed by this test suite).
- OAuth providers (LinuxDO, GitHub) will be mocked/stubbed in test environment since real OAuth flows cannot be automated without provider cooperation.
- Test database state can be managed via API calls (admin endpoints) for setup/teardown — no direct DB access from tests.
- The frontend application is served at `BASE_URL` and fully functional before tests run.
- Playwright is added as a devDependency to the project (not currently in `package.json`).
- CI/CD pipeline (GitHub Actions or similar) is available for automated test execution.
- Test user accounts with known credentials/tokens are pre-provisioned in the test environment.
