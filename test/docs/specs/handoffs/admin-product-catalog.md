# Wave A handoff — Admin product/catalog

Source boundary: approved admin product behavior and current Catalog dependencies only. Retired legacy Product scenarios are excluded from accepted behavior.

## Coverage

- 10 accepted scenarios: 7 functional, 3 visual; all browser; 1 empty-result.
- Create: `SC-ADMIN-PRODUCT-CREATE-001/002`, `SC-VISUAL-ADMIN-PRODUCT-CREATE-001`.
- List: `SC-ADMIN-PRODUCT-LIST-001/002/003`, `SC-VISUAL-ADMIN-PRODUCT-LIST-001`.
- Editorial/category: `SC-ADMIN-PRODUCT-EDITORIAL-001`, `SC-ADMIN-PRODUCT-CATEGORY-001`, `SC-VISUAL-ADMIN-CATEGORIES-001`.

## User goals and visible information

- Find and manage catalog entities through identity/context, search, visibility and stock-health information.
- Create/edit product information, specifications, media and preview state.
- Link or clear a published editorial article without changing commercial state.
- Manage category hierarchy/position and expose persisted category context.
- Current Catalog concepts include Product Model Overview, Attributes, Variants, Media, Preview, Publish Readiness and Lifecycle.

## Behavior constraints

- Create/edit: input specification/media → preview → save → persisted entity → fresh public detail where applicable.
- Search with no match is an empty state, not an error boundary.
- Editorial link is reversible: no link ↔ published article; save and clear must persist on fresh read.
- Category position save must be confirmed by fresh category read.
- Current Product Model lifecycle is `Draft → Active → Discontinued`; Discontinued is terminal, draft preview is private and only eligible Active models are public.
- Inactive category/master/option/definition blocks new assignments while historical references remain readable.
- ProductModel is not hard-deleted. Readiness exposes structured blockers; percentage is derived.

## Validation, conflicts and dependencies

Relevant errors include `CATEGORY_NOT_FOUND`, `CATEGORY_INACTIVE`, `PRODUCT_MODEL_NOT_FOUND`, `PRODUCT_MODEL_NOT_DRAFT`, `PRODUCT_MODEL_NOT_ACTIVE`, `INVALID_PRODUCT_LIFECYCLE_TRANSITION`, `PRODUCT_SLUG_ALREADY_EXISTS`, `STALE_PRODUCT_MODEL`, readiness/media blockers and typed attribute/variant errors.

Unresolved contract boundaries: direct row toggle/delete wording is legacy-shaped and conflicts with canonical no-delete/lifecycle behavior; stock-health filtering depends on inventory; editorial linking crosses content ownership. Do not resolve these by inventing generic status behavior.

Dependencies: admin authorization, Catalog entities, inventory/stock context, content editorial link, public Catalog projections and media/variant readiness.

## API classification and Design System candidates

- UI-supporting dependencies: `SC-GREEN-MASTER-001..008`, `SC-GREEN-MODEL-001..016`, `SC-GREEN-PREVIEW-001..004`, `SC-GREEN-PUBLIC-001..008`.
- Reference-only/deferred legacy: `SC-CAT-PRODUCT-READ-001..004`, `SC-CAT-PRODUCT-COMMAND-001..005`, `SC-CAT-PRODUCT-DETAILS-001..003`.

Candidates: contextual data table row actions, search/filter, empty result, typed attribute/specification controls, media picker/preview/primary-media state, terminal confirmation, article link/clear, category reorder, inline validation, permission/stale/unavailable/persistence feedback.
