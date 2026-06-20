# Product Coverage

## Current Coverage

- legacy spec: `008-admin-catalog-ops`
- routes: products, product new/edit, categories
- types: `AdminProduct`, `AdminProductForm`, `AdminCategory`
- adapters: `getAdminProducts()`, `getAdminProduct()`, `getAdminProductForm()`, `getAdminCategories()`, product mutations

## Gaps

- product detail package chưa tách hoàn toàn khỏi route-first framing
- cards/inventory flow còn chỉ là partial contract note

## Priority

- entity: `P1`
- cards/inventory deepening: `P2`
