# Tasks: Admin Review Moderation

**Input**: `specs/006-admin-reviews/`
**Tests**: Required, run against production API wiring

## Phase 1: Spec Lock

- [x] T001 Chốt module intent, actors, route inventory, route-level use cases trong `spec.md`
- [x] T002 Chốt contract mục tiêu trong `contracts/reviews-api.md`
- [x] T003 Chốt phase split và entry/exit criteria trong `plan.md`
- [x] T004 Audit current admin reviews code và public reviews consumption, ghi gaps vào `spec.md`
- [x] T005 Review Figma adaptation và ghi kết quả vào `figma-review.md`
- [x] T006 Thêm `Backend Ownership` section vào `spec.md`
- [x] T007 Define API/UI/Figma coverage trong `test-plan.md`
- [x] T008 Tạo task buckets implementation không chứa code trong Phase 1

## Phase 2: Execution Backlog

### Contracts / API

- [ ] T101 Khóa moderation contract và public review reflection contract

### BE: business logic / contract / persistence

- [ ] T102 Implement review moderation read model với stats, filters, pagination
- [ ] T103 Implement state transition endpoints: approve, hide, feature, bulk publish, delete
- [ ] T104 Implement public review filtering/ordering theo backend-owned status rules
- [ ] T105 Implement authorization, integrity, và persistence cho moderation flow

### FE: render / form wiring / API integration only

- [ ] T106 Refactor `/admin/reviews` thành split moderation UI theo Figma
- [ ] T107 Wiring queue selection, context panel, và action states
- [ ] T108 Wiring API integration cho approve/hide/feature/bulk publish/delete
- [ ] T109 Render server-driven stats, flags, verified state, attachments

### Playwright API

- [ ] T110 Làm xanh `playwright/specs/api/reviews-moderation.api.spec.ts`

### Playwright UI

- [ ] T111 Làm xanh `playwright/specs/admin/reviews-moderation.spec.ts`

### Figma parity / regression

- [ ] T112 Làm xanh `playwright/specs/admin/figma-contract.spec.ts` cho reviews selectors và verify public reflection regressions

## Completion Rule

- Phase 2 chỉ complete khi toàn bộ test đã define pass mà không sửa spec/test để chạy theo code.
