# Task Provider Contract

The Task Provider is the outer task-resolution layer for repository pipelines.

Agents should receive **resolved tasks**, not reconstruct dependency scope, document state, patch intent, or execution arguments themselves.

## Core model

```text
user / coordinator intent
→ Task Provider
→ pipeline config
→ pipeline dependency graph
→ Module patch graphs
→ resolved task package
→ pipeline executor
→ child agent / harness
```

The provider owns resolution. The executor owns execution. The agent consumes the resolved task.

## Invocation boundary

For a Figma product patch, the public entrypoint is:

```bash
npm run task -- --pipeline figma --patch P001-promotions
```

The caller does **not** provide:

```text
dependency graph path
changed Module seed
change-doc list
Module docs
Figma URL
Figma node id
per-Module patch/compatibility mode
```

Those are resolved from repository-owned configuration and Module graphs.

`figma:pipeline` is an internal executor and accepts only a Task Provider package:

```text
figma:pipeline --task <resolved-task.json>
```

Do not bypass the provider for dependency patch work.

## Pipeline configuration

A pipeline config owns the resources required to resolve that pipeline:

```text
pipeline id
executor
dependency graph
patch registry
Module graph locations
default execution budget
```

For Figma this lives at:

```text
tools/task-provider/pipelines/figma.json
```

The pipeline dependency graph remains **scope-only**. It does not own docs, patch reasons, writer intent, or product semantics.

## Module patch graph

Each Module owns its own state evolution:

```text
BASE
↓
P001
↓
P002
↓
...
```

A Module patch node contains:

```text
patch id
parent Module state
authoritative task document
resulting desired-state documents
```

A Module without a node for the requested product patch does not receive an invented patch. The provider resolves its latest earlier state and emits a compatibility task.

## Task resolution

For requested patch `Pxxx`:

1. load the pipeline dependency graph;
2. load every Module graph configured for that pipeline;
3. find Modules that contain a direct `Pxxx` patch node;
4. use those direct patch Modules as the dependency lookup roots;
5. compute the union dependent closure in dependency order;
6. resolve each Module independently at `Pxxx`;
7. emit exactly one task per affected Module:

```text
PATCH
or
COMPATIBILITY
```

### PATCH

The Module has a direct patch node for `Pxxx`.

The task package supplies only the Module patch task + resulting desired state required to execute/verify that transition.

### COMPATIBILITY

The Module is in dependency closure but has no direct patch node for `Pxxx`.

The task package supplies the Module's latest state at or before `Pxxx` and authorizes verification only.

If execution discovers that the Module actually requires a direct change:

```text
DOC_GAP
→ STOP
→ add/fix the Module patch node in docs first
```

Never let an agent manufacture an undocumented Module patch from dependency reachability alone.

## Fail-closed rules

Task resolution must stop when:

```text
requested patch is unknown
requested patch is not activated in any Module graph
pipeline config and dependency graph disagree on Modules
Module patch parent chain is invalid
resolved input document is missing
```

Execution must stop when the resolved task cannot be honored exactly.

## Evidence

Resolved task packages are execution evidence and are written under:

```text
artifacts/task-provider/
```

They are not product/domain authority. Canonical authority remains the Module patch graphs and their referenced docs.
