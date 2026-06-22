# Playwright Admin SoT Closeout Tasks

## Active Workstream - Remove Cards And Points From The System

- Scope lock:
  - remove `cards` as entity, route, API surface, UI flow, and test contract
  - remove `points` as account field, checkout/refund/admin/profile behavior, and test contract
  - purge historical card/points business data rather than keeping compatibility reads
  - product editorial/media must remain reachable only through `/admin/products` -> `Edit` / `Quick edit`
  - all prior evidence mentioning `/admin/cards`, card-key delivery, points balance, points refund, or points mutation becomes stale until rerun

### Execution Checklist

- `[x]` done
- `[~]` in progress
- `[ ]` not started
- `[-]` removed or not applicable

#### A. Planning and tracker setup

- [~] `RM-DOC-01` Update admin/content/product/customer specs to remove cards/points ownership and lock the product-list-to-edit flow.
- [ ] `RM-DOC-02` Update coverage/index docs to remove cards and points from active admin scope.
- [ ] `RM-DOC-03` Add backend removal references and stale-evidence notes to this SoT tracker.

#### B. Frontend/admin contract removal

- [~] `RM-FE-01` Remove `/admin/cards` route, sidebar entry, adapters, hooks, and components.
- [~] `RM-FE-02` Remove product-editor cards CTA and any cards-specific context handoff.
- [~] `RM-FE-03` Remove points balance, check-in, and use-points behavior from storefront/profile flows.
- [~] `RM-FE-04` Remove admin user/customer points mutation UI and refund copy that mentions cards/points restore.
- [~] `RM-FE-05` Keep product editorial/media entry rooted only in `/admin/products` -> product edit.

#### C. Playwright/API contract updates

- [~] `RM-TEST-01` Remove cards-specific admin and API specs.
- [~] `RM-TEST-02` Remove points/check-in/profile-points specs and helpers.
- [ ] `RM-TEST-03` Rewrite affected admin/content/product/user/refund coverage to the no-cards/no-points contract.
- [ ] `RM-TEST-04` Add or tighten coverage for `/admin/products` row edit and quick-edit entry into product media/editorial.

#### D. Verification and closeout

- [ ] `RM-VER-01` Run focused frontend/admin verification for the no-cards/no-points contract.
- [ ] `RM-VER-02` Run focused API verification for the no-cards/no-points contract.
- [ ] `RM-VER-03` Confirm removed routes/fields are absent and no touched suites carry stale `test.fail`, `test.fixme`, or unexplained skips.
- [ ] `RM-VER-04` Mark remaining tasks `[x]` only from fresh evidence after reruns.

## Active Workstream - Admin Settings Simplification

- Scope lock:
  - remove unused settings/menus/features instead of hiding them
  - move About ownership into article flow
  - move banner page enablement into banner management
  - remove `/admin/about`, `/admin/media`, `/admin/product-content`
  - treat earlier evidence for removed routes/settings as stale until rerun

### Execution Checklist

- `[x]` done
- `[~]` in progress
- `[ ]` not started
- `[-]` removed or not applicable

#### A. Planning and tracker setup

- [x] `DOC-01` Update store-setting specs to match the simplified scope.
- [x] `DOC-02` Update content specs to reflect About-in-article and banner-owned enablement.
- [x] `DOC-03` Update coverage/inventory docs to remove `/admin/about`, `/admin/media`, `/admin/product-content`.
- [x] `DOC-04` Add this simplification workstream into `playwright/admin-sot-closeout-tasks.md`.
- [x] `DOC-05` Mark old evidence tied to removed settings/routes as stale in the SoT tracker.
- [x] `DOC-06` Add the workflow rule to `AGENTS.md`.

#### B. Store settings simplification

