# GRIP — UX-Driven, Behavior-Preserving Greenfield Redesign

Status: planning complete; Wave D/E execution gates remain explicitly open in the task breakdown and QA evidence.

## Intent and authority

Rebuild GRIP to make the Public Storefront and Admin Console simpler, clearer and easier to use while preserving required business behavior.

The redesign prioritizes clear user goals, low cognitive load, predictable interaction, understandable terminology, natural materialization of domain concepts and efficient task completion.

- `AGENTS.md`: orchestration, isolation, ownership and handoffs.
- `.agents/designer.md`: UX/Figma/design execution and visual quality.
- Applicable canonical semantic specifications: semantic authority for the domains they own.
- Published handoffs: derived execution context, never semantic authority.
- This file and the task breakdown are persistent planning state.

`.agents/designer.md` must not override applicable semantic specifications or canonical product intent. If a handoff or Gherkin scenario conflicts with the semantic authority for its domain, downstream agents must record a contract conflict, avoid encoding the contradictory behavior, and return the issue to the original owner. Completion is blocked until the conflict is resolved; it must not be silently reinterpreted or widened.

If a domain has no canonical semantic specification, record a `semantic source gap`. Gherkin may provide observable evidence, but it does not become semantic authority by default.

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

## Separate traces and precedence

Design trace:

```text
canonical domain semantics
→ actor goals + product intent
→ UX model / IA / canonical flows
→ mental model
→ information + interaction requirements
→ validated Design System foundations
→ screens / states / prototype
→ product validation
→ proven repeated solution
→ Design System promotion
```

Behavior trace:

```text
Gherkin scenario
→ observable outcome / constraint
→ relevant UX flow/state
→ compatibility challenge
→ preserved / conflict / stale / semantic-gap
→ prototype evidence
```

Read relevant Gherkin during discovery, but do not use it as the parent of UX synthesis. Scenarios are behavioral evidence and compatibility checks, not screen blueprints, UI requirements or component inventories.

When Gherkin is compatible with the applicable semantic authority, its observable outcome is a compatibility constraint. When it conflicts, canonical semantics win on meaning; do not preserve the contradiction, mark the conflict, and block completion until resolved.

## Execution graph

```text
P — persistent planning artifacts
↓
A-* — semantic/domain discovery plus early Gherkin evidence reading (no designer instruction)
↓
A-AGG — compact handoff aggregation with semantic owners and source gaps
↓
A-UX — UX synthesis and IA from semantics, actor goals and product intent
↓
B-FOUNDATION — validated Design System foundations/primitives
↓
C-* — composition by cognitive module (reads .agents/designer.md)
    ├─ applicable viewport deliverables
    └─ intra-module prototype
↓
D-VALIDATE — product flow and Gherkin compatibility challenge
↓
C-EXT — promote only proven repeated solutions into Foundation/DS
↓
D-* — cross-module integration and prototype wiring
↓
E-* — UX, product, semantic conflict, behavior and traceability QA
```

Planning is complete because scope, semantic ownership, Catalog baseline, ownership boundaries, dependencies, task outputs, handoffs, separate traces and completion gates are persisted in this directory. This does not claim that the still-open execution and conflict gates have passed.

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

`A-UX` is a design synthesis task. Its owner must read and apply `.agents/designer.md`, but the instruction cannot override applicable semantic specifications or canonical product intent.

`A-UX` consumes `A-AGG` semantic handoffs and synthesizes user goals, task flows, the shopper's mental model, terminology, user-facing IA/navigation, information grouping, progressive disclosure, interaction principles, UX requirements and cognitive-load risks. Gherkin evidence is available for challenge and correlation, but does not determine the UX decomposition.

The user-facing IA may regroup Catalog concepts; it must not mirror internal folders, packages or legacy Product boundaries blindly.

## Wave B — Validated Design System foundations

One Foundation cognitive owner establishes only validated foundations and primitives from the approved visual seed, applicable semantics, synthesized UX model and `.agents/designer.md`. It must not reconstruct raw module mental models or predefine speculative product patterns.

`B-001` is a retirement audit only. It may identify obsolete assumptions, but must not salvage old composition or extend legacy components as a shortcut.

```text
B-001  Retire old Design System assumptions
B-002  New visual foundations
B-003  Tokens, typography, spacing, grids and breakpoints
B-004  Validated public/admin shell foundations
B-005  Controls, forms and interaction primitives
B-006  Accessibility and primitive state variants
```

Page `01 — GRIP Design System / Validated Foundations` must be a usable canonical foundation containing tokens, typography, spacing, responsive rules, primitives, controls, focus behavior and primitive state variants. Product-specific patterns are not canonical until a product flow has proven them.

Coverage trace:

```text
foundation need
→ validated primitive/token
→ consuming product flow
→ repeated proven solution
→ promoted DS pattern | screen-specific | not-applicable
```

`B-FOUNDATION` blocks product composition only for missing foundations/primitives genuinely required to render or operate the flow. It does not block Wave C because an unproven product pattern is absent. The actual Figma foundation must be visible, usable, correctly structured and consumable; reports are not completion evidence.

Late reusable gaps follow:

```text
module → local product solution → product validation → repeated need → Foundation/DS promotion → coverage update
```

## Wave C — Greenfield composition

Candidate scopes are provisional only. Final grouping and ownership come from the Wave A/A-UX cognitive ownership map.

Ownership is by cognitive module, never by viewport. Each module owner owns all applicable desktop/mobile deliverables and intra-module prototype interactions. No separate viewport agents are created.

Module owners consume the synthesized UX model, published module handoff, validated Design System foundations and `.agents/designer.md`.

Every canonical frame must be actual application UI with shell, hierarchy, content, controls, actions and real state. Requirement cards, annotations or documentation boards cannot substitute for product composition.

Product flows consume validated Design System foundations and primitives. A local solution is allowed while it is being proven. Promote it only after repeated product use and behavior/visual validation. Canonical production frames represent a coherent runtime state; supporting artifacts may show adjacent/component states, but mutually exclusive runtime states must not be mixed in one production screen. Drawers, dialogs, field errors, focus, hover and transient feedback use contextual variants when appropriate.

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

Behavior/traceability gate checks separate design and behavior traces, semantic ownership, unresolved semantic-source gaps, Gherkin compatibility/conflicts, accepted browser/visual coverage, validation, permissions, errors, terminal states, reversible actions, reload/fresh-read durability, API-tagged classification and `.agents/designer.md` compliance. Any unresolved semantic conflict blocks completion.

No feature files, specs, assertions, backend/frontend code or test behavior may be modified.
