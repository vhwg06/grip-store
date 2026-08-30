# GRIP Domain Planning Pipeline

This directory is the canonical planning surface for GRIP business/domain and UI/UX evolution.

This phase is **not** frontend/backend implementation planning. Do not introduce API, database, persistence, backend, frontend, OpenAPI, or technical-test work unless a separate task explicitly asks for implementation.

## 1. Product evolution model

GRIP grows primarily by **vertical capability expansion** over the product that already exists.

A planning topic such as Promotions, Membership, or Business Solutions does not automatically imply a new isolated bounded context, application, navigation area, or UI universe.

Use:

```text
existing GRIP business/domain
+ new capability
+ existing journeys and UI/UX
→ coherent next version of GRIP
```

Do not default to:

```text
new capability
→ isolated domain universe
→ isolated Public UI
→ isolated Admin UI
```

A capability becomes independently bounded only when product semantics actually require that separation.

## 2. Canonical capability pipeline

For each capability:

```text
CAP-01 Reference Research
↓
CAP-02 GRIP SRS / Business-Domain Decision
↓
CAP-03 Public UI/UX Extension Plan
↓
CAP-04 Admin UI/UX Extension Plan
↓
CAP-05 Build Impact Map
↓
CAP-06 Patch / Reconcile Affected GRIP Modules
↓
CAP-07 Cross-capability Review
```

The stages are sequential in authority:

```text
research informs GRIP decisions
→ GRIP decisions constrain UI/UX
→ impact map decides affected Modules/docs
→ CAP-06 creates exact Module patch transitions
→ CAP-07 reviews through the current roadmap point
```

For roadmap vertical capabilities, also read `vertical-capability-sequencing.md`.

## 3. Reference research

### IKEA is the primary reference

Where IKEA has relevant observable behavior, use IKEA as the main reference for:

- feature discovery;
- user behavior;
- business behavior;
- public interaction patterns;
- UI/UX patterns;
- service/journey structure.

IKEA is a **reference pool**, not the GRIP product model.

Keep the separation:

```text
Observed reference fact
→ product/UX lesson
→ candidate GRIP value
```

Never rewrite reference research merely because GRIP selects a smaller scope.

### Feature selection must fit Vietnamese SMEs

GRIP feature adoption should consider:

- usefulness for Vietnamese SME customers/operators;
- simplicity and learnability;
- likely operator know-how;
- frequency/value of the job;
- fit with existing GRIP capabilities;
- whether a smaller behavior solves the same problem;
- whether the feature introduces unnecessary enterprise/e-commerce complexity.

Decision model:

```text
IKEA as main reference
+ relevant SME Vietnam evidence
+ existing GRIP constraints
→ GRIP feature decision
```

Not:

```text
IKEA has X
→ GRIP must have X
```

## 4. GRIP SRS

The SRS decides what GRIP actually owns and supports.

Before writing/extending an SRS:

1. read relevant existing GRIP SRS files;
2. identify the existing journey/domain being extended;
3. preserve compatible semantics;
4. add only selected GRIP behavior;
5. define cross-capability relationships without manufacturing ownership migrations.

Prefer additive vertical evolution:

```text
existing behavior
+ new capability
→ next business model
```

Do not create breaking boundaries just because a capability has a new planning name.

## 5. Public UI/UX — extend existing GRIP UX

Before proposing Public UI/UX:

1. read the accepted GRIP SRS;
2. read affected existing Public UI/UX docs;
3. locate existing journeys/surfaces touched by the capability;
4. use reference UX as input;
5. extend/adapt existing GRIP UX rather than designing a disconnected product from zero.

Authority:

```text
existing GRIP Public UI/UX
+ new GRIP business semantics
+ reference UI/UX research
→ next GRIP Public UI/UX
```

A capability-specific Public artifact is a **delta/extension plan**, not a replacement UI specification.

It should identify:

```text
existing GRIP Public docs read
existing journeys/surfaces extended
new user jobs
reference patterns considered
proposed additions/changes
surfaces intentionally unchanged
```

## 6. Admin UI/UX — extend existing GRIP UX

Admin follows the same rule.

Before proposing Admin UI/UX:

1. read the accepted SRS;
2. read affected existing Admin UI/UX docs;
3. understand current operator workflow/navigation;
4. add the new capability at the smallest coherent point;
5. keep the workflow understandable for operators without deep e-commerce expertise.

Authority:

```text
existing GRIP Admin UI/UX
+ new GRIP business semantics
+ reference UI/UX research
→ next GRIP Admin UI/UX
```

A capability-specific Admin artifact is an extension plan, not permission to create a separate admin application/workspace.

## 7. Impact map

Patching is driven by actual impact, not naming similarity.

After SRS + Public UI/UX + Admin UI/UX are accepted, map:

```text
new capability behavior
→ affected existing business journey
→ affected canonical Module/document
→ exact addition/reconciliation required
```

For every candidate Module/document choose:

```text
PATCH
NO PATCH REQUIRED
DEFER — requires a later capability decision
```