- [x] `SET-01` Remove Overview version/update UI.
- [x] `SET-02` Remove theme color UI and related state/save flow.
- [x] `SET-03` Remove the brand warning notice block.
- [x] `SET-04` Remove Discovery & visibility section and dead logic behind it.
- [x] `SET-05` Remove Banner & About Presence section and dead logic behind it.
- [x] `SET-06` Remove Registry & legacy controls section and dead logic behind it.
- [x] `SET-07` Rebalance settings layout after section removal.
- [x] `SET-08` Remove dead props from `admin/settings/page`.
- [x] `SET-09` Remove dead dashboard mappings and obsolete adapter exports.

#### C. Remove redundant routes and menus

- [x] `NAV-01` Remove `/admin/about` page and component.
- [x] `NAV-02` Remove `/admin/media` page and component.
- [x] `NAV-03` Remove `/admin/product-content` page and component.
- [x] `NAV-04` Remove sidebar links to the deleted routes.
- [x] `NAV-05` Remove `CMS` and `COMMERCE` section grouping.
- [x] `NAV-06` Flatten desktop sidebar into one list.
- [x] `NAV-07` Flatten mobile nav and remove deleted links.
- [x] `NAV-08` Remove stale nav test IDs/usages.

#### D. About ownership migration

- [x] `ABOUT-01` Add "use this article as About" control in article form.
- [x] `ABOUT-02` Load current About ownership into article edit state.
- [x] `ABOUT-03` Persist About assignment through article flow only.
- [x] `ABOUT-04` Support reassigning About from one article to another.
- [x] `ABOUT-05` Support clearing About assignment.
- [x] `ABOUT-06` Clear About assignment when the active About article is deleted.
- [x] `ABOUT-07` Move public About page data source to article ownership.
- [-] `ABOUT-08` Remove legacy About page sync/fetch code if no longer used.
  - Kept the sync path because the live public backend still serves `/v1/public/content/pages/about`; article ownership now drives that projection.

#### E. Banner ownership migration

- [x] `BAN-01` Add page-level banner enable/disable controls inside banner management.
- [x] `BAN-02` Add admin adapter support for page-level banner enablement.
- [x] `BAN-03` Add public site-config support for page-level banner enablement.
- [x] `BAN-04` Update homepage consumer to use homepage banner enablement.
- [x] `BAN-05` Update products page consumer to use products banner enablement.
- [~] `BAN-06` Remove old global banner presence mapping if fully replaced.
  - The live backend still exposes a global `bannerPresence` contract publicly, so the new page-aware client path keeps that global contract as a compatibility fallback.

#### F. Product/media ownership cleanup

- [x] `PROD-01` Confirm product editor already covers required media use cases.
- [x] `PROD-02` Remove standalone product-content route coverage and ownership references.
- [x] `PROD-03` Keep contextual media upload/select components as shared internals.
- [x] `PROD-04` Remove standalone media-management route coverage and ownership references.

#### G. Playwright and API updates

- [x] `TEST-01` Prune store-settings admin spec to match surviving settings sections.
- [x] `TEST-02` Remove media-library admin spec.
- [x] `TEST-03` Retire or merge product-content admin spec.
- [x] `TEST-04` Update content admin spec to remove deleted routes and cover new ownership model.
- [x] `TEST-05` Add article-owned About admin coverage.
- [x] `TEST-06` Add banner per-page toggle admin coverage.
- [x] `TEST-07` Update affected API settings/content specs to match new contracts.
- [x] `TEST-08` Update any sidebar/menu assertions tied to removed nav items.

#### H. Verification and closeout

- [x] `VER-01` Run focused settings admin tests with `--workers=1`.
- [x] `VER-02` Run focused articles admin tests with `--workers=1`.
- [x] `VER-03` Run focused banners admin tests with `--workers=1`.
- [x] `VER-04` Run affected content/product/admin tests with `--workers=1`.
- [x] `VER-05` Run affected API specs.
- [x] `VER-06` Update `playwright/admin-sot-closeout-tasks.md` from fresh evidence only.
- [x] `VER-07` Confirm touched suites have no stale `test.fail`, `test.fixme`, or unexplained skips.
- [x] `VER-08` Mark final tasks `[x]` only after tests are green.

## Status Legend

