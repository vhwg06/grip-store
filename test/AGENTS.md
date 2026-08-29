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
- `npm run figma:harness -- ...` is the canonical single-scope write/repair
  lifecycle. It may start one writer session and owns its complete repair budget.
- `npm run figma:verify -- ...` is verification-only. It MUST NOT start or resume
  a writer, mutate Figma, or schedule a repair.
- `npm run figma:pipeline -- ...` is the canonical dependency update runner.
- When the requested task is a dependency update pipeline, `figma:pipeline`
  remains the top-level orchestration owner for the entire dependency closure.
  Do NOT replace it with a direct single-scope `figma:harness` invocation and
  then treat that child harness result as completion of the original task.
- A single-scope `figma:harness` or `figma:verify` `PASS` is only a local result
  for that Module scope. It MUST NOT be reported as dependency-pipeline `PASS`.
- Dependency-pipeline completion means every Module in the planned dependency
  closure has reached `PASS` under the same top-level pipeline execution and the
  pipeline runner itself exits successfully. If any planned Module remains
  `NOT_RUN`, the dependency pipeline is not complete.
- If the pipeline terminates on one Module, report that terminal pipeline result
  and the later `NOT_RUN` dependents. Do not silently continue them with ad-hoc
  single-scope harness calls.
- If a Module is repaired by a separate explicitly requested single-scope run
  after a terminated dependency pipeline, continuation requires rerunning
  `figma:pipeline` from the original `--changed` seed(s). Do not start manually
  from the next dependency and do not infer that the prior pipeline has resumed.
- The dependency graph lives at `docs/srs/figma-pipeline-dependencies.json`.
- Dependency graph nodes are **logical Module scopes**, not physical Figma roots.
  The graph decides which Module scopes must be checked after a change.
- Figma is flattened at the Module-surface level. One Module may legitimately
  map to multiple sibling top-level roots with distinct surface responsibilities,
  for example `Catalog Public` and `Catalog Admin`.
- The dependency pipeline MUST NOT require or accept a hard-coded Figma URL or
  node id. For each affected graph node, use its Module identity plus the
  canonical Figma hierarchy/identity constraints in `.agents/design-base.md`,
  current canonical inputs, and the actual connected Figma artifact through
  `figma-mcp-go` to resolve the existing canonical Module surface set.
- `Catalog Public` + `Catalog Admin` is a valid resolved Catalog scope and MUST
  NOT be classified ambiguous merely because there are two sibling roots.
- Target ambiguity means multiple candidates compete for the same
  `Module + Surface responsibility`, or semantic ownership cannot be established.
- `figma:pipeline` is an update/verify path, NOT an init/rewrite path. The
  required existing surface set for each selected Module MUST be resolvable
  before review or mutation may continue.
- Reviewer target-resolution summaries are part of the pipeline control
  contract:

  ```text
  TARGET_RESOLVED:   → required existing Module surface set established
  TARGET_NOT_FOUND:  → no Module surface can be established, or a required existing surface is missing
  TARGET_AMBIGUOUS:  → candidates compete for the same semantic surface / ownership cannot be resolved
  ```

- `TARGET_NOT_FOUND`, `TARGET_AMBIGUOUS`, or an unclassifiable target-resolution
  result MUST stop the entire dependency pipeline with zero mutation for that
  Module and no processing of later dependents.
- A missing required Module surface MUST NOT be treated as an ordinary
  `FAIL_VERIFICATION` and MUST NOT trigger a writer. Do not draw/rebuild the
  missing surface from scratch as a fallback for patch/update work.
- Creating a missing canonical surface root requires a separate explicit
  init/rewrite instruction. Never infer init/rewrite permission from a changed
  planning document, dependency edge, patch request, or failed lookup.
- Local `artifacts/figma-harness/**` are execution evidence only and MUST NOT be
  used as a replacement canonical target registry.
- Core rule:

  ```text
  module changed
  → lookup dependency graph
  → changed module + dependents
  → for each logical Module scope, resolve its EXISTING flattened surface set through figma-mcp-go
     ├── TARGET_NOT_FOUND / TARGET_AMBIGUOUS → STOP, no mutation
     └── TARGET_RESOLVED
          → review the complete Module scope
             ├── PASS              → no update
             └── FAIL_VERIFICATION → run normal figma:harness write/repair lifecycle
  ```

- Pass every canonical module whose accepted planning inputs changed with
  `--changed`. The runner follows dependent edges recursively, deduplicates the
  result, and processes modules in dependency order.
- The graph decides which Module scopes must be checked; it does NOT decide which
  Figma surfaces must be mutated.
- Do NOT maintain a separate PATCH/VERIFY/backfill list for Figma.
- Modules outside the changed node's dependent closure MUST NOT run.
- Every affected Module scope is reviewed first with `figma:verify` after its
  existing canonical surface set has been resolved through MCP.
- Only a clean `FAIL_VERIFICATION` for a target already classified
  `TARGET_RESOLVED` means some representation inside the Module scope needs
  update. The writer must mutate only the affected semantic surface(s).
- A target-resolution failure, review timeout, execution error, or other
  terminal failure MUST stop the pipeline and MUST NOT be interpreted as
  permission to mutate.
- A vertical capability name or documentation folder MUST NOT create a new
  top-level Figma surface unless product semantics establish a genuinely new
  owning responsibility AND an explicit init/rewrite task authorizes creation.
- A pipeline run MUST stop on the first failed target resolution, review, or
  update. It MUST NOT continue into dependents, automatically retry, reset repair
  budget, or create a replacement surface.
- A write/repair invocation MUST terminate from an independent reviewer or
  deterministic verifier state, never immediately after writer mutation.
- Writer execution over an existing canonical scope MUST reconcile by semantic
  identity before creating nodes. Re-entry or repair MUST NOT append a second
  canonical representation for an already represented Module / Surface / Use
  Case / Screen / State responsibility.
- `PASS`, `FAIL_BUDGET`, `FAIL_VERIFICATION`, `TIMEOUT`, and `ERROR` are terminal
  results for the current harness invocation.
- Do not automatically start a new write/repair harness invocation after
  `FAIL_BUDGET`, `TIMEOUT`, or `ERROR`. Report the terminal result and its
  artifact directory instead. A new write run requires an explicit new
  instruction.
