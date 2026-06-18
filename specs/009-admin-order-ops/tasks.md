# Tasks: Admin Order Operations

**Input**: `specs/009-admin-order-ops/`
**Tests**: Required, run against production API wiring

## Phase 1: Spec Lock

- [x] T001 Chốt route inventory và use cases cho orders/detail/refunds
- [x] T002 Audit current code/contracts/tests trong `spec.md`
- [x] T003 Chốt figma review gate dùng `gpt-taste`
- [x] T004 Chốt backend ownership cho state transitions và refund rules
- [x] T005 Define API/UI coverage trong `test-plan.md`
- [x] T006 Tạo task buckets cho Phase 2

## Phase 2: Execution Backlog

### Contracts / API

- [ ] T101 Khóa order/refund contract

### BE: business logic / contract / persistence

- [ ] T102 Implement order list/detail read models
- [ ] T103 Implement allowed state transitions
- [ ] T104 Implement refund approval/rejection semantics
- [ ] T105 Implement derived status/timeline outputs

### FE: render / form wiring / API integration only

- [ ] T106 Refine order list/detail/refund UIs with explicit filter scope, blocked-action states, refund decision surfaces, and list-state handling for loading/empty/error
- [ ] T107 Wire admin actions to backend-owned transitions
- [ ] T108 Render loading/success/error and derived state without FE-owned rules

### Playwright API

- [ ] T109 Make green order/refund API tests

### Playwright UI

- [ ] T110 Make green order/refund admin UI tests, including refund evidence/confirmation flows and detail blocked states

### Figma parity / regression

- [ ] T111 Verify operational clarity, queue state separation, list/detail handoff, and regression coverage

## Completion Rule

- Phase 2 chỉ được bắt đầu sau khi artifact Phase 1 đã khóa xong.
- Phase 2 chỉ complete khi toàn bộ test đã define pass mà không sửa spec/test để chạy theo code.