- `[x]` Verified from the current repository state.
- `[~]` Implemented or claimed complete, but requires a clean executable verification.
- `[ ]` Not complete.
- A task is only changed to `[x]` when its acceptance command passes without stale `test.fail`, `test.fixme`, or unexplained `test.skip` markers.

## Scope

- In: admin/API Playwright contract quality, missing exception coverage, deterministic execution, FE/BE gap verification, and tracker normalization.
- Out for this planning pass: modifying Playwright tests, FE code, BE code, fixtures, or production data.
- Source order: `use-cases.md` and `scenarios.md` define intent; Playwright encodes behavior; implementation is changed only after a failing contract is confirmed.

## Gate 0 - Baseline And Plan Lock

- [x] **PLAN-01** Inventory current admin/API markers. Current result: two `test.fail` markers in `admin/payment.spec.ts`, one conditional admin `test.skip` in `admin/payment-collection.spec.ts`, and two admin `waitForTimeout` calls.
- [x] **PLAN-02** Confirm the gap matrix is stale relative to current tests and must not be used as completion evidence without reruns.
- [x] **PLAN-03** Confirm current unrelated worktree changes are limited to auth state JSON and Figma snapshots; preserve them during execution.
- [~] **PLAN-04** Record a baseline Playwright result for targeted admin and API specs before any further test or implementation edit.
  - Current evidence: targeted admin payment/refund reports captured at `playwright/.artifacts/payment-refund-baseline.json` and `playwright/.artifacts/payment-refund-current.json`; targeted API payment/refund verification is captured at `playwright/.artifacts/payment-refund-api-current.json`.
  - Remaining gap: no pre-edit API baseline was captured before this turn, so the historical baseline portion is only partially reconstructable.
  - Acceptance: machine-readable report records pass, fail, expected-fail, skip, and flaky counts.
  - Stale for simplification workstream: old route/settings evidence that mentioned `/admin/about`, `/admin/media`, `/admin/product-content`, theme color, store-level About assignment, or store-level banner presence must not be treated as current after this refactor.

## Gate 1 - T1 Metadata Completion

- [x] **T1-01** Verify all 12 target admin spec files have one `GOAL`, `PRIORITY`, and `SCENARIO` entry per `test()` block.
- [x] **T1-02** Verify all 14 target API spec files have one `GOAL`, `PRIORITY`, and `SCENARIO` entry per `test()` block.
- [x] **T1-03** Verify target `test.describe` titles include their module priority tags.
- [ ] **T1-04** Audit metadata values against `use-cases.md` and `scenarios.md`, not only metadata counts.
  - Acceptance: every UC has the correct goal, priority, related domains, and scenario branch.
- [ ] **T1-05** Correct metadata drift found by T1-04 without reading FE or BE code during the test-editing pass.
- [ ] **T1-VER** Run the metadata audit again and save counts in the closeout evidence.

## Gate 2 - T2 Scenario Coverage Completion

- [x] **T2-01** Confirm both store-settings alternates exist: reorder active blocks and grouped discovery/visibility save.
- [x] **T2-02** Confirm both order alternates exist: filtered queue narrowing and multi-order customer pattern.
- [x] **T2-03** Confirm the customer no-refund/no-review commerce-indicator alternate exists.
- [x] **T2-04** Confirm the refund decision-note-before-approve alternate exists.
- [x] **T2-05** Confirm review approve, feature, and partially-valid bulk-selection alternates exist.
- [x] **T2-06** Confirm notification readiness-before-send alternate exists.
- [x] **T2-07** Confirm iterative user-search alternate exists.
- [ ] **T2-08** Validate each alternate against its exact scenario branch and remove fixture assumptions not required by the spec.
- [ ] **T2-09** List all T2 tests and verify none are silently skipped, expected-failed, or absent from the selected project.
- [ ] **T2-VER** Run all T2 alternate tests cleanly with `--workers=1`.

## Gate 3 - Contract Gap Encoding

The test may remain a normal test when implementation is green. Add `test.fail` only when the clean run proves the contract is currently red; never keep a stale marker.

