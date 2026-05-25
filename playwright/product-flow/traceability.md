# Product Flow Traceability

## Use Case to Scenario Mapping

- `UC-PF-01` Guest Homepage Discovery
  - `PF-HOME-001`
  - `PF-HOME-002`
  - `PF-HOME-003`
  - `PF-HOME-004`
  - `PF-HOME-005`
  - `PF-HOME-006`

- `UC-PF-02` Guest Browse Catalog
  - `PF-CATALOG-001`
  - `PF-CATALOG-002`
  - `PF-CATALOG-003`
  - `PF-CATALOG-004`
  - `PF-CATALOG-005`
  - `PF-CATALOG-006`

- `UC-PF-03` Guest View Product Detail
  - `PF-DETAIL-001`
  - `PF-DETAIL-002`
  - `PF-DETAIL-005`

- `UC-PF-04` Guest Add To Cart From Product Detail
  - `PF-DETAIL-003`
  - `PF-DETAIL-004`

- `UC-PF-05` Admin Manage Product Details
  - `PF-API-006`
  - `PF-API-007`
  - `PF-API-008`

## API Contract to Scenario Mapping

- Public catalog list: `PF-API-001`, `PF-API-002`, `PF-API-003`
- Public product detail: `PF-API-004`, `PF-API-005`
- Admin product details persistence: `PF-API-006`, `PF-API-007`, `PF-API-008`

## Scenario to Skeleton Spec Mapping

- `PF-HOME-*`: `playwright/specs/product-flow/home.spec.ts`
- `PF-CATALOG-*`: `playwright/specs/product-flow/catalog.spec.ts`
- `PF-DETAIL-*`: `playwright/specs/product-flow/detail.spec.ts`
- `PF-API-*`: `playwright/specs/product-flow/api.spec.ts`
