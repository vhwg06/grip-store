# Product Overview

## Intent

Quản lý catalog core theo product-centric taxonomy:

- list product
- product detail/editor
- category integrity
- product-linked cards/inventory

## Actors

- `Admin / Catalog Operator`
- `Customer`
- `QA / Developer`

## Surface Inventory

- `/admin/products`
- `/admin/product/new`
- `/admin/product/edit/[id]`
- `/admin/categories`
- product-linked cards endpoints/routes inventory

## In Scope

- CRUD product
- list/search/filter
- visibility/stock/purchase limit semantics
- category tree/order
- product-linked cards and inventory linkage

## Out Of Scope

- review moderation ownership
- standalone CMS content governance
- order/refund ownership
