# Use Cases: Admin User Engagement Operations

Status: Phase 1 source of truth

## Active Phase 1 Scope

This package actively defines Phase 1 behavior and UI-contract inputs for:

- `/admin/users`
- `/admin/messages`
- `/admin/notifications`

The following routes still exist in code but are parked from the current Figma-reviewed active scope and are not part of the active Phase 1 implementation package here:

- `/admin/leads`
- `/admin/announcement`
- `/admin/collect`
- `/admin/profile`
- `/admin/data`

## UC-010-01 User Moderation

Admin opens `/admin/users`, searches or filters users, inspects moderation context, and submits block/unblock or point-adjust intents.

Acceptance shape:

- list/search/filter semantics come from backend
- risk notes and derived state come from backend
- FE only renders list state, action affordances, and mutation results

## UC-010-02 Admin Messaging

Admin opens `/admin/messages`, selects an audience, drafts a message, previews it, and confirms send only after backend-valid targeting rules pass.

Acceptance shape:

- audience resolution and send eligibility are backend-owned
- FE shows compose, preview, confirm, history, and error surfaces
- scheduled or blocked states are rendered, not inferred by FE

## UC-010-03 Notification Configuration

Admin opens `/admin/notifications`, edits channel settings, runs test-send actions, and reviews failure/success results.

Acceptance shape:

- channel validation, auth rules, and test-send semantics are backend-owned
- FE renders config forms, test actions, and result states
- retry or failure messaging reflects server response rather than FE-owned logic
