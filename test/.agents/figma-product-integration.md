# Figma Product Integration / Prototype Contract

This contract defines the product-level integration phase after canonical Module design has been realized through the selected product checkpoint.

It is not a new business capability, not a synthetic product patch, and not permission to redesign canonical Module behavior.

## Execution ownership

```text
Task Provider
= resolve WHAT task/checkpoint this run means

Figma workload
= own the shared review → optional writer → fresh review lifecycle

product-integration policy
= classify integration review results and mutation permission

figma:harness
= perform bounded writer/reviewer execution
```

The Figma workload is reused by both Module patch execution and Product Integration. Product Integration differs by resolver/policy, not by a separate runner program.

## Agent-facing entrypoint

The caller provides only:

```bash
npm run task -- --task figma-product-integration
```

Pipeline configuration resolves:

```text
workload = figma
resolver = checkpoint
policy = product-integration
checkpoint = P003-business-solutions
stage plan = product-integration-v1
```

The caller must not manually provide workload type, resolver/policy ids, checkpoint id, stage order, Module graph/docs, Figma URL/node ids, or repair budget.

## Product checkpoint

For every logical Module, Task Provider supplies cumulative canonical state at or before the selected checkpoint:

```text
BASE stateDocs
+
all Module patch stateDocs with sequence <= checkpoint
```

This is state-selection authority only. It does not mean every Module has a direct P003 node.

The integration task MUST NOT:

```text
create P004-integration
modify Module patch history
promote patch taskDoc into new mutation authority
invent missing business behavior
```

## Preconditions

Product Integration is update/verify only.

Before mutation the reviewer must establish:

```text
required existing canonical Module surface sets are resolvable
+
current Figma can be evaluated against the provider-resolved checkpoint
```

Target identity remains:

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

If integration requires undocumented journey/state/behavior:

```text
INTEGRATION_DOC_GAP
→ STOP
→ writer forbidden
→ fix planning authority first
```

## Internal stage plan

Task Provider resolves the canonical D1-D8 DAG:

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

These are internal workload stages. Agents MUST NOT invoke them as separate caller-owned task ids or reorder them manually.

### D1 — Flow Inventory

Read-only orientation.

Resolve documented journeys as:

```text
entry
→ screens/states
→ actions
→ cross-Module handoffs
→ exits
→ failure/backtracking paths
```

Identify dead ends, orphan responsibilities, broken entry points, duplicate semantic screens, and missing prototype links.

Do not persist a second product specification merely to record the inventory.

### D2 — Screen Integration

Reconcile existing canonical screens into coherent journeys.

Allowed changes are integration consequences already supported by canonical state:

```text
screen organization required for a coherent flow
canonical navigation continuity
reconciliation of true semantic duplicates inside integration scope
shared navigation/surface composition needed for continuity
```

No new product semantics or ownership migration.

### D3 — Interaction Wiring

Wire documented prototype reactions such as:

```text
continue / back / cancel
submit / confirm / retry
link / CTA / tab
overlay / modal / drawer transitions
```

Every reaction must terminate at an existing documented responsibility/state or an explicitly allowed external exit.

A visible CTA with no meaningful destination is an integration gap.

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

These are examples, not a mandatory checklist. Do not create speculative states for completeness aesthetics.

### D5 — Cross-Module Integration

Verify documented handoffs across logical Module boundaries.

Preserve ownership:

```text
handoff continuity ≠ duplicated workflow
navigation continuity ≠ ownership migration
shared context ≠ new business semantics
```

If a handoff requires undocumented behavior, return `INTEGRATION_DOC_GAP`.

### D6 — Responsive Integration

Review complete journeys across supported desktop/mobile representations.

Responsive continuity may include:

```text
navigation mechanics
content grouping/density
forms
primary actions
sticky behavior
overlays
admin table/compact representation behavior
```

Responsive is recomposition of the same documented responsibility, not a parallel product flow.

### D7 — Prototype Validation

A fresh independent reviewer validates the full integration scope after any mutation.

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

Persist execution evidence only:

```text
resolved task/checkpoint
stage plan
whether mutation occurred
fresh verification result
terminal failure/gap when present
```

Do not create a second canonical SRS/design specification as handoff output.

## Shared review-first lifecycle

The Figma workload owns one lifecycle for both patch and integration policies:

```text
read-only review
→ policy classification
→ optional bounded writer
→ fresh independent review
→ workload evidence
```

For Product Integration, reviewer summary must begin with exactly one target marker:

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
→ complete with zero mutation

TARGET_RESOLVED + INTEGRATION_GAP + FAIL_VERIFICATION
→ bounded writer may run
→ fresh independent verification required

TARGET_RESOLVED + INTEGRATION_DOC_GAP
→ STOP
→ writer forbidden

TARGET_NOT_FOUND / TARGET_AMBIGUOUS
→ STOP
→ writer forbidden
```

A generic visual/craft failure alone is not permission to mutate.

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

## Fresh verification

After writer completion, fresh review must return:

```text
TARGET_RESOLVED
+
INTEGRATION_VERIFIED: Product Integration / Prototype
+
PASS
```

Harness exit `0` without the integration marker is insufficient completion evidence.

## Completion

The Task Provider task completes only when the selected Figma workload policy returns success after either:

```text
review-first PASS with zero mutation
```

or:

```text
policy-authorized writer
→ fresh independent integration verification PASS
```

Do not replace a failed Product Integration task with ad-hoc single-screen harness calls and claim the original task completed.
