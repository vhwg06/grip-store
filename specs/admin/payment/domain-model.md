# Payment Domain Model

## Core Objects

- `PaymentInfo`
- `PaymentMethod`
- `PaymentEvidence`

## Known Fields

- `paymentMethod`
- `status`
- `amount`
- `orderId`

## Boundary Note

- `CheckoutPaymentResult` là code evidence cho payment data shape
- admin package này không sở hữu create/retry/callback orchestration
