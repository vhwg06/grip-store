# Task Provider

The Task Provider is the agent-facing orchestration boundary.

Agents request a task by id. They do not select or configure the execution pipeline directly.

```text
Agent
→ Task Provider
→ resolve task definition
→ resolve pipeline + pipeline-owned resolver
→ resolve product patch or product checkpoint
→ resolve pipeline-owned dependency/state inputs
→ emit resolved task package
→ dispatch pipeline executor
```

## Agent-facing commands

Product patch execution:

```bash
npm run task -- --task figma-p001-promotions
npm run task -- --task figma-p002-membership
npm run task -- --task figma-p003-business-solutions
```

Product Integration / Prototype after the current design checkpoint:

```bash
npm run task -- --task figma-product-integration
```

The agent MUST NOT pass:

```text
pipeline id
resolver id
product patch/checkpoint id
dependency graph path
changed Module seeds
Figma URL/node ids
patch document paths
Module graph paths
Module desired-state paths
integration stage ids/order
resolver arguments
```

Those are provider/pipeline-owned concerns.

## Task registry

`tasks.json` is the agent-facing routing registry.

Patch task:

```text
figma-p001-promotions
→ pipeline = figma
→ patch = P001-promotions
```

Integration task:

```text
figma-product-integration
→ pipeline = figma-integration
→ checkpoint = P003-business-solutions
```

The Task Provider resolves the internal pipeline from the task definition. The caller does not pass `--pipeline`.

A checkpoint is not a synthetic product patch. It means: resolve every Module to its latest canonical state at or before that product patch, then execute the selected pipeline against that product state.

## Pipeline registry

`pipelines/figma.json` owns patch execution configuration:

```text
resolver = figma-patch
executor = figma:pipeline
dependency graph
patch registry
Module graph locations
default repair budget
```

`patches.json` names product-evolution patches. Each Module graph independently resolves what that patch means for that Module.

`pipelines/figma-integration.json` owns product integration configuration:

```text
resolver = figma-integration
executor = figma:integration
product dependency graph
patch registry
Module graph locations
stage plan
default repair budget
```

The integration resolver reuses canonical Module state history. It does not add a `P004` integration patch or modify Module graph semantics.

## Product integration plan

The pipeline-owned plan lives at:

```text
tools/task-provider/plans/figma-product-integration.json
```

Current internal DAG:

```text
D1 Flow Inventory
→ D2 Screen Integration
→ D3 Interaction Wiring
→ D4 State Coverage
  + D5 Cross-Module Integration
  + D6 Responsive Integration
→ D7 Prototype Validation
→ D8 Integration Handoff
```

These are internal execution stages. The caller still requests only `figma-product-integration`.

## Ownership boundaries

```text
Task Provider
= resolve what task the agent is asking to execute

Pipeline config
= select resolver + executor + pipeline-owned inputs

Patch resolver
= resolve exact product patch + dependency closure + PATCH/COMPATIBILITY tasks

Integration resolver
= resolve full product checkpoint + current Module states + internal stage plan

Harness/executor
= execute/verify the already-resolved task boundary
```

The harness must not rediscover task intent from a large bag of canonical documents.

## Fail-closed behavior

Patch tasks retain the existing PATCH/COMPATIBILITY rules.

Product integration additionally fails closed when:

```text
checkpoint does not resolve the full configured product scope
stage plan is invalid/cyclic
required resolved input docs are missing
canonical Figma target is missing/ambiguous
integration requires undocumented behavior/state
fresh review does not explicitly verify Product Integration / Prototype
```

Integration execution is review-first. Writer mutation is permitted only after a resolved target returns a documented `INTEGRATION_GAP`; `INTEGRATION_DOC_GAP` is planning failure and forbids mutation.
