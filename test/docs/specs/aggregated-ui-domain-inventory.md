# Aggregated UI Domain Inventory

## Evidence boundary

This inventory is derived only from `AGENTS.md` and the published handoffs in `test/docs/specs/handoffs/`:

`admin-account-context.md`, `admin-content.md`, `admin-notifications.md`, `admin-operations.md`, `admin-product-catalog.md`, `admin-refund.md`, `admin-review.md`, `catalog-domain.md`, `public-auth.md`, `public-browse.md`, `public-checkout.md`, `public-content.md`, and `public-engagement.md`.

No raw module sources, frontend, or backend sources were inspected. Figma was
audited to classify the previous artifact as non-canonical and to verify the
current foundation/Catalog/Public rebuild evidence. The handoffs remain
derived execution context; canonical semantic specifications remain the
authority for their owned domains.

## Catalog baseline

`catalog-domain.md` is the dedicated Catalog handoff. It establishes ProductModel as the sole customer-visible product concept, Variant as the sellable unit, Master Data as reusable vocabulary, the public/Draft-preview projections, and the explicit boundary excluding inventory, warehouse, order, purchase-limit, and warranty-claim state.

The legacy `catalog.product` slice remains reference-only/deferred. No current UX or design trace may revive Product as a separate concept.

## Trace separation

### Behavior trace

The behavior trace is the accepted user goal, domain, data, state, transition, error, permission, dependency, and scenario evidence summarized below. API-tagged scenarios are retained as API contracts; an API tag does not authorize inventing UI behavior that its handoff does not state. Fresh reads, reloads, serial execution, official fixtures, and backend authority follow `AGENTS.md`.

### Design trace inputs

The design trace starts from applicable domain semantics, actor goals and
product intent. It may use the user-visible information responsibilities and
interaction/information candidates below as synthesis inputs. It must not turn
scenario IDs into screen, component, layout or visual-composition requirements.
The previous Figma artifact is audit evidence only. The current foundation and
Public rebuild are separately traced, while semantic/behavior validation gates
remain explicit in the coverage matrix and QA evidence.

Named visual trace IDs:

- `SC-VISUAL-ADMIN-USERS-001`, `SC-VISUAL-ADMIN-PROFILE-001`, `SC-VISUAL-ADMIN-SETTINGS-001`, `SC-VISUAL-ADMIN-COLLECT-001`
- `SC-VISUAL-ADMIN-MESSAGES-001`
- `SC-VISUAL-ADMIN-PRODUCT-CREATE-001`, `SC-VISUAL-ADMIN-PRODUCT-LIST-001`, `SC-VISUAL-ADMIN-CATEGORIES-001`
- `SC-VISUAL-ADMIN-REFUNDS-001`

Additional visual counts are published without individual IDs in the handoffs: four in admin content and one in admin reviews. They remain trace dependencies, not inferred visual contracts.

## Cross-domain mental model

```text
Visitor -> Authenticated shopper/account holder
        -> Browse/catalog discovery -> Cart -> Checkout -> Order result
        -> Reviews / Wishlist / Notifications

Admin -> Product/catalog ownership and content editorial ownership
      -> Customer commerce context <-> User account context
      -> Order / Refund / Review operations
      -> Store settings / Payment context / Collection readiness
      -> Outbound notification readiness and history
```

Ownership boundaries that must remain explicit:

- Customer is the commerce context; User is the account-control context. A link is a handoff, not a merged model.
- Product commercial state belongs to product/catalog behavior; editorial links do not transfer commercial ownership.
- Payment facts inform order/refund decisions; they are not payment execution controls or automatic refund authority.
- Store settings project accepted identity/content/support policy into public views; backend state remains authoritative.
- Review, refund, order, notification, collection, and account terminal/read-only histories retain their own semantics.

## Domain inventory: goals, concepts, and visible information

