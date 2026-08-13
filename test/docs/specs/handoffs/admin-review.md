# Wave A handoff — Admin reviews

Source boundary: approved `test/modules/admin/review` discovery sources only. No implementation or `.agents/designer.md`.

20 accepted scenarios; 10 functional browser; 1 visual; 9 API-tagged; 2 security. Queue, decision, bulk and delete use cases are covered.

## User goals and visible information

Moderators need to find reviews, understand product/buyer/order/attachment context, make an eligible moderation decision, apply eligible bulk action and remove terminal artifacts deliberately.

Required surfaces: moderation queue, pending/featured/hidden statistics, search by product/user/comment, selectable queue item, context panel, approve/hide/feature/delete actions, bulk publish, empty `No reviews found`, delete confirmation and disabled repeated/terminal actions.

## Behavior constraints

- `PENDING → APPROVED`; `APPROVED → HIDDEN`; approved may become `FEATURED` without replacing moderation decision.
- Bulk publish evaluates eligibility per review; ineligible hidden review remains unchanged.
- Delete removes the review artifact and is terminal.
- Unauthenticated queue → `401`; non-moderator → `403`.
- Empty search is a successful empty state, not an error boundary.
- No rejected state, feature removal, explicit reload/fresh-read, loading/offline/unavailable, concurrency or zero-selection contract is specified.

## API classification and candidates

UI-supporting APIs cover queue/context, approve, hide, feature, bulk publish and delete. No API-only behavior is made into a canonical UI without a browser contract.

Candidates: review status/featured semantics, statistics, queue/selection/bulk toolbar, disabled action states, context panel, empty state, destructive confirmation, and keyboard/focus/accessibility behavior.
