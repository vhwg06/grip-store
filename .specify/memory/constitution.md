<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0 (MAJOR – initial ratification)
Modified principles: N/A (initial version)
Added sections:
  - Core Principles (7 principles)
  - Migration Architecture Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check section already generic)
  - .specify/templates/spec-template.md ✅ no changes needed (requirements structure compatible)
  - .specify/templates/tasks-template.md ✅ no changes needed (phase structure compatible)
Follow-up TODOs: None
==================
-->

# Grip Store Constitution

## Core Principles

### I. Clean Architecture Boundaries

All source code MUST respect the domain → application → adapter layering
defined by the migration target architecture. Direct imports across
layer boundaries (e.g., an adapter importing from another adapter, or a
component importing from `@/lib/db`) are prohibited.

- **Domain layer** (`src/domain/`): Pure TypeScript types and value
  objects with zero runtime dependencies.
- **Application layer** (`src/application/`): Ports (interfaces),
  hooks, and context providers. MUST depend only on domain types.
- **Adapter layer** (`src/adapters/`): REST API clients implementing
  port interfaces. MUST NOT be imported directly by components; always
  consumed through application hooks or context.
- **Presentation layer** (`src/components/`, `src/app/`): React
  components. MUST consume data exclusively through application hooks.

**Rationale**: The migration from monolith to client-only app succeeds
only if backend concerns never leak into the frontend. Enforcing layer
boundaries prevents regression into coupled server-side imports.

### II. Frontend Contract Stability

Every user-facing function signature, response shape, i18n error key,
and navigation/payment behavior MUST remain stable across the migration.
When replacing a `'use server'` action with a REST adapter, the
frontend-facing API (parameter names, return types, error codes) MUST
NOT change without explicit documentation and version bump.

- Adapter functions MUST preserve the same parameter names and return
  shapes as the server actions they replace.
- Error codes (e.g., `buy.outOfStock`, `buy.invalidQuantity`,
  `buy.limitExceeded`) MUST be kept as-is in adapter responses.
- Any breaking change to a frontend contract MUST be documented in the
  migration plan with a before/after comparison and a migration path.

**Rationale**: Components and pages depend on stable contracts. Breaking
them silently multiplies integration bugs and erodes user trust.

### III. Test-Gate Discipline

No code MUST be merged or deployed without passing the following
mandatory test gates. Gates are ordered from fastest to slowest and
every gate MUST pass before proceeding to the next.

1. **Static Analysis Gate**: `npm run lint` MUST exit 0.
2. **Build Gate**: `npm run build` MUST exit 0 with zero warnings
   treated as errors for import resolution.
3. **Import Guard Gate**: The following grep checks MUST each return
   zero results:
   - `grep -rn "from.*@/lib/db" src/`
   - `grep -rn "from.*drizzle-orm" src/`
   - `grep -rn "from.*better-sqlite3" src/`
   - `grep -rn "from.*next-auth" src/`
   - `grep -rn "'use server'" src/`
4. **Smoke Test Gate**: All critical user flows (catalog, auth,
   checkout, orders, profile, wishlist, notifications, admin) MUST be
   manually verified against the acceptance scenarios before release.

**Rationale**: The migration deletes 20+ server action files and
multiple backend libraries. Import guards are the fastest way to catch
regressions. Build + lint catch type errors early.

### IV. Type-Safe API Communication

All REST API communication MUST be fully typed end-to-end. No `any`
types are permitted in adapter code, domain types, or hook return
values.

- Every API endpoint MUST have a corresponding domain type for its
  request and response shapes.
- The base `apiFetch<T>()` function MUST enforce generic type
  parameters — callers MUST NOT use `apiFetch<any>()`.
- HTTP error responses MUST be normalized to a typed error shape
  (e.g., `{ success: false; error: string }`) — never raw strings or
  untyped objects.
- Token handling (access token attach, 401 refresh retry, logout
  fallback) MUST be encapsulated in `http-client.ts` and MUST NOT leak
  into individual adapter modules.

**Rationale**: Replacing server actions with REST calls introduces a
network boundary. Type safety across that boundary prevents the class
of bugs that only surface at runtime.

### V. User Experience Consistency

The user-perceived behavior of the application MUST NOT degrade during
or after migration. Consistency is measured against these baselines:

- **Visual Continuity**: All existing UI components, animations
  (Framer Motion), themes (Tailwind CSS + Shadcn UI), and responsive
  layouts MUST render identically after migration.
- **Interaction Fidelity**: Loading states, error messages, toast
  notifications, and navigation flows MUST match pre-migration
  behavior. Where server components become client components, skeleton
  loaders MUST replace server-rendered content to avoid layout shift.
- **Internationalization**: All i18n keys (`titleKey`, `contentKey`,
  error codes) MUST be preserved. No key may be renamed or removed
  without updating every consumer.
- **Accessibility**: Existing ARIA attributes, focus management, and
  keyboard navigation MUST be preserved in all refactored components.

**Rationale**: Users do not see architecture changes — they see broken
flows and visual regressions. UX consistency is the primary measure of
migration success.