| Domain | User goals | Current domain concepts | User-visible data/content shape |
|---|---|---|---|
| Public auth/profile | Authenticate, register, maintain identity, persist a session, refresh or end it. | Visitor, account holder, credentials, OAuth redirect, access/refresh token, identity, role, shopper profile, legacy profile. | Avatar/authenticated marker; name/email/password inputs; validation/auth/duplicate-email feedback; identity `id/email/username/role`; profile identity; OAuth redirect target. |
| Public browse and Catalog evidence | Orient, narrow, search, sort, page, inspect, and explicitly add an available product. | Homepage, hero, category, featured product, announcement, result set, category filter, keyword, price order, page, product detail, availability. | Hero; category discovery; featured cards; active announcement; product cards; result count; pagination; title/price; image gallery; tabs; specification table; no-match and unavailable states; add-to-cart boundary. |
| Public checkout/order | Manage cart and complete a purchase that yields an order result. | Cart, item, quantity, total, checkout, email, payment method, order identity/status/amount, order list. | Cart item collection; quantity; total; empty-cart marker; checkout CTA/place-order CTA; optional email/payment controls; confirmation or payment/order result; order row, empty table, or authorization result. |
| Public engagement | Read and submit reviews, manage wishlist/votes, and manage notifications. | Review rating/content/visibility; shopper eligibility; wishlist presence; vote; notification type, queued/read/unread state. | Review content/rating/status/visibility; wishlist presence/vote state; notification items, unread count, type, read state, queue/history. |
| Admin product/catalog | Find, create/edit, preview, publish, and maintain product/category/editorial context. | Product Model Overview, Attributes, Variants, Media, Preview, Publish Readiness, lifecycle; category hierarchy/position; editorial article link. | Identity/context, search, visibility and stock-health information; specifications, variants, media/primary media, preview, readiness blockers/derived percentage, lifecycle, category position, article link/clear. |
| Admin content | Reuse media, manage banners/FAQs/articles/About, and enter product editorial content without owning commercial state. | Media asset/in-use protection; banner page context/active/priority; article draft/published; Visual/Markdown/preview; FAQ active/draft/order; About article/`None`; narrative/gallery. | Media selection and protection status; banner ordering/active state; article title/body/slug/cover/topic/tags/priority/mode/preview; FAQ order/status; About link/default narrative/gallery; public projections. |
| Admin customer/user/profile | Find commerce customers or accounts, preserve context, control account state, and maintain current-admin identity/security. | Customer, linked User, orders/refunds/reviews, account state, linked customer, current admin, display identity, password/2FA/backup evidence, device/session/access context. | Customer identity and commerce indicators; linked account/customer; paginated account result and state; block/unblock control; admin identity; editable display identity; security and recent-access evidence. |
| Admin operations | Find unresolved work, inspect evidence, make only allowed decisions, and understand durable outcomes. | Order queue/detail; refund request/evidence/decision note/history; review queue/statistics/context/moderation state. | Order identifier/status/customer/total/items/shipping/payment/timeline/notes/actions; refund queue/search/evidence/confirmation/note/history; review statistics/search/product/buyer/order/attachments/actions. |
| Admin settings/payment/collection | Maintain storefront policy and identity, expose payment context, and make receive-money setup ready. | Brand/contact/stats/visitor count; homepage blocks; discovery/visibility; footer/support; registry/legacy; payment facts; collection source/payee/QR-transfer/readiness. | Contact/identity/public settings; active/priority content modules; discovery rules; support links/targets; preserve/retire commitment; payment method/signals; source active state; payee; QR/transfer instruction; backend warnings/readiness. |
| Admin outbound notifications | Read readiness, gate website push sending, trace campaigns and outcomes, and find empty history safely. | Channel readiness, website push, campaign/outbound list, notification/send-set history, outcome state, search. | Readiness state and controls; sent campaign; outbound rows; outcome state and traceable minimal history; no-match history; explicit readiness error when the deferred failure case is enabled. |

## Behavior trace: states, transitions, errors, and permissions

