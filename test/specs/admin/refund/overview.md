# Refund Overview

## Intent

Tách refund khỏi order để lock domain decision riêng:

- refund queue
- refund evidence/history
- approve/reject flow

## Actors

- `Admin / Operations`
- `Customer`
- `QA / Developer`

## Surface Inventory

- `/admin/refunds`
- `/api/admin/refunds`
- `/api/admin/refunds/:id/approve`
- `/api/admin/refunds/:id/reject`

## In Scope

- queue read
- evidence/history review
- decision note
- approve/reject outcome
- order/payment linkage cần cho quyết định

## Out Of Scope

- refund request creation từ buyer flow
- payment gateway execution internals
