# Figma Pipeline Dependency Update Contract

This file is an execution contract for updating canonical Figma after accepted planning documents change.

It is not product/domain authority.

## Core rule

```text
module changed
→ rebuild that module
→ rebuild every module that depends on it
```

Use the declared Figma dependency graph. Do not maintain a separate patch list.

Dependents are rebuilt recursively, so transitive dependents are included automatically.

## Existing Figma remains canonical

Rebuild means reconcile the existing canonical Figma root against its current module docs and updated dependency context.

Do not create a replacement Module root merely because the module is being rebuilt.

Repeated execution must reconcile by semantic identity:

```text
owning Module
+ Use Case
+ Screen responsibility
+ State responsibility
```

## Execution

For every node selected by the dependency graph, run one normal:

```text
figma:harness --mode write
```

The existing writer → review → repair-budget lifecycle remains unchanged.

The pipeline runs nodes in dependency order and stops on the first failure. Dependents of a failed node do not run.

The pipeline must not:

- rebuild modules outside the changed node's dependent closure;
- run the same module twice in one pipeline execution;
- reset a failed module's repair budget automatically;
- create duplicate canonical Figma roots.

## Planning / Figma boundary

Planning decides and patches canonical module documents.

Figma only needs to know which canonical module documents changed:

```text
canonical module changed
→ rebuild that module + dependents
```

No extra Figma impact analysis is required.
