# Production Screen Rules

## Production vs Supporting Artifact

Production:
- Product List
- Product Workspace
- Create Wizard
- Variant Table
- Variant Drawer
- Combination Preview
- Media Management
- Readiness
- Lifecycle Dialog
- Public Catalog
- Public Product Detail

Supporting only:
- Interaction Map
- State Matrix
- State Inventory
- Acceptance Review
- Traceability
- Pattern Application Matrix
- Coverage Board

Supporting artifacts do not participate in production visual review.

## Runtime State Rule

One production frame = one runtime state.

Correct:

```text
Variant List — Loaded
Variant List — Loading
Variant List — Empty
Variant List — Error
```

Incorrect:

```text
Variant List
...
STATE COVERAGE
Loading | Empty | Error
```

## Real Context Rule

A modal/dialog/drawer must be shown in its real parent context.

Correct:

```text
Product Workspace
+ Unpublish confirmation modal
```

Incorrect:

```text
Standalone card describing:
"Unpublish ProductModel?"
```

## Canonical Interaction Ownership

For each entry point, define one canonical destination.

Example:

```text
Variant row click
→ Variant Editor Drawer
```

Do not also create an unrelated Quick Inspector unless explicitly approved.

## Form Composition

Fields must have:

```text
Label
Control
Helper/error when needed
```

Use deliberate control widths. Do not use tiny select boxes floating in otherwise large form rows. Group related fields into sections.

## Table Composition

Minimum review:
- header/data column alignment;
- checkbox gutter;
- row vertical padding;
- badge alignment;
- cell baseline;
- divider distance;
- action-column spacing;
- pagination spacing;
- toolbar/table edge alignment.

Never use state documentation cards below a loaded table.
