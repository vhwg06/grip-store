# Plan: Admin Review Moderation

## Objective

Tách module `Admin / Reviews` thành 2 phase cứng:

1. **Phase 1**: use case -> spec -> figma review -> backend ownership -> current code audit -> define tests -> tasks
2. **Phase 2**: implement theo tasks của Phase 1, với test là source of truth

## Phase 1

### Scope

- chốt use cases moderation
- chuẩn hóa module spec
- xác nhận figma adaptation
- xác nhận backend ownership boundaries
- audit code hiện tại
- define API/UI/Figma tests
- xuất tasks implementation

### Explicitly out of scope

- FE code
- BE code
- DB migrations
- endpoint implementation
- route refactor

### Required artifacts

- `spec.md`
- `contracts/reviews-api.md`
- `figma-review.md`
- `test-plan.md`
- `tasks.md`

### Exit criteria

- spec đủ route inventory, current code audit, figma requirements, backend ownership
- tests đã define xong
- tasks đã tách `Contracts/API`, `BE`, `FE render/integration only`, `Playwright API`, `Playwright UI`, `Figma parity`

## Phase 2

### Dependency

Chỉ bắt đầu khi mọi artifact Phase 1 hoàn tất.

### Execution order

1. implement backend review moderation contract
2. chạy API tests và sửa đến khi pass
3. implement frontend render/forms/API integration only
4. chạy UI tests, figma parity, và public reflection regressions

### Rule

- test là source of truth cho implementation
- không chuyển moderation/business rules sang FE
- nếu implementation làm lộ thiếu sót spec, quay lại cập nhật Phase 1 artifacts trước
