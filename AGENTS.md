<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the admin module map first:
`/specs/admin-module-map.md`
<!-- SPECKIT END -->

---

## 🌐 API Environment

**Always point to the production API for all testing, including Playwright tests:**

```
NEXT_PUBLIC_API_URL=https://grip.vn/api
```

- Never use mock servers, localhost backends, or staging endpoints unless explicitly instructed.
- Playwright tests must also hit `https://grip.vn/api` — do **not** stub or intercept API calls unless the test is specifically for offline/error states.

---

## 📐 Process Rules — Spec is the Source of Truth

> **Spec and use cases are the single source of truth.**
> Tests are derived from the spec. Code is derived from tests.
> **Never modify spec, use cases, or tests to match the code.**

### Feature Development Workflow

```
Spec / Use Cases  →  Playwright Tests  →  Implementation Code
```

For admin implementation work, persist this execution rule:

- always document spec, plan, and granular tasks before implementation
- always execute against the task checklist and update task status live
- always follow `spec -> test -> implementation -> verification`
- only close work after the relevant tests are green

1. **Define the use case** — Verify it exists in the spec (`/specs`). If missing, add it.
2. **Write / update Playwright tests** — Under `/playwright/specs`, derived strictly from the use case.
3. **Implement code** — Backend contracts/adapters and frontend behavior to make tests pass.

### Bug Fix Workflow

```
Bug Report  →  Review Spec & Use Cases  →  Update Spec/Use Cases if uncovered  →  Update/Add Tests  →  Fix Code
```

1. **Review spec and use cases** — Does the bug scenario exist?
   - If **not covered**: update the spec and use case first, then write a failing test.
   - If **already covered**: the test should have caught it — add a regression test.
2. **Never** patch code first and then adjust tests/spec to match.
3. **Never** delete or weaken a test to make the code pass.

---

## ✅ Workflow Checklist (for every feature & bug fix)

- [ ] Use case defined in spec
- [ ] Playwright test written/updated under `/playwright/specs`
- [ ] Test runs against `https://grip.vn/api`
- [ ] Implementation makes tests pass without modifying tests
- [ ] Spec / use cases remain unchanged (unless genuinely expanding coverage)

---

## 🎭 Playwright Rules — Tests Are the Executable Spec

> [!CRITICAL]
> **Playwright tests are the canonical, executable capture of domain contracts defined in specs.**
> They are the bridge between human-readable specs and running implementation.
> Tests must remain independent of any FE or BE implementation details.

### Contract Capture Principle

Playwright tests **lock the domain contract** from the spec so that:
- **Frontend** forks its rendering logic from the test expectations
- **Backend** forks its API contract from the test assertions

The direction of dependency is strictly:

```
Spec (use-cases.md / scenarios.md)
        ↓
Playwright Tests   ← ONLY depends on spec
        ↓              ← NEVER depends on FE or BE code
FE Implementation
BE Implementation
```

### When Editing Playwright Tests

> [!IMPORTANT]
> **Code Blindness Rule for Playwright:**
> When writing or modifying any file under `/playwright/specs/`, you **must not** read, open, or inspect:
> - Any FE source code (`/src/**`)
> - Any BE source code (`/Users/cynus/Desktop/go-grip/**`)
>
> **Only permitted sources while editing Playwright:**
> - `/specs/**` — the use cases and scenarios
> - `/playwright/**` — other test helpers, fixtures, existing specs

### Why This Matters

If a Playwright test is written by reading the code, it tests what the code *does*, not what the spec *requires*.
Tests written from code are circular — they cannot catch spec deviations.
Tests written from spec are the ground truth — they catch implementation drift.

### What Playwright Tests Must Capture from Spec

For every use case (UC) in `use-cases.md`:

| Spec Artifact | What the Test Must Assert |
|---|---|
| Primary flow | Happy path assertions against real API |
| Alternate flows | Branching behavior variants |
| Exception/rejection flows | Expected error codes (4xx/5xx) or UI error states |
| State transitions | Valid vs. forbidden transition rejection |
| Domain constraints | Field rules, ordering rules, visibility rules |

### Playwright Editing Checklist

- [ ] I read the spec (`use-cases.md`, `scenarios.md`) — not the code
- [ ] The test asserts the domain behavior described in the spec
- [ ] Alternate and rejection flows from `scenarios.md` are covered
- [ ] I did **not** open any FE or BE source file during this edit
- [ ] I did **not** weaken or remove an assertion to make the test pass

---

## 🧭 Admin System Flow

For all admin work, the system-wide source of approach is now:

`use cases -> spec -> figma adaptation review -> backend ownership review -> tests -> tasks -> implement -> pass all defined tests`

### Admin Module Order

1. `005-admin-store-settings`
2. `006-admin-reviews`
3. `009-admin-order-ops`
4. `008-admin-catalog-ops`
5. `007-admin-content-ops`
6. `010-admin-user-engagement-ops`

### Phase Rules

#### Phase 1 — Spec Lock Only

Phase 1 artifacts must be completed before any implementation is considered valid:

