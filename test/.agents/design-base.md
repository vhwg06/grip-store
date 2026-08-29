# Figma Design Base Contract

This file defines the **shared design authority, invariants, gates, and quality pipeline** for both Figma generation and Figma review.

It is role-neutral.

Role files may add execution constraints, but they MUST NOT weaken or redefine this contract.

The external harness owns session orchestration and state transitions. This contract defines **what correct means**, not which process is allowed to advance.

---

## 1. Authority

Canonical product semantics come from:

```text
SRS
+ canonical domain semantics
+ accepted business rules / decisions / contracts
```

Design evidence comes from:

```text
UX research
+ UI / design research
+ competitor / reference research
+ approved visual direction
```

Priority:

```text
Product semantics
> User goal
> UX correctness
> Accessibility
> Composition
> approved design context
> Visual taste
> Canvas convenience
```

Research may influence or challenge design, but it must not invent or override product semantics.

Never map implementation structure directly to UI:

```text
Endpoint ≠ Page
Entity ≠ Navigation item
Field ≠ Form control by default
Requirement ≠ Screen by default
```

Never invent unsupported behavior, state, navigation, action, field, or business rule.

---

## 2. Canonical Figma Hierarchy

Logical product ownership is:

```text
Domain → Module → Surface → Use Case → Screen → State
```

`Surface` is a presentation responsibility such as Public or Admin. It may be implicit when a Module has only one relevant surface.

The Figma canvas is intentionally **flat at the Module-surface level**. A Module does not require a wrapper frame merely to mirror the logical hierarchy.

A Module may therefore own one or more sibling top-level canonical roots, for example:

```text
Catalog Public
Catalog Admin
```

Both belong to the logical `Catalog` Module and are valid distinct roots because they own different surface responsibilities.

The dependency graph selects a **logical Module scope**. Resolving that scope means locating the set of existing canonical top-level roots that belong to that Module, not forcing exactly one physical root.

Canonical UI belongs only to the correct Module and surface responsibility.

Correct ownership does not imply correct placement.

Each canonical artifact has one canonical location.

### Canonical Representation Invariant

Semantic identity is determined by:

```text
owning Module
+ Surface responsibility
+ Use Case
+ Screen responsibility
+ State responsibility
```

Node id, frame name, creation time, or visual similarity alone does not define semantic identity.

For one semantic identity there must be one canonical representation in the active scope.

Multiple sibling roots for the same Module are **not** ambiguous when they have distinct surface responsibilities.

Ambiguity exists when multiple candidates compete for the same semantic responsibility, for example two roots both claiming `Catalog Public` responsibility.

Repeated generation or repair over unchanged upstream semantics MUST reconcile the existing representation rather than append another canonical copy.

Different names alone do not make two frames different semantic states.

When two states are legitimately distinct because their semantics require different user-visible behavior or information, the artifact must contain the meaningful observable difference required by that distinction.

Pixel-identical rendering is evidence of possible duplication, not proof by itself. Review semantic responsibility before classifying or removing a duplicate.

Competing canonical representations for the same semantic responsibility are a structural failure.

---

## 3. Shared Quality Pipeline

Apply applicable gates in this order:

```text
Product semantics
→ UX / task model
→ Screen responsibility
→ Composition
→ Responsive recomposition
→ Design context
→ Geometry / structural integrity
→ Visual execution / craft
→ Final artifact verification
```

A later gate MUST NOT be used to hide failure in an earlier gate.

Examples:

```text
visual polish must not rescue failed UX
larger containers must not hide bad geometry
canonical components must not justify incorrect task structure
```

The harness may execute these checks using different workers or deterministic tools, but the meaning of each gate remains defined here.

---

## 4. Semantic & UX Gate

The active scope must make the following understandable from canonical documents:

```text
business meaning
actor + desired outcome
required decisions
supporting information
constraints
meaningful states / transitions
system-known vs user-provided information
```

PASS requires:

- the user goal is explicit;
- the task sequence is minimal and justified;
- required information appears before the decision that needs it;
- action hierarchy reflects priority and consequence;
- documented meaningful states are represented;
- unsupported behavior is not invented;
- implementation structure does not leak into UX without user value.

A requirement does not automatically become a screen.

---

## 5. Screen Responsibility Gate

Every canonical screen/state must have a defensible responsibility.

PASS requires being able to state:

```text
User task
Screen responsibility
Primary decision / action
Information priority
Critical states
```

Reject screens that merely aggregate available entities, endpoints, or components without a coherent user responsibility.

Reject competing screen/state representations that claim the same semantic responsibility without a documented reason for coexistence.

---

## 6. Composition Gate

Composition must solve:

```text
reading order
scan path
grouping
alignment
density
whitespace
action hierarchy
content priority
visual balance
continuity
```

