# Figma Pipeline Update Contract

This file is an execution contract for revisiting canonical Figma after accepted planning documents change.

It is not product/domain authority.

## Core rule

```text
module changed
→ lookup dependency graph
→ changed module + dependents, in dependency order
→ run harness review on each existing canonical Figma root
   ├── review PASS → no update
   └── review FAIL_VERIFICATION → run normal writer/repair lifecycle → fresh review
```

That is the whole update model.

Do not maintain a separate patch list, verify list, backfill manifest, or business-impact engine inside the Figma harness.

## Existing Figma is the base

Every affected node is reviewed against:

```text
current canonical module planning docs
+
current canonical Figma root
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
figma:verify
   ↓
PASS
   → done, zero mutation

FAIL_VERIFICATION
   ↓
figma:harness --mode write
   ↓
writer
→ fresh reviewer
→ repair if required within the same budget
→ PASS | terminal failure
```

A review execution error, timeout, or other terminal failure is not interpreted as "needs update". Stop the pipeline instead.

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

If review or update for one module fails terminally:

```text
stop
→ do not process its later dependents
→ do not reset repair budget automatically
→ do not start a hidden retry
```
