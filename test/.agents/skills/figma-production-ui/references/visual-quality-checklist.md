# Visual Quality Checklist

Run this after every production screen change.

## Visual Identity

- [ ] Looks like the existing product when logo is removed.
- [ ] Existing brand accent is preserved.
- [ ] Background/surface warmth matches approved production screens.
- [ ] Semantic colors are restrained.
- [ ] No generic SaaS visual drift.

## Optical Alignment

- [ ] H1/subtitle spacing feels intentional.
- [ ] Sections use unequal spacing according to hierarchy.
- [ ] Labels and controls share coherent baselines.
- [ ] Buttons in the same action group align.
- [ ] Badges are optically centered.
- [ ] Checkboxes are optically centered.
- [ ] No element feels stuck to a divider.

## Tables

- [ ] Toolbar width aligns with table width.
- [ ] Toolbar and table share left/right edges.
- [ ] Filter controls form one coherent group.
- [ ] No unnecessary outer filter border.
- [ ] Rows have sufficient vertical breathing room.
- [ ] Header is clearly separated from first row.
- [ ] Pagination is not visually attached to last row.
- [ ] Row actions are easy to scan.

## States

- [ ] Exactly one runtime state is represented.
- [ ] Loading uses the real screen context.
- [ ] Empty uses the real screen context.
- [ ] Error uses the real screen context.
- [ ] Permission uses the real screen context.
- [ ] No State Coverage cards appear in production UI.

## Components

- [ ] No bracket placeholders remain.
- [ ] Media is represented visually.
- [ ] Errors use actionable validation components.
- [ ] Statuses use canonical status components.
- [ ] Forms use actual controls.
- [ ] Drawer/Dialog reuse the canonical pattern.

## Final Question

> If frontend implemented this frame pixel-for-pixel tomorrow, would it look and behave like a production GRIP screen?

If no, do not mark complete.
