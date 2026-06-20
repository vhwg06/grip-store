# User Overview

## Intent

`user` là domain quản lý website/account/admin-user surface, tách khỏi `customer`.

## Actors

- `Admin / Support`
- `QA / Developer`

## Surface Inventory

- `/admin/users`
- admin user mutations như points/block
- account/profile-oriented references trong code inventory

## In Scope

- user info
- user manage
- admin-side account actions
- link từ user sang customer profile khi cùng thực thể đời thực

## Decision Rules

- admin đang ở `user` domain khi câu hỏi cần trả lời là:
  - account này có bị block không
  - account này có thể được unblock không
  - points hoặc account-level controls của account này là gì
  - account này có trust/access concern nào không
- admin phải handoff sang `customer` domain khi concern chính là:
  - lịch sử mua hàng
  - refund history
  - review history
  - customer identity trong ngữ cảnh commerce
- `/admin/users` là shared entry surface, nhưng account control không được dùng như substitute cho commerce support

## Out Of Scope

- order lifecycle
- customer commerce ownership
- notification inbox/messages taxonomy
