# Feature Specification: Admin Catalog Operations

**Feature Branch**: `008-admin-catalog-ops`
**Created**: 2026-06-18
**Status**: Phase 1 source of truth

## Module Intent

Module này gom catalog editing operations:

- products
- categories
- product editor
- product-linked cards/inventory surfaces khi còn thuộc catalog workflow
- product content/media nếu gắn trực tiếp vào product editing boundary

Phase split bắt buộc:

- **Phase 1**: chốt use cases, spec, figma review, backend ownership, current code audit, test definition, tasks
- **Phase 2**: implement theo tasks Phase 1, với test là source of truth

## Actors

- `Admin / Catalog Operator`
- `Visitor / Customer`
- `QA / Developer`

## Route / Screen Inventory

| Route / screen | Purpose | Current state |
|---|---|---|
| `/admin/products` | product list and quick actions | page đã tồn tại |
| `/admin/product/new` | full product create | route đã tồn tại |
| `/admin/product/edit/[id]` | product edit | route đã tồn tại |
| `/admin/categories` | category CRUD | page đã tồn tại |
| `/admin/cards/[id]` | product-linked card operations | route đã tồn tại |

## In Scope

- product CRUD/admin editing
- category CRUD/order/tree semantics
- card import/pull/config if still part of product ops
- product content/media only when directly tied to product editor flow

## Out of Scope

- standalone CMS content ops in `007`
- order/refund ops in `009`
- users/messages/leads/data in `010`
- app code changes trong Phase 1

## Route-Level Use Cases

### Use Case 1: Product List Operations

Admin xem products, search/filter the list, inspect guard states, run row actions, and hand off cleanly into edit or cards workflow.

### Use Case 2: Product Editor

Admin tạo/sửa sản phẩm với grouped save boundaries, route-safe loading/not-found handling, blocked publish rules, và product-linked media/cards context.

### Use Case 3: Category Operations

Admin quản lý categories, hierarchy/order, slug validity, visibility, and save tree changes explicitly.

### Use Case 4: Card / Inventory-Linked Operations

Admin import/pull/manage product-linked cards theo product context.

## Current Code Audit

### Current FE surface

- `/admin/products`, `/admin/product/new`, `/admin/categories`, `/admin/cards/[id]` đã tồn tại.
- `useAdminProducts`, `useAdminProductForm`, `useAdminCategories`, `useAdminCards` đã có.
- admin products page đã có list, reorder, toggle, edit, delete controls.

### Current contract visibility

- `src/adapters/api/admin.api.ts` đã có reads/mutations cho products, categories, cards.
- types trong `src/domain/admin.ts` đã bao gồm `AdminProduct`, `AdminCategory`, `AdminProductForm`.

### Gaps discovered

- boundary giữa core catalog logic và product content/media từ `004` chưa chốt hẳn
- tests hiện tại cover một phần products, nhưng chưa module hóa đầy đủ card/category/editor/create-route contracts hoặc save-group expectations của editor
- ownership rules cho visibility/stock/purchase limits/derived labels cần backend-owned hóa rõ trong spec

## Figma Adaptation Requirements

Review theo `gpt-taste` protocol, nhưng ưu tiên catalog operator efficiency:

- dense data layout nhưng không cluttered
- edit/create/product-detail flows phải có hierarchy rõ
- destructive, publish, reorder, and inventory actions phải tách visual priority rõ
- product editor phải cho thấy save boundaries theo data groups
- no visually ambiguous field groupings

## API / Contract Expectations

- `/v1/admin/products`
- `/v1/admin/products/:id`
- `/v1/admin/products/:id/form`
- `/v1/admin/categories`
- product-linked cards endpoints

## Backend Ownership

### Backend owns

- pricing validation and normalization
- visibility rules
- stock/inventory/card semantics
- purchase limit and warning semantics
- category tree integrity
- sort/reorder semantics
- derived labels/counts/public projection
- authorization and data integrity

### Frontend owns only

- render tables/forms/editors
- local form state
- submit catalog intent
- loading/success/error display
- navigation

## Test Definition

### API tests

- product CRUD
- categories CRUD
- cards import/pull/config
- validation/auth failures
- persistence and derived outputs

### UI tests

- product list render
- product list filter scope, row actions, and list-state handling
- product create/edit
- image/media upload integration
- reorder/toggle/delete
- category management
- card management route flows

## Edge Cases

- invalid category / visibility inputs rejected
- product without image renders fallback safely
- reorder must remain backend-authoritative
- shared/inventory product semantics must not be guessed by FE

## Success Criteria

- catalog core is separated from content ops and settings ops
- backend ownership is explicit for catalog business rules
- Phase 1 output reflects that all scoped catalog routes now have route-level Figma coverage, while residual polish gaps do not change backend ownership or test-first discipline
- Phase 1 output không chứa app code FE/BE
- Phase 2 chỉ được bắt đầu từ tasks đã chốt ở Phase 1
- Phase 2 chỉ complete khi toàn bộ test đã define pass
