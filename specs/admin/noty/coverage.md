# Noty Coverage

## Current Coverage

- route: `/admin/notifications`
- adapter: `getAdminNotificationSettings()`
- old `010` contains notification-related evidence but was centered on inbox/test-send, not outbound admin history

## Gaps

- current route is settings-focused, not yet list/history-focused
- no canonical outbound push contract doc yet
- legacy notification docs must not be reused as inbox source of truth

## Priority

- entity: `P3`
