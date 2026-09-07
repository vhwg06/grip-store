# Task Provider Contract

The Task Provider is the outer task-resolution layer for repository pipelines.

Agents request a **task id**. They do not reconstruct pipeline choice, dependency scope, document state, patch/checkpoint intent, stage plan, or execution arguments themselves.

## Core model

```text
agent intent
→ task id
→ Task Provider
→ task registry
→ pipeline config + pipeline-owned resolver
→ product patch OR product checkpoint
→ canonical dependency / Module state resolution
→ resolved task package
→ pipeline executor
→ child agent / harness
```

The provider owns resolution. The executor owns execution. Child agents consume resolved task boundaries.

## Agent-facing boundary

Patch tasks:

```bash
npm run task -- --task figma-p001-promotions
npm run task -- --task figma-p002-membership
npm run task -- --task figma-p003-business-solutions
```

Product Integration / Prototype:

```bash
npm run task -- --task figma-product-integration
```

The agent does **not** provide:

```text
pipeline id
resolver id
product patch/checkpoint id
dependency graph path
changed Module seed
change-doc list
Module graph paths
Module docs
Figma URL/node id
per-Module PATCH/COMPATIBILITY mode
integration stage ids/order
resolver arguments
```

Those are repository-owned routing concerns.

## Task registry

`tools/task-provider/tasks.json` maps an agent-facing task id to internal routing.

Patch example:

```text
figma-p001-promotions
→ pipeline = figma
→ patch = P001-promotions
```

Integration example:

```text
figma-product-integration
→ pipeline = figma-integration
→ checkpoint = P003-business-solutions
```

Adding another execution task is a provider/configuration decision, not a larger agent command.

A checkpoint is state-selection authority, not a new product patch. It resolves each Module to its latest state at or before the selected product patch.

## Pipeline configuration

The selected pipeline config owns:

```text
resolver
executor
dependency graph
patch registry
Module graph locations
default execution budget
pipeline-specific inputs
```

For product patch Figma:

```text
tools/task-provider/pipelines/figma.json
resolver = figma-patch
executor = figma:pipeline
```

For Product Integration / Prototype:

```text
tools/task-provider/pipelines/figma-integration.json
resolver = figma-integration
executor = figma:integration
stage plan = tools/task-provider/plans/figma-product-integration.json
```

The caller never chooses the resolver directly.

## Product patch resolution

For a patch task, preserve the existing Module patch model:

```text
BASE
↓
P001
↓
P002
↓
...
```

Each Module patch node contains:

```text
patch id
parent Module state
authoritative task document
resulting desired-state documents
```

After `task id → pipeline + patch` is resolved:

1. load the selected pipeline dependency graph;
2. load every Module graph configured for that pipeline;
3. find Modules that contain the direct product patch node;
4. use those direct patch Modules as dependency lookup roots;
5. compute the union dependent closure in dependency order;
6. resolve each Module independently at that product patch;
7. emit exactly one task per affected Module as `PATCH` or `COMPATIBILITY`.

Dependency reachability never authorizes an invented Module patch.

## Product integration resolution

Product Integration / Prototype is not `P004` and must not modify Module graph history merely to represent a design lifecycle phase.

For the integration task:

```text
task id
→ figma-integration pipeline
→ checkpoint = P003-business-solutions
→ validate patch registry + every Module graph
→ resolve the checkpoint through the existing patch resolver
→ require the dependency closure to cover the full configured product scope
→ project every Module to its latest state at/before the checkpoint
→ attach the pipeline-owned integration stage plan
→ emit one resolved product integration package
```

The internal plan is:

```text
D1 Flow Inventory
        ↓
D2 Screen Integration
        ↓
D3 Interaction Wiring
        ↓
 ┌──────┼──────────┐
 ↓      ↓          ↓
D4     D5         D6
State  Cross      Responsive
       Module
 └──────┼──────────┘
        ↓
D7 Prototype Validation
        ↓
D8 Integration Handoff
```

These stages are provider/pipeline-owned. The agent must not call them as ad-hoc task ids or reorder them manually.

The integration package contains current Module **state docs**, not direct patch-task mutation authority. It therefore cannot manufacture a new business delta during integration.

## Integration execution boundary

`.agents/figma-product-integration.md` owns integration semantics.

`figma:integration` is review-first:

```text
resolve existing canonical full-product target
↓
read-only verification
├── INTEGRATION_VERIFIED → PASS, zero mutation
├── INTEGRATION_GAP      → bounded writer → fresh review
└── INTEGRATION_DOC_GAP  → STOP, writer forbidden
```

Target routing remains fail-closed:

```text
TARGET_NOT_FOUND
TARGET_AMBIGUOUS
→ STOP
→ writer forbidden
```

Writer permission covers only documented product integration/prototype continuity. It is not permission for unrelated redesign, new behavior, or general cleanup.

## Fail-closed rules

Task resolution must stop when:

```text
task id is unknown / ambiguous
task routing is incomplete
pipeline resolver is unsupported
selected patch/checkpoint is unknown
selected patch is not activated in any Module graph
pipeline config and dependency graph disagree on Modules
Module patch parent chain is invalid
integration checkpoint does not resolve the full configured product scope
integration stage plan is invalid/cyclic
resolved input document is missing
```

Execution must stop when the resolved task cannot be honored exactly.

For integration, undocumented behavior/state is `INTEGRATION_DOC_GAP`; writer mutation is forbidden until planning authority is fixed.

## Evidence

Resolved task packages are execution evidence and are written under:

```text
artifacts/task-provider/
```

Figma harness and integration executor evidence remain under:

```text
artifacts/figma-harness/
```

They are not product/domain authority. Canonical authority remains task/pipeline configuration, Module patch graphs, their referenced planning docs, and the actual canonical Figma artifact.
