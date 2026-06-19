# Test Plan: Admin User Engagement Operations

## Active Scope

- `GET /v1/notifications`
- `GET /v1/notifications/unread-count`
- `POST /v1/notifications/:id/read`
- `POST /v1/notifications/read-all`
- `DELETE /v1/notifications`
- `POST /v1/admin/notifications/test`

## Out of Scope

- `/admin/users`
- `/admin/messages`
- `/admin/leads`
- `/admin/announcement`
- `/admin/collect`
- `/admin/profile`
- `/admin/data`

## API Coverage

- authenticated inbox list
- authenticated unread count
- mark single notification read
- mark all notifications read
- clear notification inbox
- admin raw notification test-send
- 401 for missing auth on buyer routes
- 401/403 boundary on admin route
- 400 for invalid notification ID shape

## Integration Coverage

- request/response mapping for notification handlers
- permission enforcement
- invalid-input error mapping

## E2E Coverage

- buyer inbox renders list or empty state
- buyer can trigger read actions
- buyer can clear inbox

## Gate Rules

- active `010` completion is measured only against notification contracts
- admin users/messages tests must not be counted toward `010` readiness
- tests must assert backend-owned status codes and side effects, not permissive fallbacks
