# Feature Specification: Admin User Engagement Operations

**Feature Branch**: `010-admin-user-engagement-ops`
**Created**: 2026-06-18
**Status**: Phase 1 source of truth

## Module Intent

Module này khóa active Phase 1 package cho admin user engagement ở 3 route:

- users
- messages
- notifications

Phase split bắt buộc:

- **Phase 1**: chốt đủ `use-cases.md`, `spec.md`, `contracts.md`, `figma-review.md`, `test-plan.md`, `tasks.md`
- **Phase 2**: nhận input từ spec, use cases, defined tests, và task buckets đã khóa trong Phase 1

## Actors

- `Admin / Support / Operations`
- `Customer / Lead`
- `QA / Developer`

## Route / Screen Inventory

| Route / screen | Purpose | Current state |
|---|---|---|
| `/admin/users` | user list and moderation | route đã tồn tại |
| `/admin/messages` | admin-to-user/broadcast messaging | route đã tồn tại |
| `/admin/notifications` | notification channel settings | route đã tồn tại |

## Existing But Parked Routes

The following routes remain in code but are parked from the current active Phase 1 package and current Figma-reviewed active scope:

- `/admin/leads`
- `/admin/announcement`
- `/admin/collect`
- `/admin/profile`
- `/admin/data`

## In Scope

- user listing/block/points moderation
- admin messages/broadcast/history/inbox
- notification settings/test sends

## Out of Scope

- parked routes listed above
- storefront settings in `005`
- content/catalog/order modules
- app code changes trong Phase 1

## Phase 1 Output Contract

Phase 1 for this module must output:

- product / behavior definition:
  - use cases
  - spec
  - backend ownership review
  - figma adaptation review
  - current code audit
- test definition:
  - API tests
  - E2E tests
  - integration tests
  - UI / route workflow tests
  - nếu cần: Figma parity / visual contract assertions
- implementation backlog:
  - FE tasks
  - BE tasks
  - DB migration tasks
  - contract / API tasks
  - test implementation tasks
  - nếu cần: seed / fixture tasks

## Route-Level Use Cases

See `use-cases.md` for normative use-case wording.

## Current Code Audit

### Current FE surface

- routes for users/messages/notifications/leads/announcement/collect/profile/data all exist.
- active Phase 1 package only targets users/messages/notifications.
- parked routes are acknowledged for module inventory but are not active test-definition or Figma-gate inputs in this package.

### Current contract visibility

- admin-facing adapters already expose reads/mutations across the broader engagement area.
- active package still needs contract boundaries rewritten around users/messages/notifications only.
- generic `playwright/specs/admin/settings.spec.ts` still mixes unrelated admin areas and should not remain the effective spec boundary for this module.

### Gaps discovered

- active module boundary was previously too broad and mixed parked routes into the same Phase 1 package
- tests are not yet split cleanly into user moderation, messaging, and notifications tracks
- backend ownership for permissions, counts, targeting, and send/test semantics is not explicit enough in current docs

## Figma Adaptation Requirements

Review theo `gpt-taste` protocol với trọng tâm tool clarity:

- messaging, notifications, and user moderation must feel distinct
- forms and tables require readable spacing and unambiguous CTA hierarchy
- no decorative clutter that obscures operational meaning

Figma role in this module:

- locks components/layout/state presentation for `/admin/users`, `/admin/messages`, `/admin/notifications`
- does not define business behavior or backend ownership
- parked routes are not counted inside current Figma-reviewed active scope

## API / Contract Expectations

- `/v1/admin/users`
- `/v1/admin/messages`
- `/v1/admin/notifications`

## Backend Ownership

### Backend owns

- user block/points mutation rules
- broadcast/send targeting semantics
- notification test send behavior
- unread/history counts and message integrity
- authorization and auditability

### Frontend owns only

- render tables/forms/tooling
- local input state
- submit admin intent
- loading/success/error states
- navigation

## Test Definition Summary

### API tests

- user list/mutations
- message send/clear/delete/read operations
- notification settings/test sends
- validation/auth failures

### E2E / UI / Route workflow tests

- user list render and moderation actions
- message compose/history/inbox flows
- notification settings form and tests

### Integration tests

- adapter-level users/messages/notifications request/response handling
- error mapping and permission failure rendering

### Optional Figma parity assertions

- route-level CTA hierarchy remains aligned for users/messages/notifications
- list/composer/channel state presentation does not regress from approved Figma contract

## Edge Cases

- empty user/message history states safe render
- invalid notification config/test targets rejected by backend
- user moderation outcomes remain backend authoritative

## Success Criteria

- active module package is explicitly narrowed to users/messages/notifications
- five parked routes are documented and removed from the current Figma-reviewed active scope
- backend ownership is explicit for permissions, targeting, and send/test operations
- Phase 1 output reflects spec + use cases + test definitions + implementation tasks as the required input set for Phase 2
- Phase 1 output không chứa app code FE/BE
- Phase 2 chỉ được bắt đầu từ tasks đã chốt ở Phase 1
- Phase 2 chỉ complete khi toàn bộ test đã define pass
