# Figma Pipeline Dependency Update Contract

This file is an execution contract for updating canonical Figma after accepted planning documents change.

It is not product/domain authority.

## Core rule

Do not decide reruns from a hand-written impact list.

Use the declared Figma dependency graph.

```text
changed module planning inputs
→ changed Figma pipeline node
→ reverse dependency traversal
→ stale downstream nodes
→ topological rerun
```

A node that is not in the stale dependency closure is left untouched.

## Existing Figma is the base

Every stale node already has a canonical Figma root unless it is genuinely new product scope.

For each scheduled node:

```text
current module planning docs
+ current canonical Figma root
+ current upstream dependency context
→ reconcile same canonical root
```

Do not create a replacement Module root merely because an upstream capability or planning document changed.

## Why a downstream node reruns

A scheduled node is stale for one of two reasons:

```text
direct-change
```

Its own canonical planning inputs changed.

Or:

```text
dependency-change
```

One or more declared upstream Figma dependencies changed.

A dependency-invalidated node must inspect its existing Figma against its current module docs and the updated upstream context.

It may legitimately require zero visual mutation. That is acceptable, but the lifecycle still requires fresh independent review before the node can become clean again.

## Dependency graph is orchestration authority

The graph answers only:

```text
which Figma node becomes stale when another node changes
```

It does not move business ownership and does not replace SRS/UI-UX authority.

Dependency edges must reflect actual Figma/product composition dependencies already established by the module pipeline.

Do not add an edge only because two modules have similar names or share a broad business concept.

## Node execution

Each stale node delegates to the normal single-root harness:

```text
figma:harness --mode write
```

The existing lifecycle remains authoritative:

```text
writer/reconciliation
→ deterministic verification where configured
→ fresh independent reviewer
→ repair within the same budget when required
→ PASS | terminal failure
```

The pipeline runner must stop on the first failed node.

It must not:

- continue to downstream stale nodes after an upstream stale node fails;
- reset a failed node's repair budget automatically;
- start a second hidden write lifecycle for the same node;
- rerun unrelated clean nodes.

## Canonical identity

Semantic identity remains:

```text
owning Module
+ Use Case
+ Screen responsibility
+ State responsibility
```

Repeated pipeline execution must reconcile that representation rather than append a duplicate.

## Important distinction

Planning reconciliation and Figma dependency invalidation are different concerns.

```text
Planning phase
new capability
→ patch affected canonical module docs

Figma phase
canonical module docs changed
→ mark corresponding Figma node changed
→ dependency graph decides downstream stale nodes
```

The Figma harness does not redo business impact analysis that the planning phase already completed.
