# Product Overview

## Intent

Quản lý catalog core theo product-centric taxonomy:

- list product
- product detail/editor
- category integrity
- product editorial/media inside the same editor flow

## Actors

- `Admin / Catalog Operator`
- `Customer`
- `QA / Developer`

## Surface Inventory

- `/admin/products`
- `/admin/product/new`
- `/admin/product/edit/[id]`
- `/admin/categories`
- row `Edit` và `Quick edit` đều mở product editor
- media upload/remove/save diễn ra bên trong product editor

## In Scope

- CRUD product
- list/search/filter
- visibility/stock/purchase limit semantics
- category tree/order
- editor-owned media and editorial state

## Out Of Scope

- review moderation ownership
- standalone CMS content governance
- order/refund ownership
