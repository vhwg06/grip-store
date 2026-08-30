# GRIP Domain Planning Pipeline

This directory is the canonical planning surface for GRIP business/domain and UI/UX evolution.

This phase is **not** frontend/backend implementation planning. Do not introduce API, database, persistence, backend, frontend, OpenAPI, or technical-test work unless a separate task explicitly asks for implementation.

## 1. Product evolution model

GRIP grows primarily by **vertical capability expansion** over the product that already exists.

A new planning topic such as Promotions, Membership, or Business Solutions does not automatically imply a new isolated bounded context, application, navigation area, or UI universe.

Use this model:

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

A capability becomes independently bounded only when the product semantics actually require that separation.

## 2. Canonical capability pipeline

For each new module/capability, use this sequence:

```text
1. Reference Research
   ↓
2. GRIP SRS / Business-Domain Decision
   ↓
3. Public UI/UX
   ↓
4. Admin UI/UX
   ↓
5. Patching / Reconciliation
   ↓
6. Review
```

The stages are sequential in authority: research informs GRIP decisions; GRIP decisions constrain UI/UX; the resulting capability is then reconciled into affected existing GRIP documents.

For roadmap vertical capabilities, CAP-06/CAP-07 activation and Figma execution must also follow `vertical-capability-sequencing.md`.

## 3. Reference research rules

### 3.1 IKEA is the primary reference

For commerce/product capabilities where IKEA has relevant observable behavior, use IKEA as the **main reference** for:

- feature discovery;
- user behavior;
- business behavior;
- public interaction patterns;
- UI/UX patterns;
- service/journey structure.

IKEA is a reference pool, **not the GRIP product model**.

Keep verified reference behavior intact even when GRIP chooses not to adopt it.

Required separation:

```text
Observed reference fact
→ product/UX lesson
→ candidate GRIP value
```

Never rewrite an IKEA/reference research document merely because GRIP selects a smaller scope.

### 3.2 Feature selection must fit Vietnamese SMEs

Feature adoption is a GRIP decision, not an IKEA-copying exercise.

When deciding what enters the GRIP SRS, evaluate:

- usefulness for Vietnamese SME customers/operators;
- simplicity and learnability;
- likely operational know-how of the user;
- frequency/value of the job;
- fit with existing GRIP capabilities;
- whether a smaller behavior solves the same problem;
- whether the capability creates unnecessary enterprise/e-commerce complexity.

Use other references, especially relevant Vietnamese SME/e-commerce products, when they materially improve this decision.

The intended decision model is:

```text
IKEA as main reference
+ relevant SME Vietnam evidence
+ existing GRIP product constraints
→ GRIP feature decision
```

Not:

```text
IKEA has feature X
→ GRIP must have feature X
```

## 4. GRIP SRS rules

The SRS is where GRIP decides what the product actually owns and supports.

Before writing or extending an SRS:

1. read the relevant existing SRS files in `test/docs/srs`;
2. identify the existing journey/domain that the new capability extends;
3. preserve compatible existing semantics;
4. add only the business behavior GRIP has selected;
5. define cross-capability relationships without manufacturing breaking ownership changes.

Prefer additive vertical evolution:

```text
existing behavior
+ new capability
→ next business model
```

Do not manufacture a breaking boundary migration merely because a capability received a new planning name.

## 5. Public UI/UX rules — MUST extend existing GRIP UX

Public UI/UX for a new capability MUST be based on the GRIP Public UI/UX that already exists.

Before proposing Public UI/UX:

1. read the new/updated GRIP SRS;
2. read all affected existing Public UI/UX documents;
3. locate the existing user journeys and surfaces the capability touches;
4. use IKEA/reference research for useful interaction/feature patterns;
5. extend or adapt the existing GRIP journey rather than designing a disconnected product from zero.

Authority model:

```text
existing GRIP Public UI/UX
+ new GRIP business semantics
+ reference UI/UX research
→ next GRIP Public UI/UX
```

Reference UI is not a replacement base for existing GRIP UI/UX.

Do not create a standalone Public experience for a capability when the capability naturally belongs inside existing surfaces.

Examples of valid vertical extension include:

```text
promotion behavior
→ existing Catalog / Cart / Checkout surfaces

membership behavior
→ existing Account and purchasing journeys

business solution behavior
→ existing Account / Catalog / Checkout / Order journey where applicable
```

These examples illustrate integration direction only; the actual SRS decides affected surfaces.

### 5.1 Public UI/UX artifact is an extension plan

A capability may still have its own Public UI/UX planning artifact so the change can be researched and reviewed in isolation.

That artifact is a **delta/extension plan**, not a replacement UI specification.

It must explicitly identify:

