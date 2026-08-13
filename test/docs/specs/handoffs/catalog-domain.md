## 1. Current Catalog concepts and user goals/tasks

- `ProductModel` is the sole customer-visible product concept. A Catalog Operator authors it, maintains content and media, configures its Dimensions and Variants, evaluates readiness, publishes it, and can discontinue it.
- `Variant` is a sellable unit inside a ProductModel. Its identity is the canonical combination of Dimension selections; technical values do not participate in identity.
- Catalog Master Data supplies Categories, typed Attribute Definitions and Options, and typed Masters (`Material`, `Finish`, `Pack`) reused by ProductModels and Variants.
- Variant generation previews or persists selected Cartesian combinations. Bulk Variant operations apply price, status, Pack, or media changes per item.
- A Shopper browses public ProductModels, filters the catalog, reads detail, selects compatible options, and resolves an exact public Variant. An Operator can privately preview a Draft ProductModel.
- The legacy `catalog.product` slice is retired/deferred. Its `Product` concept is replaced by `ProductModel` plus `Variant`.

## 2. User-visible data/content shape

- ProductModel identity: name, normalized unique slug, lifecycle status (`Draft`, `Active`, `Discontinued`), Category, typed description/content, fixed values, fixed Pack, measurements with canonical units, and warranty summary.
- ProductModel presentation: ordered gallery, exactly one primary image, ordered Dimensions, ordered allowed values/Options, Variants, and an explicit Default Variant reference.
- Variant data: complete Dimension selections, canonical combination identity, normalized unique SKU, status, derived sale-readiness, current selling price (positive VND is the demonstrated sale-ready value), Pack reference, technical values, and ordered media assignments.
- Master data: Category hierarchy and display position; Definition kind (`Text`, `Number`, `Boolean`, `Enum`, `MasterReference`); Number unit family/canonical unit; stable Enum Option code, label, position, and swatch media; typed Master fields such as Finish swatch or Pack selling unit/quantity/base unit.
- Public list/detail exposes Active ProductModels with at least one sale-ready Variant, content, Category, gallery/media, ordered Dimensions and Options, public Variants, current selling information, and typed technical values when exposed. Default Variant supplies initial options, price, SKU, and media priority; Variant media falls back to ProductModel media.
- Preview uses the public storefront projection over Draft data, preserves Draft status, preserves display order, and uses the explicit Default Variant. It excludes inventory, warehouse, order, purchase-limit, and warranty-claim state.

## 3. Cognitive boundary and owner recommendation

Catalog should own the complete catalog-authoring cognitive boundary: ProductModel as aggregate root, Variant identity/commercial/media rules, Master Data vocabulary, generation/bulk commands, and the public and Draft-preview read projections.

Keep Master Data as a configuration sub-boundary and Public Query/Preview as read-model surfaces, not separate product concepts. Generation and bulk actions may have distinct workflows but remain Catalog commands because they operate on Variant identity and guards.

Keep inventory, warehouse, order, purchase-limit, and warranty-claim state in an operational/commerce owner. Category is classification only; it must not become the owner of Attribute schema, Product Template, or publication rules.

## 4. UI-supporting vs Reference-only API-tagged/deferred classification

| Classification | Contract evidence | Handoff use |
|---|---|---|
| UI-supporting | Accepted `@api` scenarios in `product-model`, `variant`, `master-data`, `variant-generation`, `bulk-variant`, `public-query`, and `product-preview` | Treat as current interaction and information requirements: authoring, readiness, lifecycle, Variant management, reusable vocabulary, generation, bulk results, public browsing/selection, and Draft preview. |
| Reference-only/deferred | Retired `product` scenarios are tagged `@deferred @api @retired`; its README says the contract is replaced by ProductModel and Variant | Do not design a current Product-admin surface or revive Product as a separate concept. Keep only as migration/reference history until formally closed. |

## 5. Required states, transitions, errors, permissions, and terminal semantics

