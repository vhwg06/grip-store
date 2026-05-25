# Product Flow Specification

## Purpose

Product Flow is the primary guest-facing e-commerce journey. It must be designed and tested before implementation work starts.

The flow is:

1. Guest discovers the shop from the homepage.
2. Guest enters catalog or product detail from homepage interactions.
3. Guest browses/searches/filters catalog.
4. Guest opens product detail to inspect specs and product details.
5. Guest adds product to cart from product detail only.

## Actors

- Guest: anonymous visitor who can discover products, browse catalog, view details, and add products to cart.
- Admin: authenticated backoffice user who manages products and product detail data. Admin UI is lower priority, but backend contracts must support it.

## Scope

In scope:

- Homepage guest discovery.
- Catalog browsing and product search/filter/sort.
- Product detail page with specs/detail.
- Add-to-cart from product detail.
- PostgreSQL-backed product and product detail persistence.
- Playwright scenarios for the whole Product Flow.

Out of scope for Product Flow v1:

- Homepage add-to-cart.
- Homepage product follow/wishlist.
- Product quick purchase from homepage.
- Full admin UI polish.
- Online payment gateway behavior.

## Business Rules

- Homepage is optimized for Guest users.
- Homepage keeps the existing layout structure, but its product interactions are discovery-only.
- Homepage product cards must navigate to product detail, not mutate cart.
- Product list/catalog must help the Guest find products and continue to product detail.
- Product detail owns the Add to cart use case.
- Product details and specs must not be added as columns on `products`.
- Product detail/spec data must be stored in `product_details` and linked to `products`.
- PostgreSQL is the required database. SQLite must not be used for the Product Flow backend.

## Data Ownership

`products` owns core catalog data:

- ID
- name/title
- description summary
- price
- compare price
- category
- main image
- status/active flag
- merchandising flags
- stock/sold/rating aggregate fields

`product_details` owns extended detail data:

- product reference
- specs key/value rows or structured specs payload
- SKU
- brand
- gallery images
- usage guide
- bundled gifts
- detail content

The implementation may keep the current key/value `product_details` shape for specs first, but it must not move specs into `products`.

## Acceptance Summary

The Product Flow is accepted when:

- Docs in `playwright/product-flow/` are the source of truth.
- Playwright specs are written from these docs before implementation changes.
- Homepage scenarios prove there is no add-to-cart/follow behavior on homepage products.
- Product detail scenarios prove specs are displayed and Add to cart works.
- API scenarios prove backend reads/writes `product_details`.
- The Product Flow Playwright suite passes green.