```text
existing GRIP Public documents read
existing journeys/surfaces being extended
new user jobs introduced by the capability
reference patterns considered
proposed additions/changes to existing GRIP UX
surfaces intentionally left unchanged
```

The later patching stage applies the accepted delta to the affected canonical GRIP documents.

## 6. Admin UI/UX rules — MUST extend existing GRIP UX

Admin UI/UX follows the same rule.

Before proposing Admin UI/UX:

1. read the new/updated GRIP SRS;
2. read affected existing Admin UI/UX documents;
3. understand the operator's existing workflow and navigation model;
4. add the new capability at the smallest coherent point in that workflow;
5. keep the workflow understandable for operators without deep e-commerce expertise.

Authority model:

```text
existing GRIP Admin UI/UX
+ new GRIP business semantics
+ reference UI/UX research
→ next GRIP Admin UI/UX
```

Do not create a separate admin application/workspace just because the capability has a separate research/SRS task.

### 6.1 Admin UI/UX artifact is an extension plan

A capability-specific Admin UI/UX artifact must state which existing Admin workflow it extends.

It must not assume that the capability deserves a new top-level navigation destination before the business and UX evidence justify one.

It should identify:

```text
existing GRIP Admin documents read
current operator workflow
new operator job introduced
smallest coherent insertion point
reference UI/UX patterns considered
proposed additions/changes
surfaces intentionally left unchanged
```

## 7. Patching / reconciliation

Patching happens **after** the new capability has enough GRIP business and UI/UX definition to know what existing documents are affected.

Patching means:

```text
new GRIP capability
+ existing GRIP SRS/UIUX
→ extend affected journeys/surfaces
→ reconcile stale GRIP decisions/references
→ preserve product consistency
```

Patching does **not** mean:

- deleting reference facts GRIP did not adopt;
- rewriting research to look like the GRIP SRS;
- inventing breaking changes between old and new modules;
- moving ownership simply to make every capability a separate bounded context;
- implementation work.

Patch only documents that are actually affected by the new business capability.

A reviewed result may legitimately be:

```text
NO PATCH REQUIRED
```

when the existing GRIP document remains consistent.

### 7.1 Patching is driven by an impact map

Do not predeclare that every older module must change.

After SRS + Public UI/UX + Admin UI/UX are accepted, build an impact map:

```text
new capability behavior
→ affected existing business journey
→ affected canonical GRIP document
→ exact addition/reconciliation required
```

For every candidate document, choose one result:

```text
PATCH
NO PATCH REQUIRED
DEFER — requires a later capability decision
```

Every `PATCH` must be traceable to an accepted GRIP business/UI decision.

### 7.2 Patching order

Patch from business authority outward:

```text
SRS / business-domain docs
→ Public UI/UX docs
→ Admin UI/UX docs
→ cross-document references / terminology
→ final review
```

Do not patch UI/UX first when the underlying GRIP business behavior is still unresolved.

## 8. Review gate

Before calling a capability planning pass complete, verify:

```text
Research
- reference facts are evidence-backed;
- IKEA/reference fact is separated from GRIP decision;
- relevant SME Vietnam constraints were considered for feature selection.

SRS
- selected GRIP behavior is explicit;
- existing compatible semantics are preserved;
- cross-capability relationships are coherent;
- no unnecessary enterprise complexity was introduced.

Public UI/UX
- based on existing GRIP Public UI/UX;
- capability is integrated into affected journeys;
- reference UI/UX is used as input, not as the product base.

Admin UI/UX
- based on existing GRIP Admin UI/UX;
- operator workflow remains simple and coherent;
- no isolated admin universe was invented without need.

Patching
- only affected GRIP docs were changed;
- reference research was not rewritten merely to match selected GRIP scope;
- every patch traces to an accepted capability decision;
- final journeys remain coherent across capabilities.
```

For vertical capabilities whose canonical Figma must be updated after CAP-06, planning review and Figma execution remain separate gates:

```text
CAP-07 planning review
→ accepted active change
→ figma:pipeline receives:
     original changed Module seed(s)
     + active change label
     + authoritative change/impact document
```

The dependency graph selects logical Module scope only. It does not define patch intent.

## 9. Core principle

```text
Research broadly.
Choose for GRIP deliberately.
Scale vertically.
Extend existing UI/UX.
Patch only where the new capability actually reaches.
Keep dependency scope separate from mutation intent.
```

## 10. Current GRIP planning roadmap

The current baseline planning set under `test/docs/srs` contains:

```text
1. Catalog
2. Checkout
3. Account
4. Engagement
5. Content
6. Order
7. Aftersales
```

These are the existing GRIP business/UI-UX baseline that new work must read and extend.