### VI. Performance Budgets

Client-side performance MUST meet these budgets on every release.
Violations MUST be justified in a Complexity Tracking table and
approved before merge.

- **Initial Page Load**: Largest Contentful Paint (LCP) MUST be
  < 2.5 seconds on a 4G connection.
- **API Response Handling**: The `http-client.ts` MUST implement
  request timeouts (default 10 seconds). Failed requests MUST surface
  user-facing error states within 1 second of timeout.
- **Bundle Size**: JavaScript bundle MUST NOT exceed 300 KB gzipped
  for the initial route. Each additional route chunk MUST NOT exceed
  100 KB gzipped.
- **Token Refresh Latency**: The 401 → refresh → retry cycle MUST
  complete within 2 seconds. If refresh fails, the user MUST be
  redirected to login within 500 ms.
- **State Management**: SWR/React Query cache MUST be configured with
  appropriate `dedupingInterval` and `revalidateOnFocus` to prevent
  redundant API calls. No endpoint MUST be called more than once per
  user action unless explicitly invalidated.

**Rationale**: Migrating from server-rendered pages to client-only
rendering shifts performance responsibility to the browser. Without
budgets, bundle bloat and waterfall requests will degrade the
experience.

### VII. Migration Completeness

The migration is complete ONLY when all of the following conditions are
satisfied. Partial states MUST NOT be shipped to production.

- Zero files remain in `src/actions/` directory.
- Zero files remain in `src/lib/db/` directory.
- The files `src/lib/auth.ts`, `src/lib/admin-auth.ts`,
  `src/lib/email.ts`, `src/lib/notifications.ts`,
  `src/lib/order-processing.ts`, `src/lib/epay.ts`,
  `src/lib/card-api.ts`, `src/lib/crypto.ts` are deleted.
- `drizzle.config.ts` is deleted.
- `drizzle-orm`, `drizzle-kit`, `better-sqlite3`, `next-auth`, and
  `@auth/core` are removed from `package.json`.
- All Import Guard Gate checks (Principle III) pass.
- All pages in `src/app/` use `'use client'` directive or are pure
  layout/metadata wrappers.
- The `AuthProvider` context replaces `SessionProvider` in
  `src/app/layout.tsx`.

**Rationale**: A half-migrated codebase is worse than the original
monolith — it has both complexity models with neither's benefits.
Completeness must be binary.

## Migration Architecture Constraints

The following constraints apply specifically to the monolith → REST API
migration documented in `docs/migration/`:

- **No Server Actions**: The `'use server'` directive MUST NOT appear
  anywhere in `src/`. All data mutations go through REST adapters.
- **No Direct DB Access**: No frontend code may import from
  `@/lib/db`, `drizzle-orm`, or `better-sqlite3`.
- **JWT Auth Only**: Authentication MUST use Bearer JWT tokens issued
  by the backend. `next-auth` MUST be fully removed from the frontend.
- **Client Components**: All data-fetching pages MUST be client
  components using application hooks. Server components are permitted
  only for static layouts and metadata.
- **Port/Adapter Pattern**: Each backend module (auth, catalog,
  checkout, orders, profile, wishlist, notifications, admin) MUST have
  a corresponding port interface in `src/application/ports/` and an
  adapter implementation in `src/adapters/api/`.
- **Module Independence**: Each migration phase (M0–M8) MUST be
  independently verifiable. A phase is complete when its adapter, hooks,
  and page refactors pass all test gates without regressions in other
  modules.

## Development Workflow

All development on this project MUST follow this workflow:

1. **Branch**: Create a feature branch following the naming convention
   `[###-feature-name]`.
2. **Spec → Plan → Tasks**: Use the Spec Kit workflow
   (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks`) for any
   feature requiring more than a single-file change.
3. **Implement**: Follow the task list in priority order (P1 → P2 →
   P3). Mark tasks as `[/]` when in progress and `[x]` when complete.
4. **Verify**: Run all test gates (Principle III) before requesting
   review.
5. **Commit**: Use conventional commit messages
   (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
6. **Review**: All changes MUST be reviewed against the constitution
   principles before merge. Reviewers MUST verify import guards and
   contract stability.

## Governance

This constitution is the supreme authority for all development
decisions on the Grip Store project. In case of conflict between this
constitution and any other document, this constitution prevails.

- **Amendments**: Any change to this constitution MUST be documented
  with a before/after diff, a rationale, and a version bump following
  semantic versioning (MAJOR for principle removals/redefinitions, MINOR
  for additions, PATCH for clarifications).
- **Compliance Review**: Every pull request MUST include a self-check
  against all applicable principles. Reviewers MUST verify compliance
  before approving.
- **Exception Process**: Temporary exceptions to any principle MUST be
  documented in a Complexity Tracking table (see plan template) with
  justification and an expiration date.
- **Versioning**: This constitution follows semantic versioning.
  Version history is tracked in the Sync Impact Report at the top of
  this file.

**Version**: 1.0.0 | **Ratified**: 2026-05-23 | **Last Amended**: 2026-05-23
