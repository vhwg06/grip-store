# Task Provider Contract

The Task Provider is the single agent-facing execution entrypoint for repository workflows.

Agents request a **task id**. They do not reconstruct workload type, resolver/policy choice, dependency scope, document state, patch/checkpoint intent, stage plan, or execution arguments themselves.

## Core model

```text
agent intent
→ task id
→ Task Provider
→ task registry
→ pipeline config
→ workload factory
→ workload
   ├── resolver
   ├── execution policy
   └── shared workload lifecycle
→ resolved task package
→ harness / child agent
```

`run-task-provider.ts` is generic. It must not grow `if workload === ...` branches for each new task family.

A workload owns execution semantics. Resolver and policy variants inside the same workload are selected from configuration.

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

The caller does **not** provide:

```text
workload type
resolver id
policy id
product patch/checkpoint id
dependency graph path
changed Module seed
change-doc list
Module graph paths
Module docs
Figma URL/node id
per-Module PATCH/COMPATIBILITY mode
integration stage ids/order
harness arguments
```

Those are repository-owned routing concerns.

## Task registry

`tools/task-provider/tasks.json` maps task id to a pipeline plus the task-specific selector.

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

Tasks are data. Promotions, Membership, and Business Solutions do not require separate executor implementations.

## Pipeline configuration

Pipeline config chooses execution semantics:

```text
workload
resolver
policy
dependency graph
patch registry
Module graph locations
default execution budget
pipeline-specific inputs
```

Figma patch config:

```text
tools/task-provider/pipelines/figma.json

workload = figma
resolver = patch
policy   = module-patch
```

Figma Product Integration config:

```text
tools/task-provider/pipelines/figma-integration.json

workload = figma
resolver = checkpoint
policy   = product-integration
stagePlan = tools/task-provider/plans/figma-product-integration.json
```

Both use the same Figma workload implementation and the same review/write/fresh-review lifecycle.

## Workload factory boundary

`tools/task-provider/workload-factory.ts` maps a workload type to its implementation.

```text
workload = figma
→ Figma workload
```

Add a new workload implementation only when execution lifecycle semantics are genuinely different.

Do **not** add a new workload for:

```text
new product patch
new capability name
new checkpoint
new Figma review policy
```

Those should normally be expressed as task/config/resolver/policy data inside the existing workload.

## Figma workload decomposition

The Figma workload is split into:

```text
resolver
├── patch
└── checkpoint

execution policy
├── module-patch
└── product-integration

shared executor
└── review
    → classify
    → optional writer
    → fresh independent review
    → evidence
```

The lifecycle is implemented once under `tools/task-provider/workloads/figma/`.

### Patch resolver + module-patch policy

Patch resolution preserves Module-local state history:

```text
BASE
→ P001
→ P002
→ ...
```

Task Provider:

1. finds direct Module patch nodes;
2. computes dependency closure;
3. resolves each Module to `PATCH` or `COMPATIBILITY`;
4. supplies exact task/state docs.

`PATCH` may mutate only after:

```text
TARGET_RESOLVED
+ CHANGE_GAP
+ FAIL_VERIFICATION
```

`COMPATIBILITY` never mutates. If compatibility requires a direct change:

```text
CHANGE_GAP
→ DOC_GAP
→ STOP
```

### Checkpoint resolver + product-integration policy

Product Integration / Prototype is not `P004`.

```text
figma-product-integration
→ checkpoint = P003-business-solutions
→ require full configured product scope
→ project each Module to cumulative canonical state at/before P003
→ attach D1-D8 stage plan
```

Cumulative state input means:

```text
BASE stateDocs
+
all Module patch stateDocs with sequence <= checkpoint
```

Patch `taskDoc` is not promoted into new mutation authority.

Integration is review-first:

```text
TARGET_RESOLVED + INTEGRATION_VERIFIED
→ PASS, zero mutation

TARGET_RESOLVED + INTEGRATION_GAP + FAIL_VERIFICATION
→ bounded writer
→ fresh review

INTEGRATION_DOC_GAP
TARGET_NOT_FOUND
TARGET_AMBIGUOUS
→ STOP
→ writer forbidden
```

## Product Integration internal DAG

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

These are internal pipeline stages, not agent-facing task ids.

## Fail-closed rules

Stop when:

```text
task id is unknown / ambiguous
pipeline config is invalid
workload type is unsupported
resolver/policy combination is unsupported
selected patch/checkpoint is unknown
Module patch parent chain is invalid
pipeline/dependency graph disagree
checkpoint does not resolve full product scope
stage plan is invalid/cyclic
resolved input document is missing
review classification is invalid
fresh verification fails
repair budget is exhausted
```

Never fall back to an ad-hoc runner or manually reconstruct the pipeline.

## Evidence

Resolved task packages:

```text
artifacts/task-provider/**
```

Figma workload/harness evidence:

```text
artifacts/figma-harness/**
```

Execution evidence is not product/domain authority. Canonical authority remains task/pipeline configuration, Module graphs and planning documents, plus the actual canonical Figma artifact.
