# GRIP — UX-Driven, Behavior-Preserving Greenfield Redesign

Status: planning complete; Wave D/E execution gates remain explicitly open in the task breakdown and QA evidence.

## Intent and authority

Rebuild GRIP to make the Public Storefront and Admin Console simpler, clearer and easier to use while preserving required business behavior.

The redesign prioritizes clear user goals, low cognitive load, predictable interaction, understandable terminology, natural materialization of domain concepts and efficient task completion.

- `AGENTS.md`: orchestration, isolation, ownership and handoffs.
- `.agents/designer.md`: UX/Figma/design execution and visual quality.
- `behavior/spec/use case`: semantic authority.
- Published handoffs: derived execution context, never semantic authority.
- This file and the task breakdown are persistent planning state.

`.agents/designer.md` must not override behavior/spec/use cases or published module contracts. If a handoff conflicts with or cannot represent its source contract, downstream agents must return the issue to the original owner; they must not silently reinterpret it or widen their cognitive scope.

Catalog is the current canonical domain model. Do not reconstruct the legacy Product domain, terminology, ownership or screen boundaries unless explicitly supported by the current contract.

## Full visual reset

Both application UI and Design System are greenfield. Existing Public Storefront, Admin Console, component, pattern, shell, workflow, state model and Design System artifacts are audit-only and may be retired.

The only approved visual seed is:

- warm/off-white background;
- broad warm-neutral direction.

### Visual tone migration guide

The full execution guide is persisted in [`visual-tone-migration-guide.md`](./visual-tone-migration-guide.md).

Use the first storefront reference as the approved tonal/style direction.

Target characteristics:

- very light warm off-white canvas;
- near-white or subtly warm elevated surfaces;
- strong near-black primary text;
- restrained warm-gray secondary text;
- sparse muted gold/ochre accent;
- restrained semantic colors for success, warning, danger and status;
- light, clean, spacious, high-contrast composition;
- warmth should come mainly from the canvas and subtle surfaces, not from tinting every component.

Avoid:

- beige/clay monochromatic UI;
- low-contrast brown/gray typography;
- heavy tinted surfaces;
- using accent color across large areas;
- making every card, control or section visibly warm;
- copying layout, component structure or IA from the reference screen.

Apply the migration system-wide:

1. Rework foundation tokens first: canvas/background, elevated/surface roles, primary/muted text, border/divider, accent and semantic status roles.
2. Re-evaluate typography contrast and hierarchy against the lighter canvas.
3. Update primitives and components to consume semantic tokens; do not recolor components individually with arbitrary values.
4. Update shells and patterns only after foundation tokens are stable.
5. Verify public and admin UI use the same tonal language while preserving appropriate density and hierarchy.
6. Run visual QA on representative public/admin screens before propagating the migration everywhere.

The reference defines tonal relationship and visual character only:

```text
light warm canvas
→ subtle surface separation
→ strong ink contrast
→ restrained accent
```

It does not define product behavior, IA, layout, component anatomy or interaction patterns. Do not preserve the current `clay` direction merely because it already exists. If existing tokens/components conflict with this tonal direction, replace them at the canonical Design System level rather than patching individual screens.

Visual acceptance check: if the UI starts looking beige/brown as a whole, the migration is wrong. The dominant impression must be light/neutral first, warm second.

Typography, tokens, spacing, components, patterns, shells, navigation and interaction models must be derived anew. The previous Design System is not a canonical dependency.

## Separate traces

Design trace:

```text
domain intent + user goals + domain concepts
→ UX model, task flows and IA
→ interaction/information requirements
→ reusable UX patterns
→ new canonical Design System
→ actual screens and states
```

Behavior trace:

```text
scenario
→ preserved observable outcome/constraint
→ canonical flow/state
→ prototype path and evidence
```

Scenarios are behavioral evidence and compatibility constraints, not screen blueprints, UI requirements or component inventories.

## Execution graph

```text
P — persistent planning artifacts
↓
A-* — isolated behavior/domain discovery (no designer instruction)
↓
A-AGG — compact handoff aggregation
↓
A-UX — UX synthesis and IA (reads .agents/designer.md)
↓
B-* — new canonical Design System (reads .agents/designer.md)
↓
B-GATE — artifact-backed Design System coverage gate
↓
C-* — composition by cognitive module (reads .agents/designer.md)
    ├─ applicable viewport deliverables
    └─ intra-module prototype
↓
C-EXT — Foundation extension loop
↓
D-* — cross-module integration and prototype wiring
↓
E-* — UX, product, contract and traceability QA
```

Planning is complete because scope, Catalog baseline, ownership boundaries, dependencies, task outputs, handoffs, coverage matrix and completion gates are persisted in this directory. This does not claim that the still-open Wave D/E execution gates have passed.

## Wave A — User goals, domain concepts and behavior constraints

Module agents work in isolated cognitive boundaries and read only approved discovery sources in their assigned scope. They do not inspect frontend/backend code, load `.agents/designer.md` or create Figma artifacts.

Each handoff derives:

- primary user goals, decisions and tasks;
- domain concepts users must understand;
- user-visible information/content shape;
- required actions and information;
- behavioral outcomes and constraints;
- validation, permission, error, unavailable, conflict and terminal semantics;
- dependencies and reload/fresh-read requirements;
- scenario coverage;
- reusable interaction/information-pattern candidates.

