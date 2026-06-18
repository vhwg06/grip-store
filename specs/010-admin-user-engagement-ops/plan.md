# Plan: Admin User Engagement Operations

## Objective

Tách module `010-admin-user-engagement-ops` thành 2 phase cứng:

1. **Phase 1**: xuất đủ bộ artifact `use cases -> spec -> figma review -> backend ownership -> current code audit -> test definitions -> implementation tasks`
2. **Phase 2**: implement theo input đã khóa từ Phase 1, với test là source of truth

## Phase 1

### Scope

- khóa boundary active scope cho `users`, `messages`, `notifications`
- ghi rõ `leads`, `announcement`, `collect`, `profile`, `data` đang bị parked khỏi current Figma-reviewed active scope
- xác nhận figma adaptation từ frame thật cho active scope
- xác nhận backend ownership boundaries
- audit code/contracts/tests hiện tại
- define API/E2E/integration/UI/Figma-parity tests
- xuất task buckets cho contracts, backend, frontend, db migration, tests, và fixtures nếu cần

### Explicitly out of scope

- parked routes của module
- FE code
- BE code
- migrations
- endpoint implementation
- UI refactor

### Required artifacts

- `use-cases.md`
- `spec.md`
- `contracts.md`
- `figma-review.md`
- `test-plan.md`
- `tasks.md`

### Exit criteria

- spec đủ route inventory, active scope, parked scope, current code audit, figma role, backend ownership
- use cases đã tách riêng và làm nguồn sự thật cho behavior
- tests đã define xong theo nhóm `API`, `E2E`, `integration`, `UI / route workflow`, và nếu cần `Figma parity`
- tasks đã tách `Contracts/API`, `BE`, `FE render/integration only`, `DB migration`, `test implementation`, và `fixtures/repair` nếu cần

## Phase 2

### Dependency

Chỉ bắt đầu khi toàn bộ artifact Phase 1 hoàn tất.

### Execution order

1. implement backend contract và business rules
2. chạy API tests và sửa đến khi pass
3. chạy integration tests cho adapters/contracts
4. implement frontend render/forms/API integration only
5. chạy E2E, UI tests, figma parity, và regression checks

### Rule

- test là source of truth cho implementation
- không đẩy business logic sang FE
- nếu implementation làm lộ thiếu sót spec, quay lại cập nhật Phase 1 artifacts trước
- Phase 2 chỉ nhận input từ:
  - spec
  - use cases
  - defined tests
  - FE tasks
  - BE tasks
  - DB migration tasks
  - contract tasks
