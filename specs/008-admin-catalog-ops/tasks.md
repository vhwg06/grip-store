# Tasks: Admin Catalog Operations

**Input**: `specs/008-admin-catalog-ops/`
**Tests**: Required, run against production API wiring

## Phase 1: Spec Lock

- [x] T001 Chốt route inventory và use cases cho products/categories/cards
- [x] T002 Audit current code/contracts/tests trong `spec.md`
- [x] T003 Chốt figma review gate dùng `gpt-taste`
- [x] T004 Chốt backend ownership cho catalog business rules
- [x] T005 Define API/UI coverage trong `test-plan.md`
- [x] T006 Tạo task buckets cho Phase 2

## Phase 2: Execution Backlog

### Contracts / API

- [ ] T101 Khóa product/category/card contract

### BE: business logic / contract / persistence

- [ ] T102 Implement product CRUD and validation semantics
- [ ] T103 Implement category integrity and ordering semantics
- [ ] T104 Implement card/inventory flows linked to products
- [ ] T105 Implement public projection rules for catalog-derived fields

### FE: render / form wiring / API integration only

- [ ] T106 Refine product list/editor/category/card routes, including list-state handling, explicit row actions, grouped editor save boundaries, and category reorder-save semantics
- [ ] T107 Wire forms and tables to backend-owned contracts
- [ ] T108 Render validation/loading/error state without FE-owned business logic, matching route-level Figma states for list, category tree, and editor flows

### Playwright API

- [ ] T109 Make green module-aligned admin catalog API tests

### Playwright UI

- [ ] T110 Make green product/category/card admin UI tests, including route-specific create vs edit vs cards assertions

### Figma parity / regression

- [ ] T111 Verify catalog operator hierarchy, route parity, grouped save boundaries, and regression coverage

## Completion Rule

- Phase 2 chỉ được bắt đầu sau khi artifact Phase 1 đã khóa xong.
- Phase 2 chỉ complete khi toàn bộ test đã define pass mà không sửa spec/test để chạy theo code.