| Domain | States/transitions and constraints | Errors/permissions/negative boundaries |
|---|---|---|
| Auth/profile | Visitor -> registered account -> authenticated session; login -> reload-persistent session -> logout; refresh exchanges a refresh token. OAuth only asserts redirect initiation. | Empty required browser fields show validation; invalid credentials/API login `401`; missing login email `400` or `422`; invalid refresh `401`; unauthenticated protected reads/updates and logout `401`; authenticated logout accepts `200/204/400`; duplicate registration has a distinct error; removed check-in reads/mutation are `404`. No automatic signup login or OAuth completion is asserted. |
| Browse/Catalog evidence | Homepage discovery -> category/catalog or featured detail; homepage discovery does not mutate cart. Catalog supports results, category narrowing, `price_asc`, page 2, keyword match, no-match empty state, and explicit card/detail add for available products. Unavailable detail omits add-to-cart. The Catalog projection exposes only eligible Active ProductModels and uses the explicit Default Variant for initial public state. | Catalog-load, image, filter, sort, pagination, add-to-cart, and announcement failure behavior is unspecified. Do not infer recovery, combined-filter precedence, unavailable copy, or operational stock semantics. |
| Cart/checkout/order | Empty cart -> item; item quantity can become `2`; item can be removed -> empty; product -> cart -> checkout -> place-order -> confirmation/payment/order result. Authenticated order creation returns `200/201` with identity, status, and amount-like value. | Unauthenticated checkout order/payment-order/payment-params/status/cancel/preview calls return exact `401`; authenticated invalid order input returns `400/422`. Quantity bounds, stock errors, payment success/failure, order status values, idempotency, durable confirmation, and cancellation success are unspecified. `/admin/orders` ownership/authorization and shopper order-history route are unresolved. |
| Engagement | Eligible review submission -> accepted -> reload-visible according to visibility; wishlist absent -> present -> absent; votable item -> recorded vote; notification unread -> one/all read; inbox -> cleared. | Protected actions preserve stated `401`, permission, validation, conflict, and not-found semantics. No loading/offline/unavailable behavior, review delete UI, admin test-send, or invented validation copy. |
| Product/catalog admin | Draft -> Active -> Discontinued; Discontinued is terminal; draft preview is private; only eligible Active models are public; ProductModel is not hard-deleted. Inactive category/master/option/definition blocks new assignment while historical references remain readable. Editorial link <-> no link and category position require fresh reads. Generation and bulk Variant operations return per-item outcomes without rolling back valid items. | Typed errors include `CATEGORY_NOT_FOUND`, `CATEGORY_INACTIVE`, `PRODUCT_MODEL_NOT_FOUND`, `PRODUCT_MODEL_NOT_DRAFT`, `PRODUCT_MODEL_NOT_ACTIVE`, `INVALID_PRODUCT_LIFECYCLE_TRANSITION`, `PRODUCT_SLUG_ALREADY_EXISTS`, `STALE_PRODUCT_MODEL`, readiness/media blockers, and typed attribute/variant errors. Legacy row-toggle/delete wording is not canonical. |
| Content | Needed media -> uploaded/selected -> reusable; in-use media is protected. Banners/FAQs active/inactive and ordered state project publicly. Article draft -> published -> public stream/detail; delete -> public detail `404`; draft preview does not publish. About published article <-> `None`; `None` restores default narrative. | Admin authorization includes specified `401/403` cases. Field validation, duplicate/conflict, broad not-found, loading/offline, and many reverse/deletion fresh-read semantics are unspecified. |
| Customer/user/profile | Customer root owns commerce history and may hand off to linked User; User root owns account state and may hand off to linked Customer. Block <-> unblock is reversible and requires fresh reads in both directions. Display identity updates persist without changing permissions. | Customer reads: unauthenticated `401`, shopper/non-admin `403`; admin customer search excludes administrator accounts. Empty searches/history are valid; stale/unsuitable account state changes reject. User-root status codes and profile authorization codes are not specified. Static security/audit/session fallback data is prohibited. |
| Operations | Order `PENDING -> PAID` is atomic; `DELIVERED` is terminal; invalid transition leaves state unchanged. Refund pending -> evidence -> confirmation -> approved/rejected; terminal outcome leaves queue and becomes read-only history. Review `PENDING -> APPROVED -> HIDDEN`; approved may become `FEATURED`; eligible bulk publish is per-review; delete is terminal. | Order cancel/delete requires a fresh read showing `404`; refund unauthenticated `401`, shopper/non-admin `403`, invalid identifier approve `400`, unavailable selection must not create a false decision, no second terminal decision. Review queue unauthenticated `401`, non-moderator `403`; hidden/ineligible/repeated terminal actions stay unchanged or unavailable as specified. |
| Settings | Accepted contact/identity/homepage/support changes project to admin and public reads/homepage. Rejected input preserves prior valid state. Homepage composition preserves priority/active/uniqueness/count rules; discovery/visibility conflicts reject; registry/legacy behavior must explicitly preserve or retire. | Invalid contact email disables browser save and shows validation; duplicate ordering or negative news count `400` (negative browser count disables save); malformed support target `400`; admin settings read unauthenticated `401`, shopper `403`. Exact fields/enums/URLs are unspecified. |
| Payment/collection | Payment method/signals are contextual evidence only. Collection source active/inactive, payee, QR/transfer setup, and readiness warnings determine receive-money readiness. | Invalid setup cannot become live; browser validation preserves prior setup; readiness/active state must be backend-derived, never fabricated. Payment/collection authorization codes are unspecified. |
| Outbound notifications | Sufficient readiness -> send permitted; insufficient readiness blocks before dispatch. Settings save -> website push send -> sent campaign/history/outcome. API-created notification appears after browser reload. Search no-match is a normal empty result. | Exact permission status is not published. Deferred settings-request failure requires an explicit readiness error and no fabricated defaults; retry/recovery/control availability are unspecified. |

