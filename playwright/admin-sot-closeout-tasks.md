# Playwright Admin SoT Closeout Tasks

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

- [~] **EXC-PROD-01** Verify UC-PROD-03 proves `is_active` persists through the backend, not only local UI state.
- [ ] **EXC-PROD-02** Add/verify UC-PROD-05 graceful behavior when product-linked cards cannot be loaded.
- [ ] **EXC-REV-01** Add UC-REV-02 rejection coverage proving a hidden review cannot be hidden again.
- [~] **EXC-CONT-01** Verify UC-CONT-04 public non-leak and UC-CONT-06 commercial-state preservation are enforced by canonical API tests.
- [ ] **EXC-NOTY-01** Add FE error-state coverage proving a readiness 404/error cannot produce fabricated defaults.
- [x] **EXC-PAY-01** Verify UC-PAY-03 proves the refund decision surface contains no payment execution controls.
  - Evidence: `playwright/specs/admin/payment.spec.ts` now scopes UC-PAY-03 to `[data-testid="refunds-decision-panel"]`; the clean Chromium run in `playwright/.artifacts/payment-refund-current.json` reports zero unexpected results.
- [~] **EXC-PCOL-01** Verify UC-PCOL-03 rejects invalid save and preserves the prior valid configuration after reload.
- [ ] **EXC-PCOL-02** Replace the conditional UC-PCOL-04 skip with deterministic valid/invalid readiness setup or explicit data-blocked ownership.
- [ ] **EXC-VER** Run each exception test independently and record the rejected action, expected status/UI state, and observed result.

## Gate 5 - Assertion Quality

- [ ] **QUAL-USER-01** Refactor UC-USER-01 away from account/system copy assertions; assert exact search narrowing and account-row semantics.
- [ ] **QUAL-USER-02** Refactor UC-USER-05 away from explanatory copy; assert commerce actions are absent and the customer handoff is separate.
- [ ] **QUAL-CUS-01** Strengthen UC-CUS-04 by navigating through the linked-account handoff and verifying the destination identity.
- [ ] **QUAL-NOTY-01** Assert backend readiness/error state directly instead of success caused by local fallback data.
- [x] **QUAL-PAY-01** Scope UC-PAY-03 assertions to the refund decision surface so unrelated page buttons cannot create false failures.
- [ ] **QUAL-PCOL-01** Assert source identity/state from the backend response rather than only absence of known hardcoded labels.
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

- [~] **RUN-BE-ORD** Verify order transition and refund-status contracts.
  - Current evidence: local `go-grip` patch now restores `locked_count` from actual pending reservations before checkout stock validation; direct local verification against `http://127.0.0.1:8080` returned `201` for `POST /v1/checkout/orders` after the fix.
- [~] **RUN-BE-CUSUSER** Verify customer/account filtering, commerce summary, points, block, and handoff identifiers.
- [~] **RUN-BE-REF** Verify refund detail and payment evidence.
- [~] **RUN-BE-NOTY** Verify readiness, message list, durable outbound artifact, and history outcome fields.
- [~] **RUN-BE-PROFILE** Verify security posture and session contracts.
- [~] **RUN-BE-PCOL** Verify sources, validation, persistence, readiness, and warnings contracts.
- [~] **RUN-BE-SETCONT** Verify store presence, FAQ visibility, cards, and product commercial-state preservation.

### Frontend Surfaces

- [~] **RUN-FE-ORDPROD** Verify order detail, persisted product active state, history handoff, and category refresh.
- [~] **RUN-FE-SET** Verify settings success feedback, homepage controls, discovery controls, and registry controls.
- [~] **RUN-FE-CUSUSER** Verify separate customer/account roots, state summary, and explicit domain handoffs.
- [x] **RUN-FE-REF** Verify pending queue reconciliation and historical refund search.
  - Current evidence: `/admin/refunds` now fetches `status=all`, filters pending/history client-side, and hydrates the selected refund from `/v1/admin/refunds/:id`; targeted Chromium reruns proved pending-queue reconciliation and historical decision reading on the live backend.
- [~] **RUN-FE-NOTY** Verify server-backed readiness/history and explicit backend error state.
- [~] **RUN-FE-PROFILE** Verify real username, persisted display name, security posture, and sessions.
- [~] **RUN-FE-PCOL** Verify server-backed sources, persisted payee, invalid-save preservation, and readiness.

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
- [ ] **FINAL-03** Verify `test.fail` and `test.fixme` count is zero; any remaining skip is explicitly data-owned and excluded from the SoT claim.
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