- [x] **ENC-ORD-01** Confirm API coverage exists for forbidden `PENDING -> DELIVERED` and order refund-status relevance.
- [x] **ENC-CUS-01** Confirm API coverage exists for customer search narrowing.
- [x] **ENC-USER-01** Confirm API coverage exists for account search narrowing.
- [x] **ENC-SET-01** Confirm API coverage exists for `bannerPresence` and `aboutPresence`.
- [x] **ENC-REF-01** Confirm API coverage exists for refund detail/evidence.
- [x] **ENC-NOTY-01** Confirm API coverage exists for readiness, outbound artifacts, and send history.
- [x] **ENC-PCOL-01** Confirm API coverage exists for collection `sources[]`.
- [x] **ENC-APRO-01** Confirm API coverage exists for security posture and sessions.
- [x] **ENC-CONT-01** Confirm API coverage exists for inactive FAQ exclusion and commercial-state preservation.
- [ ] **ENC-01** Run each encoded API contract individually and classify it as green, genuine red, or data-blocked.
- [ ] **ENC-02** Add an expected-failure marker only to genuine red contracts, with owner and concrete blocker in the reason.
- [ ] **ENC-03** Reject any gap represented only in the matrix; every genuine red row must map to an executable assertion.

## Gate 4 - Exception And Rejection Coverage

- [x] **EXC-PROD-01** Verify UC-PROD-03 proves `is_active` persists through the backend, not only local UI state.
  - Evidence: after the final backend deploy on 2026-06-22, direct live probes to `PATCH /v1/admin/products/:id/status` now persist both `{"isActive":false}` and `{"isActive":true}` through `/v1/admin/products/:id/form` readback. Focused reruns for `playwright/specs/api/admin-product.spec.ts --grep "UC-PROD-03"` and `playwright/specs/admin/product.spec.ts --grep "UC-PROD-03 submits commercial state changes from the list quick action"` both passed cleanly.
- [x] **EXC-PROD-02** Add/verify UC-PROD-05 graceful behavior when product-linked cards cannot be loaded.
  - Evidence: `playwright/specs/admin/product-content.spec.ts` now opens a real `/admin/cards` surface from product editor context, preserves `productId`/name/SKU in the handoff, and proves an intercepted `/v1/admin/cards` `500` renders an explicit backend-error state instead of a fabricated fallback. Focused Chromium rerun on 2026-06-21 passed cleanly (`4 passed`, including setup).
- [x] **EXC-REV-01** Add UC-REV-02 rejection coverage proving a hidden review cannot be hidden again.
  - Evidence: `playwright/specs/admin/reviews-moderation.spec.ts` now includes `UC-REV-02 exception: a hidden review cannot be hidden again`, and the focused Chromium rerun on 2026-06-22 passed cleanly (`1 passed`, `0 unexpected`), proving the `Hide` action is disabled once a review is already in `HIDDEN` state.
- [x] **EXC-CONT-01** Verify UC-CONT-04 public non-leak and UC-CONT-06 commercial-state preservation are enforced by canonical API tests.
  - Evidence: focused API rerun on 2026-06-22 for `playwright/specs/api/admin-content.spec.ts` passed cleanly with the API-only config (`6 passed`, `0 skipped`, `0 unexpected`), proving inactive FAQs stay off the public homepage FAQ block and content-only product editorial updates preserve the product's commercial state.
- [x] **EXC-NOTY-01** Add FE error-state coverage proving a readiness 404/error cannot produce fabricated defaults.
  - Evidence: `playwright/specs/admin/noty.spec.ts` now includes `EXC-NOTY-01`, which intercepts `/v1/admin/notifications` with a `404` and proves `/admin/notifications` renders the explicit page error boundary instead of fabricating default readiness state; verified in the focused Chromium rerun on 2026-06-22 (`7 passed`, `0 unexpected`).
