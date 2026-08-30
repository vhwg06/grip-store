# Task Provider Contract

The Task Provider is the outer task-resolution layer for repository pipelines.

Agents request a **task id**. They do not reconstruct pipeline choice, dependency scope, document state, patch intent, or execution arguments themselves.

## Core model

```text
agent intent
→ task id
→ Task Provider
→ task registry
→ pipeline config + product patch
→ pipeline dependency graph
→ Module patch graphs
→ resolved task package
→ pipeline executor
→ child agent / harness
```

The provider owns resolution. The executor owns execution. Child agents consume resolved Module tasks.

## Agent-facing boundary

For the current Promotions Figma task:

```bash
npm run task -- --task figma-p001-promotions
```

The agent does **not** provide:

```text
pipeline id
product patch id
dependency graph path
changed Module seed
change-doc list
Module graph paths
Module docs
Figma URL/node id
per-Module PATCH/COMPATIBILITY mode
resolver arguments
```

Those are repository-owned routing concerns.

## Task registry

`tools/task-provider/tasks.json` maps an agent-facing task id to internal routing:

```text
figma-p001-promotions
→ pipeline = figma
→ patch = P001-promotions
```

Adding another execution task is a provider/configuration decision, not a larger agent command.

## Pipeline configuration

After task lookup, the selected pipeline config owns:

```text
executor
dependency graph
patch registry
Module graph locations
default execution budget
```

For Figma:

```text
tools/task-provider/pipelines/figma.json
```

The pipeline dependency graph remains **scope-only**. It does not own docs, patch reasons, writer intent, or product semantics.

`figma:pipeline` is an internal executor and accepts only:

```text
--task <Task Provider resolved package>
```

Do not bypass Task Provider for dependency patch work.

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

A Module without a node for the selected product patch does not receive an invented patch. The provider resolves its latest earlier state and emits a compatibility task.

## Task resolution

After `task id → pipeline + patch` is resolved:

1. load the selected pipeline dependency graph;
2. load every Module graph configured for that pipeline;
3. find Modules that contain the direct product patch node;
4. use those direct patch Modules as dependency lookup roots;
5. compute the union dependent closure in dependency order;
6. resolve each Module independently at that product patch;
7. emit exactly one task per affected Module:

```text
PATCH
or
COMPATIBILITY
```

### PATCH

The Module has a direct patch node.

The resolved package supplies only the Module patch task + resulting desired state required to execute/verify that transition.

### COMPATIBILITY

The Module is in dependency closure but has no direct patch node.

The package supplies the Module's latest earlier state and authorizes verification only.

If execution discovers that the Module actually requires a direct change:

```text
DOC_GAP
→ STOP
→ add/fix the Module patch node in docs first
→ resolve a fresh task package
```

Never let an agent manufacture an undocumented Module patch from dependency reachability alone.

## Fail-closed rules

Task resolution must stop when:

```text
task id is unknown / ambiguous
task routing is incomplete
selected patch is unknown
selected patch is not activated in any Module graph
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

They are not product/domain authority. Canonical authority remains task/pipeline configuration, Module patch graphs, and their referenced planning docs.