- module spec
- figma review
- backend ownership review
- current code audit
- test plan
- tasks

Phase 1 must not contain FE or BE implementation code.

#### Phase 2 — Test-Driven Implementation

Phase 2 starts only after Phase 1 is complete for that module.

- Tests defined in Phase 1 become the source of truth for execution.
- Implement backend business logic and contract first.
- Implement frontend rendering/forms/API integration second.
- Do not move business, process, calculation, ordering, state-transition, validation, or derived logic into FE.

### Ownership Rule

**Frontend owns only:**

- render server state
- collect input
- submit user intent
- show loading/success/error
- route navigation
- non-authoritative presentation formatting

**Backend owns by default:**

- validation rules
- field normalization
- ordering/reordering semantics
- filtering/search semantics
- derived labels/counts/summary cards
- state transitions
- publish/hide/approve/feature/refund logic
- visibility gating
- storefront reflection logic
- media usage protection
- configuration persistence shape
- permission checks
- concurrency/integrity rules

If a screen currently requires FE to compute business state, the module is blocked until the spec defines the BE contract to absorb that logic.

### Figma Rule

For detailed operational guidelines, constraints, and instructions for Figma design, refer to the [Figma Designer Agent Rules & Guidelines (.agents/designer.md)](file:///Users/cynus/Desktop/grip-store/.agents/designer.md).

When reviewing or editing admin Figma flows, use `$gpt-taste` as the review protocol.

Apply it as an admin-appropriate design audit, not as marketing-style visual excess:

- clear hierarchy
- strong spacing and scanability
- explicit CTA priority
- no cheap meta-labels
- no clutter that hides operational meaning
- forms, tables, side panels, and destructive actions must remain visually unambiguous

> [!CRITICAL]
> **Strict Figma and Documentation Rules:**
> 1. **No Code Inspection on Figma Tasks:** When instructed to edit/modify Figma, **absolutely do not read, open, or inspect code** (remain completely blind to the codebase).
> 2. **Explicit Doc Changes Only:** Documentation and specification files (`/specs/*` or other docs) must **only** be modified strictly according to explicit user requests. Do not perform automatic, unrequested documentation updates.

### Artifact Rule

Each admin module should maintain its own folder under `/specs/<module>/` and Phase 1 artifacts must remain aligned with `/specs/admin-module-map.md`.

---

## 🚫 No Mocking / Hardcoding Rule

**Never use mock or fake data in the codebase.**
- All UI components must display and interact with real data fetched from the backend (server-side state).
- Do not use client-side mocking (e.g., hardcoded arrays, E2E conditional mock states, etc.).
- If specific data is required for tests or layout verification (such as products, reviews, categories, etc.), it must be seeded directly in the backend database using SQL migration files, scripts, or official backend APIs (e.g., in `/Users/cynus/Desktop/go-grip`).

---

## 🧪 Testing Best Practices & Anti-Patterns

### 1. Bidirectional State Transition Testing (Kiểm thử trạng thái 2 chiều)
Mọi test case liên quan đến thay đổi trạng thái (Toggle, Active/Inactive, Bật/Tắt, Enable/Disable) **bắt buộc phải được kiểm thử theo cả 2 chiều**:
- **Chiều tắt:** Trạng thái ban đầu (`Active/Enabled`) $\rightarrow$ UI Toggle Tắt $\rightarrow$ Lưu $\rightarrow$ Reload/F5 trang $\rightarrow$ Assert đã ẩn/disabled.
- **Chiều bật:** UI Toggle Bật lại $\rightarrow$ Lưu $\rightarrow$ Reload/F5 trang $\rightarrow$ Assert đã hiển thị/enabled.
*Tuyệt đối không chỉ kiểm thử 1 chiều (chỉ tắt hoặc chỉ bật), vì có thể bỏ lọt các lỗi parse payload ở backend.*

### 2. Tránh lệch cấu trúc API Bypass trong Test
Khi thực hiện Mock, Setup, hoặc Cleanup/Rollback dữ liệu trong Playwright tests:
- Tránh viết tay (hardcode) payload JSON gửi trực tiếp bằng `request.put` hay `request.post` với cấu trúc khác với cách Frontend thực tế gửi qua API Adapter.
- Ưu tiên tái sử dụng (import) trực tiếp các hàm API Adapter/Client của Frontend hoặc đảm bảo Schema và cấu trúc trường (Nested/Flat) trùng khớp hoàn toàn với Frontend gửi đi để tránh việc test setup tự "vá lỗi" cấu trúc hộ UI.

### 3. Persistent State & Serial Execution (Thực thi tuần tự các test làm thay đổi trạng thái persistent/toàn cục)
Khi chạy các bộ Playwright test làm thay đổi cấu hình hệ thống (Settings, CMS Articles, static pages, v.v.), bắt buộc phải chạy tuần tự bằng cách thêm flag `--workers=1` (hoặc cấu hình tương đương) để tránh việc các test case chạy song song làm ghi đè cấu hình lẫn nhau gây ra trạng thái không đồng nhất (out-of-sync/race conditions) trên môi trường API thật (production/staging).

