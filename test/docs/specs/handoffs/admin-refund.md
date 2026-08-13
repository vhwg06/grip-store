# Wave A handoff — Admin refunds

Source boundary: approved `test/modules/admin/refund` discovery sources only. No implementation or `.agents/designer.md`.

16 accepted scenarios; 9 browser; 7 API-tagged; 2 security; 1 empty-result; 1 visual `SC-VISUAL-ADMIN-REFUNDS-001` at `1440×1326`.

## User goals and visible information

Resolve a refund safely and confidently: find pending work, inspect order/customer/payment/prior-note evidence, decide, confirm an irreversible outcome and later inspect durable read-only history.

Required information/actions: pending queue, `Search refund or order...`, selectable request, evidence/context, `Approve refund`, `Reject request`, `Yes, Confirm`, decision note, History mode and empty copy `No refund requests in queue matching the filters.`

## Behavior constraints

- Unauthenticated → `401`; shopper/non-admin → `403`.
- Pending/actionable → evidence review → confirmation → approved/rejected.
- Final outcome leaves pending queue and becomes historical/read-only; second terminal action is not exposed.
- Nonexistent search is empty, not an error boundary.
- Unavailable selection ends review without false decision.
- Invalid refund identifier on approve → `400`.
- Fresh API/browser reads show durable outcome, queue removal and persisted decision note.
- Note requiredness/length, detailed unavailable status and concurrency semantics are unspecified; do not invent them.

## Dependencies and DS candidates

Dependencies: admin role, linked order/customer/payment evidence, notes, pending/history reconciliation, order/payment context.

Candidates: queue/search/select, grouped read-only evidence, decision action/confirmation/note, terminal history, pending/approved/rejected status, empty/unavailable/permission/invalid/reconciliation states.

API-supporting: `SC-REF-QUEUE-001`, `SC-REF-DECISION-001`, `SC-REF-DECISION-002`, `SC-REF-HISTORY-001`. Reference-only: `SC-REF-QUEUE-005`, `SC-REF-QUEUE-006`, `SC-REF-DECISION-007`.