- Permissions: Catalog Operator needs author/manage permission for Catalog commands and private preview; Shopper receives public read projections. Exact role/scope names are not specified.
- ProductModel: create in `Draft`; edit slug only while Draft; publish `Draft -> Active` only after readiness passes; discontinue `Active -> Discontinued`; Discontinued is terminal, remains readable, and reserves its slug. Draft cannot be discontinued, Active slug cannot be changed, and deletion is rejected in every lifecycle state.
- Readiness: required blockers include `MISSING_NAME`, `INVALID_CATEGORY`, `MISSING_PRIMARY_MEDIA`, and `NO_SALE_READY_VARIANT`. Publish also guards `DEFAULT_VARIANT_REQUIRED`, `DEFAULT_VARIANT_NOT_SALE_READY`, and `PRODUCT_NOT_PUBLISHABLE`; readiness percentage is derived and not persisted. Stale expected versions fail with `STALE_PRODUCT_MODEL`.
- Variant: create/generate as `Inactive`; activation and positive VND pricing are separate, with sale-readiness derived from valid commercial data. Inactive Variants remain readable, retain SKU/commercial history, reserve SKU, and are excluded from public options/resolution. Active ProductModels cannot lose their last sale-ready Variant or last primary image. Default replacement is required before inactivating the current Default Variant.
- Variant validation includes `VARIANT_DIMENSION_DUPLICATED`, `MISSING_DIMENSION_VALUE`, `UNEXPECTED_DIMENSION_VALUE`, `INVALID_DIMENSION_VALUE`, `ATTRIBUTE_OPTION_INACTIVE`, `DUPLICATE_VARIANT_COMBINATION`, `INVALID_VARIANT_TECHNICAL_VALUE`, `SKU_ALREADY_EXISTS`, `VARIANT_DIMENSION_LOCKED`, `VARIANT_NOT_SALE_READY`, `DEFAULT_VARIANT_NOT_SALE_READY`, and `INVALID_VARIANT_MEDIA_ASSIGNMENT`.
- Master Data: used Definitions preserve semantic fields after use; inactive Definitions/Options/Masters cannot receive new assignments, historical references remain readable, and used Category/Option records cannot be hard-deleted. Relevant errors include `ATTRIBUTE_SCOPE_CONFLICT`, `ATTRIBUTE_DEFINITION_NOT_FOUND`, `ATTRIBUTE_DEFINITION_INACTIVE`, `ATTRIBUTE_DEFINITION_SEMANTIC_IMMUTABLE`, `ATTRIBUTE_OPTION_NOT_FOUND`, `ATTRIBUTE_OPTION_IN_USE`, `CATEGORY_NOT_FOUND`, `CATEGORY_INACTIVE`, `MASTER_NOT_FOUND`, `MASTER_INACTIVE`, and `MASTER_KIND_MISMATCH`.
- Generation: preview is non-persistent; 101 valid combinations produces non-blocking `VARIANT_COMBINATION_WARNING`; the 1001-combination hard limit and persisted Variant limit produce `VARIANT_COMBINATION_LIMIT_EXCEEDED`. Generation is subset-only, idempotent, and mixed batches return per-item success/failure without rolling back valid items.
- Bulk operations return per-item `updated`, `skipped`, and `failed` results. Valid items persist when another item fails; Default and last-sale-ready guards still apply.
- Public query: only Active ProductModels with at least one sale-ready Variant appear. Draft, Discontinued, inactive, incomplete, unexpected, and non-sale-ready combinations are not publicly resolved; unavailable detail/resolution is represented as not found in the scenarios. Preview never publishes or mutates lifecycle state.

## 6. Dependencies

- ProductModel authoring depends on an Active Category, reusable active Definitions/Options/Masters, media ownership, Variant Dimensions, Variant data, Default Variant selection, and globally unique slug/version checks.
- Variant authoring depends on the ProductModel Dimension schema, active allowed values, canonicalization rules, SKU uniqueness, valid Pack references, and same-ProductModel media.
- Public listing/detail depends on lifecycle state, readiness, sale-ready Variants, stable slug, ordered content/options, Default Variant, and media fallback rules.
- Preview depends on the same projection semantics as Public Query but reads Draft data privately.
- Generation depends on the Dimension/Option Cartesian space and existing canonical combinations. Bulk operations depend on selected Variant identity and the relevant price, Master, media, and lifecycle guards.
- Catalog explicitly does not depend on operational stock, warehouse, order, purchase-limit, or warranty-claim state as part of these projections.

## 7. Reusable interaction/information candidates

- Structured readiness panel: blocker code, scope, target, section, field, and message, with a clear publish gate.
- Ordered editors for Category hierarchy, gallery/primary image, Dimensions, and Options; preserve order separately from identity.
- Variant matrix/combination preview showing `existing`, `new`, and `excluded`, selected subset, warning/limit state, and idempotent generation results.
- Variant table with canonical selections, technical values, SKU, price, status, sale-readiness, Pack, media, and explicit Default marker.
- Explicit Default Variant selector with replacement guard and visible downstream initial-state impact.
- Batch result pattern with per-item `updated`/`skipped`/`failed` status and semantic error details.
- Public selector pattern that starts from Default Variant, filters to compatible sale-ready options, resolves canonical numeric representations, and applies Variant-media-over-gallery fallback.
- Stable identity/canonicalization feedback for slugs, SKUs, numeric units, and reference codes while allowing display metadata to change independently.

## 8. Explicit unknowns

- Exact greenfield API paths, payloads, response envelopes, HTTP status mapping, pagination shape/default ordering, and command/read authorization scopes are not established by the handoff sources.
- The full ProductModel edit surface after publication, complete Variant status graph, and exact deletion/archival policy for Variants and media are unspecified.
- The complete readiness blocker catalog, validation-message text, and error payload schema are unspecified beyond named examples.
- Media upload/asset lifecycle, image URL/content shape, and the exact typed projection for technical values are unspecified.
- Public search semantics and the exact shape/ownership of buy metadata, settings, announcement, and any availability/stock fields need resolution; the sources exclude operational inventory while also mentioning buy metadata.
- Preview endpoint/access rules, Operator role boundaries, audit requirements, and concurrency behavior beyond ProductModel version checks are unspecified.
- Empty, loading, stale, permission-denied, partial-failure, and other UI presentation states are not defined by the API contracts.
- The legacy Product migration mapping and its formal retirement criterion remain open.