- [x] **EXC-PAY-01** Verify UC-PAY-03 proves the refund decision surface contains no payment execution controls.
  - Evidence: `playwright/specs/admin/payment.spec.ts` now scopes UC-PAY-03 to `[data-testid="refunds-decision-panel"]`; the clean Chromium run in `playwright/.artifacts/payment-refund-current.json` reports zero unexpected results.
- [x] **EXC-PCOL-01** Verify UC-PCOL-03 rejects invalid save and preserves the prior valid configuration after reload.
  - Evidence: focused API rerun on 2026-06-22 for `playwright/specs/api/admin-payment-collection.spec.ts` passed cleanly (`4 passed`) and focused Chromium rerun for `playwright/specs/admin/payment-collection.spec.ts` also passed cleanly (`4 passed`), proving invalid collection input is rejected without persisting over the last valid backend state after reload. Both payment-collection suites now run `serial` because they mutate a shared backend singleton.
- [x] **EXC-PCOL-02** Replace the conditional UC-PCOL-04 skip with deterministic valid/invalid readiness setup or explicit data-blocked ownership.
  - Evidence: `playwright/specs/admin/payment-collection.spec.ts` no longer carries the old conditional skip path; the focused 2026-06-22 Chromium rerun passed cleanly (`4 passed`) while asserting the live backend `ready`/`warnings` contract directly.
- [ ] **EXC-VER** Run each exception test independently and record the rejected action, expected status/UI state, and observed result.

## Gate 5 - Assertion Quality

- [x] **QUAL-USER-01** Refactor UC-USER-01 away from account/system copy assertions; assert exact search narrowing and account-row semantics.
  - Evidence: `playwright/specs/admin/user.spec.ts` now asserts the `/admin/users` search contract via stable test IDs and exact row narrowing; focused Chromium rerun on 2026-06-21 finished green for the user/customer admin slice (`17 passed`, `1 explicit data-blocked skip`, `0 unexpected`).
- [x] **QUAL-USER-02** Refactor UC-USER-05 away from explanatory copy; assert commerce actions are absent and the customer handoff is separate.
  - Evidence: `playwright/specs/admin/user.spec.ts` now proves account-control separation by asserting the account panel exposes only account controls plus the explicit customer handoff while customer-history/refund/review actions are absent; verified in the same 2026-06-21 focused Chromium rerun.
- [x] **QUAL-CUS-01** Strengthen UC-CUS-04 by navigating through the linked-account handoff and verifying the destination identity.
  - Evidence: `playwright/specs/admin/customer.spec.ts` now clicks the linked `Account` action, verifies navigation into `/admin/users`, confirms the user search is prefilled with the linked identity, and asserts the account-control panel is shown; verified in the 2026-06-21 focused Chromium rerun.
- [x] **QUAL-NOTY-01** Assert backend readiness/error state directly instead of success caused by local fallback data.
  - Evidence: `src/adapters/api/admin.api.ts` no longer swallows notification-settings save/load failures into fake success/default payloads, `src/components/admin/notifications-content.tsx` no longer persists scaffolded history across reloads, and the focused Chromium rerun on 2026-06-22 proved server-backed message reload plus explicit readiness failure handling.
- [x] **QUAL-PAY-01** Scope UC-PAY-03 assertions to the refund decision surface so unrelated page buttons cannot create false failures.
- [x] **QUAL-PCOL-01** Assert source identity/state from the backend response rather than only absence of known hardcoded labels.
  - Evidence: `playwright/specs/admin/payment-collection.spec.ts` now parses the live `/v1/admin/collect` response in `UC-PCOL-01`, asserts each backend `sources[].label` is rendered, and verifies `Ready`/`Unavailable` badge counts match the backend source state. Focused Chromium rerun on 2026-06-22 passed cleanly (`4 passed`, `0 unexpected`).
- [ ] **QUAL-SEL-01** Inventory brittle exact-copy and broad text selectors in the 12 target admin specs.
- [ ] **QUAL-SEL-02** Replace implementation-copy selectors with roles, stable test IDs, state, navigation, network contracts, or persisted data where the copy is not itself contractual.

## Gate 6 - Determinism And Data Independence

