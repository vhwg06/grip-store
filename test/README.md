# Test repository

This directory is the test repository. Each capability is a vertical slice
under `modules/`.

`behavior.feature` is the executable Gherkin business source, not a
documentation-only navigation map. Its stable scenario tags are the selection
key for `cucumber-js`. The colocated `behavior.steps.ts` file is the static
Cucumber binding boundary and contains the executable adapter for the scenario.
There are no parallel module-native `*.spec.ts` files.

Playwright remains the execution engine: API steps use Playwright's
`APIRequestContext`, and browser steps use Playwright `Browser`/`Page`. Cucumber
owns the Scenario lifecycle and invokes those Playwright adapters. Therefore CI
must run the Cucumber commands below; the legacy `npx playwright test` command
does not discover Gherkin and is intentionally not the acceptance entrypoint.

Authenticated scenarios require `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`,
`ADMIN_USER_EMAIL`, and `ADMIN_USER_PASSWORD` (or the corresponding token
variables). No local or bypass environment is used.

`shared/` contains cross-module plumbing only. `generated/` contains the
committed deterministic traceability index and the reserved ephemeral output
boundary; Gherkin itself is not rewritten into a second acceptance source.

Run the whole accepted feature suite with `npm run test:acceptance` (or
`npm run test:all`). Run one scenario with
`npm run test:scenario -- @SC-MODEL-01`. The `test:api` and `test:browser`
commands are tag-filtered views over the same Gherkin suite, not separate test
sources. `test:api:non-catalog` and `test:browser:non-catalog` are the CI gates
while Catalog is not implemented; `test:catalog` is run separately as an
explicitly expected failure. Use `tools/validate-modules.ts` and
`tools/validate-openapi.ts` for structural checks; those commands do not call
the backend.

## Figma design harness

The Figma phase is driven by upstream design documents only: SRS, canonical
domain/business documents, UX research, and UI/design research. Feature/Gherkin
belongs to the later acceptance phase and is deliberately not an input to the
Figma harness.

Shared design correctness is defined once in:

```text
.agents/design-base.md
```

That contract owns the common authority, canonical hierarchy, gate order, and
PASS meaning for semantics/UX, screen responsibility, composition, responsive,
design context, geometry/structure, visual craft, and final artifact quality.

Role files inherit that contract rather than duplicating it:

```text
.agents/design-base.md
        /        \
       /          \
 designer.md   figma-reviewer.md
   WRITE           READ
       \            /
        \          /
         harness runner
```

`designer.md` explains how the writer produces and repairs Figma against the
shared contract. `figma-reviewer.md` explains how a fresh read-only reviewer
judges the actual Figma against the same gates. Neither role may redefine or
weaken the base contract.

The runner owns orchestration and state transitions. A run is bounded by a
repair budget, and every writer mutation is followed by a fresh independent
review before the run can terminate:

```text
upstream docs
→ persistent writer session
→ actual Figma
→ optional deterministic geometry gate
→ fresh independent reviewer
   ├─ PASS → terminal PASS
   └─ FAIL + repair budget remaining
        → writer repair
        → fresh independent reviewer

final failed review after repair budget is exhausted
→ terminal FAIL_BUDGET
→ no further writer mutation
→ no automatic new harness run
```

A repair budget of `N` therefore allows at most `N` writer repairs and `N + 1`
independent reviews. The harness must terminate from a reviewer/verifier state,
never immediately after mutation.

Example:

```bash
npm run figma:harness -- \
  --scope "Checkout admin" \
  --figma "<Figma file/page/node reference>" \
  --doc docs/specs/checkout/checkout_srs.md \
  --doc docs/specs/checkout/checkout-admin-ui-ux-research.md \
  --max-repairs 3
```

`--max-iterations` is retained as a deprecated compatibility alias and is
interpreted as the repair budget.

Harness sessions pin Figma access to `figma-mcp-go`. They must not fall back to
another Figma MCP server when the canonical server is unavailable or
rate-limited.

Requirements:

- authenticated `codex` CLI available on `PATH` (or set `CODEX_BIN`);
- the local Codex configuration exposes `figma-mcp-go` to the writer and
  reviewer;
- each `--doc` path exists under this test repository.

Optional execution controls:

- `FIGMA_GEOMETRY_CHECK_CMD`: deterministic geometry check before review;
- `FIGMA_PHASE_TIMEOUT_MS`: per-Codex-phase timeout (default 45 minutes);
- `FIGMA_HARNESS_TIMEOUT_MS`: whole-run timeout (default 4 hours);
- `FIGMA_HARNESS_HEARTBEAT_MS`: progress heartbeat interval (default 1 minute).

The Codex child process is asynchronous, so the harness can emit heartbeat
messages and terminate a phase that exceeds its timeout rather than blocking
silently until the child exits.

Terminal state is written to `terminal-state.json` under the run directory with
one of:

```text
PASS
FAIL_BUDGET
TIMEOUT
ERROR
```

`FAIL_BUDGET`, `TIMEOUT`, and `ERROR` are terminal for that invocation. The
caller must report the result instead of automatically starting a fresh harness
with a reset repair budget.

Run the lifecycle regression test with:

```bash
npm run test:figma-harness
```

Run outputs are kept under `artifacts/figma-harness/` for inspection. They are
execution evidence, not new canonical design artifacts.
