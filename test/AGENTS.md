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

## Domain / UI-UX planning

- For planning work under `docs/srs/**`, read and obey `docs/srs/README.md` before
  creating or patching Research, SRS, Public UI/UX, or Admin UI/UX artifacts.
- Treat new commerce/business capabilities as vertical product evolution by
  default. Do not manufacture an isolated bounded context or UI universe merely
  because the capability has a separate planning task or name.
- IKEA is the primary reference where relevant, but reference research is not
  the GRIP product model. GRIP feature decisions must also consider the needs,
  simplicity, and operating context of Vietnamese SMEs.
- Public and Admin UI/UX MUST extend the affected existing GRIP UI/UX and
  journeys. Reference UI/UX is input; it is not a replacement base.
- Patching/reconciliation happens after the new GRIP capability is defined and
  changes only affected GRIP planning documents. Do not rewrite reference facts
  merely because GRIP adopts a smaller scope.

## Figma harness execution

- Canonical Figma harness sessions MUST use `figma-mcp-go` for Figma operations.
  Do not fall back to another Figma MCP server when `figma-mcp-go` is unavailable
  or rate-limited.
- `npm run figma:harness -- ...` is the canonical single-root write/repair
  lifecycle. It may start one writer session and owns its complete repair budget.
- `npm run figma:verify -- ...` is verification-only. It MUST NOT start or resume
  a writer, mutate Figma, or schedule a repair.
- `npm run figma:pipeline -- ...` is the canonical dependency rebuild runner.
- The dependency graph lives at `docs/srs/figma-pipeline-dependencies.json`.
- Core rule:

  ```text
  module changed
  → rebuild that module
  → rebuild every dependent module
  ```

- Pass every canonical module whose accepted planning inputs changed with
  `--changed`. The runner follows dependent edges recursively, deduplicates the
  result, and executes the rebuild in dependency order.
- Do NOT maintain a separate PATCH/VERIFY/backfill list for Figma.
- Modules outside the dependency path MUST NOT run.
- Every rebuilt module delegates to exactly one normal
  `figma:harness --mode write` lifecycle and reads
  `.agents/figma-pipeline-update.md` before its canonical module documents.
- A vertical capability name or documentation folder MUST NOT create a new
  top-level Figma Module root unless product semantics establish a genuinely new
  owning Module. Rebuild the existing canonical root.
- A pipeline run MUST stop on the first failed module. It MUST NOT continue into
  its dependents, automatically retry it, or reset its repair budget.
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