- [x] **DET-REF-01** Replace the refund search `waitForTimeout(300)` with a response/event/state wait tied to the search result.
  - Evidence: `searchRefund()` in `playwright/specs/admin/refund.spec.ts` now waits for a matching `GET /v1/admin/refunds` response instead of a fixed timeout.
- [ ] **DET-ADM-01** Review the `admin-specs.spec.ts` timeout and replace it if the file remains part of the authoritative suite.
- [ ] **DET-DATA-01** Inventory hardcoded IDs such as `test-order-0001` and classify each as stable contract fixture or replaceable lookup.
- [ ] **DET-DATA-02** Replace non-contract fixture IDs with API-created data or semantic lookup, including cleanup where mutation tests create durable records.
- [ ] **DET-SKIP-01** Audit all admin/API skips and classify each as environment prerequisite, data-blocked scenario, obsolete test, or hidden implementation gap.
- [ ] **DET-SKIP-02** Eliminate silent skips from the authoritative admin suite; allowed skips must include explicit ownership and unblock criteria.

## Gate 7 - Execution Gap Resolution

### Payment/Refund Boundary First

- [x] **RUN-PAY-01** Run `admin/payment.spec.ts` and prove whether UC-PAY-02 and UC-PAY-03 are now green.
  - Current evidence: `playwright/.artifacts/payment-refund-current.json` shows zero unexpected results across the targeted payment/refund cluster, and a standalone Chromium rerun of `UC-PAY-03` completed green after the stale marker was removed.
- [x] **RUN-PAY-02** Remove the two payment `test.fail` markers only after their assertions pass without expected-failure semantics.
  - Current evidence: both stale payment markers are removed; `rg -n "test\\.(fail|fixme)" playwright/specs/admin/payment.spec.ts playwright/specs/admin/refund.spec.ts` now returns no matches.
- [x] **RUN-PAY-03** Run `admin/refund.spec.ts` after payment-boundary verification and confirm no regression.
  - Current evidence: backend go-live removed the checkout `500` blocker; the targeted Chromium payment/refund rerun in `playwright/.artifacts/payment-refund-current.json` is clean (`expected=14`, `unexpected=0`, `skipped=0`, `flaky=0`).

### Backend Contracts

- [x] **RUN-BE-ORD** Verify order transition and refund-status contracts.
  - Evidence: focused API rerun on 2026-06-21 for `playwright/specs/api/admin-order.spec.ts` and `playwright/specs/api/orders.api.spec.ts` passed cleanly (`13 passed`, `0 skipped`, `0 unexpected`, `0 flaky`), covering allowed/forbidden order transitions, purchase-history resolution, refund-status relevance, and incomplete-context order detail.
- [x] **RUN-BE-CUSUSER** Verify customer/account filtering, commerce summary, points, block, and handoff identifiers.
  - Evidence: focused API rerun on 2026-06-21 for `playwright/specs/api/admin-user.spec.ts` and `playwright/specs/api/admin-customer.spec.ts` passed cleanly (`12 passed`, `0 skipped`, `0 unexpected`, `0 flaky`), covering customer/account filtering, summary fields, points/block mutations, and linked-customer handoff metadata.
- [x] **RUN-BE-REF** Verify refund detail and payment evidence.
  - Evidence: focused API rerun on 2026-06-22 for `playwright/specs/api/admin-refund.spec.ts` passed cleanly with the API-only config (`8 passed`, `0 skipped`, `0 unexpected`), proving pending queue reads, refund-detail evidence, approve/reject decision flows, historical approved refund review, and duplicate-approve rejection.
- [x] **RUN-BE-NOTY** Verify readiness, message list, durable outbound artifact, and history outcome fields.
  - Evidence: focused API rerun on 2026-06-22 for `playwright/specs/api/admin-noty.spec.ts` passed cleanly with an API-only config (`scratch/playwright.api-no-webserver.config.ts`) to avoid unrelated frontend web-server bootstrapping (`4 passed`, `0 skipped`, `0 unexpected`), proving `/v1/admin/notifications`, `/v1/admin/messages`, broadcast send acceptance, and history outcome fields.
