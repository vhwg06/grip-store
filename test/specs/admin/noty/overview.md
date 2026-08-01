# Noty Overview

## Intent

`noty` trong admin taxonomy mới chỉ cover outbound push notification hiển thị trên website:

- push noty
- list noty
- history

Không bao gồm message inbox hoặc buyer inbox operations.

## Actors

- `Admin / Support / Operations`
- `QA / Developer`

## Surface Inventory

- `/admin/notifications`
- `/api/admin/notifications`

## In Scope

- notification send configuration cần cho outbound flow
- send/list/history spec direction
- website display-oriented push use cases

## Out Of Scope

- buyer inbox read/unread/clear
- admin messages/chat
- notification channel governance sâu hơn nếu chưa có route thật
