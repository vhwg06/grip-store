# Figma Pipeline Update Contract

This file is an execution contract for revisiting canonical Figma after accepted planning documents change.

It is not product/domain authority.

## Core rule

```text
module changed
→ lookup dependency graph
→ changed module + dependents, in dependency order
→ resolve each canonical Module root through figma-mcp-go
→ run harness review on that root
   ├── review PASS → no update
   └── review FAIL_VERIFICATION → run normal writer/repair lifecycle → fresh review
```

That is the whole update model.

Do not maintain a separate patch list, verify list, backfill manifest, business-impact engine, hard-coded Figma URL list, or node-id routing table inside the Figma harness.

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

Use MCP document/page/search/node inspection as needed to establish the unique canonical Module root before review or mutation.

The shared structural constraints are authoritative:

```text
each product Module owns one independent top-level canvas root
Module roots are siblings
canonical UI belongs only under its owning Module
semantic identity = Module + Use Case + Screen responsibility + State responsibility
```

A node id, frame name, creation time, or visual similarity alone is not enough to establish semantic identity.

If the intended canonical root cannot be established unambiguously, fail instead of guessing or mutating another root.

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
resolve canonical Module root through figma-mcp-go
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

A target-resolution ambiguity, review execution error, timeout, or other terminal failure is not interpreted as "needs update". Stop the pipeline instead.

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
→ do not reset repair budget automatically
→ do not start a hidden retry
```
