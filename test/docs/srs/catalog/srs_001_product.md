# Catalog & Product — Greenfield Domain and Feature Specification

**Specification ID**: srs_001_product
**Status**: Canonical Step 1 specification
**Scope**: Big-bang rewrite of Catalog & Product

> This document is the business and domain source of truth for the new Catalog & Product flow. Existing implementation artifacts are audit evidence only. They are not design constraints.

## 1. Purpose

Grip will replace the existing Catalog and Product implementations with one greenfield domain. This specification defines the business vocabulary, aggregate ownership, invariants, lifecycle commands, derived projections, error contract, and acceptance behavior for the replacement.

The later implementation sequence is:

Business requirements and approved discovery decisions
→ New domain and feature specification
→ Acceptance features
→ Database and OpenAPI design
→ Backend and frontend implementation
→ Verification

Step 1 does not implement API, database, frontend, migration, or test bindings.

## 2. Scope

### In scope

- Category classification, hierarchy, ordering, and activation.
- Typed Attribute Definitions and rich Attribute Options.
- Material, Finish, and Pack Master Data.
- ProductModel authoring and lifecycle.
- Fixed attributes, Variant Dimensions, Variant technical values, and measurements.
- ProductModel media and Variant media assignments.
- Variant identity, SKU, commercial values, status, and sale readiness.
- Default Variant and ProductModel publish readiness.
- Variant combination preview, selected generation, and manual creation.
- Bulk Variant price, status, Pack, and media operations.
- Admin storefront preview for Draft ProductModels.
- Public ProductModel listing, detail, option projection, and Variant resolution.

### Big-bang rewrite policy

The later implementation cutover will:

- Delete the old Catalog and Product flow.
- Drop the old Catalog and Product schema.
- Create the new domain.
- Expose the new contract.
- Build the new administration and storefront flow.
- Replace the old acceptance suite.

The cutover will not migrate, backfill, map, preserve, dual-read, dual-write, adapt, or provide compatibility for old Catalog/Product data or semantics. Existing Catalog/Product data is not preserved by this specification.

### Out of scope

- Inventory, warehouse, stock count, or availability ownership.
- Pricing rules, price lists, promotions, or discount engines.
- Product Type, Family, Family Variant, Attribute Set, or Category-owned schemas.
- Multi-level ProductModel structures.
- Full staged/current publishing, revisions, scheduling, partial publish, or revert workflows.
- Cart, checkout, order, payment, warranty claim, return, or refund behavior.
- Database schema design, OpenAPI design, UI layout, Figma, and implementation.

## 3. Terminology

| Term | Meaning |
| --- | --- |
| Catalog | The bounded capability containing classification, reusable definitions, master references, and ProductModels. |
| Category | Classification and ordering data. It does not own product rules or an Attribute schema. |
| Attribute Definition | A reusable typed definition that can be assigned to one ProductModel scope. |
| Attribute Option | A stable selectable option belonging to an Enum Attribute Definition. |
| Master Data | Shared reference values limited to Material, Finish, and Pack. |
| ProductModel | The customer-visible product aggregate and Aggregate Root. |
| Variant | The actual sellable unit within a ProductModel. |
| SKU | The commercial identity of a Variant. SKU uniqueness is global. |
| Fixed Attribute | A ProductModel value shared by all Variants. |
| Variant Dimension | A selectable Attribute Definition whose values participate in Variant identity. |
| Technical Value | A Variant-specific value that does not participate in Variant identity. |
| Canonical Combination | The normalized identity of the complete set of Variant Dimension values. |
| Sale-ready Variant | A derived Variant state eligible for public selling information. |
| Default Variant | The explicitly selected Variant used for the initial public projection. |
| Publish Readiness | A derived evaluation of whether a ProductModel can become Active. |
| Public Projection | A read-only representation containing only Active ProductModel and public Variant data. |

## 4. Actors

