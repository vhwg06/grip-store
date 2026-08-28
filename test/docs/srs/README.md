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
- final journeys remain coherent across capabilities.
```

## 9. Core principle

```text
Research broadly.
Choose for GRIP deliberately.
Scale vertically.
Extend existing UI/UX.
Patch only where the new capability actually reaches.
```
