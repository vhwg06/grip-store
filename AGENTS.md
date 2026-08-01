# AGENTS.md — Non-Negotiable Rules

* Specs and use cases are the source of truth. Tests must follow the spec, and implementation must satisfy the tests.
* Do not modify specs, use cases, assertions, status codes, payloads, or expected behaviour merely to match existing code.
* Do not invent behaviour outside the task or spec.
* Always follow: `Spec / Use Case → Test → Implementation → Verification`.
* For bug fixes, add or update a regression test before fixing the implementation.
* Do not delete, skip, disable, weaken, or rewrite tests just to make them pass.
* Do not add test-only branches or special-case production logic.
* Do not claim `done`, `fixed`, `verified`, or `passing` unless all relevant tests were executed and passed.
* If tests cannot run or any relevant test fails, report the work as unverified or incomplete and include the failing command or test.
* When editing `/test/tests/**`, do not inspect frontend or backend implementation. Derive expected behaviour only from `/test/specs/**` and `/test/**`.
* Playwright tests must use `https://grip.vn/api`. Do not use mocks, stubs, localhost, staging, fake data, or hardcoded application data unless explicitly required by the test scenario.
* Test data must be created through official APIs, migrations, seeds, or scripts and must follow the real public contract.
* Reversible state changes must be tested in both directions and verified after reload or a fresh API read.
* Tests mutating shared persistent state must run serially.
* Backend must own validation, normalization, permissions, state transitions, business rules, derived state, persistence integrity, and concurrency rules.
* Do not move backend business logic into the frontend or make frontend-computed state authoritative.
* Do not modify files, documentation, specs, or scope unrelated to the assigned task.
* During Figma-only work, do not inspect or modify frontend or backend code.
* Before admin work, read `/test/specs/admin-module-map.md`.
