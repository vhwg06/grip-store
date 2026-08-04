# Catalog Base Contract

This document is the semantic contract for the Catalog Base vertical slices.
The canonical machine-readable transport contract is
`contracts/openapi.yaml`; ProductModel and Variant replace the legacy Product
surface. Product lifecycle semantics remain specified by the colocated
Gherkin features.

<!-- contract-ref: catalog-public-product-list -->

## Public product list

`GET /v1/catalog/product-models` is public and returns paginated Active
ProductModels with at least one publicly sale-ready Variant. Filtering is
server-side and supports Category, Material, Finish, SellingPrice range, sort,
page, and limit inputs. Inactive and terminal ProductModels are excluded.

<!-- contract-ref: catalog-public-product-detail -->

## Public product detail

`GET /v1/catalog/product-models/{modelId}` is public and returns ProductModel
content, catalog media, options, and current SellingPrice. Stock, warehouse,
order, purchase-limit, and warranty-claim state are outside this projection.
Missing or inactive models return `404`.

<!-- contract-ref: catalog-admin-product-management -->

## Admin product management

The admin product surface includes:

- `POST /v1/admin/products` to create product core and detail data;
- `PATCH /v1/admin/products/{id}` to replace product and detail data;
- `DELETE /v1/admin/products/{id}` to delete or archive a product.

Admin operations require an authenticated admin. Product core and detail
writes are transactional, and replacing details removes omitted specs.

<!-- contract-ref: catalog-product-model-lifecycle -->

## ProductModel lifecycle

ProductModel publication uses `POST /v1/admin/catalog/product-models/{modelId}/publish`,
`/unpublish`, and `/discontinue`; media replacement uses `/media`. The
scenarios assert the lifecycle rules declared in
`modules/catalog/product-model/behavior.feature`.

<!-- contract-ref: catalog-master-data -->

## Catalog master data

Category, AttributeDefinition, EnumValue, Material, Finish, and Pack are
admin-owned catalog masters under `/v1/admin/catalog`. Their lifecycle is
non-destructive: deactivation rejects new assignment while preserving
existing references. Attribute definitions use one valid typed shape
(`Scalar`, `Enum`, or `Reference`); definitions that are already in use may
change display metadata only. The exact request and response shapes are in
`contracts/openapi.yaml`.

<!-- contract-ref: catalog-variant-management -->

## Variant management

Variant scenarios use `/v1/admin/catalog/product-models/{modelId}/variants`
and `/v1/admin/catalog/variants/{variantId}` while asserting selected option,
SKU, price, pack, identity, and derived sale-readiness rules declared in
`modules/catalog/variant/behavior.feature`.

<!-- contract-ref: catalog-public-variant-resolution -->

## Public Variant resolution

Public catalog discovery filters only by Category, Material, Finish, and
SellingPrice in this phase. Available options are read from
`/v1/catalog/product-models/{modelId}/options` and resolving a Variant uses
`POST /v1/catalog/product-models/{modelId}/variants:resolve`; both are derived
from compatible publicly sellable Variants and canonical selected options.

<!-- contract-ref: catalog-cart-boundary -->

## Cart boundary

Product discovery does not mutate the cart. Guest cart mutation begins at
product detail Add to cart, and inactive or unavailable products cannot be
added.
