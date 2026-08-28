# Figma Reconciliation Wave

Use this runner when canonical Figma already exists through later modules and accepted product documentation introduces **vertical capability deltas** that affect earlier roots.

Do not rewind the original module-generation pipeline.

## Architecture

```text
figma:reconcile
    ↓ manifest root order
    ├── root action=patch
    │      ↓
    │   figma:harness --mode write
    │      ↓
    │   normal writer → verifier/reviewer → repair-budget lifecycle
    │
    └── root action=verify
           ↓
        figma:harness --mode verify
           ↓
        read-only independent verification
```

`figma:harness` remains the single-root lifecycle primitive. `figma:reconcile` only orchestrates root selection, document authority order, sequencing, and failure propagation.

## Document authority order

Each manifest root separates inputs into:

```text
semantics
→ baseUiUx
→ deltaUiUx
→ references
```

The orchestrator passes `.agents/figma-reconciliation.md` first, then flattens those buckets in the order above.

Meaning:

```text
GRIP product truth
→ existing GRIP UX as base
→ accepted vertical UX delta
→ targeted reference evidence
→ existing canonical Figma mutation/review
```

Reference research is never the Figma base.

## Current wave

The current manifest is:

```text
docs/srs/figma-vertical-reconciliation.json
```

It currently defines:

```text
PATCH
Catalog
→ Checkout
→ Account
→ Content
→ Order

VERIFY ONLY
Engagement
→ Aftersales
```

The order is canonical-root order for this backfill, not a declaration that Promotions, Membership, or Business Solutions are new Figma roots.

## Dry run

Always safe to inspect the plan first:

```bash
npm run figma:reconcile -- \
  --manifest docs/srs/figma-vertical-reconciliation.json \
  --figma "<Figma file/page reference>" \
  --max-repairs 3 \
  --dry-run
```

Dry run validates:

- manifest structure;
- unique canonical roots;
- action semantics;
- repair-budget rules;
- document existence;
- final document ordering.

It does not start a Figma writer or reviewer.

## Execute the wave

```bash
npm run figma:reconcile -- \
  --manifest docs/srs/figma-vertical-reconciliation.json \
  --figma "<Figma file/page reference>" \
  --max-repairs 3
```

Roots run sequentially.

A failed child lifecycle stops the wave immediately. Later roots remain `NOT_RUN`.

The orchestrator never converts a failed `verify` root into `write`, never retries a failed root automatically, and never resets a failed root's repair budget behind the caller's back.

## Explicit resume / targeted execution

After inspecting and explicitly deciding to start a new lifecycle, select one or more roots:

```bash
npm run figma:reconcile -- \
  --manifest docs/srs/figma-vertical-reconciliation.json \
  --figma "<Figma file/page reference>" \
  --root Checkout
```

Repeat `--root` to select multiple roots. Selected roots retain manifest order.

This is the supported way to avoid rerunning already-passed roots.

## Evidence

Each child `figma:harness` invocation keeps its normal artifacts under:

```text
artifacts/figma-harness/
```

The wave orchestrator additionally writes:

```text
artifacts/figma-harness/reconciliation-*/wave-state.json
```

The wave state records each selected root as:

```text
PASS
FAILED
NOT_RUN
```

with its child process exit code.