Every PATCH must trace to an accepted business/UI decision.

## 8. CAP-06 = Module patch activation

For roadmap verticals, CAP-06 does not create one cumulative cross-product reconciliation file.

Each affected Module owns its own state graph:

```text
BASE
→ P001
→ P002
→ ...
```

Each Module patch node must identify:

```text
product patch id
parent Module state
authoritative patch task document
resulting desired-state documents
```

The task document must be self-contained enough to execute/verify the semantic transition. It must state:

```text
required steps / behaviors
resulting desired state
preserved ownership/invariants
explicit non-changes
completion evidence
```

A Module that has `NO PATCH REQUIRED` receives no patch node for that product patch.

Do not create cumulative files whose meaning silently changes from:

```text
P001
```

to:

```text
P001 + P002 + P003
```

Historical patch nodes remain immutable planning checkpoints; later capabilities add later Module nodes.

## 9. Patch order inside a Module

Patch from business authority outward before the Module node is accepted:

```text
business/domain semantics
→ Public UI/UX
→ Admin UI/UX
→ terminology/references
→ resulting desired state
```

Do not patch UI/UX while underlying business behavior is unresolved.

A later Module patch points to the latest prior patch node for that Module, not necessarily the immediately previous **product** patch.

Example:

```text
Catalog
BASE
→ P001-promotions
→ P003-business-solutions
```

If Catalog has no P002 Membership change, P003 may parent P001.

## 10. CAP-07 review

Review the product through the **current activation point**, not through every future source artifact in the repository.

Verify:

```text
Research
- evidence-backed reference facts
- reference facts separated from GRIP decisions
- SME Vietnam constraints considered

SRS
- selected behavior explicit
- compatible semantics preserved
- no unnecessary enterprise complexity

Public/Admin UI/UX
- extends existing GRIP journeys
- no disconnected UI universe
- operator/customer flow remains coherent

Module patch nodes
- only affected Modules changed
- parent chain valid
- patch task is self-contained
- desired state explicit
- future capability semantics not leaked in

Cross-product
- ownership coherent
- journeys coherent through current product patch
```

## 11. Task Provider boundary

Planning owns canonical Module patch graphs. Execution agents do **not** rediscover them.

The agent-facing execution boundary is Task Provider:

```text
agent task id
→ Task Provider
→ task registry
→ pipeline + product patch
→ pipeline config
→ dependency graph
→ Module graph resolver
→ resolved task package
→ executor
```

For Promotions Figma:

```bash
npm run task -- --task figma-p001-promotions
```

The agent does not supply:

```text
pipeline id
product patch id
dependency graph path
changed Module seed
change-doc list
Module graph/doc paths
Figma URL/node id
```

Those are provider-owned concerns.

See:

```text
.agents/task-provider.md
tools/task-provider/README.md
```

## 12. Figma dependency boundary

The Figma dependency graph is **scope-only**:

```text
which logical Module scopes depend on which earlier Module scopes?
```

It does not contain docs, patch intent, desired state, or writer instructions.

Task Provider:

1. finds all Modules containing the selected product patch node;
2. uses those Modules as direct dependency roots;
3. computes the union dependent closure;
4. resolves each Module independently.

Each affected Module becomes:

```text
PATCH
or
COMPATIBILITY
```

### PATCH

Direct Module patch node exists.

Execution verifies/materializes only that Module patch + resulting desired state.

### COMPATIBILITY

Module is dependency-reachable but owns no direct patch node.

Execution verifies compatibility only. If a direct change is actually needed:

```text
DOC_GAP
→ STOP
→ add the missing Module patch node first
```

Dependency reachability is never mutation permission.

## 13. Current roadmap

Baseline Modules:

```text
1. Catalog
2. Checkout
3. Account
4. Engagement
5. Content
6. Order
7. Aftersales
```

Vertical product patches:

```text
P001-promotions
P002-membership
P003-business-solutions
```

Planning order:

```text
8. Promotions
9. Membership
10. Business Solutions
```

`Business Solutions` remains the combined business-purchasing + planning/consultation direction unless later research proves a real product boundary.

## 14. Current activation

```text
P001-promotions
→ CAP-01..07 planning complete
→ direct Module nodes: Catalog / Checkout / Content / Order
→ Figma task: figma-p001-promotions

P002-membership
→ source planning prepared
→ CAP-06 Module nodes not activated yet

P003-business-solutions
→ source planning prepared
→ CAP-06 Module nodes not activated yet
```

Future source docs may exist, but they are not current Module state until their CAP-06 patch nodes are activated.

## 15. Final product-wide consistency pass

After each roadmap capability has completed its own Module activation/review/Figma task, run one final product-wide consistency review.

This is not a second redesign. Verify:

```text
business/domain consistency
cross-capability terminology
Public journey continuity
Admin workflow continuity
navigation/entry-point consistency
duplicate/contradictory UX guidance
stale references
unintentional standalone surfaces
```

Do not erase the evidence that each product patch was individually activated and verified.
