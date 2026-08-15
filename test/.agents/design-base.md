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

```text
Domain → Module → Use Case → Screen → State
```

Each product Module owns one independent top-level canvas root.

Module roots are siblings.

Canonical UI belongs only under its owning Module.

Correct ownership does not imply correct placement.

Each canonical artifact has one canonical location.

---

## 3. Shared Quality Pipeline

Apply applicable gates in this order:

```text
Product semantics
→ UX / task model
→ Screen responsibility
→ Behavior / flow completeness
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
strong composition must not hide an incomplete flow
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

---

## 6. Behavior / Flow Completeness Gate

The actual Figma scope must completely represent the documented user-visible behavior that the design exposes or is responsible for.

This gate checks **coverage and continuity**, not visual quality.

For every documented or visibly exposed user action, determine:

```text
entry point
→ user action / decision
→ resulting screen / state / overlay / transition
→ meaningful next step or terminal outcome
```

PASS requires:

- every in-scope documented user-visible behavior has a representation in canonical Figma;
- every visible actionable control has a corresponding destination, state change, overlay, confirmation, or explicitly documented external outcome;
- required intermediate steps are represented when the user must pass through them;
- required success, empty, error, validation, confirmation, or destructive states are represented when canonical documents make them behaviorally meaningful;
- alternate paths that materially change user decisions or outcomes are represented;
- no CTA, navigation item, row action, menu action, or interactive affordance points to a missing canonical flow;
- no required flow ends at an unexplained dead end;
- the full path can be traced from its entry point to a meaningful outcome without inventing behavior.

Example failure:

```text
The product-list screen exposes “Thêm mới”.
Canonical documents define product creation as an in-scope capability.
No create screen/state/flow exists in Figma.
→ Behavior / Flow Completeness FAIL
```

Another failure:

```text
A destructive action exists in the UI and canonical documents require confirmation,
but no confirmation state is represented.
→ Behavior / Flow Completeness FAIL
```

Important:

```text
behavior step ≠ frame by default
```

One screen/state may satisfy multiple behavior steps when the interaction is genuinely represented there. Do not manufacture frames merely to increase coverage.

Likewise, this gate MUST NOT invent downstream Feature/Gherkin scenarios. It verifies the behavior already defined by the upstream Figma-phase documents.

---

## 7. Composition Gate

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

## 8. Design Context Gate

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

## 9. Responsive Gate

Desktop and mobile are different compositions of the same task.

Preserve:

```text
user goal
semantic priority
reading order
critical information
primary action
required capability
behavior / flow completeness
```

Recompute when space changes:

```text
grouping
placement
density
progressive disclosure
interaction mechanics
```

PASS requires responsive variants to preserve task priority, capability, and the reachable behavior required for that viewport.

Mobile is never desktop shrunk down.

---

## 10. Geometry & Structural Gate

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
correct parent hierarchy
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

## 11. Visual Quality & Craft Gate

Run only after upstream semantics, UX, behavior coverage, composition, and applicable geometry are valid.

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

## 12. Final Artifact Gate

The actual Figma artifact is the evidence.

Tool success does not imply design correctness.

A scope is eligible for final PASS only when all applicable gates above pass on the actual artifact.

Never approve while any of these remain:

```text
semantic / UX gap silently guessed
wrong canonical ownership
unclear screen responsibility
missing required behavior / flow step
orphan CTA / action with no represented outcome
required state or transition absent
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
Behavior completeness > Pretty dead ends
Composition > Decoration

Correct ownership ≠ Correct placement
Inside parent ≠ Valid layout
Tool success ≠ Design correctness

Coordinates / bounds > Screenshot for geometry
Rendered Figma > Intended rationale for visual judgment

Repair broken scope > Build more nodes
Leave scope correct > Make nodes exist
```
