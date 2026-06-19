# Use Cases: Admin User Engagement Operations

Status: Active Phase 1 source of truth

## Active Scope

This package only defines notification use cases:

- buyer notification inbox operations
- admin raw notification test-send

The following areas are outside the active module boundary:

- `/admin/users`
- `/admin/messages`
- parked admin utility routes

## UC-010-01 Buyer Reads Notification Inbox

Authenticated buyer opens notification inbox and reads available notification items plus unread count.

Acceptance shape:

- inbox list comes from backend
- unread count comes from backend
- FE renders result or empty state only

## UC-010-02 Buyer Marks Notification State

Authenticated buyer marks a single notification as read or marks the entire inbox as read.

Acceptance shape:

- notification ownership and mutation semantics are backend-owned
- FE only triggers the action and reflects returned status
- invalid notification IDs are rejected by backend

## UC-010-03 Buyer Clears Notification Inbox

Authenticated buyer clears inbox notifications.

Acceptance shape:

- clear semantics are backend-owned
- successful clear returns transport success without FE-owned state inference

## UC-010-04 Admin Sends Raw Notification Test

Admin triggers raw notification test-send for a chosen channel and target.

Acceptance shape:

- admin authorization is backend-owned
- payload validation and queue semantics are backend-owned
- FE or API tests only assert the transport contract and returned queue result
