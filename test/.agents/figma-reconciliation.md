# Figma Vertical Reconciliation Contract

This file is an **execution contract**, not product/domain authority.

It applies only when the caller is running a vertical reconciliation/backfill wave over canonical Figma that already exists.

## Core invariant

The current canonical Figma is the base artifact.

A new capability name or documentation folder does **not** imply a new Figma Module root.

Use:

```text
existing canonical Figma root
+ accepted new business semantics
+ existing GRIP UI/UX base
+ capability UI/UX delta
+ targeted reference evidence
→ reconciled canonical root
```

Never default to:

```text
new capability folder
→ new top-level Figma root
→ duplicate storefront/admin universe
```

## Supplied document order

After this execution contract, the reconciliation harness supplies product/design documents in this authority order:

```text
1. Product semantics
   - existing owning-module SRS
   - accepted vertical-capability SRS
   - accepted reconciliation / impact decisions

2. Existing GRIP UI/UX base
   - current Public/Admin UI/UX for the owning canonical root

3. UI/UX delta
   - accepted vertical-capability Public/Admin extension documents

4. Targeted reference evidence
   - IKEA/reference research supporting interaction choices
```

Read them in that order.

Reference evidence may inform execution but must not override GRIP semantics or the existing GRIP UI/UX base.

## Patch action

When the wave action is `patch`:

1. inspect the supplied canonical root in existing Figma;
2. inventory its current Use Cases / Screens / States by semantic responsibility;
3. identify only the accepted deltas that affect that root;
4. update/recompose existing canonical representations when their responsibility is extended;
5. create a new Screen/State only when the new semantics introduce a genuinely new responsibility;
6. do not create a new top-level Module root for the vertical capability;
7. do not mutate unrelated Module roots;
8. read back the resulting inventory before finishing.

The normal repair-budget and independent-review lifecycle remains unchanged.

## Verify action

When the wave action is `verify`:

- treat the supplied root as expected to require no mutation;
- review the actual root against the supplied semantics/audit documents;
- do not start or request writer mutation;
- PASS only when the root remains coherent after the product changes;
- report a verification failure if the new product semantics actually require a Figma change.

A verification failure is not permission for the wave orchestrator to silently restart the root in write mode.

## Wave isolation

Each canonical root owns one independent harness lifecycle and one independent repair budget.

The wave orchestrator executes roots sequentially and stops on the first failed lifecycle.

It must never:

- automatically retry a failed root with a fresh budget;
- continue mutating later roots after an earlier root fails;
- rerun already-passed roots merely to resume a later failed root.

A later retry must be an explicit new invocation scoped to the intended root.

## Canonical identity

Semantic identity remains:

```text
owning Module
+ Use Case
+ Screen responsibility
+ State responsibility
```

Vertical capability name is not part of canonical identity unless product semantics genuinely introduce a new owning Module.
