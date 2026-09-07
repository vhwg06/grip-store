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

- Read and obey `.agents/task-provider.md` for repository pipeline work.
- `npm run task -- --task <task-id>` is the single agent-facing execution entrypoint.
- `run-task-provider.ts` is generic. Do not add task/workload-specific branches to it.
- Task Provider resolves:

  ```text
  task id
  → pipeline config
  → workload factory
  → workload
     ├── resolver
     ├── policy
     └── shared execution lifecycle
  ```

- Product-patch Figma tasks are invoked only through Task Provider:

  ```bash
  npm run task -- --task figma-p001-promotions
  npm run task -- --task figma-p002-membership
  npm run task -- --task figma-p003-business-solutions
  ```

- Product Integration / Prototype is invoked only through:

  ```bash
  npm run task -- --task figma-product-integration
  ```

- Do NOT ask the caller to provide or manually pass:

  ```text
  workload type
  resolver id
  policy id
  product patch/checkpoint id
  --graph
  --changed
  --change
  --change-doc
  Module graph/doc lists
  Figma URL/node id
  integration stage ids/order
  harness arguments
  ```

- `tools/task-provider/tasks.json`, pipeline config, and the selected workload
  resolve those concerns.
- Do not create a new `run-xxx.ts` merely because a new task/policy/checkpoint is added.
- Add a new workload implementation only when execution lifecycle semantics are
  genuinely different.
- Do not bypass Task Provider with an ad-hoc sequence of single-scope harness
  calls and then claim the provider task completed.

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
- Product Integration / Prototype MUST NOT be encoded as a synthetic Module
  patch such as `P004-integration`. It consumes each Module's latest resolved
  state at the provider-selected checkpoint.

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
  integration stage instructions
  ```

- For product patches, Task Provider derives the direct patch Module set from
  Module graphs, then computes the union dependent closure in dependency order.
- For Product Integration / Prototype, Task Provider requires the selected
  checkpoint to resolve the full configured product scope and then supplies each
  Module's cumulative state at or before that checkpoint.
- Modules outside a provider-resolved scope MUST NOT run.

## Figma workload execution

- Canonical Figma operations MUST use `figma-mcp-go`. Do not fall back to another
  Figma MCP server when it is unavailable or rate-limited.
- `npm run figma:harness -- ...` is the single-scope write/repair lifecycle.
- `npm run figma:verify -- ...` is read-only verification and MUST NOT mutate or
  schedule repair.
- A single-scope harness PASS is local only. It is not Task Provider PASS.
- Both product-patch and product-integration tasks use the same Figma workload
  lifecycle:

  ```text
  review
  → policy classify
  → optional bounded writer
  → fresh independent review
  → evidence
  ```

- Patch and integration behavior differ by resolver/policy configuration, not by
  separate runner programs.
- Provider completion requires the workload execution to satisfy its policy and
  return successfully. Do not infer provider completion from a child harness
  exit alone.

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
  → STOP workload
  → writer forbidden
  ```

## Product Integration / Prototype execution

- Read and obey `.agents/figma-product-integration.md`.
- The agent-facing task is exactly:

  ```bash
  npm run task -- --task figma-product-integration
  ```

- Pipeline config selects:

  ```text
  workload = figma
  resolver = checkpoint
  policy = product-integration
  ```

- Task Provider resolves the current product checkpoint and the pipeline-owned
  D1-D8 stage DAG. Agents MUST NOT invoke D1-D8 as separate caller-owned task ids
  or manually reorder them.
- Current internal stages are:

  ```text
  D1 Flow Inventory
  → D2 Screen Integration
  → D3 Interaction Wiring
  → D4 State Coverage
    + D5 Cross-Module Integration
    + D6 Responsive Integration
  → D7 Prototype Validation
  → D8 Integration Handoff
  ```

- Product integration is review-first. Reviewer summaries must begin with one of:

  ```text
  TARGET_RESOLVED:
  TARGET_NOT_FOUND:
  TARGET_AMBIGUOUS:
  ```

  and a resolved target must classify exactly one integration result:

  ```text
  INTEGRATION_VERIFIED: Product Integration / Prototype
  INTEGRATION_GAP: Product Integration / Prototype
  INTEGRATION_DOC_GAP: Product Integration / Prototype
  ```

- Writer permission requires exactly:

  ```text
  TARGET_RESOLVED
  + INTEGRATION_GAP
  + FAIL_VERIFICATION
  ```

- `INTEGRATION_DOC_GAP`, `TARGET_NOT_FOUND`, and `TARGET_AMBIGUOUS` are terminal;
  writer mutation is forbidden.
- Integration mutation is limited to documented screen-flow/prototype continuity,
  required state reachability, cross-Module handoffs, responsive journey
  continuity, and defects directly blocking those concerns.
- Integration is not permission for new business behavior, ownership changes,
  unrelated redesign/polish, speculative states, or implementation work.
- After mutation, fresh independent review must return
  `TARGET_RESOLVED + INTEGRATION_VERIFIED: Product Integration / Prototype`.
  Workload success without that marker is insufficient evidence.

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
- Provider Figma tasks are update/verify only. Missing canonical surface creation
  requires a separate explicit init/rewrite task.
- Local `artifacts/figma-harness/**` and `artifacts/task-provider/**` are execution
  evidence only, not canonical product/Figma locator registries.

## Terminal behavior

- Stop on the first target-resolution failure, `DOC_GAP`,
  `INTEGRATION_DOC_GAP`, unclassifiable task result, timeout, execution error,
  failed fresh verification, or exhausted repair budget.
- Do not automatically retry, reset repair budget, skip to a later dependent, or
  create replacement surfaces.
- Writer execution over an existing canonical scope MUST reconcile by semantic
  identity before creating nodes. Re-entry/repair MUST NOT append duplicate
  canonical Module / Surface / Use Case / Screen / State representations.
- `PASS`, `FAIL_BUDGET`, `FAIL_VERIFICATION`, `TIMEOUT`, and `ERROR` remain
  terminal statuses for an individual harness invocation.
