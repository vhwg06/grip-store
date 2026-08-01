# Order Domain Model

## Core Objects

- `Order`
- `OrderItem`
- `OrderTimelineEntry`
- `OrderAction`
- `CustomerPurchaseHistory`

## Key Fields

- `orderId`
- `orderNumber`
- `status`
- `totalAmount`
- `paymentMethod`
- `customerId`
- `items[]`
- `timeline[]`

## State Notes

- order state machine thuộc backend
- payment method trong phase này chỉ là informational field
- purchase history là projection theo `customerId`, không phải aggregate riêng của `customer`

## Allowed Transition Matrix

| Current state | Allowed actions | Disallowed action meaning |
|---|---|---|
| `PENDING` | `mark paid`, `cancel` | cannot be treated as fulfilled or delivered yet |
| `PROCESSING` | `mark delivered`, `cancel` | cannot return to unpaid intake state |
| `SHIPPED` | `mark delivered` | cannot be cancelled as if work never started |
| `DELIVERED` | none | order lifecycle is operationally complete |
| `CANCELLED` | none | order lifecycle is operationally closed |
| `REFUNDED` | none | refund outcome closes ordinary order transitions |

Transition rules surfaced by this matrix:

- an action is valid only when the current order state explicitly permits it
- terminal states do not expose ordinary forward transitions
- refund-aware states override ordinary order progression where relevant

## Relationships

- `Order` references `customerId`
- `Order` links optional `refundState`
- `Order` exposes payment info summary
