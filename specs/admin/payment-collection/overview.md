# Payment Collection Overview

## Intent

`payment-collection` là domain cấu hình cách doanh nghiệp nhận tiền:

- payee identity
- bank/QR collection source
- receive-money readiness

## Actors

- `Admin / Operations`
- `Admin / Finance Operator`

## Boundaries

- `payment-collection` cấu hình receive-money surfaces
- `payment` chỉ giải thích payment facts trong order/refund context

## Relationships

- downstream checkout/order instructions có thể tham chiếu cấu hình này
