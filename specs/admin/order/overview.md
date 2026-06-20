# Order Overview

## Intent

Quản lý order lifecycle cho admin theo 3 surfaces:

- `order list`
- `order detail`
- `order manage`

Entity này cũng sở hữu semantics của `purchase history by customerId`.

## Actors

- `Admin / Operations`
- `Customer`
- `QA / Developer`

## Surface Inventory

- `/admin/orders`
- `/admin/orders/[id]`
- `/api/admin/orders`
- `/api/admin/orders/:id`
- order status action endpoints

## In Scope

- list/search/filter/pagination
- detail summary, timeline, note state
- allowed admin state actions
- customer-linked purchase history view
- derived order status shown by server state

## Out Of Scope

- refund decision ownership
- payment gateway lifecycle
- customer profile master data ownership
