# Figma Review: Admin Catalog Operations

Status: PASS WITH GAPS for Phase 1 on 2026-06-18

Review basis:

- Figma file: `GRIP-Website Design`
- Page: `Admin CMS - Media Workflows`
- Reviewed frames:
  - `Admin / Products` (`281:9998`)
  - `Admin / Categories` (`281:10268`)
- `Admin / Product Editor` (`281:10376`)
- Review method: inspected live frame text/content, not inferred from spec

Screenshot evidence:

- [products.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/products.png)
- [products-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/products-updated.png)
- [products-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/products-stronger.png)
- [categories.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/categories.png)
- [categories-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/categories-updated.png)
- [categories-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/categories-stronger.png)
- [product-editor.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-editor.png)
- [product-editor-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-editor-updated.png)
- [product-editor-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-editor-stronger.png)
- [product-create-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-create-added.png)
- [cards-workflow-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/cards-workflow-added.png)

Route verdict summary:

- `/admin/products`: `Strong`
- `/admin/product/new`: `Strong`
- `/admin/categories`: `Strong`
- `/admin/product/edit/[id]`: `Strong`
- `/admin/cards/[id]`: `Strong`

## Evidence Observed In Figma

### Products

- Title: `Product Management`
- Subtitle references catalog overview, stock health, visibility, and pricing
- Frame now shows concrete list-state and row-action separation:
  - search field
  - status chips
  - row cards
  - `Edit`, `Hide`, `Cards` CTAs
  - loading banner
  - empty-state card
  - inline error note

Verdict:

- Strong enough for route-level workflow coverage. The frame now shows scan/filter controls, row actions, guard states, list-state handling, and cards-route handoff without leaving the core queue semantics implicit.

### Product Create

- Title: `Product Create`
- Subtitle separates create-state from edit-state
- Pre-publish checks, group boundaries, and create-specific CTA are visible

Verdict:

- Strong enough to lock `/admin/product/new` as its own route-level UI contract.

### Categories

- Title: `Category Management`
- Subtitle references category names, slugs, banner grouping, sort order, product counts
- Frame now shows concrete tree-state and save boundaries:
  - row cards
  - `Move up` / `Move down` controls
  - `Save category` CTA
  - duplicate-slug validation note
  - empty-state card
  - explicit reorder-save note

Verdict:

- Strong enough for route-level workflow coverage. The frame now shows tree ordering, validation boundaries, create/edit intent, and reorder-save semantics in one operator surface.

### Product Editor

- Title: `Product Editor`
- Subtitle: `Full product editing surface for pricing, inventory, visibility, cards API, and media/content handoff.`
- Concrete control/state evidence visible:
  - title, price, and stock fields
  - media preview block
  - grouped save controls
  - route-safe not-found banner
  - publish blocker note tied to validation checks
  - edit-scope note for SEO/cards sync

Verdict:

- Strong enough for route-level workflow coverage. The frame now shows loaded edit-state, field-level presence, grouped save boundaries, publish blockers, and route-safe fallback handling inside the editor route.

### Cards Workflow

- Title: `Cards Workflow`
- Product-linked context, pull/map/conflict/publish steps, and integrity checks are visible

Verdict:

- Strong enough to lock `/admin/cards/[id]` as a route-level workflow instead of leaving it implied under product editing.

## Use Case Coverage Check

- [x] Product editor domain sections are visible
- [x] Boundary between commercial fields and media/content is explicitly called out
- [x] Categories are at least acknowledged as a separate admin concern
- [x] Product list shows row UI, actions, and list-state handling
- [x] Category reorder/tree/edit/save boundary is visible at route level
- [x] Product editor shows field presence, grouped saves, and blocked publish boundaries
- [x] Cards sync workflow is visibly tied to product edit scope and dedicated cards route
- [x] Product create route now has dedicated frame coverage
- [x] Cards workflow route now has dedicated frame coverage
- [x] Figma now covers route-level workflow for all scoped routes, while spec/tests still remain authoritative for business behavior

## Gate Result

Pass with gaps for Phase 1, no route-level blocker remains inside this module.

Reason:

- All scoped routes now have route-specific workflow evidence.
- Residual gaps are density/polish details rather than missing route-level workflow proof.

## Follow-up Constraints

- Treat `spec.md` and tests as the authoritative behavior source for product list actions, category ordering, and cards sync semantics.
- Backend owns validation, stock/visibility semantics, category integrity, and derived catalog state.
