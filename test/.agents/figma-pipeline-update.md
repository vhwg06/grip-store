# Figma Pipeline Update Contract

This file defines execution after Task Provider has resolved a Figma patch task.

It is not product/domain authority and it is not a task resolver.

## Ownership model

```text
Task Provider
= resolve WHAT this run means
= resolve direct Module patch nodes
= resolve dependency closure
= resolve each Module state/task mode

figma:pipeline
= execute the resolved Module task sequence

child reviewer/writer
= inspect or mutate only the supplied Module task
```

Do not collapse these layers.

## Public entrypoint

Dependency patch work starts through Task Provider:

```bash
npm run task -- --pipeline figma --patch P001-promotions
```

`figma:pipeline` is internal and accepts only:

```text
--task <Task Provider resolved package>
```

It must reject raw graph/change/doc/Figma routing arguments.

## Dependency graph

The Figma dependency graph is scope-only:

```text
Module id
scope
dependsOn
optional execution budget
```

It does not contain docs, patch reasons, business impact, desired state, or writer intent.

Task Provider derives direct patch Modules from Module graphs and then computes the union dependent closure.

## Module task modes

Every affected Module arrives already classified by Task Provider.

### PATCH

The Module owns a direct node for the requested product patch.

Resolved input contains:

```text
Module patch id
parent Module state
authoritative task document
resulting desired-state docs
```

Reviewer must classify the patch as exactly one:

```text
CHANGE_VERIFIED: <patch label>
CHANGE_GAP: <patch label>
```

`CHANGE_NOT_APPLICABLE` is invalid for PATCH.

Writer permission requires exactly:

```text
TARGET_RESOLVED
+
CHANGE_GAP
+
FAIL_VERIFICATION
```

The writer may mutate only the resolved Module patch plus defects directly caused by or blocking that patch.

Unrelated pre-existing spacing, gallery, copy, composition, responsive, or craft issues are outside the task and must not authorize mutation.

After writer completion the fresh independent reviewer must produce:

```text
TARGET_RESOLVED
+
CHANGE_VERIFIED
```

Child exit `0` alone is not completion evidence.

### COMPATIBILITY

The Module is in the dependency closure but owns no direct node for the requested product patch.

Task Provider supplies its latest Module state at or before that patch.

This mode is read-only.

Compatible result:

```text
TARGET_RESOLVED
+
CHANGE_NOT_APPLICABLE: <patch label>
→ PASS
→ zero mutation
```

If review establishes that a direct Module change is actually required:

```text
CHANGE_GAP
→ DOC_GAP
→ STOP pipeline
→ writer forbidden
```

The fix is to patch docs / Module graph first, then resolve a new task package.

Dependency reachability is never permission to invent an undocumented Module patch.

## Task-scoped review

When the Figma target contains a Task Provider resolved task boundary, reviewer gates and scores apply to the resolved task scope.

For PATCH:

```text
patch semantics
+ resulting desired state
+ directly affected surfaces
```

For COMPATIBILITY:

```text
compatibility with current Module state
+ dependency effect only
```

Unrelated pre-existing quality issues may be reported as non-blocking observations, but they must not be converted into patch failure or repair work.

The pipeline is not a general Figma maintenance loop.

## Existing target resolution

Figma update/verify is never implicit init/rewrite.

Before patch evaluation, resolve the existing canonical Module surface set through `figma-mcp-go`.

A logical Module may own multiple flattened sibling roots with distinct responsibilities:

```text
Catalog
→ Catalog Public
→ Catalog Admin
```

This is one resolved Catalog scope, not ambiguity.

Semantic identity is:

```text
Module
+ Surface responsibility
+ Use Case
+ Screen responsibility
+ State responsibility
```

Reviewer summary must begin with exactly one target marker:

```text
TARGET_RESOLVED:
TARGET_NOT_FOUND:
TARGET_AMBIGUOUS:
```

`TARGET_NOT_FOUND`, `TARGET_AMBIGUOUS`, or unclassifiable target resolution is terminal and must never enter a writer branch.

A missing canonical root requires a separate explicit init/rewrite task.

## Execution lifecycle

For each Task Provider resolved Module task, in package order:

```text
resolve existing canonical Module surface set
↓
TARGET_NOT_FOUND / TARGET_AMBIGUOUS
→ STOP

TARGET_RESOLVED
↓
read-only review
↓
PATCH
├── CHANGE_VERIFIED → PASS, zero mutation
└── CHANGE_GAP      → bounded writer → fresh review → CHANGE_VERIFIED

COMPATIBILITY
├── CHANGE_NOT_APPLICABLE → PASS, zero mutation
└── CHANGE_GAP            → DOC_GAP → STOP, writer forbidden
```

The top-level pipeline stops on the first terminal failure. Later Module tasks remain `NOT_RUN`.

## Completion

A child harness PASS is local only.

The provider-resolved Figma task is complete only when:

```text
all resolved Module tasks = PASS
+
figma:pipeline exits successfully
+
Task Provider observes executor success
```

Do not replace a terminated pipeline with ad-hoc child runs and claim the provider task completed.

## Canonical reconciliation

When PATCH authorizes writer mutation, reconcile the existing representation in place by semantic identity.

Repeated execution of the same patch against the same state must converge and must not append duplicate canonical roots/screens/states.

## Failure rule

Stop on:

```text
TARGET_NOT_FOUND
TARGET_AMBIGUOUS
DOC_GAP
invalid task/change classification
review execution failure
writer execution failure
fresh review that does not verify the patch
timeout
repair budget exhaustion
```

Do not automatically retry, reset repair budget, continue to later dependents, or reinterpret failure as general cleanup permission.