Do not derive screens mechanically from scenarios. `A-AGG` publishes compact handoffs and the aggregated behavior/domain inventory. Downstream agents do not reread raw module sources when the handoff is sufficient.

If a handoff is insufficient or contradictory:

```text
downstream detects ambiguity
→ return clarification to original owner
→ owner re-explores only its original boundary
→ corrected/expanded handoff
→ downstream resumes
```

## A-UX — UX synthesis

`A-UX` is a design synthesis task. Its owner must read and apply `.agents/designer.md`, but the instruction cannot override behavior/spec/use cases or published contracts.

`A-UX` consumes only `A-AGG` handoffs and synthesizes user goals, task flows, domain mental models, terminology, user-facing IA/navigation, information grouping, progressive disclosure, interaction principles, UX requirements, reusable patterns and cognitive-load risks.

The user-facing IA may regroup Catalog concepts; it must not mirror internal folders, packages or legacy Product boundaries blindly.

## Wave B — New canonical Design System

One Foundation cognitive owner consumes the aggregated behavior/domain inventory, synthesized UX model, approved visual seed and `.agents/designer.md`. It must not reconstruct raw module mental models.

`B-001` is a retirement audit only. It may identify obsolete assumptions, but must not salvage old composition or extend legacy components as a shortcut.

```text
B-001  Retire old Design System assumptions
B-002  New visual foundations
B-003  Tokens, typography, spacing, grids and breakpoints
B-004  Public/Admin shells and responsive structure
B-005  Controls, forms and interaction states
B-006  Data display, tables, selection and bulk actions
B-007  Catalog, commerce and engagement patterns
B-008  Overlays, feedback, status, recovery and readiness
B-009  Accessibility/state variants and artifact QA
```

Page `01 — Grip Design System` must be a usable canonical system containing foundations, primitives, controls, components, interaction/information patterns, shells, responsive rules, state variants, accessibility behavior and usage semantics. Isolated specimens or documentation boards do not satisfy this requirement.

Coverage trace:

```text
user goal / UX need
→ interaction/information requirement
→ canonical DS artifact | screen-specific | not-applicable
→ consuming flow/module
```

`B-GATE` blocks Wave C until every known reusable UX requirement is classified as covered by a canonical artifact, explicitly screen-specific or not applicable. The actual Figma artifact must be visible, usable, correctly structured and consumable by module agents; reports are not completion evidence.

Late reusable gaps follow:

```text
module → extension request → Foundation → DS update → coverage update → module resumes
```

## Wave C — Greenfield composition

Candidate scopes are provisional only. Final grouping and ownership come from the Wave A/A-UX cognitive ownership map.

Ownership is by cognitive module, never by viewport. Each module owner owns all applicable desktop/mobile deliverables and intra-module prototype interactions. No separate viewport agents are created.

Module owners consume the synthesized UX model, published module handoff, new canonical Design System and `.agents/designer.md`.

Every canonical frame must be actual application UI with shell, hierarchy, content, controls, actions and real state. Requirement cards, annotations or documentation boards cannot substitute for product composition.

Reusable patterns must consume canonical Design System artifacts. Local composition is allowed only when genuinely unique. State frames are separate only when state materially changes composition; drawers, dialogs, field errors, focus, hover and transient feedback use contextual variants when appropriate.

Canonical naming:

```text
[Domain] / [Module] / [Use Case] / [Screen] / [State]
```

Scenario IDs belong in metadata, descriptions and coverage matrices, not canonical frame names.

## Wave D — Cross-module integration

Wave C owns intra-module search, filters, tabs, forms, galleries, dialogs, pagination and other local interactions.

Integration consumes published handoffs and canonical artifacts only. It owns global/shell navigation, cross-module transitions, auth/protected handoffs, commerce handoffs, cross-artifact back/close behavior, cross-module reversible paths and integration-level reload/fresh-read paths. It may modify integration/prototype wiring but may not redesign another owner's artifact.

## Wave E — Quality gates

QA passes reuse published context and do not reconstruct raw module mental models.

UX gate checks shortest reasonable path, clear primary action, understandable terminology, progressive disclosure, reduced cognitive load, natural domain materialization, recoverable errors and absence of unnecessary internal complexity.

Product/design gate checks credible application UI, new Design System reuse, warm-neutral coherence, responsive behavior, Vietnamese copy, accessibility, geometry, clipping, collision, orphan, duplicate and accidental legacy reuse.

Geometry verification is explicit and mandatory. For every canonical parent and every direct child frame/component/instance:

- enumerate child bounds as `x`, `y`, `width`, `height`, `right` and `bottom`;
- test every sibling pair for positive-area bounding-box intersection;
- calculate each laid-out row height as the maximum height of every item in that row;
- place the next row at `previousRowBottom + verticalGap`;
- verify every child is contained by its parent after accounting for the node's coordinate space;
- verify the configured minimum gap between adjacent rows/columns.

Being inside the parent bounds is not sufficient. Any positive-area sibling intersection fails the gate. A geometry audit must be persisted with the Figma evidence; a visual export timeout remains unverified.

Behavior/traceability gate checks accepted browser/visual coverage, separate design and behavior traces, validation, permissions, errors, terminal states, reversible actions, reload/fresh-read durability, API-tagged classification and `.agents/designer.md` compliance.

No feature files, specs, assertions, backend/frontend code or test behavior may be modified.
