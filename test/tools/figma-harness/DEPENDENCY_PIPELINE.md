# Figma Dependency Pipeline

Use this runner after accepted planning changes update one or more canonical module inputs.

## Rule

```text
module changed
→ lookup dependency graph
→ changed module + dependents
→ for each affected module:
     review existing Figma
     ├── no changes needed → PASS, no mutation
     └── changes needed    → run normal writer/repair harness → fresh review
```

Dependencies come from:

```text
docs/srs/figma-pipeline-dependencies.json
```

No separate patch/backfill list is needed.

## Example dependency lookup

If only `Order` changes:

```text
Order
→ Aftersales
```

Those roots are then checked in dependency order. The graph only says **what must be checked**; it does not say both roots must be mutated.

For each root:

```text
figma:verify
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
  --figma "<Figma file/page reference>" \
  --changed Catalog \
  --max-repairs 3
```

Repeat `--changed` when multiple canonical modules changed.

Use `--dry-run` to print dependency lookup without reviewing or mutating Figma.

## Runtime behavior

The runner:

1. starts from the changed node(s);
2. follows dependent edges recursively;
3. deduplicates modules;
4. orders them by dependency;
5. runs read-only harness review for each root;
6. updates only roots whose review returns `FAIL_VERIFICATION`;
7. lets the normal write harness close every mutation with fresh review and the existing repair budget;
8. stops on the first terminal review/update failure.

A timeout, execution error, or other terminal review failure is not interpreted as "needs update".

## Planning boundary

Planning already decides what changed and patches canonical module docs.

Figma does not redo business impact analysis:

```text
canonical module changed
→ dependency lookup
→ review affected Figma roots
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