- Catalog Operator: configures vocabulary, authors ProductModels, manages Variants, and performs lifecycle commands.
- Catalog Administrator: performs the same business operations with the required administration permission.
- Shopper: reads public ProductModel projections, selects options, and resolves a public Variant.
- Catalog Domain: validates invariants, computes derived state, owns transitions, and guarantees uniqueness/concurrency behavior.

Permission matrices and transport authentication are outside this specification. Every operation assumes the actor has the required permission.

## 5. Domain model

Catalog owns:

- Category.
- AttributeDefinition with AttributeOption children.
- MasterData limited to Material, Finish, and Pack.
- ProductModel as Aggregate Root.

ProductModel owns:

- FixedAttributeValues.
- ProductImage collection.
- VariantImageAssignment collection.
- VariantDimension collection.
- Variant collection.
- Default Variant reference.

The following are derived projections or calculations, not persisted entities:

- VariantIdentity.
- VariantReadiness.
- ProductReadiness.
- CombinationPreview.
- PublicProductProjection.

Required semantic separation:

- ProductModel is the product shown to the shopper.
- Variant is the actual sellable unit.
- SKU is the commercial identity of the Variant.

There is no second flat Product concept in the new domain.

## 6. Aggregate boundaries

- ProductModel is the Aggregate Root for name, slug, description, Category reference, fixed values, measurements, warranty summary, media, Dimensions, Variants, and Default Variant.
- A ProductModel command validates all affected children and aggregate readiness rules before committing.
- Category, Attribute Definition, Attribute Option, and each Master Data kind are reusable configuration records with their own identity and lifecycle.
- ProductModel stores references to reusable Catalog records; it does not mutate their global definitions.
- ProductImage belongs to one ProductModel. VariantImageAssignment may reference only images and Variants of that ProductModel.
- Public projections are derived from the ProductModel aggregate and current public Variant state; they are not a second source of truth.

## 7. Approved discovery decisions

The new domain absorbs only discovery patterns that fit Grip's approved scope:

- Product-centric administration is organized around ProductModel responsibilities and supports inline Variant work.
- Common/fixed attributes are distinct from Variant Dimensions and Variant technical values.
- Attribute Options have stable identity and readiness is continuously inspectable as derived state.
- ProductModel and sellable Variant are distinct concepts, with an explicit Default Variant and task-oriented lifecycle commands.
- Dimension configuration is separate from combination generation; operators can preview and generate only a selected subset.
- Bulk Variant operations apply semantic commands to selected Variants and return item-level results.

The following discovery concepts are intentionally not adopted: Product Type, Family, Family Variant, Attribute Set, Category-owned schemas, multi-level ProductModels, full staged/current publishing, Inventory inside Catalog, and pricing rule engines.

## 8. Entity semantics

### Category

Category supports hierarchy, display metadata, position, activation, and deactivation.

- Category is classification only.
- Category does not own Attribute schema, Product Template, publication rules, or Variant rules.
- Deactivation blocks new ProductModel assignment and blocks a Draft from publishing into that Category.
- An already Active ProductModel remains publicly readable when its Category is later deactivated.
- Category is never hard-deleted.

### Attribute Definition

An Attribute Definition has a stable semantic key, display metadata, active state, and exactly one Value Kind:

- Text.
- Number.
- Boolean.
- Enum.
- MasterReference.

Rules:

- Number uses a unit family and canonical unit. Version 1 supports the approved length unit registry.
- Boolean has no unit or Master target.
- Enum owns AttributeOption records and never uses a raw string array as identity.
- MasterReference targets exactly one of Material, Finish, or Pack.
- Display name, description, and display position are mutable metadata.
- Value Kind, unit family, canonical unit, reference target, and semantic key become immutable after first use.
- Deactivation blocks new assignment but leaves existing values readable.

### Attribute Option

An Attribute Option belongs to one Enum Attribute Definition and contains:

- Code.
- Label.
- Position.
- Optional swatch media.
- Active state.

Rules:

