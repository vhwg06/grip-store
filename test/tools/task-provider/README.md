# Task Provider

Task Provider is the single agent-facing orchestration entrypoint.

```bash
npm run task -- --task <task-id>
```

The caller provides only a task id. Task Provider resolves everything else.

## Resolution model

```text
Task id
→ tasks.json
→ pipeline config
→ workload factory
→ workload
   ├── resolver
   ├── policy
   └── shared execution lifecycle
→ resolved task package
→ harness / child agent
```

`run-task-provider.ts` is intentionally generic. New task families must not add task-specific branches there.

## Current Figma workload

Patch execution, Product Integration, and Product QA use the same workload:

```text
workload = figma
```

Patch pipeline:

```text
pipeline = figma
resolver = patch
policy = module-patch
```

Product Integration pipeline:

```text
pipeline = figma-integration
resolver = checkpoint
policy = product-integration
```

Product QA pipeline:

```text
pipeline = figma-product-qa
resolver = checkpoint
policy = product-qa
```

The difference is configuration/policy, not a different `run-xxx.ts` program.

## Workload factory

`workload-factory.ts` owns the mapping from workload type to implementation.

```text
figma
→ tools/task-provider/workloads/figma/
```

Add a new workload implementation only when its execution lifecycle is genuinely different.

Do not add a new workload merely for:

```text
Promotions
Membership
Business Solutions
another product patch
another checkpoint
another Figma review policy
```

Those are task/config/policy data.

## Figma shared lifecycle

The Figma workload owns one lifecycle:

```text
read-only review
→ policy classifies result
→ optional bounded writer
→ fresh independent review
→ execution evidence
```

The writer-capable harness itself may perform multiple bounded repair/review iterations. A repairable policy failure is therefore feedback into the loop, not automatically a terminal task failure.

Policies provide task-specific semantics.

### `module-patch`

```text
PATCH
  CHANGE_VERIFIED → PASS
  CHANGE_GAP      → writer allowed

COMPATIBILITY
  CHANGE_NOT_APPLICABLE → PASS
  CHANGE_GAP            → DOC_GAP, writer forbidden
```

### `product-integration`

```text
INTEGRATION_VERIFIED → PASS
INTEGRATION_GAP      → writer allowed
INTEGRATION_DOC_GAP  → STOP, writer forbidden
```

### `product-qa`

```text
QA_VERIFIED → PASS
QA_GAP      → bounded repair loop → fresh review
QA_DOC_GAP  → STOP, writer forbidden for undocumented behavior
```

Before `QA_GAP` may authorize mutation, the finding must pass the Product QA false-positive controls: authority/gate trace, fresh artifact evidence, material product impact, scope validity, semantic identity, product-vs-tooling distinction, and freshness after repair.

All policies remain fail-closed on `TARGET_NOT_FOUND` / `TARGET_AMBIGUOUS`.

## Agent-facing tasks

```bash
npm run task -- --task figma-p001-promotions
npm run task -- --task figma-p002-membership
npm run task -- --task figma-p003-business-solutions
npm run task -- --task figma-product-integration
npm run task -- --task figma-product-qa
```

The caller does not pass workload, resolver, policy, graph paths, Module docs, Figma node ids, stage order, or harness arguments.

## Product Integration checkpoint

`figma-product-integration` resolves:

```text
checkpoint = P003-business-solutions
→ full configured product scope
→ cumulative Module state at/before P003
→ product-integration-v1 stage plan
```

Cumulative state is:

```text
BASE stateDocs
+
all Module patch stateDocs with sequence <= checkpoint
```

It is not a synthetic `P004` patch.

## Internal D1-D8 integration plan

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

These are internal pipeline stages, not caller-owned task ids.

## Product QA checkpoint

`figma-product-qa` runs after Product Integration / Prototype and resolves the same final P003 checkpoint:

```text
checkpoint = P003-business-solutions
→ full configured product scope
→ cumulative Module state at/before P003
→ product-qa-v1 stage plan
```

Product QA is the final design gate before Core Harness architecture/build. It does not create `P004`, a new Module state, or a second product specification.

Canonical phase contract:

```text
docs/srs/product-qa-design-review.md
```

Operational reviewer/repair contract:

```text
.agents/figma-product-qa.md
```

## Evidence

```text
artifacts/task-provider/**
artifacts/figma-harness/**
```

Execution evidence is not canonical product authority.
