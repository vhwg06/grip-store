# Playwright Requirement-Figma Traceability

Last updated: 2026-05-25

## Scope

- Business source of truth: Playwright specs.
- Design trace source: Figma file `GRIP-Website Design` (page `Design`, id `1:3`).
- Spec source: `specs/003-playwright-auto-test/spec.md`.

## Figma Evidence (verified via figma-mcp-go)

The following nodes were verified and exported with `save_screenshots`:

| Figma Node ID | Node Name | Evidence File |
| --- | --- | --- |
| `27:1404` | `Homepage` | `docs/testing/figma-nodes/27-1404-home.png` |
| `58:861` | `All-Products` | `docs/testing/figma-nodes/58-861-product-list.png` |
| `62:2672` | `Product Details` | `docs/testing/figma-nodes/62-2672-product-detail.png` |
| `114:3466` | `View-full-cart` | `docs/testing/figma-nodes/114-3466-cart.png` |
| `117:4153` | `Checkout-page` | `docs/testing/figma-nodes/117-4153-checkout.png` |
| `87:2148` | `News-Blog` | `docs/testing/figma-nodes/87-2148-articles.png` |
| `47:1048` | `Contact` | `docs/testing/figma-nodes/47-1048-contact.png` |

## Requirement Trace Matrix

| Requirement Source | Playwright Coverage | Figma Node Trace | Notes |
| --- | --- | --- | --- |
| US1: API contract coverage (`FR-001`, `FR-006`, `FR-012`) | `playwright/specs/api/*.spec.ts` | N/A (API-only) | Contract truth is API response + auth/error behavior. |
| US2: Product browsing and search (`FR-002`) | `playwright/specs/browse/homepage.spec.ts`, `product-list.spec.ts`, `product-detail.spec.ts`, `search.spec.ts`, `browse/figma-contract.spec.ts` | `27:1404`, `58:861`, `62:2672` | Section/CTA assertions mapped to home/list/detail screens. |
| US3: Cart and checkout (`FR-002`) | `playwright/specs/checkout/cart.spec.ts`, `order-flow.spec.ts`, `checkout/figma-contract.spec.ts` | `114:3466`, `117:4153`, `62:2672` | Flow trace includes detail -> cart -> checkout CTA continuity. |
| US4: Authentication flow (`FR-002`) | `playwright/specs/auth/login.spec.ts`, `signup.spec.ts`, `auth-extended.spec.ts` | `27:1404` (entry/navigation context) | Auth behavior is business contract; no dedicated auth screen node identified in current Design page. |
| US5: Admin panel (`FR-002`) | `playwright/specs/admin/products.spec.ts`, `orders.spec.ts`, `settings.spec.ts`, `admin/figma-contract.spec.ts` | `58:861`, `62:2672` (table/content patterns) | No explicit admin board in provided design page; using shared management/list patterns. |
| US6: Content pages (`FR-002`) | `playwright/specs/content/articles.spec.ts`, `about.spec.ts`, `contact.spec.ts` | `87:2148`, `47:1048` | Articles/contact directly mapped to named nodes. |
| US7: Engagement features (`FR-002`) | `playwright/specs/engagement/wishlist.spec.ts`, `reviews.spec.ts`, `checkin.spec.ts` | `62:2672`, `58:861` | Review/wishlist tied to product detail/list contexts. |
| Visual regression (`FR-014`) | Existing screenshot assertions in critical flows | `27:1404`, `62:2672`, `114:3466`, `117:4153` | Baseline behavior validated by Playwright visual checks. |

## Current Validation Status

- Latest run (`2026-05-25`): `239 passed`, `0 skipped` at runtime (`npx playwright test --reporter=line`, ~1.4m).
- `api + chromium + mobile-chrome`: green.
- Full matrix remains environment-limited:
  - Firefox and WebKit browser binaries are missing.
  - Browser install is blocked in this sandbox by DNS/network restriction (`ENOTFOUND cdn.playwright.dev`) and cache permission limits outside workspace.
- Source contains conditional `test.skip(...)` guards for missing token/data preconditions in API specs, but they were not triggered in the validated environment because required auth/token setup was present.
- Final stabilization in this run:
  - Removed loading-state `product-card` test-id collisions that previously produced invalid detail navigation (`/products/loading-*`).
  - Hardened product-list page object card discovery/wait path to sample terminal UI state before extraction.

## Rules for New Tests

For every new Playwright spec:

1. Add requirement reference (US/FR from `specs/003-playwright-auto-test/spec.md`).
2. Add Figma node id reference (or explicitly mark `N/A` for API tests).
3. Ensure runtime has no skipped tests in supported environment.
4. Prefer fixing product code/back-end behavior before altering assertions.

## Business Gaps to Refine

- Admin dedicated design mapping is not explicit in provided `Design (1:3)` page.
- Auth-specific dedicated design node is not explicit in provided `Design (1:3)` page.
- If these are expected, add concrete node ids to remove ambiguity in trace rules.
- FE still contains non-critical fallback/hardcoded content in some non-product modules (e.g., article/category/wishlist placeholders). Continue moving display logic and filtering authority to backend responses where available.
