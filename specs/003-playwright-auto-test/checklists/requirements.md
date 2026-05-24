# Requirements Checklist — 003 Playwright Auto Test

## Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-001 | API tests cover all endpoints from api-spec.md | ⬜ |
| FR-002 | E2E tests for P1 user journeys | ⬜ |
| FR-003 | Cross-browser: Chromium, Firefox, WebKit | ⬜ |
| FR-004 | Mobile viewport testing | ⬜ |
| FR-005 | Configurable env (local/staging) | ⬜ |
| FR-006 | API response validation (status, schema, auth) | ⬜ |
| FR-007 | Page Object Model pattern | ⬜ |
| FR-008 | HTML reports in playwright/reports/ | ⬜ |
| FR-009 | Test tagging for selective execution | ⬜ |
| FR-010 | Auth fixtures (storageState) | ⬜ |
| FR-011 | Test data setup/teardown | ⬜ |
| FR-012 | Error response testing (4xx) | ⬜ |
| FR-013 | CI/CD configuration (headless, retry, parallel) | ⬜ |
| FR-014 | Visual regression checks | ⬜ |

## Non-Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-001 | Suite completes < 10 min on CI | ⬜ |
| NFR-002 | Individual test timeout ≤ 30s | ⬜ |
| NFR-003 | TypeScript strict mode | ⬜ |
| NFR-004 | Failure screenshots + traces | ⬜ |
| NFR-005 | Flake rate < 5% | ⬜ |

## Technical Architecture

| ID | Requirement | Status |
|----|-------------|--------|
| TA-001 | Directory structure (/playwright/tests/, pages/, fixtures/, helpers/) | ⬜ |
| TA-002 | playwright.config.ts at project root | ⬜ |
| TA-003 | Environment variables (.env.test) | ⬜ |
| TA-004 | API tests use request context (no browser) | ⬜ |
| TA-005 | Shared storageState for auth | ⬜ |

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-001 | ~54 API endpoint tests minimum | ⬜ |
| SC-002 | ~21 E2E tests minimum | ⬜ |
| SC-003 | < 5% flake rate across browsers | ⬜ |
| SC-004 | < 10 min CI execution | ⬜ |
| SC-005 | Reports with screenshots + traces | ⬜ |
| SC-006 | Single-command local execution | ⬜ |

## User Stories Coverage

| # | Story | Priority | Status |
|---|-------|----------|--------|
| 1 | API Test Suite for Core Backend Endpoints | P1 | ⬜ |
| 2 | E2E Test: Product Browsing & Search | P1 | ⬜ |
| 3 | E2E Test: Cart & Checkout Flow | P1 | ⬜ |
| 4 | E2E Test: Authentication Flow | P1 | ⬜ |
| 5 | E2E Test: Admin Panel | P2 | ⬜ |
| 6 | E2E Test: Content Pages | P2 | ⬜ |
| 7 | E2E Test: Wishlist & Reviews | P3 | ⬜ |