- [x] **RUN-BE-PROFILE** Verify security posture and session contracts.
  - Evidence: focused API rerun on 2026-06-22 for `playwright/specs/api/admin-profile.spec.ts` passed cleanly with the API-only config (`scratch/playwright.api-no-webserver.config.ts`) (`4 passed`, `0 skipped`, `0 unexpected`), proving self identity, persisted display identity, backend-owned security posture, and recent-access trust contracts.
- [x] **RUN-BE-PCOL** Verify sources, validation, persistence, readiness, and warnings contracts.
  - Evidence: focused API rerun on 2026-06-22 for `playwright/specs/api/admin-payment-collection.spec.ts` passed cleanly with the API-only config (`scratch/playwright.api-no-webserver.config.ts`) (`4 passed`, `0 skipped`, `0 unexpected`), proving backend source metadata, persisted payee identity, invalid-save rejection, and readiness/warnings fields.
- [x] **RUN-BE-SETCONT** Verify store presence, FAQ visibility, cards, and product commercial-state preservation.
  - Evidence: focused API rerun on 2026-06-21 for `playwright/specs/api/store-settings.api.spec.ts` passed cleanly (`8 passed`, `0 skipped`, `0 unexpected`, `0 flaky`), focused API rerun on 2026-06-22 for `playwright/specs/api/admin-content.spec.ts` passed cleanly (`6 passed`), and focused API rerun on 2026-06-22 for `playwright/specs/api/admin-product.spec.ts` passed cleanly (`8 passed`). Together these verify store presence, FAQ visibility, `/v1/admin/cards` product-linked card inventory, and preservation of product commercial state during editorial updates.

### Frontend Surfaces

- [x] **RUN-FE-ORDPROD** Verify order detail, persisted product active state, history handoff, and category refresh.
  - Evidence: focused Chromium rerun on 2026-06-21 for `playwright/specs/admin/orders.spec.ts` passed cleanly (`14 passed`, `0 skipped`, `0 unexpected`) after wiring pending-refund relevance into the order signals panel and normalizing the row-to-detail handoff URL assertion. Focused product follow-up reruns on 2026-06-21 now also passed for `playwright/specs/admin/product-content.spec.ts` (`4 passed`, product-linked cards context plus explicit backend-error handling) and `playwright/specs/admin/product.spec.ts --grep "UC-PROD-04"` (`3 passed`, category refresh/reorder semantics). Final live verification on 2026-06-22 proved the `/v1/admin/products/:id/status` toggle path now persists `is_active` through backend readback, and the focused Chromium rerun for `UC-PROD-03` passed cleanly.
- [x] **RUN-FE-SET** Verify settings success feedback, homepage controls, discovery controls, and registry controls.
  - Evidence: focused Chromium rerun on 2026-06-21 for `playwright/specs/admin/store-settings.spec.ts` passed cleanly (`18 passed`, `0 skipped`, `0 unexpected`). The FE settings surface now proves grouped success feedback, homepage composition controls, discovery/visibility saves, presence controls, and registry/legacy controls without relying on fixed seeded news counts or stale reorder assumptions.
- [x] **RUN-FE-CUSUSER** Verify separate customer/account roots, state summary, and explicit domain handoffs.
  - Evidence: focused Chromium rerun on 2026-06-21 for `playwright/specs/admin/user.spec.ts` and `playwright/specs/admin/customer.spec.ts` passed with `17 passed`, `1 explicit data-blocked skip`, `0 unexpected`, proving distinct customer/account roots, account/customer state panels, and cross-domain handoffs in both directions.
- [x] **RUN-FE-REF** Verify pending queue reconciliation and historical refund search.
  - Current evidence: `/admin/refunds` now fetches `status=all`, filters pending/history client-side, and hydrates the selected refund from `/v1/admin/refunds/:id`; targeted Chromium reruns proved pending-queue reconciliation and historical decision reading on the live backend.