- Code is unique within its Definition and is the stable option identity.
- Code may be corrected before first use; after use it is immutable.
- Label, position, swatch media, and active state are mutable metadata.
- An inactive option cannot be selected for new data.
- Existing references to an inactive option remain readable.
- A used option cannot be hard-deleted.

### Master Data

Master Data is limited to Material, Finish, and Pack.

- The pair of kind and name is unique.
- Kind is immutable.
- Finish may contain swatch media.
- Pack contains shared selling-unit metadata such as selling unit, quantity, and base unit.
- An inactive Master cannot be assigned to new ProductModel or Variant data.
- Existing references remain readable after deactivation.
- A Master reference must match the target kind of its Attribute Definition.
- Master Data does not contain Variant-specific data, stock, or quantity pricing.

### ProductModel

ProductModel owns:

- Name.
- Slug.
- Description.
- Category.
- Fixed Attribute values.
- Optional fixed Pack.
- Measurements.
- Optional warranty summary.
- ProductImage collection.
- VariantDimension collection.
- Variant collection.
- Default Variant reference.
- Lifecycle status.
- Optimistic version.

Rules:

- A new ProductModel is Draft.
- Name is required for publication and cannot be blank after normalization.
- Slug is system-wide unique.
- Slug may be generated from name when a Draft is created.
- Slug may be edited only while Draft.
- Changing name never changes slug automatically.
- Slug is the public identifier and is immutable after publication.
- A Discontinued slug remains reserved.
- ProductModel does not own inventory, warehouse, order, purchase-limit, or warranty-claim state.
- ProductModel is never deleted; lifecycle commands remove it from public availability.

### Variant Dimension

A Variant Dimension contains:

- Attribute Definition.
- Position.
- Typed, display-ordered allowed values.

Rules:

- The pair of ProductModel and Definition is unique.
- Position controls display order only.
- Allowed values preserve display ordering.
- Display ordering never participates in Variant identity.
- Every allowed value must match the Definition Value Kind and stable reference identity.
- Draft may change Dimension structure only when every existing Variant remains valid under the new exact Dimension set.
- Active cannot add/remove a Dimension, replace its Definition, or make a structural change that invalidates an existing Variant.
- Active may add a valid new allowed value and reorder display values.
- A value used by an existing Variant cannot be removed from the Dimension.
- Invalid structural changes return VARIANT_DIMENSION_LOCKED.

### Variant

Variant owns:

- SKU.
- Selected options.
- Technical values.
- Current selling amount.
- Current selling currency.
- Pack reference.
- Status, either Active or Inactive.
- Derived canonical combination.
- Variant image assignments.

Rules:

- A Variant selects exactly one valid value for every ProductModel Dimension.
- It contains no value outside the ProductModel Dimension schema.
- Selected options are immutable from creation. A different combination requires a replacement Variant.
- Technical values are permitted only for Definitions declared as Variant Technical Value.
- Technical values never participate in canonical identity.
- CreateVariant and GenerateVariants create Inactive Variants.
- Variant status supports Inactive to Active and Active to Inactive with Default Variant and last sale-ready guards.
- SKU is normalized before uniqueness checks and remains reserved while Inactive.
- Client-supplied canonical identity is never authoritative.

### ProductImage and VariantImageAssignment

- Every ProductImage belongs to one ProductModel.
- ProductModel gallery has explicit ordering and at most one primary image.
- Active ProductModel must have one valid primary image.
- Variant may have an optional gallery and at most one primary Variant image.
- One ProductImage may be assigned to multiple Variants of the same ProductModel.
- Cross-ProductModel assignment is invalid.
- A public Variant without a primary Variant image falls back to ProductModel gallery and primary image.

## 9. Value objects and normalization

### Slug

Slug is a normalized public identifier. It is globally unique, generated from name only when needed, editable only in Draft, and reserved after publication including after Discontinued.

### Attribute values

- Text: trim, normalize whitespace, and case-fold for identity.
- Number: parse a supported length unit and convert to canonical length unit.
- Boolean: canonical true or false.
- Enum: stable Attribute Option code, never label.
- MasterReference: stable Master identity, never display name.