## Dependencies and execution constraints

- **Catalog baseline:** use `handoffs/catalog-domain.md` as the dedicated Catalog handoff. Remaining Catalog questions are explicitly listed as unspecified contracts; they do not block the planning baseline or authorize behavioral invention.
- **Authentication and actors:** visitor, shopper/account holder, admin, operations administrator, and moderator contexts are distinct. Test credentials include `TEST_USER_EMAIL` and, where stated, `TEST_USER_PASSWORD`; bearer tokens connect authenticated API calls.
- **Catalog/inventory/content:** browse and checkout require available/active product data; checkout API additionally requires stock and active predicates. Product admin depends on categories, variants, media, inventory/stock health, editorial links, and public projections. Content depends on public article/banner/FAQ/About projections and store-setting ownership of public policy/About linkage.
- **Commerce context:** customer links to order/refund/review artifacts; order/refund review depends on payment facts, customer context, notes, attachments, and durable history.
- **Storefront projection:** accepted identity/contact/homepage/footer/support settings must be verified through fresh admin/public reads or homepage observation.
- **Collection and notification readiness:** collection source/payee/QR-transfer readiness and outbound notification channel readiness are separate backend-derived readiness concerns; each gates its own live behavior.
- **Browser/API boundaries:** checkout APIs include `/v1/checkout/orders`, `/v1/checkout/payment-orders`, `/v1/checkout/orders/{id}/payment-params`, `/v1/checkout/orders/{id}/status`, `/v1/checkout/orders/{id}/cancel`, and `/v1/checkout/preview`. Auth/profile APIs include the auth, profile, legacy-profile, and removed-check-in boundaries named in the auth handoff.
- **Persistent state:** cart, signup, orders, reviews, wishlist/votes, notifications, account state, settings, collection setup, content, and sends mutate state. Run shared-state mutations serially and use official APIs, migrations, seeds, or scripts; do not use test-only production branches.
- **Freshness and reversibility:** reload or independently read persisted state after reversible changes and verify both directions where the contract permits. Current checkout coverage has explicit fresh-read gaps for cart mutations, order completion, and cancellation; current review coverage does not assert reload.
- **Deferred/visual dependencies:** notification failure injection, exact notification authorization, visual references, and visual comparison method remain dependencies. They are not inferred here.

