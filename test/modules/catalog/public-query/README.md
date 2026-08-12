# Catalog / Public Query

This slice owns the public ProductModel projection:

- deterministic listing with Category filtering and pagination;
- Active ProductModel detail by stable slug;
- explicit Default Variant initial state;
- compatible public options and exact canonical Variant resolution;
- Variant-image priority with ProductModel-gallery fallback.

Only Active ProductModels with at least one sale-ready Variant are public.
Draft and Discontinued aggregates, inactive Variants, inventory, warehouse,
order, purchase-limit, and warranty-claim state are excluded by the SRS.
