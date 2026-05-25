# Product Flow API Contract

## Conventions

- Base backend path: `/v1`
- Frontend adapter may call `/api/...` only if the HTTP client maps it to `/v1/...`.
- Public product discovery APIs are accessible to Guest users.
- Admin APIs require authenticated admin access.
- PostgreSQL is the backing database.

## Public Catalog

### `GET /v1/catalog/products`

Purpose: return active products for homepage/catalog/listing.

Auth: Public.

Query:

- `category`: optional category ID or slug.
- `q`: optional keyword.
- `brand`: optional brand filter.
- `minPrice`: optional minimum price.
- `maxPrice`: optional maximum price.
- `sort`: optional, one of `default`, `popular`, `price_asc`, `price_desc`, `newest`.
- `page`: optional, default `1`.
- `limit`: optional, default implementation limit.

Response:

```json
{
  "items": [
    {
      "id": "product-id",
      "name": "Door Handle",
      "description": "Short description",
      "price": "1200000",
      "compareAtPrice": "1500000",
      "image": "https://example.com/product.jpg",
      "category": "Handles",
      "categoryId": "category-id",
      "brand": "GRIP",
      "sku": "GRIP-001",
      "isHot": true,
      "isNew": false,
      "isBestSeller": false,
      "stock": 10,
      "sold": 3,
      "rating": 4.8,
      "reviewCount": 12
    }
  ],
  "page": 1,
  "limit": 24,
  "total": 1
}
```

Rules:

- Inactive products are excluded.
- Filtering must happen server-side.
- Sorting must be deterministic.

### `GET /v1/catalog/products/{id}`

Purpose: return complete product detail for detail page and Add to cart validation context.

Auth: Public.

Response:

```json
{
  "data": {
    "id": "product-id",
    "name": "Door Handle",
    "description": "Full or summary description",
    "price": "1200000",
    "compareAtPrice": "1500000",
    "image": "https://example.com/main.jpg",
    "images": [
      "https://example.com/main.jpg",
      "https://example.com/angle.jpg"
    ],
    "category": "Handles",
    "categoryId": "category-id",
    "brand": "GRIP",
    "sku": "GRIP-001",
    "isHot": true,
    "isNew": false,
    "isBestSeller": false,
    "stock": 10,
    "sold": 3,
    "rating": 4.8,
    "reviewCount": 12,
    "usageGuide": "Installation guide",
    "bundledGifts": "Mounting kit",
    "specs": [
      { "key": "Material", "value": "Solid brass" },
      { "key": "Finish", "value": "PVD Gold" }
    ]
  }
}
```

Rules:

- Detail response joins `products` and `product_details`.
- Inactive or missing product returns `404`.
- Missing details return `specs: []` or omit optional fields, but must not fail the request.

## Admin Product Management

### `GET /v1/admin/products`

Purpose: list products for admin management.

Auth: Admin.

Response includes inactive and draft products.

### `GET /v1/admin/products/{id}/form`

Purpose: return product edit data, including categories and detail/spec data.

Auth: Admin.

Response:

```json
{
  "product": {
    "id": "product-id",
    "name": "Door Handle",
    "price": "1200000",
    "categoryId": "category-id",
    "brand": "GRIP",
    "sku": "GRIP-001",
    "specs": [
      { "key": "Material", "value": "Solid brass" }
    ]
  },
  "categories": []
}
```

### `POST /v1/admin/products`

Purpose: create product core and details.

Auth: Admin.

Request includes product core fields and `specs`.

Rules:

- Write `products` and `product_details` in one transaction.
- Reject invalid specs payload.
- Do not store specs in `products`.

### `PATCH /v1/admin/products/{id}`

Purpose: update product core and details.

Auth: Admin.

Rules:

- Update must be transactional.
- Replacing specs removes specs not included in the new payload.
- Public detail response must reflect the latest saved details.

### `DELETE /v1/admin/products/{id}`

Purpose: delete or archive product.

Auth: Admin.

Rules:

- If hard delete is used, `product_details` must be removed by cascade.
- If archive/inactive is used, public detail must return `404` for Guest.

## Cart Boundary

For Product Flow v1, Add to cart is initiated only from product detail.

Allowed implementation choices:

- Frontend local guest cart, then checkout validates product availability later.
- Backend anonymous cart using `session_id`.

The chosen implementation must satisfy Playwright scenarios:

- Homepage product click does not mutate cart.
- Detail Add to cart increments cart count.
- Inactive/unavailable product cannot be added.
