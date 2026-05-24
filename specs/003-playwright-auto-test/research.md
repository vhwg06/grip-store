# Research: Playwright Automated Testing Architecture

**Date**: 2025-07-27 | **Feature**: 003-playwright-auto-test

## Research Questions

### RQ-1: What is the existing Playwright architecture in the project?

**Findings**:

The project has a partially scaffolded Playwright setup:

- **Config**: `playwright.config.ts` at project root with 4 browser projects (chromium, firefox, webkit, mobile-chrome), HTML reporter, webServer integration with `npm run dev`.
- **Test directory**: `playwright/specs/auth/login.spec.ts` — single E2E test file for login flow (3 scenarios).
- **Fixtures**: `playwright/src/fixtures/base-test.ts` — custom test fixture extending base Playwright test with `AuthPage` (page object) and `GoBackendClient` (API helper).
- **Page Objects**: `playwright/src/objects/auth.page.ts` — `AuthPage` class with login, signup, logout methods.
- **Locators**: `playwright/src/locators/auth.locators.ts` — centralized selectors using `data-testid` attributes.
- **API Helpers**: `playwright/src/api-helpers/go-backend.client.ts` — `GoBackendClient` class wrapping Playwright's `APIRequestContext` for test data management (seed, reset, create user).
- **Reports/Results**: `playwright/reports/` and `playwright/test-results/` directories exist (gitignored).

**Current structure** (`playwright/`):
```
playwright/
├── specs/auth/login.spec.ts
├── src/
│   ├── api-helpers/go-backend.client.ts
│   ├── fixtures/base-test.ts
│   ├── locators/auth.locators.ts, index.ts
│   └── objects/auth.page.ts, index.ts
├── reports/
└── test-results/
```

**Gap**: No API-only test project, no test tagging, no auth storage state, no visual regression, no CI config. Structure uses `specs/` + `src/` instead of the `tests/` + `pages/` + `fixtures/` layout described in the feature spec's TA-001.

### RQ-2: What API endpoints need test coverage?

**Findings** (from `docs/migration/api-spec.md`):

| Module | Endpoints | Auth |
|--------|-----------|------|
| Auth | refresh, logout, me | RefreshToken / Bearer |
| Catalog | products (list), products/:id, products/:id/buy-meta, search, categories, settings, announcement | Public / Optional |
| Checkout | orders (create), payment-orders, orders/:id/payment-params, orders/:id/status, orders/:id/cancel, notify (webhook), callback/:id | Bearer / Optional / Gateway |
| Orders | list, detail, status, cancel, refund-request | Bearer |
| Profile | profile, email (PATCH), notifications (PATCH), points, checkin, checkin/status | Bearer |
| Wishlist | list, add, vote, delete | Bearer |
| Reviews | list, create, admin delete | Bearer / Public |
| Notifications | list, unread-count, read, read-all, clear | Bearer |
| Messages | user send, admin list/send/delete/read/clear | Bearer + Admin |
| Admin Products | list, create, update, delete, toggle, reorder | Admin |
| Admin Cards | list, import, delete, pull | Admin |
| Admin Orders | list, update, delete, refund-requests, approve, reject | Admin |
| Admin Users/Settings | users list/update, settings get/update, categories CRUD | Admin |
| Admin Notifications | test, broadcast | Admin |
| Admin Data | import, repair | Admin |

**Total**: ~54 unique endpoints requiring test coverage.

### RQ-3: How should the Playwright project structure be organized?

**Decision**: Adopt a **hybrid** structure that preserves existing conventions (`src/` for shared code) while adding the missing API test project and proper directory organization.

**Rationale**: The existing `playwright/src/` pattern with barrel exports is clean and well-structured. Renaming to `pages/` and `fixtures/` at root level would break the existing test. Instead, evolve the current structure:

