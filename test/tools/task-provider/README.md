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

## Registries

`tasks.json` maps an agent-facing task id to an internal pipeline + product patch.

Example:

```text
figma-p001-promotions
→ pipeline = figma
→ patch = P001-promotions
```

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
