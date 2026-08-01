# Order Coverage

## Current Coverage

- legacy spec: `009-admin-order-ops`
- routes: `/admin/orders`, `/admin/orders/[id]`
- adapters: `getAdminOrders()`, `getAdminOrder()`, `markOrderPaid()`, `markOrderDelivered()`, `cancelOrder()`
- types: `AdminOrderDetails`

## Gaps

- purchase history by `customerId` chưa có package spec riêng
- order action guards chưa được chuẩn hóa thành use case IDs
- payment info hiện mới chỉ là detail field, chưa có dedicated admin read model contract

## Priority

- entity: `P1`
- payment linkage: `P3`
