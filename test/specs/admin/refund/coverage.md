# Refund Coverage

## Current Coverage

- legacy spec: refund section của `009-admin-order-ops`
- route: `/admin/refunds`
- adapters: `getAdminRefunds()`, `adminApproveRefund()`, `adminRejectRefund()`, `getPendingRefundRequestCount()`

## Gaps

- refund package chưa từng được tách độc lập khỏi order
- payment evidence shape chưa được lock thành admin info contract

## Priority

- entity: `P2`
- deep payment linkage: `P3`
