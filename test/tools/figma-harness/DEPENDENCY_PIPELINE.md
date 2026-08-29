# Figma Dependency Pipeline

Use this runner after accepted planning changes update one or more canonical module inputs.

## Rule

```text
module changed
→ lookup dependency graph
→ changed module + dependents
→ for each affected logical Module scope:
     resolve EXISTING flattened canonical surface set through figma-mcp-go
     ├── TARGET_NOT_FOUND / TARGET_AMBIGUOUS → STOP, no mutation
     └── TARGET_RESOLVED
          → review existing Figma Module scope
             ├── no changes needed → PASS, no mutation
             └── changes needed    → run normal writer/repair harness → fresh review
```

Dependencies come from:

```text
docs/srs/figma-pipeline-dependencies.json
```

Canonical Figma structure and semantic identity come from:

```text
.agents/design-base.md
```

No separate patch/backfill list or hard-coded Figma target registry is needed.

## Dependency graph selects Module scope

The dependency graph is about **logical Module dependencies**, not physical Figma nesting.

A node such as `Catalog` selects all canonical Figma representations owned by the Catalog Module.

The canvas is flattened at the Module-surface level, so this is valid:

```text
Catalog
→ Catalog Public
→ Catalog Admin
```

`Catalog Public` and `Catalog Admin` are sibling top-level roots with different surface responsibilities. They form one resolved Catalog Module scope and are not ambiguous.

Ambiguity is narrower:

```text
Catalog Public
Catalog Public v2
```

when both candidates claim the same `Catalog + Public` semantic responsibility, or semantic ownership cannot be established.

## Existing-scope rule

The dependency pipeline is an update/verify runner. It is not an init/rewrite runner.

Therefore the existing surface set required by the current canonical inputs must already be resolvable before the pipeline can decide whether the design needs an update.

Example:

```text
--changed Catalog
→ dependency lookup includes Catalog
→ MCP resolves Catalog-owned surfaces

Catalog Public + Catalog Admin resolved
→ TARGET_RESOLVED
→ review complete Catalog scope

no Catalog surface can be established
or a required existing Catalog surface is missing
→ TARGET_NOT_FOUND
→ STOP pipeline
→ do NOT create the missing surface from scratch

multiple roots compete for the same Catalog surface responsibility
→ TARGET_AMBIGUOUS
→ STOP pipeline
→ do NOT guess
```

A missing surface may be created only by a separate explicit init/rewrite instruction. Patch/update semantics never imply permission to initialize Figma.

## Figma routing

The dependency pipeline does not take a Figma URL or node id.

For each selected graph node it derives a semantic Module target from the Module id and scope. The child reviewer/writer uses `figma-mcp-go` to inspect the actual connected Figma artifact and locate the existing canonical surface-root set owned by that Module.

The target must satisfy the shared structural contract:

```text
dependency Module → one or more flattened canonical surface roots
surface roots may be siblings
canonical UI belongs only under the correct Module + Surface responsibility
semantic identity = Module + Surface + Use Case + Screen + State responsibility
```

Frame name or node id alone is not sufficient.

The review `summary` is also the machine-readable target-resolution handshake:

```text
TARGET_RESOLVED:   required existing Module surface set established
TARGET_NOT_FOUND:  no Module surface exists, or a required existing surface is missing
TARGET_AMBIGUOUS:  candidates compete for the same semantic surface / ownership cannot be resolved
```

The runner is fail-closed. If the target result is missing/unclassifiable, it stops instead of assuming the scope is safe to update.

`artifacts/figma-harness/**` remains execution evidence; it is not the canonical target registry.

## Example dependency lookup

If only `Order` changes:

```text
Order
→ Aftersales
```

Those logical Module scopes are checked in dependency order. The graph only says **what must be checked**; it does not say every surface must be mutated.

For each Module scope:

```text
MCP resolve existing canonical surface set
├── TARGET_NOT_FOUND / TARGET_AMBIGUOUS
│    → terminal failure
│    → no writer
│
└── TARGET_RESOLVED
     → figma:verify over complete Module scope
        ├── PASS              → leave Figma unchanged
        └── FAIL_VERIFICATION → figma:harness --mode write
                                 → mutate only affected semantic surface(s)
                                 → reviewer
                                 → repair if needed
                                 → PASS / terminal failure
```

## Run

```bash
npm run figma:pipeline -- \
  --graph docs/srs/figma-pipeline-dependencies.json \
  --changed Catalog \
  --max-repairs 3
```

Repeat `--changed` when multiple canonical modules changed.

Use `--dry-run` to print dependency lookup without accessing, reviewing, or mutating Figma.

## Runtime behavior

The runner:

1. starts from the changed node(s);
2. follows dependent edges recursively;
3. deduplicates logical Modules;
4. orders them by dependency;
5. derives each Module's semantic Figma scope from graph identity + `.agents/design-base.md`;
6. requires the child read-only harness to resolve the existing flattened surface set through `figma-mcp-go`;
7. reads the review artifact's target-resolution marker;
8. stops immediately on `TARGET_NOT_FOUND`, `TARGET_AMBIGUOUS`, or an unclassifiable resolution result;
9. runs normal design review only for `TARGET_RESOLVED` Module scopes;
10. updates only resolved Module scopes whose review returns `FAIL_VERIFICATION`;
11. requires the writer to mutate only the affected semantic surface(s) inside that resolved scope;
12. lets the normal write harness close every mutation with fresh review and the existing repair budget;
13. stops on the first target-resolution/review/update terminal failure.

A target-resolution failure, timeout, execution error, or other terminal review failure is not interpreted as "needs update".

## Planning boundary

Planning already decides what changed and patches canonical module docs.

Figma does not redo business impact analysis:

```text
canonical module changed
→ dependency lookup
→ MCP resolve affected EXISTING Module surface sets
→ missing/ambiguous required scope? STOP
→ otherwise review affected Module scopes
→ update only the semantic surfaces where review proves it is needed
```

## Evidence

Child harness artifacts remain under:

```text
artifacts/figma-harness/
```

The pipeline also writes:

```text
artifacts/figma-harness/pipeline-*/pipeline-state.json
```

with, per affected module:

```text
review = PASS | NEEDS_UPDATE | FAILED
updated = true | false
status = PASS | FAILED | NOT_RUN
```
