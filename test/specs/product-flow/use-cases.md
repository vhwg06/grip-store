# Product Flow Use Cases

## UC-PF-01: Guest Homepage Discovery

Actor: Guest.

Goal: Guest understands what the shop sells and has clear entry points into catalog and product detail.

Preconditions:

- The shop has at least one active category.
- The shop has at least one active featured or hot product.

Main flow:

1. Guest opens `/`.
2. System renders the existing homepage layout.
3. System displays hero/banner content.
4. System displays category rail or catalog shortcuts.
5. System displays featured product blocks.
6. Guest clicks a category.
7. System navigates to `/products?category={category}`.
8. Guest clicks a homepage product card or `Khám phá` CTA.
9. System navigates to `/products/{productId}`.

Rules:

- Homepage product actions are discovery-only.
- Homepage product cards do not add items to cart.
- Homepage product cards do not expose product follow/wishlist actions.
- Cart count remains unchanged after homepage product CTA click.

Failure and empty states:

- If no featured products are available, homepage still renders stable empty slots or fallback content.
- If category loading fails, homepage remains usable and surfaces a non-blocking fallback.

## UC-PF-02: Guest Browse Catalog

Actor: Guest.

Goal: Guest browses, searches, filters, and sorts active products before choosing one to inspect.

Preconditions:

- Product catalog API is available.
- Active products exist in PostgreSQL.

Main flow:

1. Guest opens `/products`.
2. System calls `GET /v1/catalog/products`.
3. System displays product cards in a grid.
4. Guest applies category, keyword, brand, price, or sort criteria.
5. System updates URL query parameters.
6. System reloads product results using matching API query parameters.
7. Guest clicks a product card.
8. System navigates to `/products/{productId}`.

Rules:

- Public catalog returns active products only.
- Catalog card click opens detail.
- Catalog is not the primary Add to cart location in v1.
- Empty results must show a clear no-results state.

Failure and empty states:

- Invalid filter values are ignored or rejected with a user-safe state.
- API failures render a recoverable error state, not a blank page.

## UC-PF-03: Guest View Product Detail

Actor: Guest.

Goal: Guest sees complete product information, including specs/details, before adding to cart.

Preconditions:

- Product exists and is active.
- Product may have zero or more detail/spec records.

Main flow:

1. Guest opens `/products/{productId}`.
2. System calls `GET /v1/catalog/products/{productId}`.
3. Backend loads product core data from `products`.
4. Backend loads specs/detail data from `product_details`.
5. System renders title, price, image/gallery, brand/SKU if available, description, and stock information.
6. System renders specs table when specs exist.
7. System renders details/guide/reviews sections when data exists.
8. System renders Add to cart controls.

Rules:

- Inactive products are not visible to Guest.
- Missing specs do not break the detail page.
- Specs display order must be stable.
- Add to cart CTA exists on detail page.

Failure and empty states:

- Unknown product returns not-found/error state.
- Inactive product returns not-found/error state.
- Detail API error shows a recoverable error state.

## UC-PF-04: Guest Add To Cart From Product Detail

Actor: Guest.

Goal: Guest adds a product to cart after inspecting the product detail page.

Preconditions:

- Guest is on an active product detail page.
- Product is available for purchase.

Main flow:

1. Guest chooses quantity. Default is 1.
2. Guest clicks Add to cart.
3. System validates quantity is at least 1.
4. System validates product is still active and available.
5. System adds product to cart.
6. System updates cart count.
7. System shows confirmation.

Rules:

- Add-to-cart from homepage is not allowed in v1.
- Same product added again increments quantity instead of creating duplicate cart lines.
- Quantity cannot be less than 1.
- Inactive or unavailable products are not added.

Failure and empty states:

- If product becomes inactive after page load, Add to cart fails with a friendly error.
- If quantity exceeds allowed stock or purchase limit, Add to cart fails with a friendly error.

## UC-PF-05: Admin Manage Product Details

Actor: Admin.

Goal: Admin creates, updates, and deletes product core data and product detail/spec data.

Preconditions:

- Admin is authenticated and authorized.
- PostgreSQL is available.

Main flow:

1. Admin creates or edits a product.
2. Backend validates required product fields.
3. Backend writes core fields to `products`.
4. Backend writes specs/detail fields to `product_details`.
5. Backend commits both writes in one transaction.
6. Public detail API returns the saved specs/details.
7. Admin deletes a product when needed.
8. Backend deletes related `product_details` through cascade or explicit cleanup.

Rules:

- Product details must not be stored as new columns on `products`.
- Product core and details must be saved atomically.
- Delete product must remove related detail records.
- Admin UI delivery is lower priority than backend correctness.

Failure and empty states:

- Invalid specs payload returns validation error.
- Partial save must rollback.
- Duplicate SKU or invalid product identity returns validation/conflict error.
