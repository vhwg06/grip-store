# GRIP visual tone migration guide

This is an execution guide for the greenfield Design System and all canonical application UI. It is subordinate to behavior/spec/use cases and `.agents/designer.md`.

## Approved direction

Use the first storefront reference as tonal/style direction only:

- very light warm off-white canvas;
- near-white or subtly warm elevated surfaces;
- strong near-black primary text;
- restrained warm-gray secondary text;
- sparse muted gold/ochre accent;
- restrained semantic colors for success, warning, danger and status;
- light, clean, spacious, high-contrast composition;
- warmth comes mainly from the canvas and subtle surfaces, not from tinting every component.

## Avoid

- beige/clay monochromatic UI;
- low-contrast brown/gray typography;
- heavy tinted surfaces;
- large accent areas;
- making every card, control or section visibly warm;
- copying layout, component structure or IA from the reference screen.

## Migration order

1. Rework foundation tokens: canvas/background, elevated/surface, primary/muted text, border/divider, accent and semantic roles.
2. Re-evaluate typography contrast and hierarchy against the lighter canvas.
3. Update primitives and components to consume semantic tokens; do not recolor components with arbitrary values.
4. Update shells and patterns after foundations are stable.
5. Verify public and admin use the same tonal language with appropriate density and hierarchy.
6. Run visual QA on representative public/admin screens before propagating the migration.

The tonal relationship is:

```text
light warm canvas → subtle surface separation → strong ink contrast → restrained accent
```

The reference does not define behavior, IA, layout, component anatomy or interaction patterns. Do not preserve the current `clay` direction merely because it exists. Replace conflicting canonical tokens at the Design System level.

## Acceptance check

If the UI looks beige/brown as a whole, the migration is wrong. The dominant impression must be light/neutral first, warm second.
