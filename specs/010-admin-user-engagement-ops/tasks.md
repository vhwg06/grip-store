# Tasks: Admin User Engagement Operations

**Input**: `specs/010-admin-user-engagement-ops/`
**Tests**: Required, run against production API wiring

## Active Scope

- `/admin/users`
- `/admin/messages`
- `/admin/notifications`

## Parked Routes

- `/admin/leads`
- `/admin/announcement`
- `/admin/collect`
- `/admin/profile`
- `/admin/data`

## Phase 1: Spec Lock

- [x] T001 Chốt route inventory, active scope, parked scope, và use cases cho users/messages/notifications
- [x] T002 Audit current code/contracts/tests trong `spec.md`
- [x] T003 Chốt figma review gate dùng `gpt-taste`
- [x] T004 Chốt backend ownership cho permissions, moderation semantics, và send/test operations
- [x] T005 Define API/E2E/integration/UI/Figma-parity coverage trong `test-plan.md`
- [x] T006 Tạo task buckets cho Phase 2 đủ để implementer không phải tự suy luận scope hay ownership

## Phase 2: Execution Backlog

### Contracts / API

- [ ] T101 Khóa users/messages/notifications admin contracts

### BE: business logic / contract / persistence

- [ ] T102 Implement user moderation rules and list/search semantics
- [ ] T103 Implement messaging/broadcast/read/clear semantics
- [ ] T104 Implement notification settings/test send semantics

### DB migration tasks

- [ ] T105 Add migrations only if contract changes require new persistence for moderation, delivery logs, templates, or notification-channel config; otherwise explicitly mark `No migration needed`

### FE: render / form wiring / API integration only

- [ ] T106 Refine users/messages/notifications UIs, including explicit row actions, audience/preview boundaries, and failure-state separation
- [ ] T107 Wire forms and actions to backend-owned contracts
- [ ] T108 Render loading/success/error and validation blockers without FE-owned business logic

### Test implementation tasks

- [ ] T109 Implement and make green API tests for users/messages/notifications
- [ ] T110 Implement and make green integration tests for adapters/contracts
- [ ] T111 Implement and make green E2E / UI route workflow tests for users/messages/notifications

### Figma parity / visual contract assertions

- [ ] T112 Verify tool clarity, CTA hierarchy, route-level parity, and regression coverage for the active scope

## Completion Rule

- Phase 2 chỉ được bắt đầu sau khi artifact Phase 1 đã khóa xong.
- Phase 2 chỉ complete khi toàn bộ test đã define pass mà không sửa spec/test để chạy theo code.
