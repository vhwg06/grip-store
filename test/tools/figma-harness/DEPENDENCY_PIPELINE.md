# Figma Dependency Pipeline

Use this runner after accepted planning changes update one or more canonical Module inputs.

## Two separate contracts

The dependency graph and the patch intent are intentionally separate.

```text
dependency graph
= scope selector
= which logical Module scopes must be checked

active change context
= patch intent
= what accepted delta the child harness must verify/materialize
```

Do not encode patch reasons or business-impact semantics into dependency edges.

Dependencies come from:

```text
docs/srs/figma-pipeline-dependencies.json
```

Canonical Figma structure comes from:

```text
.agents/design-base.md
```

Patch/update behavior comes from:

```text
.agents/figma-pipeline-update.md
```

## Canonical flow

```text
accepted change context
+
original changed Module seed(s)
↓
dependency lookup
↓
changed Module + dependents
↓
for each logical Module:
  resolve EXISTING flattened canonical surface set through figma-mcp-go
  ├── TARGET_NOT_FOUND / TARGET_AMBIGUOUS
  │    → STOP, zero mutation
  │
  └── TARGET_RESOLVED
       → classify active change
          ├── CHANGE_VERIFIED
          │    → requested delta already represented
          │    → PASS, zero mutation
          │
          ├── CHANGE_NOT_APPLICABLE
          │    → dependency compatibility only
          │    → PASS, zero mutation
          │
          └── CHANGE_GAP
               → requested delta missing/incorrect here
               → FAIL_VERIFICATION
               → bounded child writer for this delta only
               → fresh independent review
               → must close with CHANGE_VERIFIED
```

A Module appearing in dependency closure is not permission for general Figma cleanup.

## Active change context

Every dependency run requires:

```text
--change <accepted delta label>
--change-doc <authoritative delta / impact document>
```

Repeat `--change-doc` only when more than one upstream document is needed to explain the same active delta.

The top-level orchestrator should derive these values from the current accepted planning checkpoint in the repository.

Example for Promotions:

```bash
npm run figma:pipeline -- \
  --graph docs/srs/figma-pipeline-dependencies.json \
  --changed Catalog \
  --change Promotions \
  --change-doc docs/srs/Promotions/05-promotions-impact-map-and-review.md \
  --max-repairs 3
```

Interpretation:

```text
--changed Catalog
= dependency lookup starts at Catalog

--change Promotions
+ Promotions impact-map/reconciliation context
= child harness knows the requested patch is Promotions
```

The runner passes the active change context to every child reviewer/writer together with that Module's current canonical docs.

## Change classification handshake

For every resolved Module, reviewer `summary` must begin with the normal target marker and also contain one active-change marker.

Examples:

```text
TARGET_RESOLVED: CHANGE_VERIFIED: Promotions — ...
```

```text
TARGET_RESOLVED: CHANGE_GAP: Promotions — ...
```

```text
TARGET_RESOLVED: CHANGE_NOT_APPLICABLE: Promotions — ...
```

Meanings:

- `CHANGE_VERIFIED`: requested delta is already represented; no writer.
- `CHANGE_GAP`: requested delta needs a direct repair/update here.
- `CHANGE_NOT_APPLICABLE`: Module is in closure but no direct delta applies; compatibility-only, no writer.

The runner is fail-closed if this classification is missing or unclassifiable.

## Writer permission

Only this state authorizes a writer:

```text
TARGET_RESOLVED
+
CHANGE_GAP: <active change>
+
figma:verify exit = FAIL_VERIFICATION
```

The following must never start a writer:

```text
TARGET_NOT_FOUND
TARGET_AMBIGUOUS
CHANGE_VERIFIED
CHANGE_NOT_APPLICABLE
missing change marker
review failure whose reason is unrelated to the active change
```

Unrelated pre-existing craft/spacing/copy/composition defects may be recorded as non-blocking observations but are not patch intent.

The writer may mutate only the active delta and defects directly caused by or blocking that delta on affected semantic surfaces.

No opportunistic:

```text
spacing cleanup
gallery tuning
copy polishing
old screen redesign
responsive maintenance
unrelated Figma QA fixes
```

## Fresh evidence after mutation

Child `figma:harness` exit `0` alone does not prove the requested patch was completed.

After the writer lifecycle, the top-level runner reads the child's fresh reviewer artifact and requires:

