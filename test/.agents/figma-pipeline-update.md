# Figma Pipeline Update Contract

This file is the execution contract for revisiting canonical Figma after accepted planning documents change.

It is not product/domain authority.

## Core model

The dependency graph and the active patch/change context have different jobs.

```text
Dependency graph
= WHICH logical Module scopes must be checked

Active change context
= WHAT accepted delta this run is trying to materialize
```

Never collapse those responsibilities.

A dependency edge is not mutation permission.

Canonical flow:

```text
accepted planning delta
↓
original changed Module seed(s)
↓
lookup dependency graph
↓
changed Module + dependents, dependency order
↓
for each Module:
  resolve EXISTING canonical flattened surface set
  ↓
  classify the active change for this Module
    ├── CHANGE_VERIFIED
    │     → active delta already represented
    │     → PASS, zero mutation
    │
    ├── CHANGE_NOT_APPLICABLE
    │     → compatibility check only
    │     → PASS, zero mutation
    │
    └── CHANGE_GAP
          → active delta is missing/incorrect here
          → writer may repair that delta only
          → fresh independent review
```

The pipeline must never degrade into a general Figma cleanup/tuning pass merely because a Module is in the dependency closure.

## Active change context is mandatory

`figma:pipeline` requires an explicit run-level active change contract:

```text
--change <accepted delta label>
--change-doc <authoritative delta / impact document>
```

The top-level orchestrator must derive this from the accepted planning work already present in the repository. Do not make the user restate information that the current planning checkpoint establishes.

Example for the Promotions checkpoint:

```text
--changed Catalog
--change Promotions
--change-doc docs/srs/Promotions/05-promotions-impact-map-and-review.md
```

The active change context is propagated to every child reviewer/writer together with that Module's current canonical docs.

Interpretation:

```text
current canonical Module docs
= compatibility/product truth

active change docs
= why this pipeline run exists
= patch intent
```

Do not add change reasons, patch lists, or business-impact semantics to the dependency graph itself.

## Reviewer change gate

After target resolution, the reviewer must evaluate the active change before general quality observations can authorize mutation.

For `TARGET_RESOLVED`, the summary must include exactly one machine-consumed active-change marker:

```text
CHANGE_VERIFIED: <active change>
CHANGE_GAP: <active change>
CHANGE_NOT_APPLICABLE: <active change>
```

Meanings:

### CHANGE_VERIFIED

The active delta required for this Module is already represented correctly enough to satisfy the accepted change contract and current canonical compatibility constraints.

Result:

```text
PASS
zero mutation
```

### CHANGE_GAP

The active delta requires a direct observable/design change in this Module and the current Figma is missing it, represents it incorrectly, or has a blocking defect directly caused by / blocking that delta.

Only this classification can authorize a writer.

Required routing:

```text
TARGET_RESOLVED
+
CHANGE_GAP
+
FAIL_VERIFICATION
→ writer allowed
```

### CHANGE_NOT_APPLICABLE

The Module is in the dependency closure but the active change requires no direct Figma delta there. Review compatibility only.

Result:

```text
PASS
zero mutation
```

## Unrelated defects are not patch intent

Pre-existing issues unrelated to the active change must not be converted into `CHANGE_GAP`.

Examples:

```text
old spacing inconsistency
old gallery polish issue
old copy preference
old composition weakness
unrelated responsive tuning opportunity
```

These may be recorded as non-blocking observations when useful, but they do not authorize a writer in this patch run unless they directly block, contradict, or were introduced by the active delta on an affected semantic surface.

This is the key boundary:

```text
Module is affected by dependency graph
≠ every defect in that Module may be repaired
```

## Writer mutation boundary

A dependency-pipeline writer may mutate only:

```text
active change delta
+
blocking defects directly caused by or preventing that delta
+
required reconciliation on the affected semantic surfaces
```

It must not opportunistically:

```text
polish unrelated screens
retune spacing elsewhere
rewrite unrelated copy
redesign old composition
fix unrelated responsive behavior
perform general Figma maintenance
```

If the active change is already represented or not applicable, no writer should start.

## Machine-enforced writer permission

The top-level runner consumes both target and active-change markers.

A writer may start only under this exact control state:

