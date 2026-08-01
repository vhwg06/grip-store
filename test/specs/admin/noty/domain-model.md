# Noty Domain Model

## Core Objects

- `NotificationConfig`
- `OutboundNotification`
- `NotificationSendHistory`

## Key Fields

- `channel`
- `target`
- `content`
- `status`
- `sentAt`
- `error`

## Boundary Note

- notification inbox domain không thuộc package này
- config hiện tại trong code mới phản ánh channel credentials/settings hơn là send log
