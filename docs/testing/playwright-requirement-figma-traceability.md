# Playwright Requirement-Figma Traceability

Last updated: 2026-05-25

## Scope

- Business source of truth: `test/modules/**/behavior.feature` Gherkin.
- Executable binding source: the colocated `test/modules/**/behavior.steps.ts` files.
- Design trace source: Figma file `GRIP-Website Design` (page `Design`, id `1:3`).
- Scenario navigation source: each module's `manifest.yaml` and stable scenario ID.

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
| US1: API contract coverage (`FR-001`, `FR-006`, `FR-012`) | `test/modules/**/behavior.feature` scenarios tagged `@api` and their colocated steps | N/A (API-only) | Contract truth is API response + auth/error behavior. |
| US2: Product browsing and search (`FR-002`) | `test/modules/browse/behavior.feature`, `test/modules/product-flow/behavior.feature` | `27:1404`, `58:861`, `62:2672` | Section/CTA behavior is bound by the matching module steps. |
| US3: Cart and checkout (`FR-002`) | `test/modules/checkout/behavior.feature` and `behavior.steps.ts` | `114:3466`, `117:4153`, `62:2672` | Detail -> cart -> checkout continuity is one Cucumber flow. |
| US4: Authentication flow (`FR-002`) | `test/modules/auth/behavior.feature` and `behavior.steps.ts` | `27:1404` (entry/navigation context) | Auth behavior is business contract; no dedicated auth screen node identified in current Design page. |
| US5: Admin panel (`FR-002`) | `test/modules/admin/**/behavior.feature` and colocated steps | `58:861`, `62:2672` (table/content patterns) | No explicit admin board in provided design page; using shared management/list patterns. |
| US6: Content pages (`FR-002`) | `test/modules/content/behavior.feature` and `behavior.steps.ts` | `87:2148`, `47:1048` | Articles/contact behavior is bound from the module feature. |
| US7: Engagement features (`FR-002`) | `test/modules/engagement/behavior.feature` and `behavior.steps.ts` | `62:2672`, `58:861` | Review/wishlist behavior is tied to product detail/list contexts. |
| Visual regression (`FR-014`) | Existing screenshot assertions in critical flows | `27:1404`, `62:2672`, `114:3466`, `117:4153` | Baseline behavior validated by Playwright visual checks. |

## Current Validation Status

- Structural validation: 20 modules and 182 scenario IDs pass `npm run validate`.
- Cucumber dry-run: the full accepted suite resolves 182 scenarios and 701 steps; the selected `@CAT-MODEL-003` route resolves one scenario.
- Runtime API/browser execution has not been run in this migration pass, so runtime status remains unverified.

## Rules for New Tests

For every new behavior scenario:

1. Add exactly one stable ID tag to the Scenario and declare it in the module manifest.
2. Keep the Gherkin scenario in the capability's `behavior.feature`.
3. Bind every step from that module's `behavior.steps.ts` to a real API/browser action.
4. Select one scenario with its tag or run the complete accepted feature suite with `test:acceptance`.

## Business Gaps to Refine

- Admin dedicated design mapping is not explicit in provided `Design (1:3)` page.
- Auth-specific dedicated design node is not explicit in provided `Design (1:3)` page.
- If these are expected, add concrete node ids to remove ambiguity in trace rules.
- FE still contains non-critical fallback/hardcoded content in some non-product modules (e.g., article/category/wishlist placeholders). Continue moving display logic and filtering authority to backend responses where available.
