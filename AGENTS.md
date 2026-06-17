<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
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