## Reusable interaction and information pattern candidates

These are reusable behavior/information patterns, not screen or component prescriptions.

- **Actor and permission context:** authenticated-admin, operations, moderator, shopper, and unauthenticated contexts with explicit `401/403` boundaries.
- **Search -> result -> empty result:** customer/user/product/review/refund/notification searches preserve a normal no-match state without an error boundary; refined searches can replace an empty result.
- **Ownership-preserving handoff:** customer <-> user and product <-> editorial links preserve the source identifier/context and expose only destination-domain ownership/controls.
- **Fresh-read reconciliation:** after a save or reversible transition, reload/read authoritative state; for account block/unblock and collection/profile/settings changes, verify the inverse where specified.
- **Validation preserves prior state:** invalid contact, homepage, support, collection, and setup inputs surface the specified error/disabled action while retaining the last valid value.
- **Backend-derived state guard:** identity, security/access evidence, readiness, active badges, lifecycle, action eligibility, and public projections come from backend state; never replace them with static success/default rows.
- **Lifecycle and action eligibility:** status values, terminal states, read-only histories, disabled/hidden repeated actions, and typed readiness blockers are treated as authoritative state transitions.
- **Queue -> evidence -> decision -> confirmation -> history:** shared operations pattern across orders, refunds, and reviews while keeping their ownership and transitions distinct.
- **Structured evidence context:** customer/order/payment/refund/review context is grouped as decision evidence without turning payment facts into execution or refund authority.
- **Discovery versus transaction boundary:** homepage discovery opens/refines information; explicit add-to-cart exists only in the accepted catalog/detail contexts; checkout begins from cart state.
- **Result-set controls:** keyword/category/price order/count/page are a single conceptual exploration model, but combined precedence/reset/URL semantics remain unspecified.
- **Editorial/media lifecycle:** select/reuse/protect media, edit/preview/publish content, link/clear editorial association, and verify public projection.
- **Readiness -> dispatch -> trace:** notification channel readiness gates sending; sent campaigns and outcome/history remain traceable after reload.
- **Cart/order identity capture:** a future strengthened checkout contract should carry stable cart-item and order identity through mutation, confirmation, fresh status read, and history matching; the current handoff marks this as a gap rather than an existing guarantee.

## Scenario register and API classification

Ranges use the inclusive notation published by the handoffs. Where a handoff gives a count but no individual IDs, IDs are intentionally recorded as unpublished rather than inferred.

### Account/context handoff: 59 indexed scenarios

