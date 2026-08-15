---
name: figma-production-ui
description: Design, review, and refine production Figma screens while preventing visual drift, documentation-as-UI, inconsistent interaction models, optical misalignment, and large-file hallucination.
---

# Figma Production UI Protocol

Use this skill when creating, polishing, or reviewing production UI in a large Figma file.

## Core Principle

> A production frame represents one realistic user-visible screen at one point in time.

### Production Traceability Invariant

> A production frame is invalid if its workflow, navigation, component behavior, or state semantics cannot be traced to exactly one Business Use Case and one canonical System pattern.

The traceability contract is:

```text
Business Module → Use Case → Screen → Runtime State
```

Enforce these invariants for every production frame:
- one production frame equals one runtime state;
- one declared wizard step equals one logical production screen;
- stable path naming is mandatory;
- Workspace Tabs and Wizard Stepper are separate patterns;
- coverage boards are documentation only;
- the frame name and supporting traceability documentation identify the Business Module, Use Case, Screen, State, and System patterns.

Do not confuse production UI with state coverage, interaction maps, acceptance boards, or design-system documentation. Documentation supports production UI. It never replaces it.

## 1. Control Context Before Editing

Never reason over the entire Figma file when the scope is large.

Work in this order:

```text
Visual Baseline
→ Canonical Pattern
→ Target Screen
→ Target State
→ Screenshot Verification
```

For each task, explicitly identify:
- visual baseline node;
- canonical screen/pattern;
- exact target frame(s);
- exact requested change.

Do not redesign unrelated frames. If more than 5–8 production screens are in scope, split the work into batches.

## 2. Preserve Existing Visual Identity

Existing approved production screens are the visual source of truth. Layout and workflow may evolve. Visual identity must not drift.

Before editing, inspect the approved baseline for:
- background and surface tone;
- brand/accent colors;
- typography hierarchy;
- sidebar/navigation treatment;
- buttons;
- borders;
- radius;
- density;
- semantic colors;
- spacing rhythm.

Do not replace an established product language with a generic SaaS aesthetic.

> Workflow may be redesigned. Brand identity must be preserved.

## 3. Production UI ≠ Documentation

A production screen must contain real UI components.

Do not use:
- prose-only behavior descriptions;
- `[image preview]`;
- `[required]`;
- rectangle placeholders;
- state inventories;
- multiple mutually exclusive states shown together;
- acceptance notes inside shipped screens.

For every capability:

```text
Capability
→ Real production screen
→ Real runtime state
→ Real interaction
→ Supporting documentation
```

Never:

```text
Capability
→ Documentation board
→ Done
```

## 4. One Runtime State Per Frame

Loading, Empty, Error, Permission, Success, Conflict, and Terminal states are mutually exclusive unless the product explicitly requires composition.

Do not append:

```text
STATE COVERAGE
Loading | Empty | Permission | Error
```

under a successful production screen.

Instead create:

```text
Product List — Loaded
Product List — Loading
Product List — Empty
Product List — Filtered Empty
Product List — Permission Denied
Product List — Error
```

Each state preserves the real surrounding page context.

## 5. Reuse One Canonical Interaction Model

Do not create competing UI models for the same entry point.

Example violation:

```text
Variant List → lightweight inspector drawer
Variant List → full editor drawer
```

unless the specification explicitly defines both.

Before introducing a new Drawer, Dialog, Table, Form, Upload, Readiness, or Toolbar pattern:
1. Search for the canonical pattern.
2. Reuse it if present.
3. Extend it only when required by approved behavior.
4. Do not create a parallel local implementation.

## 6. Workflow Navigation Consistency

One workflow must have exactly one canonical navigation model.

For a wizard:
- each declared step maps to exactly one logical production screen;
- step count and ordering never change between frames;
- completed, current, and upcoming states use one canonical Stepper component;
- a production screen must not combine two declared steps;
- review content, readiness checks, and completion summaries do not replace wizard navigation.

The approved Catalog & Product create pipeline is:

```text
General
→ Attributes
→ Dimensions
→ Variants
→ Media
→ Review
→ Draft Workspace
```

Create screens must not locally redefine, merge, rename, reorder, or restyle these steps.

Wizard navigation and post-create workspace navigation are different patterns:

```text
Wizard Stepper
→ completes when the Draft ProductModel is created

Product Workspace Tabs
→ Overview | Attributes | Variants | Media | Preview | Readiness
```

Do not mix wizard pipeline semantics with Product Workspace tabs. A Review screen may contain readiness or checklist content, but it remains the final step of the canonical Stepper.

## 7. Optical Alignment Over Mechanical Alignment

Pixel alignment alone is not sufficient.

Review:
- vertical rhythm;
- baseline alignment;
- whitespace distribution;
- row breathing room;
- badge optical centering;
- checkbox alignment;
- control heights;
- section grouping;
- action grouping.

Avoid equal spacing everywhere. Use spacing to express hierarchy.

A table row must feel like an independent information block, not text trapped between dividers.

## 8. Table + Toolbar Composition

The toolbar controls the table and must visually belong to it.

Require:
- toolbar and table share the same left/right content edges;
- filter/search controls follow one grid;
- no unexplained horizontal dead space;
- primary actions have deliberate placement;
- row content has sufficient vertical padding;
- dividers do not crowd text/badges;
- pagination has breathing room.

Do not add unnecessary outer borders around filter groups when the individual controls and table already define their own surfaces.

Avoid nested-card framing without a functional reason.

## 9. Real Components, Not Field Dumps

Do not render domain data as plain property text when a production component is appropriate.

Bad:

```text
Media
Assigned: none
Fallback: ProductModel media
```

Prefer thumbnails, a media picker, fallback badge, and assign/replace actions.

Bad:

```text
Status
Active
Commercial readiness
Incomplete
```

Prefer status badges, validation banners, field groups, tabs/sections, and actionable recovery.

A screen must not resemble JSON, a schema, a property inspector, or a specification document.

## 10. Edit Only the Requested Dimension

When the review request says spacing only, tone only, alignment only, or row density only, do not redesign information architecture or business flow.

Preserve approved layout unless the requested issue cannot be solved without changing it.

## 11. Mandatory Verification Loop

After every production edit:
1. Capture the target frame.
2. Inspect it visually.
3. Compare against the visual baseline.
4. Check the requested problem specifically.
5. Fix again if needed.

Do not claim completion based only on node creation or text existence. Completion requires screenshot-level verification.

## Completion Gate

A production frame is complete only when:
- it represents one realistic runtime state;
- it contains real UI, not documentation placeholders;
- it uses the approved visual language;
- it reuses canonical interaction patterns;
- it uses one canonical workflow navigation model for each journey;
- optical alignment is visually balanced;
- table/form rows have sufficient breathing room;
- toolbar/table/container edges align intentionally;
- no irrelevant state-coverage artifacts appear in the UI;
- no frontend engineer must invent layout, control placement, state presentation, or interaction semantics.

Read:
- `references/production-screen-rules.md`
- `references/visual-quality-checklist.md`
