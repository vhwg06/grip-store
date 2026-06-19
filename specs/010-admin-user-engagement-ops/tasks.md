# Tasks: Admin User Engagement Operations

**Input**: `specs/010-admin-user-engagement-ops/`  
**Tests**: Required, run against production API wiring

## Active Scope

- buyer notifications
- admin raw notification test-send

## Explicitly Excluded

- `/admin/users`
- `/admin/messages`
- parked admin utility routes

## Phase 1: Spec Lock

- [x] T001 Narrow module boundary to notifications-only
- [x] T002 Remove users/messages from active use-case inventory
- [x] T003 Lock notification-only API contract inventory
- [x] T004 Lock notification-only API test gate
- [x] T005 Break Phase 2 backlog by backend-owned notification behaviors

## Phase 2: Execution Backlog

### Contracts / API

- [ ] T101 Lock buyer notification inbox request/response contracts
- [ ] T102 Lock admin raw notification test-send request/response contract

### BE: business logic / handler / persistence

- [ ] T103 Ensure `GET /v1/notifications` returns stable inbox payload and pagination metadata
- [ ] T104 Ensure `GET /v1/notifications/unread-count` returns stable unread count payload
- [ ] T105 Ensure `POST /v1/notifications/:id/read` validates numeric IDs and updates one notification
- [ ] T106 Ensure `POST /v1/notifications/read-all` marks all buyer notifications read
- [ ] T107 Ensure `DELETE /v1/notifications` clears buyer inbox contractually
- [ ] T108 Ensure `POST /v1/admin/notifications/test` enforces admin role and returns queue acknowledgement

### DB / seed / fixture

- [ ] T109 Keep notification seed fixtures present for buyer inbox mutation coverage, or explicitly add them if missing
- [ ] T110 Add migration only if notification contract changes require persistence changes; otherwise mark `No migration needed`

### Tests

- [ ] T111 Implement and make green API tests for all active notification contracts
- [ ] T112 Update or add integration tests for notification handler contract coverage
- [ ] T113 Add E2E coverage only for active notification flows if UI route remains in scope

## Completion Rule

- Module `010` is done only when all active notification API tests pass against backend.
- Users/messages coverage must not be used as evidence that `010` is complete.
