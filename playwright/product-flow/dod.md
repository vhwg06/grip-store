# Product Flow Definition of Done

## Required Order

1. Product Flow docs exist in `playwright/product-flow/`.
2. Playwright specs are written from these docs.
3. Product Flow specs fail red where current behavior is missing or wrong.
4. Backend implementation is fixed first.
5. Frontend implementation is wired to the corrected backend behavior.
6. Product Flow Playwright suite passes green.

## Documentation Gate

The following files must exist and remain aligned:

- `playwright/product-flow/spec.md`
- `playwright/product-flow/use-cases.md`
- `playwright/product-flow/scenarios.md`
- `playwright/product-flow/api-contract.md`
- `playwright/product-flow/dod.md`

## Backend Gate

Backend is acceptable when:

- PostgreSQL is the only Product Flow database target.
- Product specs/details are stored in `product_details`, not extra `products` columns.
- Public list API returns active products only.
- Public detail API returns product core data plus detail/spec data.
- Inactive product detail returns not-found behavior for Guest.
- Admin create/update persists product core and details transactionally.
- Admin delete/archive prevents public detail access.

## Frontend Gate

Frontend is acceptable when:

- Homepage keeps the existing layout structure.
- Homepage product interactions are discovery-only.
- Homepage has no product follow action.
- Homepage has no add-to-cart action.
- Catalog cards navigate to product detail.
- Product detail renders specs from backend data.
- Product detail Add to cart works.

## Playwright Gate

The Product Flow suite must cover:

- Homepage guest discovery.
- Homepage category navigation.
- Homepage product-to-detail navigation.
- No homepage cart mutation.
- No homepage product follow action.
- Catalog listing/filter/search/sort/empty state.
- Product detail core info.
- Product detail specs.
- Add-to-cart from detail.
- Inactive product not accessible/addable.
- Public catalog API.
- Product detail API with specs.
- Admin product details persistence.

Feature is DONE only when the required Product Flow Playwright specs pass green.

## Non-Goals

These do not block Product Flow v1 completion:

- Full admin UI polish.
- Online payment gateway behavior.
- Homepage product quick-buy.
- Wishlist/follow feature on homepage.
