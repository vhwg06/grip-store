# Catalog Base Contract

This document is the transport contract for the Catalog Base vertical slices.
It records the public catalog and admin product surfaces used by the accepted
API scenarios. Product lifecycle semantics remain specified by the colocated
Gherkin features.

<!-- contract-ref: catalog-public-product-list -->

## Public product list

`GET /v1/catalog/products` is public and returns paginated active products.
Filtering is server-side and supports category, keyword, price, brand, sort,
page, and limit inputs. Inactive products are excluded.

<!-- contract-ref: catalog-public-product-detail -->

## Public product detail

`GET /v1/catalog/products/{id}` is public and returns product core data,
media, category, stock, and `specs`. Missing or inactive products return
`404`. Missing optional detail rows do not make a valid product request fail.

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

ProductModel publication scenarios use the admin product management transport
surface while asserting the lifecycle rules declared in
`modules/catalog/product-model/behavior.feature`.

<!-- contract-ref: catalog-variant-management -->

## Variant management

Variant scenarios use the Catalog Base admin product transport surface while
asserting selected option, SKU, price, and sale-readiness rules declared in
`modules/catalog/variant/behavior.feature`.

<!-- contract-ref: catalog-cart-boundary -->

## Cart boundary

Product discovery does not mutate the cart. Guest cart mutation begins at
product detail Add to cart, and inactive or unavailable products cannot be
added.