### Money

Version 1 selling currency is VND. Selling amount must be greater than zero for sale readiness. This is current selling price only, not a pricing rule engine.

### Measurement

Equivalent supported length values, such as 20 cm and 200 mm, resolve to one canonical value. Incompatible units are rejected.

### Version

Every successful ProductModel mutation increments optimistic version. A command using an older version returns STALE_PRODUCT_MODEL and makes no change.

## 10. Attribute scopes

On one ProductModel, an Attribute Definition belongs to exactly one scope:

- Fixed Attribute.
- Variant Dimension.
- Variant Technical Value.

The domain derives scope from the ProductModel association:

- A Definition in fixed_attribute_values is Fixed Attribute.
- A Definition in VariantDimension is Variant Dimension.
- A Definition allowed in per-Variant technical_values is Variant Technical Value.

Reusing a Definition in the same scope is allowed. Assigning it to another scope returns ATTRIBUTE_SCOPE_CONFLICT, even when the value or label is identical.

Deactivating a Definition or Option after use does not rewrite historical data. It blocks new assignments and new combinations that require the inactive reference.

## 11. Product lifecycle

ProductModel lifecycle is exactly:

- Draft to Active.
- Active to Discontinued.

The only lifecycle commands are PublishProductModel and DiscontinueProductModel.

- PublishProductModel is valid only from Draft and performs fresh readiness evaluation.
- DiscontinueProductModel is valid only from Active and is terminal.
- Active to Draft, Active to an unpublished state, Discontinued to Active, and Discontinued to Draft are unsupported.
- Generic ProductModel status update is not a capability.
- Active allows safe content, media, commercial, and technical edits only when all Active invariants remain valid.
- Discontinued remains operator-readable but is absent from public projections.

## 12. Variant lifecycle

Variant status is Active or Inactive.

- CreateVariant and GenerateVariants create Inactive Variants.
- Activation validates references, selected values, and commercial invariants.
- Inactivation is rejected when the Variant is Default without a sale-ready replacement.
- Inactivation is rejected when it would remove the last sale-ready Variant from an Active ProductModel.
- Inactive Variants retain SKU, selections, commercial values, references, and history.
- Inactive Variants are excluded from public options and resolution.

## 13. Canonical Variant identity

The domain calculates canonical combination for creation, generation, and public resolution:

1. Resolve ProductModel Dimension definitions.
2. Validate exactly one value for every Dimension and no unexpected key.
3. Normalize each Attribute key using stable semantic key, not display name or position.
4. Validate and normalize the value by Value Kind.
5. Convert Number values to canonical length unit.
6. Use option code for Enum and stable Master identity for MasterReference.
7. Sort normalized pairs by canonical Attribute key.
8. Serialize as key=value|key=value.

Changing label, display position, casing, whitespace, or equivalent unit representation cannot create a second identity.

The domain guarantees one canonical combination per ProductModel, one SKU globally, and semantic duplicate errors rather than raw persistence errors.

## 14. Variant generation

There are three separate capabilities:

- PreviewVariantCombinations.
- GenerateVariants.
- CreateVariant.

### PreviewVariantCombinations

- Does not persist.
- Calculates the Cartesian product of valid active allowed values.
- Classifies results as existing, new, or excluded.
- Returns total Cartesian count and canonical representation.
- Returns a non-blocking warning above the warning threshold.
- Rejects above the hard limit.

### GenerateVariants

- Persists only operator-selected combinations.
- Never creates the entire Cartesian product automatically.
- Validates each selected combination independently.
- Retries for an existing canonical combination return existing and do not fail the batch.
- Valid new combinations are created as Inactive Variants.
- Invalid combinations return item-level failed results without rolling back valid items.
- Refuses new persistence when the maximum persisted count would be exceeded.
- Is idempotent by ProductModel and canonical combination.

### CreateVariant

