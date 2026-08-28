# Figma Dependency Pipeline

Use this runner when canonical Figma has already progressed through multiple modules and one or more canonical module planning inputs change.

The runner does not use a manual patch/verify list.

It treats the Figma module pipeline as a dependency graph.

## Architecture

```text
changed module node(s)
      ↓
reverse dependency closure
      ↓
stale node set
      ↓
topological order
      ↓
one normal figma:harness lifecycle per stale node
```

`figma:harness` remains the single-root lifecycle primitive and keeps its existing repair-budget and fresh-review semantics unchanged.

## Dependency meaning

`dependsOn` is a Figma pipeline dependency, not a statement of aggregate ownership.

If node `B` depends on node `A`, then a material planning/design change to `A` invalidates `B` because `B` was designed against `A`'s product/UI context.

Example:

```text
Catalog changed
→ Checkout stale because Checkout depends on Catalog
→ Account stale if it depends on Checkout
→ continue only along declared edges
```

An unrelated node with no dependency path from the changed node remains clean and is skipped.

## Current graph

The current graph is:

```text
docs/srs/figma-pipeline-dependencies.json
```

Its current topological module order is:

```text
Catalog
→ Checkout
→ Account
→ Engagement
→ Content
→ Order
→ Aftersales
```

This order emerges from declared dependencies; the runner validates the graph is acyclic.

The graph is the orchestration source of truth for invalidation. Do not hard-code a separate backfill list in the runner.

## Changed nodes

The planning phase remains responsible for patching canonical module docs.

After that patch, tell the Figma pipeline which canonical module inputs changed:

```bash
npm run figma:pipeline -- \
  --graph docs/srs/figma-pipeline-dependencies.json \
  --figma "<Figma file/page reference>" \
  --changed Catalog \
  --changed Checkout \
  --max-repairs 3 \
  --dry-run
```

The changed set is only the invalidation seed.

The runner computes all downstream stale nodes from the dependency graph.

## Example invalidation

If only `Order` changed:

```text
Order
→ Aftersales
```

Only those two nodes rerun.

If `Catalog` changed and every later module is reachable from it through the current graph, the correct result is:

```text
Catalog
→ Checkout
→ Account
→ Engagement
→ Content
→ Order
→ Aftersales
```

In that case going back through the full downstream pipeline is correct because dependency invalidation requires it, not because the harness blindly rewinds to module 1.

## Node inputs

Each graph node lists only that module's current canonical planning set.

Vertical capability documents are first reconciled into affected canonical module planning docs during the planning phase. The Figma pipeline consumes the resulting module docs rather than re-performing vertical capability impact analysis.

The pipeline additionally supplies:

```text
.agents/figma-pipeline-update.md
```

which explains why the node is being revisited and requires canonical in-place reconciliation.

## Execution

Run without `--dry-run` to execute stale nodes:

```bash
npm run figma:pipeline -- \
  --graph docs/srs/figma-pipeline-dependencies.json \
  --figma "<Figma file/page reference>" \
  --changed Order \
  --max-repairs 3
```

For every stale node:

```text
existing canonical Figma
+ current module docs
+ updated dependency context
→ normal writer/review lifecycle
```

A dependency-invalidated node may need no visual mutation after inspection. It still needs the fresh review that closes its stale state.

## Failure behavior

The pipeline stops immediately when a stale node fails its child harness lifecycle.

It does not:

- continue into downstream stale nodes;
- automatically reset repair budget;
- automatically open a new writer lifecycle;
- rerun nodes outside the stale dependency closure.

## Evidence

Child lifecycles retain their normal artifacts under:

```text
artifacts/figma-harness/
```

The pipeline runner also records:

```text
artifacts/figma-harness/pipeline-*/pipeline-state.json
```

including changed seeds, invalidation reason, PASS/FAILED/NOT_RUN, and exit code for each stale node.
