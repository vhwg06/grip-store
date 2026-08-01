# Review Overview

## Intent

Quản lý review moderation như domain riêng:

- review queue
- single action moderation
- bulk publish
- featured/public projection control

## Actors

- `Admin / Moderator`
- `Customer`
- `QA / Developer`

## Surface Inventory

- `/admin/reviews`
- `/api/admin/reviews`
- moderation mutations
- public product reviews projection dependency

## In Scope

- queue moderation
- approve/hide/feature
- bulk publish
- context panel với product/customer/order references

## Out Of Scope

- customer compose review UX
- product core ownership