```
playwright/
├── specs/                    # Test specifications (testDir)
│   ├── api/                  # API-only tests (no browser)
│   │   ├── auth.api.spec.ts
│   │   ├── catalog.api.spec.ts
│   │   ├── checkout.api.spec.ts
│   │   ├── orders.api.spec.ts
│   │   ├── profile.api.spec.ts
│   │   ├── wishlist.api.spec.ts
│   │   ├── reviews.api.spec.ts
│   │   ├── notifications.api.spec.ts
│   │   └── admin.api.spec.ts
│   ├── auth/                 # Auth E2E (existing)
│   │   └── login.spec.ts
│   ├── browse/               # Product browsing E2E
│   │   ├── homepage.spec.ts
│   │   ├── product-list.spec.ts
│   │   ├── product-detail.spec.ts
│   │   └── search.spec.ts
│   ├── checkout/             # Cart & checkout E2E
│   │   ├── cart.spec.ts
│   │   └── order-flow.spec.ts
│   ├── admin/                # Admin panel E2E
│   │   ├── products.spec.ts
│   │   ├── orders.spec.ts
│   │   └── settings.spec.ts
│   ├── content/              # Content pages E2E
│   │   ├── articles.spec.ts
│   │   ├── about.spec.ts
│   │   └── contact.spec.ts
│   └── engagement/           # Wishlist & reviews E2E
│       ├── wishlist.spec.ts
│       └── reviews.spec.ts
├── src/                      # Shared test infrastructure
│   ├── api-helpers/          # API client helpers
│   │   ├── go-backend.client.ts  (existing)
│   │   ├── auth.api.ts       # Auth API helper
│   │   ├── catalog.api.ts    # Catalog API helper
│   │   ├── checkout.api.ts   # Checkout API helper
│   │   ├── orders.api.ts     # Orders API helper
│   │   └── admin.api.ts      # Admin API helper
│   ├── fixtures/             # Test fixtures (existing)
│   │   ├── base-test.ts      (existing — extended)
│   │   └── auth.setup.ts     # Global setup for auth storage state
│   ├── locators/             # Centralized locators (existing)
│   │   ├── auth.locators.ts  (existing)
│   │   ├── catalog.locators.ts
│   │   ├── cart.locators.ts
│   │   ├── admin.locators.ts
│   │   └── index.ts
│   ├── objects/              # Page objects (existing)
│   │   ├── auth.page.ts      (existing)
│   │   ├── homepage.page.ts
│   │   ├── product-list.page.ts
│   │   ├── product-detail.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   ├── admin.page.ts
│   │   └── index.ts
│   └── helpers/              # Utilities
│       ├── test-data.ts      # Test data generators
│       └── wait-helpers.ts   # Custom wait utilities
├── reports/                  # HTML reports (gitignored)
└── test-results/             # Artifacts (gitignored)
```

### RQ-4: How should the Playwright config be structured for API vs E2E separation?

**Decision**: Add a dedicated `api` project to `playwright.config.ts` that uses only `request` context (no browser), enabling `npx playwright test --project=api` for fast API-only runs.

**Config changes needed**:
1. Add `api` project with no `use.browserName` and custom `baseURL` pointing to `GO_BACKEND_URL`.
2. Add `setup` project for auth state preparation.
3. Add test tagging via filename convention (`*.api.spec.ts`) and Playwright's `grep` option.
4. Configure `storageState` for authenticated E2E tests.
5. Add `.env.test` support alongside existing `.env.local`.

### RQ-5: What authentication strategy works for testing?

**Decision**: Two-tier approach:
1. **API tests**: Use pre-configured tokens via environment variables (`TEST_USER_TOKEN`, `ADMIN_USER_TOKEN`). The `GoBackendClient` already supports direct API calls.
2. **E2E tests**: Use Playwright's `storageState` pattern — a global setup script logs in once and saves browser cookies/localStorage to a file. Dependent E2E projects reference this state.

**Reason**: OAuth redirect to external providers (LinuxDO/GitHub) cannot be automated. The existing login spec tests the `/login` page UI, which uses email/password — this can be the auth setup mechanism for E2E state.

### RQ-6: What are the key architectural decisions?

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Directory structure | Keep `specs/` + `src/` pattern | Existing convention, already works |
| API test separation | Separate `api` Playwright project | No browser overhead, faster CI |
| Page object pattern | One POM class per logical page | FR-007 requirement, already established |
| Locator strategy | `data-testid` attributes | Already in use, stable across refactors |
| Test tagging | Directory-based + `test.describe` annotations | Maps to `--grep @tag` execution |
| Auth state | `storageState` file from setup project | Standard Playwright pattern |
| Test data | API-based setup/teardown via `GoBackendClient` | No direct DB access (spec constraint) |
| CI execution | Headless, 2 retries, parallel workers | NFR-001, NFR-005 |
| Visual regression | `toHaveScreenshot()` on critical pages | FR-014 |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OAuth cannot be automated | Auth E2E tests limited | Use email/password login for test env; mock OAuth for full flow tests |
| Go backend test endpoints (`/api/test/*`) may not exist | Cannot seed/reset test data | Document required test endpoints as prerequisite; fallback to admin API |
| Flaky tests from shared database state | CI instability | Test isolation via unique user per test run; parallel workers with separate data |
| 10-minute CI budget with 54+ API + 30+ E2E tests | May exceed budget | Parallel execution; API tests run without browser; shard across CI nodes |
| `data-testid` attributes missing on components | Locators fail | Audit existing components; add `data-testid` as prerequisite task |

## Dependencies & Prerequisites

1. **Go backend running** at `GO_BACKEND_URL` with all API endpoints from spec.
2. **Test user accounts** pre-provisioned (regular user + admin).
3. **`data-testid` attributes** on all interactive UI elements.
4. **Environment variables** configured in `.env.test` or CI secrets.
5. **Playwright installed** as devDependency (already in `package.json`).
