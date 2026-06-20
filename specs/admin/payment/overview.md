# Payment Overview

## Intent

`payment` trong phase này chỉ mô tả admin-facing payment info:

- payment info
- payment method/status context gắn với order/refund

## Actors

- `Admin / Operations`
- `QA / Developer`

## Surface Inventory

- order detail payment fields
- checkout payment data types
- refund-linked payment evidence

## In Scope

- payment method and payment status info shown to admin
- transaction/evidence linkage cần cho order/refund reading

## Out Of Scope

- payment gateway lifecycle
- callback/retry orchestration
- buyer checkout UX ownership
