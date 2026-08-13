# Wave A handoff — Admin operations

Source boundary: approved order, refund and review module discovery outputs. No implementation or design sources.

## User goals and visible information

Operations users need to find unresolved work, inspect evidence/context, perform only allowed decisions and understand durable terminal outcomes.

- Order queue/detail: identifier, status, customer, total, items, shipping, payment, timeline, notes, allowed actions and customer-history/refund context.
- Refunds: pending queue, search, selectable request, order/customer/payment/prior-note evidence, approve/reject, confirmation, decision note and read-only history.
- Reviews: queue statistics, search, review status, selection, comment, product/buyer/order/attachments and moderation actions.

## Behavior constraints

- Orders: atomic `PENDING → PAID`; invalid transition stays unchanged; `DELIVERED` is terminal; cancel/delete requires fresh read `404`; empty/not-found/partial-context states are successful contextual states.
- Refunds: pending → evidence review → confirmation → approved/rejected; final outcomes leave queue and become read-only history; no second terminal decision; unavailable selection ends without false decision; fresh read confirms queue removal and note persistence.
- Reviews: `PENDING → APPROVED`; `APPROVED → HIDDEN`; approved may become featured; eligible bulk publish only; hidden remains unchanged; delete is terminal. Repeated invalid actions are disabled/hidden.
- Explicit permissions: unauthenticated `401`, non-admin/non-moderator `403` where specified. Do not invent unspecified loading/concurrency/validation states.

## Dependencies and reusable candidates

Dependencies: admin auth, customer/order/payment context, refund links, review attachments and content, durable timeline/history and server-derived action eligibility.

Candidates: status/read-only semantics, queue/search/selection, contextual evidence viewer, bulk action toolbar, action gating, destructive confirmation, empty/not-found/partial/unavailable states, atomic transition feedback and fresh-read reconciliation.

## Module ownership recommendation

Order, refund and review share an operations decision mental model but retain distinct behavior contracts. UX synthesis may unify interaction principles and evidence patterns without merging semantic ownership or inventing cross-module actions.
