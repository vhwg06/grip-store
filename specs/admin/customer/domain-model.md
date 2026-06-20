# Customer Domain Model

## Core Objects

- `Customer`
- `CustomerSummary`
- `CustomerCommerceLinks`

## Key Fields

- `customerId`
- `displayName`
- `email`
- `phone`
- `orderCount`
- `lastLoginAt`
- `createdAt`

## Canonical Customer Root Contract

A minimum-valid customer commerce root must provide:

- `customerId`
  - canonical commerce identifier used for joins into order, refund, and review contexts
- at least one customer-facing identity signal:
  - `displayName`, or
  - `email`, or
  - `phone`
- optional commerce summary signals:
  - `orderCount`
  - `lastLoginAt`
  - `createdAt`

The customer root remains valid when:

- `orderCount = 0`
- no refund references exist
- no review references exist
- a linked `userId` is absent

## Relationship Notes

- `Customer` may link to `userId`
- `Customer` references order/refund/review aggregates but does not own them
