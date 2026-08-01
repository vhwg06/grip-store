# Refund Domain Model

## Core Objects

- `RefundRequest`
- `RefundEvidence`
- `RefundDecision`
- `RefundDecisionHistory`

## Key Relationships

- `RefundRequest` references `orderId`
- `RefundRequest` references `customerId`
- `RefundRequest` references payment info snapshot when available

## State Notes

- eligibility và transition rules thuộc backend
- admin note là decision context, không phải source of truth cho state machine
