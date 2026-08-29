# Figma Pipeline Update Contract

This file is an execution contract for revisiting canonical Figma after accepted planning documents change.

It is not product/domain authority.

## Core rule

```text
module changed
→ lookup dependency graph
→ changed module + dependents, in dependency order
→ resolve each EXISTING canonical Module surface set through figma-mcp-go
   ├── TARGET_NOT_FOUND / TARGET_AMBIGUOUS → STOP pipeline, zero mutation
   └── TARGET_RESOLVED                     → review that Module scope
        ├── review PASS → no update
        └── review FAIL_VERIFICATION → normal writer/repair lifecycle → fresh review
```

That is the whole update model.

Do not maintain a separate patch list, verify list, backfill manifest, business-impact engine, hard-coded Figma URL list, or node-id routing table inside the Figma harness.

## Orchestration ownership and completion

`figma:pipeline` owns the dependency-update task from the original changed seed(s) through the entire planned dependency closure.

The single-scope `figma:verify` and `figma:harness` invocations are child lifecycles used by that orchestration. Their terminal states are **local** to one Module scope.

```text
child figma:verify PASS
≠ dependency pipeline PASS

child figma:harness PASS
≠ dependency pipeline PASS
```

A dependency pipeline is complete only when:

```text
all Module scopes in the planned closure = PASS
+
top-level figma:pipeline exits successfully
```

If any planned Module is `NOT_RUN`, the dependency pipeline is incomplete.

If the top-level pipeline stops on a terminal failure:

```text
report the failed Module
+ report later dependents as NOT_RUN
+ stop
```

Do not replace the failed top-level pipeline with ad-hoc single-scope harness calls and then claim the original pipeline completed.

If a separate explicit instruction later repairs the failed Module outside the pipeline, continue the dependency task by rerunning `figma:pipeline` from the **original `--changed` seed(s)**. The rerun must re-review the repaired upstream Module and then walk the dependency closure normally. Do not manually jump to the next dependency.

## Dependency node ≠ physical Figma root

The dependency graph is the selector.

A graph node such as `Catalog` represents the logical Catalog Module scope. It does not require one wrapper/root named `Catalog`.

Figma is flattened at the Module-surface level, so one Module may legitimately map to multiple sibling top-level roots:

```text
Catalog
→ Catalog Public
→ Catalog Admin
```

Those roots are not ambiguous because Public and Admin have distinct surface responsibilities.

Ambiguity exists only when multiple candidates compete for the **same** Module + Surface responsibility, or semantic ownership cannot be established.

## Existing-scope invariant

`figma:pipeline` is an **update / verify** path. It is not an init or rewrite path.

For every affected module, the existing canonical surface set required by the current canonical inputs must already be resolvable before review or mutation.

```text
patch Catalog
→ dependency node = Catalog
→ MCP resolves Catalog Public + Catalog Admin
→ TARGET_RESOLVED
→ review/update normally
```

If no canonical surface for the Module can be established, or a surface required by the supplied canonical inputs is missing:

```text
TARGET_NOT_FOUND
→ STOP
→ do NOT create the missing surface from scratch
```

If multiple candidates compete for the same surface responsibility:

```text
TARGET_AMBIGUOUS
→ STOP
→ do not guess
→ do not mutate
```

Creating a missing canonical surface root requires a **separate explicit init/rewrite instruction**. Missing-target recovery must never be inferred from a patch/update request.

## Figma target resolution

The dependency pipeline does not accept a Figma URL or node id.

For each affected module, resolve the canonical Figma Module scope from:

```text
module identity from the dependency graph
+
canonical Figma hierarchy / identity constraints from .agents/design-base.md
+
current canonical inputs supplied for that graph node
+
actual connected Figma artifact inspected through figma-mcp-go
```

Use MCP document/page/search/node inspection as needed to establish the existing canonical surface-root set before review or mutation.

The shared structural constraints are authoritative:

```text
dependency Module → one or more flattened canonical surface roots
surface roots may be siblings
canonical UI belongs only under the correct Module + Surface responsibility
semantic identity = Module + Surface + Use Case + Screen + State responsibility
```

A node id, frame name, creation time, or visual similarity alone is not enough to establish semantic identity.

Reviewer target-resolution summaries are machine-consumed by the dependency runner:

```text
TARGET_RESOLVED:
TARGET_NOT_FOUND:
TARGET_AMBIGUOUS:
```

`TARGET_RESOLVED` means the required existing Module scope has been established; it may contain multiple distinct surface roots.

The dependency runner is fail-closed: missing, ambiguous, or unclassifiable target resolution is terminal and must never enter the writer branch.

Local `artifacts/figma-harness/**` are execution evidence only. They are not the canonical Figma locator source and must not replace MCP inspection of the actual artifact.

## Existing Figma is the base

Every affected graph node is reviewed against:

```text
current canonical module planning docs
+
current canonical Figma surface set resolved through MCP
```

A changed document or upstream dependency does not by itself justify mutation.

The reviewer decides whether the existing Figma still satisfies the current inputs.

If it does, leave it unchanged.

If it does not, run the normal writer/repair harness against the same resolved Module surface set and mutate only the affected semantic surface(s).

## Dependency graph scope

The dependency graph answers only:

```text
which later logical Figma Module scopes must be checked when this Module changes?
```

It does not redefine domain ownership, physical Figma nesting, or whether a visual update is required.

## Update lifecycle

For every module returned by dependency lookup:

```text
resolve existing canonical Module surface set through figma-mcp-go
   ↓
TARGET_NOT_FOUND / TARGET_AMBIGUOUS
   → terminal failure
   → zero mutation
   → stop dependents

TARGET_RESOLVED
   ↓
figma:verify over the complete Module scope
   ↓
PASS
   → done, zero mutation

FAIL_VERIFICATION
   ↓
figma:harness --mode write
   ↓
writer against the same resolved Module surface set
→ mutate only affected semantic surface(s)
→ fresh reviewer
→ repair if required within the same budget
→ PASS | terminal failure
```

A target-resolution failure, review execution error, timeout, or other terminal failure is not interpreted as "needs update". Stop the pipeline instead.

## Canonical identity

When update is required, reconcile the existing representation by:

```text
owning Module
+ Surface responsibility
+ Use Case
+ Screen responsibility
+ State responsibility
```

Do not append duplicate canonical roots/screens/states merely because the planning inputs changed.

Distinct surface responsibilities such as Public and Admin are not duplicates.

## Failure rule

Process dependency results in order.

If target resolution, review, or update for one module fails terminally:

```text
stop
→ do not process its later dependents
→ do not create a missing/replacement surface root
→ do not reset repair budget automatically
→ do not start a hidden retry
```
