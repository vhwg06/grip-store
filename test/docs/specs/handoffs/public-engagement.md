# Wave A handoff — Public engagement

Source boundary: `test/modules/engagement/{README.md,manifest.yaml,behavior.feature}` only. No implementation or design sources.

## Coverage

- 32 accepted scenarios; 7 browser; 25 API-tagged; 13 security.
- Review: `SC-ENGAGEMENT-REVIEW-001..003`.
- Wishlist: `SC-ENGAGEMENT-WISHLIST-001..004`.
- API: `SC-ENGAGEMENT-API-001..011` and `SC-ENGAGEMENT-NOTIFICATIONS-001..014`.

## User goals and visible information

- Read public reviews and submit an eligible authenticated rating/review.
- Add/remove products from a wishlist and vote where the contract allows it.
- Read notification items, understand unread count/type, mark one/all read and clear the inbox.
- Protected actions must expose authentication, permission, validation, conflict and not-found outcomes.

Visible concepts are review content/visibility, rating, wishlist presence/vote state, typed notifications, unread/read state and queued notification state.

## Behavior constraints

- Review submission: eligible shopper + rating → submit → accepted → reload → visibility-dependent display.
- Wishlist: available product → add → present; present → remove → absent; votable item → vote → recorded.
- Notifications: inbox/count → mark one read; mark all read; clear inbox.
- Unauthenticated mutation/access returns the specified `401`; non-admin or invalid actions use the specified permission/error semantics.
- Only review submission explicitly requires reload/fresh-read verification.
- No loading/offline/unavailable behavior, review-delete control, admin test-send control, or invented validation copy is allowed.

## API classification

- UI-supporting: review `API-001..003`, `API-006..011`; notifications `NOTIFICATIONS-001..010`, `NOTIFICATIONS-014`.
- Reference-only for this public shopper scope: review deletion `API-004..005`; admin email test send `NOTIFICATIONS-011..013`.

## Dependencies and reusable candidates

Dependencies: catalog/product data, shopper session/role enforcement, persistent review/wishlist/vote state, notification read-state persistence and email queue.

Reusable candidates: rating input, review visibility/status, wishlist add/remove/vote, notification typing/unread state, read/clear actions and standard `400/401/403/404/409` feedback. Empty/unavailable composition remains a synthesis decision because the contract does not specify all such states.

## Verification

Handoff is compact and preserves the distinction between behavioral evidence and UX composition. No screen blueprint is derived here.
