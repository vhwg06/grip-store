# Test Plan: Admin User Engagement Operations

## Active Scope

- `/admin/users`
- `/admin/messages`
- `/admin/notifications`

## Parked Routes

The following routes are outside the current active package and should not be counted in this test plan:

- `/admin/leads`
- `/admin/announcement`
- `/admin/collect`
- `/admin/profile`
- `/admin/data`

## API Coverage

- users list and moderation mutations
- messages send/clear/delete/read
- notification settings/test sends
- validation/auth failures

## E2E Coverage

- admin can complete moderation flow on users route
- admin can compose, preview, and confirm send on messages route
- admin can edit notification channel settings and test-send from notifications route

## Integration Coverage

- adapter request payload shaping for users/messages/notifications
- response normalization and error mapping into UI-safe state

## UI / Route Workflow Coverage

- users list and actions
- messages compose/history/inbox
- notification settings forms

## Optional Figma Parity / Visual Contract Assertions

- users route keeps search, row-action, risk-state, and moderation CTA hierarchy
- messages route keeps audience, preview, confirm-send, and blocked-send state presentation
- notifications route keeps channel edit, test CTA, and failure-note presentation

## Gate Rules

- tests should assert backend-owned permissions and side effects
- figma review must pass for active scope before UI contract is treated as final
- Figma parity assertions must not be used to define behavior; they only protect UI contract
