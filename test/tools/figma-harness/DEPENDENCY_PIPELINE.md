# Figma Dependency Pipeline

Use this runner after accepted planning changes update one or more canonical module inputs.

## Rule

```text
module changed
→ rebuild that module
→ rebuild every module that depends on it
```

Dependencies come from:

```text
docs/srs/figma-pipeline-dependencies.json
```

No separate patch/backfill list is allowed.

Dependents are rebuilt recursively, so transitive dependents are included automatically.

## Example

If only `Order` changes:

```text
Order
→ Aftersales
```

If `Catalog` changes and all later modules depend on it transitively:

```text
Catalog
→ Checkout
→ Account
→ Engagement
→ Content
→ Order
→ Aftersales
```

That is simply the dependency graph being rebuilt from the changed node.

## Run

```bash
npm run figma:pipeline -- \
  --graph docs/srs/figma-pipeline-dependencies.json \
  --figma "<Figma file/page reference>" \
  --changed Catalog \
  --max-repairs 3
```

Repeat `--changed` when multiple canonical modules changed.

Use `--dry-run` to print the rebuild order without touching Figma.

## Build behavior

The runner:

1. starts from the changed node(s);
2. follows dependent edges recursively;
3. deduplicates modules;
4. orders them by dependency;
5. runs one normal `figma:harness --mode write` lifecycle per module;
6. stops on first failure.

Each build reconciles the existing canonical Figma root. It does not create a replacement root.

The existing harness writer/reviewer/repair-budget lifecycle is unchanged.

## Planning boundary

Planning already decides what changed and patches canonical module docs.

Figma does not redo impact analysis:

```text
canonical module changed
→ rebuild from that node through its dependents
```

## Evidence

Child harness artifacts remain under:

```text
artifacts/figma-harness/
```

The pipeline also writes:

```text
artifacts/figma-harness/pipeline-*/pipeline-state.json
```

with the changed inputs and PASS / FAILED / NOT_RUN result for each rebuilt module.
