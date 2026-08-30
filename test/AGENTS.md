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
- For roadmap vertical capabilities, also read and obey
  `docs/srs/vertical-capability-sequencing.md`.
- CAP-06 reconciliation is capability-specific and activates in roadmap order.
  Do not combine future capability semantics into the current Module patch.
- Future capability source artifacts may exist ahead of their roadmap turn, but
  they MUST NOT become active Module patch nodes until that capability reaches
  CAP-06.
- Treat new commerce/business capabilities as vertical product evolution by
  default. Do not manufacture an isolated bounded context or UI universe merely
  because the capability has a separate planning task or name.
- IKEA is the primary reference where relevant, but reference research is not
  the GRIP product model. GRIP feature decisions must also consider the needs,
  simplicity, and operating context of Vietnamese SMEs.
- Public and Admin UI/UX MUST extend the affected existing GRIP UI/UX and
  journeys. Reference UI/UX is input; it is not a replacement base.
- Patching/reconciliation changes only affected GRIP planning documents. Do not
  rewrite reference facts merely because GRIP adopts a smaller scope.

## Task Provider

- Read and obey `.agents/task-provider.md` for dependency-pipeline work.
- The Task Provider is the agent-facing task-resolution layer. Agents request a
  task id; they do not reconstruct pipeline choice, dependency scope, patch
  intent, Module state, or document arguments themselves.
- For the Promotions Figma patch use:

  ```bash
  npm run task -- --task figma-p001-promotions
  ```

- Do NOT ask the caller to provide or manually pass:

  ```text
  pipeline id
  product patch id
  --graph
  --changed
  --change
  --change-doc
  Module graph/doc lists
  Figma URL/node id
  resolver arguments
  ```

  for a dependency patch task. `tools/task-provider/tasks.json` and the selected
  pipeline config resolve those concerns.
- `figma:pipeline` is an internal executor. It accepts only a provider-generated
  `--task <resolved-task.json>` package.
- Do not bypass Task Provider with an ad-hoc sequence of single-scope harness
  calls and then claim the dependency task completed.

## Module patch graphs

- Each logical Module owns a `module-graph.json` under its canonical SRS folder.
- A Module graph owns Module state evolution, not cross-Module dependency scope:

  ```text
  BASE
  → P001
  → P002
  → ...
  ```

- Each direct patch node MUST define:

  ```text
  patch id
  parent Module state
  authoritative task document
  resulting desired-state documents
  ```

- The patch task document must be executable as a semantic design delta: it must
  state required steps/behaviors, resulting desired state, preserved
  ownership/invariants, explicit non-changes, and completion evidence.
- A Module without the requested patch node remains at its latest earlier Module
  state and receives a `COMPATIBILITY` task only.
- Dependency reachability alone NEVER authorizes inventing a Module patch.
- If compatibility review proves a direct Module change is necessary but the
  Module graph has no patch node, return `DOC_GAP` and stop. Fix docs/module graph
  first; do not let the Figma writer improvise the missing patch.

## Figma dependency scope

- The Figma dependency graph lives at
  `docs/srs/figma-pipeline-dependencies.json`.
- It is **scope-only** and contains only logical Module routing information such
  as `id`, `scope`, `dependsOn`, and optional execution budget.
- The dependency graph MUST NOT contain:

  ```text
  docs
  patch reasons
  change descriptions
  business impact rules
  desired state
  writer intent
  ```

- Task Provider derives the direct patch Module set from Module graphs, then
  computes the union dependent closure in dependency order.
- Modules outside that resolved closure MUST NOT run.

## Figma harness execution

- Canonical Figma operations MUST use `figma-mcp-go`. Do not fall back to another
  Figma MCP server when it is unavailable or rate-limited.
- `npm run figma:harness -- ...` is the single-scope write/repair lifecycle.
- `npm run figma:verify -- ...` is read-only verification and MUST NOT mutate or
  schedule repair.
- A single-scope harness PASS is local only. It is not dependency-pipeline PASS.
- `figma:pipeline` owns execution of the provider-resolved Module task sequence.
- Pipeline completion requires every Module task in the resolved package to PASS
  and the top-level executor to exit successfully. Any `NOT_RUN` means the task
  closure is incomplete.

## Resolved Module task modes

### PATCH

- Task Provider found a direct Module patch node for the requested product patch.
- Reviewer/writer input is the exact Module patch task + resulting desired state,
  not the whole historical document tree by default.
- Reviewer summary for a resolved target must classify the patch as exactly one:

  ```text
  CHANGE_VERIFIED: <patch label>
  CHANGE_GAP: <patch label>
  ```

- `CHANGE_NOT_APPLICABLE` is invalid for a direct PATCH task.
- Writer permission is fail-closed and requires:

  ```text
  TARGET_RESOLVED
  + CHANGE_GAP
  + FAIL_VERIFICATION
  ```

- Writer may mutate only the resolved patch delta plus defects directly caused
  by or blocking that delta.
- Unrelated pre-existing spacing, copy, layout, gallery, responsive, composition,
  or craft issues are outside the task. They may be non-blocking observations
  but MUST NOT authorize mutation or be reported as patch evidence.
- After mutation, a fresh independent reviewer must produce
  `TARGET_RESOLVED + CHANGE_VERIFIED`. Child exit `0` alone is insufficient.

### COMPATIBILITY

- Task Provider found no direct Module patch node, but the Module lies in the
  dependency closure.
- No writer is permitted.
- Compatible result:

  ```text
  TARGET_RESOLVED
  + CHANGE_NOT_APPLICABLE: <patch label>
  → PASS, zero mutation
  ```

- If review establishes that the dependency actually requires a direct Module
  change:

  ```text
  CHANGE_GAP
  → DOC_GAP
  → STOP pipeline
  → writer forbidden
  ```

## Figma target resolution

- Figma is flattened at the Module-surface level. One Module may legitimately
  map to multiple sibling top-level roots with distinct responsibilities, e.g.
  `Catalog Public` + `Catalog Admin`.
- Distinct Public/Admin roots are one resolved logical Module scope, not
  ambiguity.
- Resolve identity by:

  ```text
  Module
  + Surface responsibility
  + Use Case
  + Screen responsibility
  + State responsibility
  ```

  not by node id/frame name alone.
- Reviewer target-resolution summaries are machine-consumed:

  ```text
  TARGET_RESOLVED:
  TARGET_NOT_FOUND:
  TARGET_AMBIGUOUS:
  ```

- `TARGET_NOT_FOUND`, `TARGET_AMBIGUOUS`, or unclassifiable target resolution is
  terminal and must never enter a writer branch.
- `figma:pipeline` is update/verify only. Missing canonical surface creation
  requires a separate explicit init/rewrite task.
- Local `artifacts/figma-harness/**` and `artifacts/task-provider/**` are execution
  evidence only, not canonical product/Figma locator registries.

## Terminal behavior

- Stop on the first target-resolution failure, `DOC_GAP`, unclassifiable task
  result, timeout, execution error, failed fresh verification, or exhausted
  repair budget.
- Do not automatically retry, reset repair budget, skip to a later dependent, or
  create replacement surfaces.
- Writer execution over an existing canonical scope MUST reconcile by semantic
  identity before creating nodes. Re-entry/repair MUST NOT append duplicate
  canonical Module / Surface / Use Case / Screen / State representations.
- `PASS`, `FAIL_BUDGET`, `FAIL_VERIFICATION`, `TIMEOUT`, and `ERROR` remain
  terminal statuses for an individual harness invocation.