| Slice | Count | API-tagged IDs | Browser IDs | Visual |
|---|---:|---|---|---|
| Customer | 14 | `SC-CUS-SEARCH-001,005,006`; `SC-CUS-SUMMARY-001`; `SC-CUS-ACCOUNT-LINK-001`; `SC-CUS-COMMERCE-HISTORY-001`; `SC-CUS-ACCOUNT-HANDOFF-001` | `SC-CUS-SEARCH-002,003,004`; `SC-CUS-SUMMARY-002,003`; `SC-CUS-ACCOUNT-LINK-002`; `SC-CUS-COMMERCE-HISTORY-002` | none published |
| User | 10 | `SC-USER-SEARCH-001`; `SC-USER-STATE-001`; `SC-USER-CUSTOMER-HANDOFF-001`; `SC-USER-SCOPE-001` | `SC-USER-SEARCH-002,003`; `SC-USER-STATE-002`; `SC-USER-CUSTOMER-HANDOFF-002`; `SC-USER-SCOPE-002` | `SC-VISUAL-ADMIN-USERS-001` |
| Admin profile | 9 | `SC-APRO-IDENTITY-001,002`; `SC-APRO-SECURITY-001,002` | `SC-APRO-UI-001..004` | `SC-VISUAL-ADMIN-PROFILE-001` |
| Store settings | 15 | `SC-SET-CONTACT-001`; `SC-SET-HOMEPAGE-001`; `SC-SET-DISCOVERY-001`; `SC-SET-REGISTRY-001`; `SC-SET-CONTACT-API-001..003`; `SC-SET-HOMEPAGE-API-001`; `SC-SET-REGISTRY-API-001` | `SC-SET-CONTACT-UI-001,002`; `SC-SET-HOMEPAGE-UI-001,002`; `SC-SET-REGISTRY-UI-001` | `SC-VISUAL-ADMIN-SETTINGS-001` |
| Payment context | 2 | `SC-PAY-ORDER-CONTEXT-001`; `SC-PAY-REFUND-CONTEXT-001` | none published | none |
| Payment collection | 9 | `SC-PCOL-SOURCES-001`; `SC-PCOL-PAYEE-001`; `SC-PCOL-SETUP-001`; `SC-PCOL-READINESS-001` | `SC-PCOL-SOURCES-002`; `SC-PCOL-PAYEE-002`; `SC-PCOL-SETUP-002`; `SC-PCOL-READINESS-002` | `SC-VISUAL-ADMIN-COLLECT-001` |

API classification: the 30 API-tagged IDs above are the published API trace for customer, user, profile, settings, payment context, and collection behavior. The handoff does not assign separate reference-only labels to these IDs; preserve their stated browser ownership boundaries and do not invent additional UI controls.

### Other handoffs

