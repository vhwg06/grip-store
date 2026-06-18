# Plan: Admin Store Settings

## Objective

Tách module `Store Settings` thành 2 phase cứng:

1. **Phase 1**: chốt spec/use case -> figma review -> backend ownership -> check current code -> define tests -> generate FE/BE tasks
2. **Phase 2**: implement theo tasks của Phase 1, với test là source of truth

## Phase 1

### Scope

- chốt use cases
- chuẩn hóa module spec
- xác nhận figma adaptation
- xác nhận backend ownership boundaries
- audit code hiện tại
- define API/UI/Figma tests
- xuất tasks implementation

### Explicitly out of scope

- FE code
- BE code
- migrations
- endpoint implementation
- UI refactor

### Required artifacts

- `spec.md`
- `contracts/store-settings-api.md`
- `figma-review.md`
- `test-plan.md`
- `tasks.md`

### Exit criteria

- spec đủ route inventory, current code audit, figma requirements, backend ownership
- tests đã define xong
- tasks đã tách `Contracts/API`, `BE`, `FE render/integration only`, `Playwright API`, `Playwright UI`, `Figma parity`

## Phase 2

### Dependency

Phase 2 chỉ được bắt đầu khi toàn bộ deliverables Phase 1 của module này hoàn tất.

### Execution order

1. implement backend contract và business rules
2. chạy API tests và sửa đến khi pass
3. implement frontend render/forms/API integration only
4. chạy UI tests và regression/public reflection checks

### Rule

- test là source of truth cho implementation
- không đẩy business logic sang FE để làm xanh test
- nếu implementation làm lộ lỗ hổng spec, quay lại cập nhật Phase 1 artifacts trước
