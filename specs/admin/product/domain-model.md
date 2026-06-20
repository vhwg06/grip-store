# Product Domain Model

## Core Objects

- `Product`
- `ProductForm`
- `Category`
- `CardLink`

## Key Fields

- `productId`
- `name`
- `price`
- `compareAtPrice`
- `categoryId`
- `sku`
- `visibilityLevel`
- `stock`
- `purchaseLimit`
- `purchaseWarning`

## Relationships

- `Product` belongs to zero or one `Category`
- `Product` may link to cards/inventory
- `Product` may expose review summary publicly, but moderation is outside this domain
