# Test repository rules

- `modules/**` owns capability behavior and its executable Cucumber binding.
- `behavior.feature` is the business acceptance source.
- `behavior.steps.ts` is a thin, statically bound Cucumber automation adapter.
- Stable Scenario IDs are tags on the Scenario. `npm run test:scenario --
  @SC-MODEL-01` selects that Gherkin Scenario via Cucumber after its module
  adapter is implemented.
- Every accepted Scenario ID is declared in its module manifest. Cucumber's
  world hook resolves the feature URI and module-local steps file for that tag;
  there are no parallel native `*.spec.ts` targets.
- `shared/**` contains only cross-module plumbing.
- `generated/**` is build output and must not be edited by hand. Gherkin is
  executed directly by Cucumber; no generated Playwright-BDD source is the
  acceptance source.
- *Always follow: `Spec / Use Case → Test → Implementation → Verification`.

## Figma harness execution

- Canonical Figma harness sessions MUST use `figma-mcp-go` for Figma operations.
  Do not fall back to another Figma MCP server when `figma-mcp-go` is unavailable
  or rate-limited.
- `npm run figma:harness -- ...` is the canonical write/repair lifecycle. It may
  start one writer session and owns its complete repair budget.
- `npm run figma:verify -- ...` is verification-only. It MUST NOT start or resume
  a writer, mutate Figma, or schedule a repair. Use it when the task is to verify
  the canonical artifact as it already exists.
- A write/repair invocation MUST terminate from an independent reviewer or
  deterministic verifier state, never immediately after writer mutation.
- Writer execution over an existing canonical scope MUST reconcile by semantic
  identity before creating nodes. Re-entry or repair MUST NOT append a second
  canonical representation for an already represented Module / Use Case /
  Screen / State responsibility.
- `PASS`, `FAIL_BUDGET`, `FAIL_VERIFICATION`, `TIMEOUT`, and `ERROR` are terminal
  results for the current harness invocation.
- Do not automatically start a new write/repair harness invocation after
  `FAIL_BUDGET`, `FAIL_VERIFICATION`, `TIMEOUT`, or `ERROR`. Report the terminal
  result and its artifact directory instead. A new write run requires an
  explicit new instruction.
