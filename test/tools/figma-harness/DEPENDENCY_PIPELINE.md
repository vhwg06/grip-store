# Figma Dependency Pipeline

Use this runner after accepted planning changes update one or more canonical module inputs.

## Rule

```text
module changed
→ lookup dependency graph
→ changed module + dependents
→ for each affected module:
     resolve EXISTING canonical Module root through figma-mcp-go
     ├── TARGET_NOT_FOUND / TARGET_AMBIGUOUS → STOP, no mutation
     └── TARGET_RESOLVED
          → review existing Figma
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

## Existing-root rule

The dependency pipeline is an update/verify runner. It is not an init/rewrite runner.

Therefore every selected Module root must already exist before the pipeline can decide whether the design needs an update.

Example:

```text
--changed Catalog
→ dependency lookup includes Catalog
→ MCP lookup Catalog

Catalog root exists uniquely
→ TARGET_RESOLVED
→ review

Catalog root missing
→ TARGET_NOT_FOUND
→ STOP pipeline
→ do NOT create Catalog from scratch

Catalog cannot be resolved uniquely
→ TARGET_AMBIGUOUS
→ STOP pipeline
→ do NOT guess
```

A missing root may be created only by a separate explicit init/rewrite instruction. Patch/update semantics never imply permission to initialize Figma.

## Figma routing

The dependency pipeline does not take a Figma URL or node id.

For each selected graph node it derives a semantic target from the Module id and scope, then the child reviewer/writer uses `figma-mcp-go` to inspect the actual connected Figma artifact and locate the unique existing canonical Module root.

The target must satisfy the shared structural contract:

```text
each product Module owns one independent top-level canvas root
Module roots are siblings
canonical UI belongs only under its owning Module
semantic identity = Module + Use Case + Screen responsibility + State responsibility
```

Frame name or node id alone is not sufficient.

The review `summary` is also the machine-readable target-resolution handshake:

```text
TARGET_RESOLVED:   unique existing canonical root established
TARGET_NOT_FOUND:  no existing canonical root exists
TARGET_AMBIGUOUS:  unique semantic resolution failed
```

The runner is fail-closed. If the target result is missing/unclassifiable, it stops instead of assuming the root is safe to update.

`artifacts/figma-harness/**` remains execution evidence; it is not the canonical target registry.

## Example dependency lookup

If only `Order` changes:

```text
Order
→ Aftersales
```

Those roots are then checked in dependency order. The graph only says **what must be checked**; it does not say both roots must be mutated.

For each root:

```text
MCP resolve existing canonical root
├── TARGET_NOT_FOUND / TARGET_AMBIGUOUS
│    → terminal failure
│    → no writer
│
└── TARGET_RESOLVED
     → figma:verify
        ├── PASS              → leave Figma unchanged
        └── FAIL_VERIFICATION → figma:harness --mode write
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
3. deduplicates modules;
4. orders them by dependency;
5. derives each module's semantic Figma target from graph identity + `.agents/design-base.md`;
6. requires the child read-only harness to resolve and validate the existing canonical root through `figma-mcp-go`;
7. reads the review artifact's target-resolution marker;
8. stops immediately on `TARGET_NOT_FOUND`, `TARGET_AMBIGUOUS`, or an unclassifiable resolution result;
9. runs normal design review only for `TARGET_RESOLVED` roots;
10. updates only resolved roots whose review returns `FAIL_VERIFICATION`;
11. lets the normal write harness close every mutation with fresh review and the existing repair budget;
12. stops on the first target-resolution/review/update terminal failure.

A target-resolution failure, timeout, execution error, or other terminal review failure is not interpreted as "needs update".

## Planning boundary

Planning already decides what changed and patches canonical module docs.

Figma does not redo business impact analysis:

```text
canonical module changed
→ dependency lookup
→ MCP resolve affected EXISTING canonical roots
→ missing/ambiguous root? STOP
→ otherwise review affected roots
→ update only where review proves it is needed
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
