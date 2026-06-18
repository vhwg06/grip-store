# Plan: Admin Catalog Operations

## Objective

Tách module `008-admin-catalog-ops` thành 2 phase cứng:

1. **Phase 1**: chốt use case -> spec -> figma review -> backend ownership -> current code audit -> define tests -> tasks FE/BE
2. **Phase 2**: implement theo tasks của Phase 1, với test là source of truth

## Phase 1

### Scope

- khóa module boundary của products/categories/cards
- xác nhận figma adaptation từ frame thật
- xác nhận backend ownership boundaries
- audit code/contracts/tests hiện tại
- define API/UI/Figma tests
- xuất task buckets cho backend và frontend

### Explicitly out of scope

- FE code
- BE code
- migrations
- endpoint implementation
- UI refactor

### Required artifacts

- `spec.md`
- `contracts.md`
- `figma-review.md`
- `test-plan.md`
- `tasks.md`

### Exit criteria

- spec đủ route inventory, use cases, current code audit, figma requirements, backend ownership
- tests đã define xong
- tasks đã tách `Contracts/API`, `BE`, `FE render/integration only`, `Playwright API`, `Playwright UI`, `Figma parity`

## Phase 2

### Dependency

Chỉ bắt đầu khi toàn bộ artifact Phase 1 hoàn tất.

### Execution order

1. implement backend contract và business rules
2. chạy API tests và sửa đến khi pass
3. implement frontend render/forms/API integration only
4. chạy UI tests, figma parity, và regression checks

### Rule

- test là source of truth cho implementation
- không đẩy business logic sang FE
- nếu implementation làm lộ thiếu sót spec, quay lại cập nhật Phase 1 artifacts trước
