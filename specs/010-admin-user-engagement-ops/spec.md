# Feature Specification: Admin User Engagement Operations

**Feature Branch**: `010-admin-user-engagement-ops`  
**Created**: 2026-06-18  
**Status**: Active Phase 1 source of truth

## Module Intent

Module `010-admin-user-engagement-ops` is narrowed to notification use cases only.

Active Phase 1 package for this module covers:

- buyer notification inbox operations
- admin raw notification test-send contract

Everything related to admin users and admin messages is explicitly removed from this active module package and must not be counted toward completion for `010`.

## Actors

- `Admin / Support / Operations`
- `Authenticated Customer`
- `QA / Developer`

## Route / Contract Inventory

| Route / contract | Purpose | Active state |
|---|---|---|
| `/v1/notifications` | buyer inbox list | active |
| `/v1/notifications/unread-count` | buyer unread count | active |
| `/v1/notifications/:id/read` | mark one notification as read | active |
| `/v1/notifications/read-all` | mark all notifications as read | active |
| `/v1/notifications` `DELETE` | clear buyer inbox | active |
| `/v1/admin/notifications/test` | admin raw test-send | active |

## Removed From Active Scope

The following routes may still exist in codebase inventory, but they are not part of active `010` completion:

- `/admin/users`
- `/admin/messages`
- `/admin/leads`
- `/admin/announcement`
- `/admin/collect`
- `/admin/profile`
- `/admin/data`

## In Scope

- authenticated buyer can read notification inbox
- authenticated buyer can read unread count
- authenticated buyer can mark one notification as read
- authenticated buyer can mark all notifications as read
- authenticated buyer can clear inbox
- admin can call raw notification test-send endpoint
- auth, role, and invalid-input failures for the above contracts

## Out of Scope

- user moderation
- admin messaging or broadcast workflows
- notification channel settings UI
- parked routes listed above
- FE/BE app code edits as part of Phase 1 spec output itself

## Backend Ownership

### Backend owns

- inbox pagination and notification payload shape
- unread count calculation
- mark-read, mark-all-read, and clear semantics
- numeric notification ID validation
- admin authorization for raw notification test-send
- request validation and response status contract

### Frontend owns only

- rendering inbox list, empty state, and loading state
- triggering buyer/admin intent
- presenting success/error responses

## Test Definition Summary

### API tests

- buyer inbox read operations
- buyer inbox mutation operations
- admin raw notification test-send
- auth/role/invalid-input failures

### Integration tests

- adapter request/response mapping for notification endpoints
- permission enforcement and error mapping

### E2E / UI workflow tests

- buyer inbox render and read actions
- admin notification raw send trigger if route exists

## Edge Cases

- empty inbox still returns success payload
- unread count remains valid after mark-all-read or clear
- non-numeric notification IDs are rejected
- unauthenticated buyers are rejected on all buyer notification routes
- non-admin callers are rejected on admin raw notification route

## Success Criteria

- active module package is explicitly limited to notification use cases only
- `/admin/users` and `/admin/messages` are no longer treated as part of active `010`
- API tests fully cover the active notification contract set
- backend readiness for `010` is judged only by notification API test results
- Phase 2 completion for `010` requires all active notification API tests to pass