```text
TARGET_RESOLVED
+
CHANGE_VERIFIED: <active change>
```

(or a valid `CHANGE_NOT_APPLICABLE` when no direct delta remains).

Without fresh active-change evidence the Module is failed and later dependents remain `NOT_RUN`.

## Dependency graph selects logical Module scope

A node such as `Catalog` represents all canonical Figma representations owned by the Catalog Module.

The canvas is flattened at Module-surface level, so this is valid:

```text
Catalog
→ Catalog Public
→ Catalog Admin
```

Those sibling roots have different surface responsibilities and form one resolved Catalog scope.

Ambiguity is narrower, for example:

```text
Catalog Public
Catalog Public v2
```

when both claim the same `Catalog + Public` responsibility, or ownership cannot be established.

## Existing-scope rule

The dependency pipeline is update/verify only, not init/rewrite.

The existing surface set required by current canonical inputs must already be resolvable.

```text
TARGET_NOT_FOUND
→ STOP
→ do not create missing surface

TARGET_AMBIGUOUS
→ STOP
→ do not guess
```

A missing canonical root may be created only by a separate explicit init/rewrite task.

## Figma routing

The pipeline takes no Figma URL or node id.

For each selected graph node, child reviewer/writer resolves the actual existing canonical Module surface set through `figma-mcp-go` using:

```text
logical Module identity
+ .agents/design-base.md
+ current canonical Module inputs
+ actual connected Figma artifact
```

Semantic identity remains:

```text
Module
+ Surface responsibility
+ Use Case
+ Screen responsibility
+ State responsibility
```

Frame name or node id alone is insufficient.

Target-resolution summary markers remain:

```text
TARGET_RESOLVED:
TARGET_NOT_FOUND:
TARGET_AMBIGUOUS:
```

Local `artifacts/figma-harness/**` are execution evidence only, never a canonical target registry.

## Dependency lookup examples

If `Order` is the original changed Module:

```text
Order
→ Aftersales
```

If `Catalog` is the original changed Module under the current graph:

```text
Catalog
→ Checkout
→ Account
→ Engagement
→ Content
→ Order
→ Aftersales
```

That list says which Module scopes must be checked. It does **not** say that every Module requires a mutation.

## Completion semantics

`figma:pipeline` remains the top-level orchestration owner for the full dependency closure.

```text
figma:verify PASS
= one child verification result

figma:harness PASS
= one child writer/reviewer lifecycle result

figma:pipeline PASS
= every planned Module passed under the active change contract
```

A dependency run completes only when all planned nodes have `status = PASS` and the top-level process exits successfully.

Any `NOT_RUN` node means the closure is incomplete.

If a separately requested child repair occurs after a terminated pipeline, rerun the top-level pipeline from the original `--changed` seed(s) with the same active change context. Do not jump manually to the next dependency.

## Runtime behavior

The runner:

1. validates the dependency graph;
2. requires `--changed`, `--change`, and at least one `--change-doc`;
3. follows dependent edges recursively and orders logical Modules;
4. propagates the active change context to every child;
5. resolves each existing flattened Module surface set through `figma-mcp-go`;
6. reads target + active-change markers from the child review artifact;
7. passes resolved Modules with `CHANGE_VERIFIED` or `CHANGE_NOT_APPLICABLE` without mutation;
8. starts a writer only for `TARGET_RESOLVED + CHANGE_GAP + FAIL_VERIFICATION`;
9. lets the normal child harness own its bounded writer/repair lifecycle;
10. re-reads the fresh child reviewer artifact after mutation;
11. requires fresh `CHANGE_VERIFIED`/valid no-op evidence before proceeding;
12. stops on the first terminal target/change/review/update failure.

## Planning boundary

Planning decides the accepted change and patches canonical Module docs.

Figma does not redo domain/business impact analysis. It receives the accepted active change as execution context and answers only:

```text
within each dependency-selected Module scope,
is this accepted delta already represented,
not applicable,
or missing and requiring a bounded patch?
```

That is the whole dependency update model.

## Evidence

Pipeline state is written under:

```text
artifacts/figma-harness/pipeline-*/pipeline-state.json
```

It records the original changed seed(s), active change label/docs, and per-Module status.

Interpretation:

```text
all planned status = PASS → dependency pipeline completed
any FAILED              → dependency pipeline terminated
any NOT_RUN             → later closure was not executed
```
