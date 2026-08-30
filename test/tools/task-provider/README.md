# Task Provider

The Task Provider is the agent-facing orchestration boundary.

Agents request a task by id. They do not select or configure the execution pipeline directly.

```text
Agent
→ Task Provider
→ resolve task definition
→ resolve pipeline
→ resolve product patch/version
→ resolve pipeline-owned dependency graph
→ resolve each Module graph/state/patch
→ emit resolved task package
→ dispatch pipeline executor
```

## Agent-facing command

```bash
npm run task -- --task figma-p001-promotions
```

The agent MUST NOT pass:

```text
pipeline id
dependency graph path
changed Module seeds
Figma URL/node ids
patch document paths
Module graph paths
Module desired-state paths
resolver arguments
```

Those are provider/pipeline-owned concerns.

## Task registry

`tasks.json` is the agent-facing routing registry.

```text
figma-p001-promotions
→ pipeline = figma
→ patch = P001-promotions
```

The Task Provider resolves the internal pipeline from the task definition. The caller does not pass `--pipeline`.

## Pipeline registry

`pipelines/figma.json` owns the Figma execution configuration:

```text
executor
dependency graph
patch registry
Module graph locations
default repair budget
```

`patches.json` names product-evolution patches. Each Module graph independently resolves what that patch means for that Module.

## Ownership boundaries

```text
Task Provider
= resolve what task the agent is asking to execute

Pipeline config
= resolve execution machinery for that task type

Dependency graph
= resolve affected logical Module scope

Module graph/resolver
= resolve exact Module state + Module patch for the product patch

Harness
= execute/verify the already-resolved Module transition
```

The harness must not rediscover task intent from a large bag of canonical documents.