Prefer:

```text
order → proximity → typography → whitespace → scale → alignment
```

before decorative containers.

PASS requires:

- visual prominence follows task priority;
- primary information dominates appropriately;
- supporting information remains subordinate;
- primary and secondary actions are distinguishable;
- unrelated regions do not receive equal emphasis without semantic justification;
- the screen reads as one coherent composition;
- every visible boundary earns its existence;
- decoration does not substitute for hierarchy.

Challenge compositions that default mechanically to:

```text
card for every semantic group
pill for every status
equal panels for unequal semantics
nested containers
generic dashboard layouts
```

If the composition could trivially belong to many unrelated products, it requires challenge before approval.

---

## 7. Design Context Gate

Before final visual treatment, inspect only relevant:

```text
canonical Design System
approved product UI context
approved visual direction
```

Design System and existing UI are execution context, not semantic authority.

Reuse mature patterns when they fit the task.

Do not force a task into an existing component when doing so weakens the UX.

Pattern maturity:

```text
Local → Candidate → Validated → Canonical
```

Do not promote speculative patterns merely because they were used once.

---

## 8. Responsive Gate

Desktop and mobile are different compositions of the same task.

Preserve:

```text
user goal
semantic priority
reading order
critical information
primary action
required capability
```

Recompute when space changes:

```text
grouping
placement
density
progressive disclosure
interaction mechanics
```

PASS requires responsive variants to preserve task priority and capability.

Mobile is never desktop shrunk down.

---

## 9. Geometry & Structural Gate

Never build on or approve known-broken geometry.

Authority:

```text
Coordinates / bounds = geometry authority
Rendered Figma = visual authority
```

For each compared node:

```text
left   = x
top    = y
right  = x + width
bottom = y + height
```

Normalize compared nodes into the same coordinate space.

Two independent nodes overlap iff:

```text
A.left < B.right
AND A.right > B.left
AND A.top < B.bottom
AND A.bottom > B.top
```

Unless overlap is intentional:

```text
intersection(A, B) = empty
```

must hold.

Geometry / Structural PASS requires:

```text
correct canonical ownership
correct surface responsibility
correct parent hierarchy
one canonical representation per semantic identity
zero unintended sibling overlap
zero unintended cross-root overlap
required spacing satisfied
correct coordinate spaces
correct containment
no unintended clipping
normal production dimensions / scale
```

`inside parent` does not imply valid layout.

When reparenting, intended absolute placement must be converted correctly into the new parent-local coordinate system.

Rows and grids must use actual item bounds when dimensions differ:

```text
nextRowY    = max(previousRow.bottom) + requiredGap
nextColumnX = max(previousColumn.right) + requiredGap
```

Parent repair order:

```text
repair children
→ verify children
→ compute child union bounds
→ resize parent
```

Never enlarge a parent merely to hide incorrect child placement.

Screenshots may reveal suspicious geometry but do not prove exact geometry when node bounds are available.

---

## 10. Visual Quality & Craft Gate

Run only after upstream UX, composition, and applicable geometry are valid.

Evaluate:

```text
typographic relationships
spacing rhythm
alignment
visual emphasis
component consistency
icon use
edge treatment
density
micro-composition
visual continuity
product-specific character
```

PASS requires visual strength to follow semantic importance and the artifact to feel deliberate rather than generated or filler-like.

Correct semantics alone do not make the design production-quality.

---

## 11. Final Artifact Gate

The actual Figma artifact is the evidence.

Tool success does not imply design correctness.

A scope is eligible for final PASS only when all applicable gates above pass on the actual artifact.

Never approve while any of these remain:

```text
semantic / UX gap silently guessed
wrong canonical ownership
wrong surface responsibility
competing canonical representation for the same semantic identity
semantically equivalent duplicate state with no justified coexistence
named distinct state with no meaningful observable difference when semantics require one
unclear screen responsibility
failed composition hierarchy
computed unintended overlap
spacing violation
cross-root collision
unknown coordinate semantics
abnormal screen scale
broken geometry used as a base for more work
unresolved blocking visual defect
unverified actual Figma
```

Final principles:

```text
Product semantics > Canvas convenience
User goal > Implementation structure
Composition > Decoration

Dependency Module → canonical surface-root set
One semantic identity → one canonical representation
Different surface responsibility ≠ duplicate root
Different state name ≠ different state
Repeated execution → reconcile, not append

Correct ownership ≠ Correct placement
Inside parent ≠ Valid layout
Tool success ≠ Design correctness

Coordinates / bounds > Screenshot for geometry
Rendered Figma > Intended rationale for visual judgment

Repair broken scope > Build more nodes
Leave scope correct > Make nodes exist
```
