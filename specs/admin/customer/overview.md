# Customer Overview

## Intent

`customer` là root quản lý thông tin khách hàng trong admin:

- customer info
- customer commerce linkage
- cross-order/review/refund visibility theo `customerId`

## Actors

- `Admin / Support / Operations`
- `QA / Developer`

## Surface Inventory

- customer-facing admin list/detail surfaces hiện được thấy qua `/admin/users` inventory và order/review/refund contexts
- `getAdminUsers()`

## In Scope

- customer identity summary
- contact and account linkage
- order/refund/review references theo `customerId`
- customer-centric admin lookup

## Decision Rules

- admin đang ở `customer` domain khi câu hỏi cần trả lời là:
  - khách hàng này là ai trong ngữ cảnh commerce
  - khách hàng này đã mua gì, refund gì, review gì
  - hành vi hỗ trợ tiếp theo cần dựa trên lịch sử commerce nào
- admin rời `customer` domain sang `user` domain khi hành động cần thực hiện là:
  - block hoặc unblock account
  - đổi points hoặc account-level controls
  - đọc trust/access posture của account
- `/admin/users` có thể là shared entry surface, nhưng lookup mang mục đích commerce phải được diễn giải theo `customer` domain, còn account control phải được diễn giải theo `user` domain

## Out Of Scope

- user account security/admin role ownership
- order state machine
- refund decision ownership
