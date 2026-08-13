# Wave A handoff — Public engagement

Source boundary: `test/modules/engagement/{README.md,manifest.yaml,behavior.feature}` only. No implementation or design sources.

## Semantic authority status

No separate canonical Engagement semantic specification was located. This
handoff preserves observable review, wishlist, vote and notification evidence
without promoting Gherkin/API scenarios into domain meaning. Ownership and
eligibility semantics not defined by a canonical specification are a
`semantic source gap`.

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

## Canonical Figma rebuild

The behavior-preserved Engagement slice is represented by top-level frames on
`00 — Index`:

- Reviews loaded/submit/accepted after reload: `561:155`, `561:156`, `562:1011` desktop.
- Wishlist loaded, vote-recorded and empty: `561:157`, `561:159`, `561:686` desktop; `561:729` representative mobile.

Prototype wiring covers review read → submit → accepted/reloaded visibility,
wishlist remove → empty, and wishlist vote → recorded. Notification API scenarios remain reference-only
for this public artifact. Engagement has no canonical semantic specification,
so ownership/eligibility meaning remains a semantic source gap rather than an
invitation to infer extra controls.

Review reload evidence: `evidence/public-review-accepted-reload-v2.png`.
