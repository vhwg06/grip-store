# Test Plan: Admin Order Operations

## Files

- `playwright/specs/admin/orders.spec.ts`
- order/refund API specs split from or added beside `playwright/specs/api/admin.api.spec.ts`

## API Coverage

- order list
- order detail
- state transitions
- refund approve/reject
- validation/auth failures
- persistence and derived outputs

## UI Coverage

- list render
- filter scope persistence
- blocked row actions stay disabled until backend state changes
- detail navigation
- action triggers
- refund moderation flows
- queue empty/loading/error surfaces
- export scope remains aligned with active list filters when export stays in scope

## Gate Rules

- tests should assert backend-driven state transitions and derived status outputs
- figma review must pass before UI contract is treated as final
