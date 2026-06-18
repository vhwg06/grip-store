# Feature Specification: Admin Order Operations

**Feature Branch**: `009-admin-order-ops`
**Created**: 2026-06-18
**Status**: Phase 1 source of truth

## Module Intent

Module này gom order lifecycle operations:

- order list
- order detail
- admin status transitions
- refunds moderation

Phase split bắt buộc:

- **Phase 1**: chốt use cases, spec, figma review, backend ownership, current code audit, test definition, tasks
- **Phase 2**: implement theo tasks Phase 1, với test là source of truth

## Actors

- `Admin / Operations`
- `Customer`
- `QA / Developer`

## Route / Screen Inventory

| Route / screen | Purpose | Current state |
|---|---|---|
| `/admin/orders` | order list/filter/search | route đã tồn tại |
| `/admin/orders/[id]` | order detail/action surface | route đã tồn tại |
| `/admin/refunds` | refund queue and actions | route đã tồn tại |

## In Scope

- order list/detail
- admin order state actions
- refund approve/reject flows
- derived order status display for admin

## Out of Scope

- catalog core
- content/settings modules
- users/messages/leads/data
- app code changes trong Phase 1

## Route-Level Use Cases

### Use Case 1: Order List

Admin filter/search/paginate orders, scan queue rows, see blocked versus allowed actions, and move from list into detail without inventing hidden workflow.

### Use Case 2: Order Detail

Admin xem customer, items, total, timeline, note state, and perform only allowed actions with backend-owned safeguards.

### Use Case 3: Refund Moderation

Admin xem refund queue, inspect evidence/history, leave note context, and approve/reject with backend-owned rules.

## Current Code Audit

### Current FE surface

- `/admin/orders` và `/admin/orders/[id]` đã có routes.
- `/admin/refunds` đã có route riêng.
- `useAdminOrders`, `useAdminOrder`, `useAdminRefunds`, `useAdminOrderDetails` đã có hooks.
- order actions component đã có mark paid/delivered/cancel buttons.

### Current contract visibility

- `src/adapters/api/admin.api.ts` có reads/mutations cho orders/refunds.
- Playwright đã có `playwright/specs/admin/orders.spec.ts`.

### Gaps discovered

- order ops chưa có module-level spec tách khỏi admin generic spec
- refund behavior và server-driven derived statuses chưa được module hóa rõ
- UI tests hiện chưa đủ để trở thành source of truth cho refund approval/rejection + timeline/public reflection

## Figma Adaptation Requirements

Review theo `gpt-taste` protocol nhưng ưu tiên operational clarity:

- summary/status/action hierarchy rõ
- detail pages phải scan được nhanh
- destructive/cancellation/refund actions tách rõ khỏi read-only information
- no cramped timelines/tables

## API / Contract Expectations

- `/v1/admin/orders`
- `/v1/admin/orders/:id`
- order status transition endpoints
- refund approval/rejection endpoints

## Backend Ownership

### Backend owns

- order state machine
- refund eligibility and transitions
- derived status labels/counts/timeline data
- monetary totals and persistence
- authorization and integrity

### Frontend owns only

- render list/detail/timeline
- submit status/refund intent
- loading/success/error display
- filters/search UI
- navigation

## Test Definition

### API tests

- list orders
- order detail fetch
- allowed status transitions
- refund approve/reject
- validation/auth failures
- persistence/derived outputs

### UI tests

- list render, filter scope, blocked actions, and navigation
- view detail
- trigger allowed status actions
- refund moderation actions
- queue empty/loading/error state handling

## Edge Cases

- invalid state transitions rejected by backend
- empty refund queue safe render
- order detail missing optional fields still renders safely

## Success Criteria

- order/refund flows are isolated as one module
- backend ownership is explicit for all state transitions
- Phase 1 output reflects that all scoped routes have route-level Figma coverage, while residual polish gaps do not change backend ownership or test-first discipline
- Phase 1 output không chứa app code FE/BE
- Phase 2 chỉ được bắt đầu từ tasks đã chốt ở Phase 1
- Phase 2 chỉ complete khi toàn bộ test đã define pass