| Handoff | Published count | Published scenario IDs | API-tagged classification |
|---|---:|---|---|
| `admin-content.md` | 27 accepted; 15 API-tagged, 12 browser; 4 visual; 3 security | Individual IDs are not published. Groups named: media, banners, editor, articles, FAQ, About, product editorial, UI ownership. | API-tagged behavior is UI-supporting when it mutates or projects browser-visible content; only explicitly no-canonical-UI behavior is reference-only. Do not infer the missing IDs. |
| `admin-notifications.md` | 8 accepted; 2 API, 6 browser; 1 deferred browser | Accepted: `SC-NOTY-SEND-001`, `SC-NOTY-HISTORY-001`, `SC-NOTY-SEND-002..004`, `SC-NOTY-HISTORY-002,003`, `SC-VISUAL-ADMIN-MESSAGES-001`. Deferred: `SC-NOTY-SEND-005`. | API: readiness gate and outbound history. Deferred failure is not accepted coverage. |
| `admin-operations.md` | No independent count published | No IDs published. Summary covers order, refund, and review operations. | Do not create an order count or IDs; the handoff overlaps the detailed refund/review handoffs. |
| `admin-product-catalog.md` | 10 accepted; 7 functional browser, 3 visual; 1 empty-result | Accepted: `SC-ADMIN-PRODUCT-CREATE-001,002`; `SC-ADMIN-PRODUCT-LIST-001..003`; `SC-ADMIN-PRODUCT-EDITORIAL-001`; `SC-ADMIN-PRODUCT-CATEGORY-001`; visual `SC-VISUAL-ADMIN-PRODUCT-CREATE-001`, `SC-VISUAL-ADMIN-PRODUCT-LIST-001`, `SC-VISUAL-ADMIN-CATEGORIES-001`. | UI-supporting dependency ranges: `SC-GREEN-MASTER-001..008`, `SC-GREEN-MODEL-001..016`, `SC-GREEN-PREVIEW-001..004`, `SC-GREEN-PUBLIC-001..008`. Reference-only/deferred legacy: `SC-CAT-PRODUCT-READ-001..004`, `SC-CAT-PRODUCT-COMMAND-001..005`, `SC-CAT-PRODUCT-DETAILS-001..003`. |
| `admin-refund.md` | 16 accepted; 9 browser, 7 API; 2 security; 1 empty-result; 1 visual | Named API-supporting: `SC-REF-QUEUE-001`, `SC-REF-DECISION-001,002`, `SC-REF-HISTORY-001`. Named reference-only: `SC-REF-QUEUE-005,006`, `SC-REF-DECISION-007`. Visual: `SC-VISUAL-ADMIN-REFUNDS-001`. Remaining accepted IDs are not individually published. | Four named API-supporting scenarios are canonical behavior support; three named API/reference scenarios are reference-only for the current UI scope. |
| `admin-review.md` | 20 accepted; 10 functional browser, 9 API; 2 security; 1 visual | Individual IDs are not published. Queue, decision, bulk, and delete use cases are covered. | API queue/context, approve, hide, feature, bulk publish, and delete are UI-supporting; no API-only behavior becomes canonical UI without a browser contract. |
| `public-auth.md` | 27 accepted; 10 browser, 17 API | Browser: `SC-AUTH-LOGIN-001..003`, `SC-AUTH-OAUTH-001`, `SC-AUTH-SESSION-001,002`, `SC-AUTH-SIGNUP-001..004`. API: `SC-AUTH-API-001..009`, `SC-AUTH-PROFILE-001..008`. | API-tagged auth/profile boundary; includes token, identity, profile, protected `401`, and removed-surface `404` contracts. |
| `catalog-domain.md` | Greenfield Catalog baseline | ProductModel, Variant, Master Data, generation/bulk, public query, and Draft preview contracts from the greenfield feature sources. | UI-supporting Catalog boundary; legacy Product remains reference-only/deferred. |
| `public-browse.md` | 23 accepted; all browser | `SC-BROWSE-HOME-001..007`; `SC-BROWSE-CATALOG-001..009`; `SC-BROWSE-DETAIL-001..007`. | Browser discovery contract; detailed public Catalog semantics come from `catalog-domain.md`. |
| `public-checkout.md` | 17 accepted; 9 browser, 8 API | Browser: `SC-CHECKOUT-CART-001..005`, `SC-CHECKOUT-ORDER-001..004`. API: `SC-CHECKOUT-API-001..008`. | API contract covers authenticated order creation, invalid input, and unauthenticated payment/status/cancel/preview boundaries; durable order/UI ownership remains unresolved where noted above. |
| `public-content.md` | 10 accepted browser scenarios | About, article list/detail/pagination, contact form/map/company information, and successful contact submission. | UI-supporting public content boundary; failure/recovery copy remains unspecified. |
| `public-engagement.md` | 32 accepted; 7 browser, 25 API-tagged; 13 security | Review: `SC-ENGAGEMENT-REVIEW-001..003`; wishlist: `SC-ENGAGEMENT-WISHLIST-001..004`; API: `SC-ENGAGEMENT-API-001..011`; notifications: `SC-ENGAGEMENT-NOTIFICATIONS-001..014`. | UI-supporting: review `API-001..003,006..011` and notifications `001..010,014` (20 total). Reference-only for public shopper scope: review `API-004..005` and notifications `011..013` (5 total). |

Counts are per published handoff and are not summed into one global total: `admin-operations.md` overlaps detailed operations handoffs, while admin content/review/refund omit some individual IDs. No missing IDs or Catalog scenarios are inferred.

## Explicit non-inferences and open contract gaps

- Do not infer exact routes, payload schemas, field names, labels, enum values, URL formats, role names, error payloads, or visual composition where a handoff says they are unspecified.
- Do not strengthen permissive assertions into durable identity/status claims: checkout confirmation and order-list visibility currently do not prove a matched persisted order.
- Do not treat immediate browser-driver reads as fresh reads; current checkout cart/order coverage has known persistence gaps.
- Do not infer invalid-input copy, loading/offline/retry behavior, concurrency semantics, unavailable states, or reverse operations outside the handoff contracts.
- Do not merge customer and user domains, payment facts with payment execution, editorial ownership with commercial ownership, or separate readiness systems.
- Do not use visual scenario IDs as visual requirements until the referenced visual evidence is separately authorized and available.