- Creates exactly one Variant.
- Validates complete Dimension set, values, scopes, references, and canonical uniqueness.
- Does not accept client canonical identity as authoritative.
- Duplicate identity returns DUPLICATE_VARIANT_COMBINATION.
- Does not create sibling combinations.

## 15. Combination limit policy

Approved version 1 defaults:

- Warning threshold: 100 Cartesian combinations.
- Cartesian hard limit: 1000 combinations.
- Maximum persisted Variants: 500 per ProductModel.

The policy distinguishes Cartesian total, selected combinations, and already persisted Variants.

- Up to 100 combinations proceed without a warning.
- 101 to 1000 proceed with VARIANT_COMBINATION_WARNING.
- More than 1000 returns VARIANT_COMBINATION_LIMIT_EXCEEDED and persists nothing.
- A GenerateVariants request exceeding 500 persisted Variants is rejected before new creation.

## 16. Media behavior

- ProductModel gallery ordering is explicit and independent from primary selection.
- ProductModel has at most one primary image.
- Replacing a primary clears the old primary and assigns exactly one new primary.
- Active ProductModel cannot remove its last primary image.
- Variant assignments have explicit ordering and at most one primary.
- One ProductImage may belong to many Variants of its ProductModel.
- Cross-ProductModel assignments return INVALID_VARIANT_MEDIA_ASSIGNMENT.
- Public Variant media uses its primary image when present, otherwise ProductModel media.

## 17. Default Variant behavior

- Draft may have no Default Variant.
- Publish requires an explicit Default Variant and returns DEFAULT_VARIANT_REQUIRED when absent.
- Default Variant must belong to the ProductModel and be sale-ready.
- Default Variant cannot be inactivated, made non-sale-ready, or removed without a sale-ready replacement in the same valid command.
- Active ProductModel always has a sale-ready Default Variant.
- Storefront uses Default Variant for initial options, price, SKU, and media priority.
- Storefront never chooses the first or cheapest Variant implicitly.

## 18. Sale readiness

Sale readiness is derived, not a lifecycle status or persisted percentage. A Variant is sale-ready only when:

- Status is Active.
- Selling amount is greater than zero.
- Selling currency is VND.
- Selected options contain exactly one valid value for every Dimension.
- Selected options contain no unexpected value.

Active does not imply sale-ready. A non-sale-ready Variant is excluded from public options and resolution.

## 19. Publish readiness

Publish readiness is a derived projection containing:

- ready.
- passed_count.
- total_count.
- blockers.
- warnings.

Every issue contains code, scope, target_id, section, field, and message.

Minimum blockers:

- MISSING_NAME.
- INVALID_CATEGORY.
- INVALID_FIXED_ATTRIBUTE.
- ATTRIBUTE_SCOPE_CONFLICT.
- INVALID_VARIANT_DIMENSION.
- MISSING_PRIMARY_MEDIA.
- NO_SALE_READY_VARIANT.
- DEFAULT_VARIANT_REQUIRED.
- DEFAULT_VARIANT_NOT_SALE_READY.

VARIANT_COMBINATION_WARNING is non-blocking.

Readiness is evaluated on explicit request, after readiness-affecting mutations, in the admin ProductModel list/workspace, and again inside PublishProductModel. It is never persisted as a percentage. Publish returns PRODUCT_NOT_PUBLISHABLE with issues and keeps Draft when any blocker remains.

## 20. Catalog administration

### Category

Create, update display metadata, reorder, activate, and deactivate. Validate hierarchy and uniqueness. Hard delete is never available.

### Attribute Definition and Option

Create Definitions, update mutable display metadata, add/update/reorder Options, and deactivate Definitions or Options. Semantic fields become immutable after use. Used Options cannot be hard-deleted. New assignment validates active state, Value Kind, and scope.

### Master Data

Manage Material, Finish, and Pack, update mutable metadata, and activate/deactivate them. New references require an active Master of the matching kind. Historical references remain readable.

## 21. Product administration

ProductModel administration is grouped by business responsibility:

- Overview.
- Attributes.
- Variants.
- Media.
- Preview.
- Publish Readiness.
- Lifecycle.

Capabilities:

- Create Draft ProductModel.
- Update name, slug while Draft, description, Category, fixed values, fixed Pack, measurements, and warranty summary.
- Configure Dimension definitions, positions, and allowed values.
- Create one Variant manually.
- Preview and generate selected combinations.
- Configure SKU, current selling price, currency, Pack, technical values, status, and media.
- Select and replace Default Variant under its guards.
- Manage ProductModel and Variant media.
- Evaluate readiness and inspect blockers/warnings.
- Preview the Draft storefront projection.
- Publish and discontinue through semantic lifecycle commands.

No generic patch may bypass validation or lifecycle semantics.

## 22. Public Catalog behavior

### ListPublicProductModels

- Returns only Active ProductModels with at least one sale-ready Variant.
- Supports deterministic pagination and Category filtering.
- Returns ProductModel projections, not Variants as independent products.
- Excludes Draft and Discontinued ProductModels.
- Excludes Inventory and warehouse state.

### GetPublicProductModel

- Uses stable ProductModel slug as public identifier.
- Returns ProductModel content, Category, gallery, ordered Dimensions, ordered options, public sale-ready Variant information, Default Variant projection, and current selling information.
- Missing, Draft, and Discontinued slugs have no public detail projection.
- Public technical values belonging to sale-ready Variants may be returned in their typed canonical form; stock, warehouse, order, purchase-limit, and warranty-claim state are never returned.

### ResolveVariant

- Accepts selected Dimension values and calculates the canonical combination.
- Returns only an exact matching sale-ready Variant of the Active ProductModel.
- Equivalent numeric representations resolve to the same Variant.
- Missing, incomplete, unexpected, inactive, or non-sale-ready combinations return no public Variant.
- Available options derive from compatible public sale-ready Variants and preserve Dimension/Option order.
- Resolved Variant media uses Variant primary image, otherwise ProductModel media.

### Admin storefront preview

- Catalog Operator may preview a Draft before publication.
- Preview is not public and does not change lifecycle state.
- Preview uses the same projection rules as public detail with Draft data.
- Preview includes name, media, fixed attributes, ordered Dimensions/options, Default Variant when present, current price, Variant selection behavior, and suitable technical values.
- Preview does not introduce revisions, staged/current state, scheduling, or partial publishing.

## 23. Concurrency and uniqueness guarantees

- ProductModel commands use optimistic version checks.
- A stale command returns STALE_PRODUCT_MODEL and performs no mutation.
- Publish re-reads the aggregate and evaluates readiness in the same transaction.
- A concurrent Variant, media, price, or Default Variant update is either detected as stale or observed by fresh readiness evaluation.
- Slug uniqueness is global across Draft, Active, and Discontinued.
- SKU uniqueness is global across Active and Inactive Variants.
- Canonical combination uniqueness is scoped to one ProductModel.
- Attribute Option code uniqueness is scoped to one Definition.
- Master kind/name uniqueness is global within Catalog.
- Domain/application layers translate uniqueness conflicts to semantic errors.

## 24. Error contracts

Minimum stable semantic codes:

CATEGORY_NOT_FOUND
CATEGORY_INACTIVE
ATTRIBUTE_DEFINITION_NOT_FOUND
ATTRIBUTE_DEFINITION_INACTIVE
ATTRIBUTE_DEFINITION_SEMANTIC_IMMUTABLE
ATTRIBUTE_OPTION_NOT_FOUND
ATTRIBUTE_OPTION_INACTIVE
ATTRIBUTE_OPTION_IN_USE
ATTRIBUTE_SCOPE_CONFLICT
MASTER_NOT_FOUND
MASTER_INACTIVE
MASTER_KIND_MISMATCH
PRODUCT_MODEL_NOT_FOUND
PRODUCT_MODEL_NOT_DRAFT
PRODUCT_MODEL_NOT_ACTIVE
INVALID_PRODUCT_LIFECYCLE_TRANSITION
PRODUCT_SLUG_ALREADY_EXISTS
VARIANT_DIMENSION_DUPLICATED
VARIANT_DIMENSION_LOCKED
INVALID_DIMENSION_VALUE
MISSING_DIMENSION_VALUE
UNEXPECTED_DIMENSION_VALUE
INVALID_VARIANT_TECHNICAL_VALUE
SKU_ALREADY_EXISTS
DUPLICATE_VARIANT_COMBINATION
VARIANT_NOT_SALE_READY
DEFAULT_VARIANT_REQUIRED
DEFAULT_VARIANT_NOT_SALE_READY
MISSING_PRIMARY_MEDIA
INVALID_VARIANT_MEDIA_ASSIGNMENT
VARIANT_COMBINATION_WARNING
VARIANT_COMBINATION_LIMIT_EXCEEDED
PRODUCT_NOT_PUBLISHABLE
STALE_PRODUCT_MODEL

Raw persistence constraint names and legacy error codes are never public contracts.

## 25. Acceptance scenarios

Acceptance behavior is defined by new greenfield feature files under test/modules/catalog. Scenario IDs are new and must not reuse legacy IDs.

| Priority | Journey | Feature file | Scenario IDs |
| --- | --- | --- | --- |
| P1 | Catalog configuration | catalog/master-data/behavior.feature | SC-GREEN-MASTER-001 through 008 |
| P1 | ProductModel authoring, readiness, lifecycle | catalog/product-model/behavior.feature | SC-GREEN-MODEL-001 through 016 |
| P1 | Dimensions, Variants, identity, readiness | catalog/variant/behavior.feature | SC-GREEN-VARIANT-001 through 013 |
| P1 | Public listing, detail, resolution | catalog/public-query/behavior.feature | SC-GREEN-PUBLIC-001 through 008 |
| P1 | Combination preview and generation | catalog/variant-generation/behavior.feature | SC-GREEN-GENERATION-001 through 008 |
| P2 | Bulk Variant operations | catalog/bulk-variant/behavior.feature | SC-GREEN-BULK-001 through 005 |
| P2 | Admin storefront preview | catalog/product-preview/behavior.feature | SC-GREEN-PREVIEW-001 through 004 |

### Traceability matrix

| Requirement ID | Business requirement | Domain rule | Acceptance scenarios |
| --- | --- | --- | --- |
| BR-001 | Reusable typed Catalog vocabulary | Category, Definition, Option, and Master ownership | MASTER-001 to MASTER-008 |
| BR-002 | Safe deactivation with historical readability | Active-state and historical-reference rules | MASTER-002, MASTER-007, MASTER-008, MODEL-011, VARIANT-013 |
| BR-003 | ProductModel is the only visible product | ProductModel ownership and public projection | MODEL-001, MODEL-004, PUBLIC-001, PUBLIC-002 |
| BR-004 | Stable public identity | Slug generation, uniqueness, and immutability | MODEL-001, MODEL-002, MODEL-014, PUBLIC-002 |
| BR-005 | Definitions cannot cross scopes | Scope map and conflict rule | MODEL-003 |
| BR-006 | Dimensions define complete combinations | Exact Dimension set and allowed values | VARIANT-001 to VARIANT-004, GENERATION-001 |
| BR-007 | Variant identity is canonical and unique | Canonical algorithm and uniqueness | VARIANT-005, VARIANT-006, GENERATION-006, PUBLIC-004, PUBLIC-005 |
| BR-008 | Technical values do not alter identity | Technical scope rule | VARIANT-007, PREVIEW-004 |
| BR-009 | Status and sale readiness are distinct | Variant lifecycle and derived readiness | VARIANT-009, VARIANT-010, MODEL-010, PUBLIC-003 |
| BR-010 | Default Variant controls initial state | Default ownership and sale-ready guard | MODEL-006, MODEL-008, MODEL-016, PUBLIC-002, PUBLIC-003, PREVIEW-003 |
| BR-011 | Product and Variant media are distinct | Media ownership, primary, and fallback rules | MODEL-005, MODEL-010, VARIANT-012, PUBLIC-007, BULK-004 |
| BR-012 | Publication is readiness-gated | Readiness projection and publish transaction | MODEL-007, MODEL-008, MODEL-012, MODEL-016 |
| BR-013 | Generation is previewable, partial, and idempotent | Preview/Generate/Create separation and limits | GENERATION-001 to GENERATION-008 |
| BR-014 | Operators can update many Variants | Partial batch result | BULK-001 to BULK-005 |
| BR-015 | Drafts can be previewed safely | Shared projection behavior | PREVIEW-001 to PREVIEW-004 |
| BR-016 | Public Catalog exposes only valid Active data | Public filtering and resolution | PUBLIC-001 to PUBLIC-008 |
| BR-017 | Concurrent updates cannot publish stale state | Optimistic version and fresh readiness | MODEL-012 |
| BR-018 | Lifecycle is explicit and terminal | Publish and discontinue commands | MODEL-008, MODEL-009, MODEL-013, MODEL-015 |