```text
TARGET_RESOLVED
+
CHANGE_GAP: <active change>
+
child verify exit = FAIL_VERIFICATION
```

These states do **not** authorize mutation:

```text
TARGET_NOT_FOUND
TARGET_AMBIGUOUS
TARGET_RESOLVED + CHANGE_VERIFIED
TARGET_RESOLVED + CHANGE_NOT_APPLICABLE
TARGET_RESOLVED + missing/unclassifiable change marker
review failure without CHANGE_GAP
```

After a writer run, child exit `0` alone is not sufficient. The top-level pipeline must inspect the fresh child reviewer artifact and require:

```text
TARGET_RESOLVED
+
CHANGE_VERIFIED: <active change>
```

or, when appropriate:

```text
TARGET_RESOLVED
+
CHANGE_NOT_APPLICABLE: <active change>
```

Otherwise the Module remains failed and later dependents do not run.

## Orchestration ownership and completion

`figma:pipeline` owns the dependency-update task from the original changed seed(s) through the entire planned dependency closure.

Single-scope `figma:verify` / `figma:harness` invocations are child lifecycles only.

```text
child PASS
≠ dependency pipeline PASS
```

A dependency pipeline is complete only when:

```text
all planned Module scopes = PASS
+
top-level figma:pipeline exits successfully
```

If any planned Module is `NOT_RUN`, the pipeline is incomplete.

If the pipeline terminates:

```text
report failed Module
+ later dependents = NOT_RUN
+ stop
```

Do not replace the failed top-level pipeline with ad-hoc child harness calls and then claim completion.

If a separately requested child repair later changes the failed Module, continuation requires rerunning `figma:pipeline` from the original `--changed` seed(s) with the same active change context.

## Dependency node ≠ physical Figma root

A dependency node is one logical Module scope.

Figma is flattened at the Module-surface level, so a Module may resolve to multiple sibling canonical roots with distinct surface responsibilities:

```text
Catalog
→ Catalog Public
→ Catalog Admin
```

That is one resolved Catalog scope, not ambiguity.

Ambiguity exists only when candidates compete for the same `Module + Surface responsibility`, or semantic ownership cannot be established.

## Existing-scope invariant

`figma:pipeline` is update/verify only, never implicit init/rewrite.

For every selected Module, the existing canonical surface set required by current canonical inputs must be resolvable through `figma-mcp-go` before review or mutation.

```text
TARGET_NOT_FOUND
→ STOP
→ zero mutation

TARGET_AMBIGUOUS
→ STOP
→ zero mutation
```

Creating a missing canonical root requires a separate explicit init/rewrite task.

## Target resolution

The dependency pipeline does not accept a hard-coded Figma URL or node id.

Resolve the existing Module surface set from:

```text
logical Module identity from dependency graph
+
canonical hierarchy / identity constraints from .agents/design-base.md
+
current canonical Module inputs
+
actual connected Figma inspected through figma-mcp-go
```

Reviewer target summaries remain machine-consumed:

```text
TARGET_RESOLVED:
TARGET_NOT_FOUND:
TARGET_AMBIGUOUS:
```

When `TARGET_RESOLVED`, the same summary must also contain one active-change classification.

Example:

```text
TARGET_RESOLVED: CHANGE_GAP: Promotions — Checkout is missing coupon apply/remove states required by the active Promotions delta.
```

or:

```text
TARGET_RESOLVED: CHANGE_VERIFIED: Promotions — promotional pricing and operator promotion flows are already represented on the affected Catalog surfaces.
```

## Canonical identity and reconciliation

When `CHANGE_GAP` authorizes mutation, reconcile by semantic identity:

```text
Module
+ Surface responsibility
+ Use Case
+ Screen responsibility
+ State responsibility
```

Update the existing representation in place where it exists.

Do not append duplicate canonical roots/screens/states merely because a new planning delta arrived.

## Failure rule

Process dependency results in order.

On target-resolution failure, unclassifiable active-change result, review execution failure, timeout, exhausted repair budget, or child update that does not close with fresh change evidence:

```text
STOP
→ do not process later dependents
→ do not reset repair budget
→ do not start a hidden retry
→ do not convert failure into general cleanup permission
```