The next vertical capability queue is:

```text
8. Promotions
9. Membership
10. Business Solutions
```

`Business Solutions` is the combined planning direction for the business-purchasing and planning/consultation experience. It should remain one vertical capability unless later research shows a real product boundary that justifies separation.

The roadmap is a **planning sequence**, not proof that all ten names are independent bounded contexts.

## 11. Task template for each vertical capability

Use the following work breakdown for Promotions, Membership, Business Solutions, and later vertical capabilities:

```text
CAP-01  Reference Research
CAP-02  GRIP SRS / Business-Domain Decision
CAP-03  Public UI/UX Extension Plan
CAP-04  Admin UI/UX Extension Plan
CAP-05  Build Impact Map
CAP-06  Patch / Reconcile Affected GRIP Docs
CAP-07  Cross-capability Review
```

### CAP-01 — Reference Research

Required behavior:

```text
IKEA main reference
+ other evidence where useful
+ SME Vietnam evidence for feature-fit decisions
```

Research may be broad. Do not constrain the research to only features GRIP already expects to adopt.

### CAP-02 — GRIP SRS / Business-Domain Decision

Required inputs:

```text
CAP-01 research
+ all relevant existing GRIP SRS docs
```

Output decides:

```text
what GRIP adopts
what GRIP simplifies
what GRIP excludes
how the capability extends existing business journeys
which existing semantics remain unchanged
```

### CAP-03 — Public UI/UX Extension Plan

Required inputs:

```text
CAP-02 SRS
+ affected existing GRIP Public UI/UX
+ relevant reference UI/UX research
```

Do not write from the new capability alone.

### CAP-04 — Admin UI/UX Extension Plan

Required inputs:

```text
CAP-02 SRS
+ affected existing GRIP Admin UI/UX
+ relevant reference UI/UX research
```

Prefer the smallest coherent extension to the operator's existing workflow.

### CAP-05 — Build Impact Map

List each existing GRIP document that may be affected and justify why.

Do not patch based on naming similarity alone.

### CAP-06 — Patch / Reconcile Affected GRIP Docs

Apply accepted domain/UI changes vertically into the existing product documentation.

For roadmap verticals, reconcile only the current capability. Do not batch future capability decisions into the same Module reconciliation.

Do not perform implementation work.

### CAP-07 — Cross-capability Review

Review the end-to-end product through the current activation point after patching, not just the new capability artifact.

If Figma execution follows, preserve this capability as the run-level active change context so the dependency pipeline can distinguish scope from patch intent.

## 12. Current vertical capability plans

### 12.1 Promotions

Promotions uses IKEA as the main reference where relevant, filtered through simple Vietnamese SME needs.

Accepted scope is defined in `Promotions/02-grip-promotions-srs.md`; impact and Figma change authority are in `Promotions/05-promotions-impact-map-and-review.md`.

Current activation rule:

```text
PROMO-01 Research
→ PROMO-02 SRS
→ PROMO-03 Public UX extension
→ PROMO-04 Admin UX extension
→ PROMO-05 impact map
→ PROMO-06 Promotions-only Module reconciliation
→ PROMO-07 review
→ figma:pipeline with active change = Promotions
```

### 12.2 Membership

Membership is next after Promotions. It extends Account/business context and purchasing journeys without importing enterprise IAM complexity.

```text
MEM-01 Research
→ MEM-02 SRS
→ MEM-03 Public UX extension
→ MEM-04 Admin UX extension
→ MEM-05 impact map
→ MEM-06 Membership-only Module reconciliation on top of active Promotions
→ MEM-07 review
→ figma:pipeline with active change = Membership
```

### 12.3 Business Solutions

Business Solutions follows Membership and covers the accepted business need → proposal → quotation → purchase handoff journey without becoming CRM/project-management software.

```text
BUS-01 Research
→ BUS-02 SRS
→ BUS-03 Public UX extension
→ BUS-04 Admin UX extension
→ BUS-05 impact map
→ BUS-06 Business-Solutions-only Module reconciliation on top of active Promotions + Membership
→ BUS-07 review
→ figma:pipeline with active change = Business Solutions
```

## 13. Final product-wide consistency pass

After Promotions, Membership, and Business Solutions each complete their own activation/review/Figma change pass, run one final product-wide consistency review.

This is not a second redesign. It verifies that the accumulated vertical changes still form one coherent GRIP product.

Review:

```text
business/domain consistency
cross-capability terminology
Public journey continuity
Admin workflow continuity
navigation/entry-point consistency
duplicate or contradictory UX guidance
stale cross-document references
unintentional new standalone surfaces
```

The final pass must not retroactively erase the evidence that each roadmap capability was individually activated and verified.