- [x] **RUN-FE-NOTY** Verify server-backed readiness/history and explicit backend error state.
  - Evidence: focused Chromium rerun on 2026-06-22 for `playwright/specs/admin/noty.spec.ts` passed cleanly (`7 passed`, `0 skipped`, `0 unexpected`), proving channel readiness, compose/send flow, server-backed reload/history, empty-search handling, and the explicit readiness-error boundary.
- [x] **RUN-FE-PROFILE** Verify real username, persisted display name, security posture, and sessions.
  - Evidence: focused Chromium rerun on 2026-06-22 for `playwright/specs/admin/admin-profile.spec.ts` passed cleanly (`4 passed`, `0 skipped`, `0 unexpected`), proving `/admin/profile` now renders live self identity, persists display-name changes after reload, requests `/v1/profile/security` and `/v1/profile/sessions`, and removes the prior hardcoded audit/session scaffolding.
- [x] **RUN-FE-PCOL** Verify server-backed sources, persisted payee, invalid-save preservation, and readiness.
  - Evidence: focused Chromium rerun on 2026-06-22 for `playwright/specs/admin/payment-collection.spec.ts` passed cleanly (`4 passed`, `0 skipped`, `0 unexpected`), proving `/admin/collect` now reads backend `sources`, persists payee identity across reload, preserves the last valid config after invalid input, and reflects backend readiness/warnings instead of hardcoded status copy.

### Execution Acceptance

- [ ] **RUN-API-VER** Run the complete target API suite with one worker; zero unexplained failures, flakes, or skips.
- [ ] **RUN-ADMIN-VER** Run the complete target admin suite with one worker; zero stale expected failures and zero unexplained skips.
- [ ] **RUN-DATA-VER** Move genuinely unavailable scenarios to `blocked-by-data` only when the missing data contract and owner are documented.

## Gate 8 - Tracker Normalization

- [ ] **TRACK-01** Update each matrix row from fresh executable evidence, not historical notes.
- [ ] **TRACK-02** Normalize stale order, settings, payment, auth/bootstrap, dynamic-route, and store-presence notes first.
- [ ] **TRACK-03** Ensure every non-green row links to an executable test, owner, blocker, and unblock criterion.
- [ ] **TRACK-04** Remove resolved `red-*` notes and preserve only current evidence.
- [ ] **TRACK-VER** Confirm matrix results contain only `green` or justified `blocked-by-data` before SoT declaration.

## Gate 9 - Final SoT Validation

- [ ] **FINAL-01** Verify every target test has correct intent metadata and scenario traceability.
- [ ] **FINAL-02** Verify every primary, alternate, exception, state-transition, and domain-invariant branch has an executable assertion.
- [x] **FINAL-03** Verify `test.fail` and `test.fixme` count is zero; any remaining skip is explicitly data-owned and excluded from the SoT claim.
  - Evidence: `rg -n "test\\.(fail|fixme)\\(" playwright/specs` now returns no matches, and the last expected-failure marker in `playwright/specs/admin/product.spec.ts` was removed only after direct live probes plus focused API/Chromium reruns for `UC-PROD-03` passed cleanly.
- [ ] **FINAL-04** Run the combined admin and API suite with one worker and archive the report.
- [ ] **FINAL-05** Require two consecutive clean runs for mutation-heavy specs to detect order dependence and stale data coupling.
- [ ] **FINAL-06** Declare `playwright/specs/` authoritative for executable behavior only after Gates 1-9 are complete; retain rationale docs for business intent and boundary rationale.

## Immediate Execution Queue

Execute these tasks next, in order:

1. `PLAN-04` baseline report.
2. `RUN-PAY-01` through `RUN-PAY-03` payment/refund boundary.
3. `ENC-01` and `ENC-02` canonical API contract classification.
4. `EXC-*` missing exception coverage.
5. `QUAL-*` assertion-quality refactor.
6. `DET-*` determinism and data independence.
7. `RUN-*` full implementation verification by domain.
8. `TRACK-*` matrix normalization.
9. `FINAL-*` two-run SoT acceptance.