Every scenario must independently verify its outcome and semantic error where applicable. Feature files are the acceptance contract; bindings are a later phase.

## 26. Non-goals

The new domain and Step 1 do not include:

- Legacy Product mapping.
- Catalog Base mapping.
- Data migration or backfill.
- Data preservation.
- Dual-read or dual-write.
- Compatibility endpoint or adapter.
- Database schema implementation.
- OpenAPI implementation.
- Backend implementation.
- Frontend implementation.
- Figma or screen layout.
- Product Type, Family, Family Variant, or Attribute Set.
- Category-owned Attribute schema.
- Multi-level ProductModel.
- Full staged/current publishing engine.
- Inventory, warehouse, or stock count.
- Pricing rule engine.
- Cart, checkout, order, payment, warranty, return, or refund workflows.

## 27. Open decisions

No business decision required for the Step 1 contract remains open.

The following are intentionally deferred to later design phases and cannot change the business semantics:

- Exact database tables, indexes, and transaction implementation.
- Exact OpenAPI paths, payload shapes, and transport status mapping.
- Exact permission matrix and authentication mechanism.
- Exact UI workspace layout and visual design.
- Deployment mechanism for the approved combination-limit configuration.

## 28. Legacy removal impact report

This is the only section that records old implementation artifacts. It records removal scope, not behavior to preserve.

| Legacy artifact category | Known impact | Required later action |
| --- | --- | --- |
| Flat Product domain and products persistence | Storefront cards/detail, cart/review/engagement references, admin Product flow | Delete old model and rewrite consumers against ProductModel/Variant |
| Legacy product routes and public identifiers | Storefront routes, runtime page objects, API helpers, admin pages | Remove old routes and build the slug-based flow |
| Existing Catalog Base domain and contract | Catalog adapters, API helpers, feature modules, admin Catalog UI | Delete as an implementation and replace with the greenfield domain |
| Existing Catalog/Product migrations and schema | Current persistence and uniqueness assumptions | Drop old schema and create new schema; do not convert old rows |
| Existing OpenAPI and generated contract | Old endpoint names, status shapes, and field semantics | Replace with a contract derived from this SRS |
| Existing Catalog/Product scenarios and bindings | Current manifests, step adapters, traceability, and CI selection | Replace after approval; do not preserve legacy semantics |
| Existing Product UI/Figma flow | Admin editor/list and storefront Product pages | Replace with ProductModel workspace and public projection |
| Downstream modules referring to old Product identity | Cart, reviews, engagement, browse, search, and buy flows | Audit and rewrite at implementation boundary; no adapter or fallback |

The removal report does not authorize implementation in Step 1 and does not create a mapping or compatibility requirement.

## Final rule

Design the system the team would build if no Catalog or Product implementation existed today. Once this specification and its acceptance features are approved, delete the old implementations and build the new flow from this document.
