# Figma Pipeline Update Contract

This file is an execution contract for revisiting canonical Figma after accepted planning documents change.

It is not product/domain authority.

## Core rule

```text
module changed
→ lookup dependency graph
→ changed module + dependents, in dependency order
→ resolve each EXISTING canonical Module root through figma-mcp-go
   ├── TARGET_NOT_FOUND / TARGET_AMBIGUOUS → STOP pipeline, zero mutation
   └── TARGET_RESOLVED                     → review that root
        ├── review PASS → no update
        └── review FAIL_VERIFICATION → normal writer/repair lifecycle → fresh review
```

That is the whole update model.

Do not maintain a separate patch list, verify list, backfill manifest, business-impact engine, hard-coded Figma URL list, or node-id routing table inside the Figma harness.

## Existing-root invariant

`figma:pipeline` is an **update / verify** path. It is not an init or rewrite path.

For every affected module, an existing canonical Module root is mandatory before review or mutation.

```text
patch Catalog
→ MCP lookup Catalog
→ Catalog root exists uniquely
   → review/update normally

patch Catalog
→ MCP lookup Catalog
→ Catalog root does not exist
   → TARGET_NOT_FOUND
   → STOP
   → do NOT create Catalog from scratch
```

Likewise, if multiple candidates prevent unique semantic resolution:

```text
TARGET_AMBIGUOUS
→ STOP
→ do not guess
→ do not mutate
```

Creating a missing canonical Module root requires a **separate explicit init/rewrite instruction**. Missing-target recovery must never be inferred from a patch/update request.

## Figma target resolution

The dependency pipeline does not accept a Figma URL or node id.

For each affected module, resolve the canonical Figma target from:

```text
module identity from the dependency graph
+
canonical Figma hierarchy / identity constraints from .agents/design-base.md
+
actual connected Figma artifact inspected through figma-mcp-go
```

Use MCP document/page/search/node inspection as needed to establish the unique existing canonical Module root before review or mutation.

The shared structural constraints are authoritative:

```text
each product Module owns one independent top-level canvas root
Module roots are siblings
canonical UI belongs only under its owning Module
semantic identity = Module + Use Case + Screen responsibility + State responsibility
```

A node id, frame name, creation time, or visual similarity alone is not enough to establish semantic identity.

Reviewer target-resolution summaries are machine-consumed by the dependency runner:

```text
TARGET_RESOLVED:
TARGET_NOT_FOUND:
TARGET_AMBIGUOUS:
```

The dependency runner is fail-closed: missing, ambiguous, or unclassifiable target resolution is terminal and must never enter the writer branch.

Local `artifacts/figma-harness/**` are execution evidence only. They are not the canonical Figma locator source and must not replace MCP inspection of the actual artifact.

## Existing Figma is the base

Every affected node is reviewed against:

```text
current canonical module planning docs
+
current canonical Figma root resolved through MCP
```

A changed document or upstream dependency does not by itself justify mutation.

The reviewer decides whether the existing Figma still satisfies the current inputs.

If it does, leave it unchanged.

If it does not, run the normal writer/repair harness against the same canonical root.

## Dependency graph scope

The dependency graph answers only:

```text
which later Figma modules must be checked when this module changes?
```

It does not redefine domain ownership and it does not decide whether a visual update is required.

## Update lifecycle

For every module returned by dependency lookup:

```text
resolve existing canonical Module root through figma-mcp-go
   ↓
TARGET_NOT_FOUND / TARGET_AMBIGUOUS
   → terminal failure
   → zero mutation
   → stop dependents

TARGET_RESOLVED
   ↓
figma:verify
   ↓
PASS
   → done, zero mutation

FAIL_VERIFICATION
   ↓
figma:harness --mode write
   ↓
writer against the same resolved semantic root
→ fresh reviewer
→ repair if required within the same budget
→ PASS | terminal failure
```

A target-resolution failure, review execution error, timeout, or other terminal failure is not interpreted as "needs update". Stop the pipeline instead.

## Canonical identity

When update is required, reconcile the existing representation by:

```text
owning Module
+ Use Case
+ Screen responsibility
+ State responsibility
```

Do not append duplicate canonical roots/screens/states merely because the planning inputs changed.

## Failure rule

Process dependency results in order.

If target resolution, review, or update for one module fails terminally:

```text
stop
→ do not process its later dependents
→ do not create a replacement root
→ do not reset repair budget automatically
→ do not start a hidden retry
```
