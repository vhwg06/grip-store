# Tasks: Admin Media Management

**Input**: Design documents from `/specs/004-admin-media-management/`

**Prerequisites**: `spec.md`, `contracts/media-api.md`

**Tests**: Required. New specs must live under `/workspaces/grip-store/playwright/specs`.

## Phase 1: Setup

- [x] T001 Update `AGENTS.md` with the required new-feature workflow: spec -> Playwright specs -> implementation.
- [x] T002 Create feature specification in `specs/004-admin-media-management/spec.md`.
- [x] T003 Create backend media API contract in `specs/004-admin-media-management/contracts/media-api.md`.

## Phase 2: Tests First

- [x] T004 [P] Add admin media UI/use-case tests in `playwright/specs/admin/media-management.spec.ts`.
- [x] T005 [P] Add backend media API contract tests in `playwright/specs/api/media.api.spec.ts`.

## Phase 3: Backend Contract / Adapter Layer

- [x] T006 Add media asset types and list/delete functions to `src/adapters/api/media.api.ts`.
- [x] T007 Add media library SWR hook to `src/application/hooks/useAdmin.ts`.
- [x] T008 Implement matching Go backend endpoints outside this frontend checkout: list, presign, register, delete, and R2 storage policy.

## Phase 4: Frontend Media Library

- [x] T009 Add reusable admin media library component for browse, upload, copy, select, and delete.
- [x] T010 Add `/admin/media` page.
- [x] T011 Add admin sidebar navigation entry for media management.

## Phase 5: Use-Case Integrations

- [x] T012 Update banner manager to use media upload/select for desktop and mobile images.
- [x] T013 Update article form to use media upload/select for featured image.
- [x] T014 Update product form media controls to support existing media selection/reuse.

## Phase 6: Validation

- [ ] T015 Run `npx tsc --noEmit --pretty false` (attempted; currently blocked by existing `playwright/specs/product-flow/detail.spec.ts` nullability errors).
- [x] T016 Run `npm run lint`.
- [x] T017 Run targeted Playwright specs for media when backend media endpoints are available.
