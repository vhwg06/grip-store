# Figma Product Integration / Prototype Contract

This contract defines the product-level integration phase after canonical Module design has been realized through the selected product checkpoint.

It is not a new business capability, not a synthetic product patch, and not permission to redesign canonical Module behavior.

## Ownership model

```text
Task Provider
= resolve WHAT product checkpoint and stage plan this run means
= resolve every Module state at that checkpoint

figma:integration
= review-first execution of the resolved product integration plan

figma:harness writer
= mutate only documented integration/prototype gaps

fresh independent reviewer
= verify the resulting product-level continuity
```

Do not collapse these layers.

## Agent-facing entrypoint

The caller provides only:

```bash
npm run task -- --task figma-product-integration
```

The caller must not manually provide:

```text
pipeline id
checkpoint patch id
stage ids/order
Module graph paths
Module state documents
Figma URL/node ids
repair budget
```

Those are Task Provider / pipeline-owned concerns.

## Product checkpoint

The integration task resolves a product checkpoint such as:

```text
P003-business-solutions
```

For every logical Module, Task Provider supplies the latest Module state at or before that checkpoint.

This is a state checkpoint only. It does not mean every Module has a direct P003 node, and it must never manufacture one.

The integration pipeline does not mutate Module patch graphs or create another product state node.

## Preconditions

Product integration is update/verify only.

Before mutation, the reviewer must establish:

```text
all required existing canonical Module surface sets can be resolved
+
current Figma represents the provider-resolved product checkpoint closely enough to evaluate integration
```

Target resolution uses:

```text
Module
+ Surface responsibility
+ Use Case
+ Screen responsibility
+ State responsibility
```

If required canonical surfaces are missing or ambiguous:

```text
TARGET_NOT_FOUND / TARGET_AMBIGUOUS
→ STOP
→ writer forbidden
```

Do not initialize or replace missing Module roots as an integration fallback.

If a required journey/state/behavior is not supported by the provider-resolved canonical documents:

```text
INTEGRATION_DOC_GAP
→ STOP
→ writer forbidden
→ fix planning authority first
```

Integration is not permission to invent behavior.

## Stage plan

Task Provider resolves the canonical stage DAG. The current plan is:

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

The plan file owns exact stage metadata. This contract owns execution semantics.

### D1 — Flow Inventory

Read-only orientation inside the current run.

Resolve documented journeys as:

```text
entry
→ screens/states
→ actions
→ cross-Module handoffs where applicable
→ exits
→ exceptional/backtracking paths
```

Identify dead ends, orphan responsibilities, broken entry points, duplicate semantic screens, and missing prototype links.

Do not persist a second product specification merely to record the inventory.

### D2 — Screen Integration

Reconcile existing canonical screens into coherent journeys.

Allowed work includes only integration consequences already supported by canonical state:

```text
screen organization needed for a coherent flow
canonical navigation continuity
removal/reconciliation of true semantic duplicates inside the integration scope
consistent shared navigation/surface composition
```

Do not redesign product semantics, add features, or replace canonical Module ownership.

### D3 — Interaction Wiring

Wire prototype reactions for documented interaction responsibilities such as:

```text
forward / continue
back
cancel / close
submit / confirm
retry
link / CTA
tabs
modal / drawer / overlay transitions
```

Every reaction must terminate at an existing documented responsibility/state or an explicitly allowed external exit.

A visually present CTA with no meaningful destination is an integration gap.

### D4 — State Coverage

Ensure required observable states are represented and reachable where canonical state requires them.

Examples may include:

```text
default
loading
empty
validation error
failure
retry
disabled
success
```

These names are not a mandatory checklist. Create or wire only states justified by the resolved Module documents.

Do not create speculative states for completeness aesthetics.

### D5 — Cross-Module Integration

Verify documented product handoffs across logical Module boundaries.

Preserve ownership:

```text
handoff continuity ≠ duplicated workflow
navigation continuity ≠ ownership migration
shared context ≠ new business semantics
```

Use provider-resolved Module state as authority. If a cross-Module handoff requires undocumented behavior, return `INTEGRATION_DOC_GAP` instead of inventing it.

### D6 — Responsive Integration

Review complete journeys across supported desktop/mobile representations.

Responsive continuity includes, where applicable:

```text
navigation mechanics
content grouping/density
forms
primary actions
sticky behavior
overlays
admin tables or equivalent compact representations
```

Responsive is recomposition of the same documented responsibility, not scaling and not a parallel product flow.

### D7 — Prototype Validation

A fresh independent reviewer validates the full resolved integration scope after any mutation.

Cover:

```text
happy paths
failure/retry paths
backtracking/cancel paths
state transitions
cross-Module continuity
responsive continuity
canonical structure
```

The writer does not self-approve.

### D8 — Integration Handoff

Execution evidence belongs under the existing artifact boundary.

Persist enough evidence to identify:

```text
provider-resolved task
product checkpoint
stage plan
whether mutation occurred
fresh verification result
terminal failure/gap when present
```

Do not create a second canonical SRS/design specification as handoff output.

## Review-first mutation gate

Before starting a writer, run read-only verification over the full resolved integration target.

Reviewer summary must begin with exactly one target marker:

```text
TARGET_RESOLVED:
TARGET_NOT_FOUND:
TARGET_AMBIGUOUS:
```

For `TARGET_RESOLVED`, it must also contain exactly one integration classification:

```text
INTEGRATION_VERIFIED: Product Integration / Prototype
INTEGRATION_GAP: Product Integration / Prototype
INTEGRATION_DOC_GAP: Product Integration / Prototype
```

Interpretation:

```text
TARGET_RESOLVED + INTEGRATION_VERIFIED + PASS
→ task already complete
→ zero mutation

TARGET_RESOLVED + INTEGRATION_GAP + FAIL_VERIFICATION
→ bounded writer may run
→ fresh independent review required

TARGET_RESOLVED + INTEGRATION_DOC_GAP
→ STOP
→ writer forbidden

TARGET_NOT_FOUND / TARGET_AMBIGUOUS
→ STOP
→ writer forbidden
```

A generic visual/craft failure is not enough to authorize mutation.

## Mutation boundary

When `INTEGRATION_GAP` authorizes a writer, mutation is limited to:

```text
screen/flow integration
prototype reactions
required documented state reachability
cross-Module handoff representation
responsive flow continuity
integration defects directly blocking those concerns
```

The writer must not use this phase for:

```text
new business behavior
new product capability
Module ownership changes
general visual redesign
unrelated spacing/copy/gallery polish
speculative state creation
backend/frontend/API/database work
```

If an unrelated visual issue does not block product integration, report it as non-blocking and leave it unchanged.

## Fresh verification

After writer completion, the harness reviewer must independently return:

```text
TARGET_RESOLVED
+
INTEGRATION_VERIFIED: Product Integration / Prototype
+
PASS
```

Harness exit `0` without the integration marker is insufficient completion evidence.

## Completion

The provider task is complete only when:

```text
review-first gate passed with zero mutation
OR
bounded integration writer completed + fresh independent integration verification passed

+
figma:integration exits successfully
+
Task Provider observes executor success
```

Do not replace a failed product integration task with ad-hoc single-screen repairs and claim the original task completed.
