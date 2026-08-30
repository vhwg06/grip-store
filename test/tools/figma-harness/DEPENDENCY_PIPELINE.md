# Figma Dependency Pipeline

The Figma dependency runner is an **executor**, not a resolver.

## Public entrypoint

Use Task Provider:

```bash
npm run task -- --pipeline figma --patch P001-promotions
```

Task Provider resolves:

```text
pipeline config
→ scope-only dependency graph
→ Module patch graphs
→ direct patch Module set
→ union dependent closure
→ ordered PATCH / COMPATIBILITY Module tasks
→ resolved task package
```

Then it invokes the internal executor:

```text
figma:pipeline --task <resolved-task.json>
```

Do not call dependency patch execution with manually assembled `--graph`, `--changed`, `--change`, `--change-doc`, docs, or Figma node arguments.

## Scope-only dependency graph

`docs/srs/figma-pipeline-dependencies.json` answers only:

```text
which later logical Module scopes depend on this Module?
```

It does not own docs or patch semantics.

The direct dependency roots for a product patch are derived from Module graphs: every Module containing the requested patch node is a direct patch Module. Task Provider builds the union dependent closure and preserves dependency order.

## Module resolver

Each Module owns `module-graph.json`:

```text
BASE
→ P001
→ P002
→ ...
```

A patch node owns:

```text
parent state
authoritative task doc
resulting desired-state docs
```

Task Provider resolves the Module independently at the requested product patch.

### Direct node exists

```text
mode = PATCH
inputs = patch task + resulting desired state
```

### Direct node does not exist

```text
mode = COMPATIBILITY
state = latest Module state before/at requested patch
writer = forbidden
```

If compatibility review reveals a required direct change, the result is `DOC_GAP`; docs/module graph must be fixed first.

## Runtime behavior

For each resolved Module task:

```text
resolve existing Figma Module surface set
↓
TARGET_RESOLVED
├── PATCH
│   ├── CHANGE_VERIFIED       → PASS, no mutation
│   └── CHANGE_GAP            → writer → fresh CHANGE_VERIFIED
│
└── COMPATIBILITY
    ├── CHANGE_NOT_APPLICABLE → PASS, no mutation
    └── CHANGE_GAP            → DOC_GAP → STOP, no writer
```

Target failures stop before any writer:

```text
TARGET_NOT_FOUND
TARGET_AMBIGUOUS
UNKNOWN target resolution
```

## Mutation boundary

A PATCH writer may change only the provider-resolved patch delta and defects directly caused by or blocking that delta.

The dependency closure is not general cleanup scope. Existing unrelated layout, spacing, copy, responsive, composition, gallery, or craft issues cannot trigger mutation.

## Flattened Figma routing

Dependency Module identity is logical, not one physical root.

Example:

```text
Catalog logical Module
→ Catalog Public
→ Catalog Admin
```

Distinct Public/Admin roots form one resolved Catalog scope.

Ambiguity exists only when candidates compete for the same `Module + Surface responsibility`, or ownership cannot be established.

Figma routing uses `figma-mcp-go` plus `.agents/design-base.md`. No hard-coded Figma URL/node registry is used.

## Completion

Child `figma:verify` / `figma:harness` results are local.

A provider task completes only when:

```text
all resolved Module tasks PASS
+
figma:pipeline exits 0
+
Task Provider executor call exits 0
```

Any failed Module stops later tasks. Any later `NOT_RUN` means the closure is incomplete.

## Evidence

Task Provider package:

```text
artifacts/task-provider/*.json
```

Pipeline state:

```text
artifacts/figma-harness/pipeline-*/pipeline-state.json
```

Both are execution evidence only. Module graphs and referenced planning docs remain canonical authority.
