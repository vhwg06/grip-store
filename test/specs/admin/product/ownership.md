# Catalog Base Ownership

## Backend Owns

- authorization cho mọi admin intent và public projection rules.
- attribute type validation, canonicalization, unit compatibility và lifecycle/deactivation semantics.
- scope exclusivity giữa fixed value, VariantDimension và variant-specific value.
- Variant combination generation, selected-subset validation, uniqueness trong ProductModel và immutable option selection.
- SKU trimming, case-folding và permanent global uniqueness.
- Variant/ProductModel state transitions, sale-ready/publicly-sellable derivation và publication invariant preservation.
- SellingPrice validation, configured-currency enforcement và atomic bulk price updates.
- ordering/media primary-image integrity, persistence, deactivation preservation và query filtering.

## Frontend Owns Only

- render catalog, editor, media ordering and state returned by backend.
- local draft/form state and collection of admin/customer intent.
- submit commands; render loading, success, errors and navigation.
- never infer sale readiness, public sellability, selectable options, SKU uniqueness or publication validity as authoritative state.

## External / Deferred Ownership

- inventory owns stock availability; Catalog Base neither consumes nor exposes it in this phase.
- order owns commercial transaction and purchase-limit behavior.
- after-sales owns warranty claims and case processing.
- future Attribute Rule capability owns generic filterability, public visibility, comparability and category applicability.
