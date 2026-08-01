# Product Flow Playwright Scenarios

These scenarios define the Playwright specs that must exist before implementation refactor starts.

## Homepage Guest Flow

### PF-HOME-001: Homepage renders guest discovery content

Given a Guest opens `/`
When the homepage finishes loading
Then the hero/banner is visible
And the category rail is visible
And at least one featured product section is visible

### PF-HOME-002: Category click navigates to catalog

Given a Guest is on `/`
And at least one category is visible
When the Guest clicks the first category
Then the URL matches `/products?category=...`

### PF-HOME-003: Featured product CTA navigates to detail

Given a Guest is on `/`
And at least one homepage product card is visible
When the Guest clicks the product card or `Khám phá` CTA
Then the URL matches `/products/{productId}`

### PF-HOME-004: Homepage product CTA does not add to cart

Given a Guest is on `/`
And cart count is `0` or empty
When the Guest clicks a homepage product CTA
Then the URL navigates to product detail
And cart count remains `0` or empty
And the cart storage has no new item before product detail Add to cart is clicked

### PF-HOME-005: Homepage product cards do not show follow action

Given a Guest is on `/`
When homepage product cards are visible
Then no product follow control is visible inside homepage product cards
And no wishlist heart action is visible inside homepage product cards

### PF-HOME-006: Homepage product cards do not show add-to-cart action

Given a Guest is on `/`
When homepage product cards are visible
Then no homepage product card shows `Thêm vào giỏ`
And no homepage product card performs cart mutation on click

## Catalog Flow

### PF-CATALOG-001: Catalog lists active products

Given active products exist
When a Guest opens `/products`
Then product cards are visible
And each card has a product name and price

### PF-CATALOG-002: Category filter returns matching products

Given category A has products
And category B has products
When a Guest opens `/products?category={categoryA}`
Then visible products belong to category A
And category B products are not shown

### PF-CATALOG-003: Search returns matching products

Given a seeded product name contains a known keyword
When a Guest searches that keyword
Then at least one matching product appears
And the result count is greater than `0`

### PF-CATALOG-004: Sort updates product ordering

Given at least two products have different prices
When a Guest selects price ascending sort
Then products are ordered from lower price to higher price

### PF-CATALOG-005: Empty result shows no-results state

Given no product matches keyword `__no_product_should_match__`
When a Guest searches that keyword
Then a no-results state is visible
And no product card is shown as a real result

### PF-CATALOG-006: Product card click navigates to detail

Given a Guest is on `/products`
And at least one product card is visible
When the Guest clicks the first product card
Then the URL matches `/products/{productId}`

## Product Detail Flow

### PF-DETAIL-001: Detail renders product core info

Given an active product exists
When a Guest opens `/products/{productId}`
Then the product title is visible
And the product price is visible
And the product image or gallery is visible

### PF-DETAIL-002: Detail renders specs from backend detail data

Given an active product has product detail specs
When a Guest opens `/products/{productId}`
Then the product specs table is visible
And at least one specs row has a key and value

### PF-DETAIL-003: Add-to-cart from detail increments cart count

Given a Guest opens an active product detail page
And cart count is `0` or empty
When the Guest clicks Add to cart
Then cart count becomes `1`
And a success confirmation is visible

### PF-DETAIL-004: Quantity add-to-cart stores correct quantity

Given a Guest opens an active product detail page
When the Guest changes quantity to `2`
And clicks Add to cart
Then cart count becomes `2`
And the cart item quantity for that product is `2`

### PF-DETAIL-005: Inactive product cannot be opened or added

Given a product is inactive
When a Guest opens `/products/{productId}`
Then the page shows not-found or product-unavailable state
And Add to cart is not visible

## API Flow

### PF-API-001: Product list returns paginated active products

Given active and inactive products exist
When Playwright requests `GET /v1/catalog/products`
Then response status is `200`
And response contains `items`, `page`, `limit`, and `total`
And inactive products are absent

### PF-API-002: Product list supports category filter

Given products exist in multiple categories
When Playwright requests `GET /v1/catalog/products?category={category}`
Then response status is `200`
And each returned item belongs to the requested category

### PF-API-003: Product search returns matching products

Given a product exists with a known keyword
When Playwright requests `GET /v1/catalog/products?q={keyword}`
Then response status is `200`
And at least one returned item matches the keyword

### PF-API-004: Product detail returns specs

Given an active product has records in `product_details`
When Playwright requests `GET /v1/catalog/products/{productId}`
Then response status is `200`
And response data includes `specs`
And `specs` contains at least one key/value item

### PF-API-005: Inactive product detail returns not found

Given a product is inactive
When Playwright requests `GET /v1/catalog/products/{productId}`
Then response status is `404`

### PF-API-006: Admin create product persists details

Given an Admin is authenticated
When Playwright creates a product with specs through admin API
Then response status is `201` or `200`
And `GET /v1/catalog/products/{productId}` returns those specs

### PF-API-007: Admin update product replaces details transactionally

Given an Admin is authenticated
And an existing product has specs
When Playwright updates that product with a new specs set
Then public product detail returns the new specs
And removed specs are no longer returned

### PF-API-008: Admin delete product cascades details

Given an Admin is authenticated
And a product has product detail records
When Playwright deletes the product
Then product detail returns `404`
And related `product_details` are not visible through any public API
