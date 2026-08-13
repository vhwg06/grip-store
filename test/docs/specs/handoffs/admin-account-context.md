# Wave A — Admin account/context discovery

## Evidence boundary

This handoff is derived only from `AGENTS.md` and the following approved module sources:

- `test/modules/admin/customer/README.md` and `behavior.feature`
- `test/modules/admin/user/README.md` and `behavior.feature`
- `test/modules/admin/admin-profile/README.md` and `behavior.feature`
- `test/modules/admin/store-setting/README.md` and `behavior.feature`
- `test/modules/admin/payment/README.md` and `behavior.feature`
- `test/modules/admin/payment-collection/README.md` and `behavior.feature`

The module READMEs identify `behavior.feature` as the executable Gherkin source of truth, with `behavior.steps.ts` as the API/browser binding boundary and `manifest.yaml` as the scenario mapping. No frontend, backend, `.agents/designer.md`, or Figma source was inspected. Visual scenario IDs are recorded for traceability only; their visual contracts are not analyzed here.

## Cognitive grouping

### 1. Account and commerce context routing

Modules: `admin/customer`, `admin/user`

The central mental model is ownership, not a combined account screen:

```text
Customer root (commerce source of truth)
  ├─ identity + order/refund/review indicators
  ├─ commerce links
  └─ linked account → User domain (account controls)

User root (account source of truth)
  ├─ account state + block/unblock control
  └─ linked customer → Customer root (commerce history)
```

Goals:

- Find the correct commerce customer and open a customer context for support.
- Find and read an account, then control account state when the concern is account-level.
- Move between linked customer and user contexts without transferring ownership or copying controls.
- Keep commerce support actions out of account management and account controls out of the customer commerce root.

Visible information and controls:

- Customer search returns customer-centric records and must exclude administrator accounts. Similar records may need commerce signals to distinguish the right record.
- Customer summary shows identity plus order, refund, and review indicators; order/refund/review references preserve the same customer context.
- Empty orders/refunds/reviews are a valid customer projection, not a broken record.
- A linked user account is visible from a customer summary and supports a handoff to user management.
- User search is paginated and account-centric; the selected account state is readable.
- The account panel exposes block and customer-handoff controls only. It does not expose commerce history actions.
- A linked customer context is available from an account. An account with no customer link remains valid in the user domain.
- Browser account state changes are reversible and must be confirmed by a fresh account read after each direction.

Permissions and errors:

- Customer root reads reject unauthenticated clients with `401` and shopper/non-admin reads with `403`.
- The feature does not specify user-root status codes; do not infer them from the customer contract.
- Empty customer/account searches are normal states. Customer empty search must render without an error boundary; an account search can be refined and replaced by a later result.
- A stale or unsuitable account state change is rejected.

Boundary semantics:

- Commerce history remains owned by the customer domain even when a linked user account is shown.
- Account blocking/unblocking remains owned by the user domain and is not a substitute for order, refund, or review support.
- The handoff should preserve a stable identifier/context, but the feature only asserts destination and ownership behavior; it does not define a URL or payload shape.

### 2. Operator identity and account security

Module: `admin/admin-profile`

Goal:

- Let the current admin inspect and maintain their operational identity and judge account trustworthiness.

Visible information and actions:

- Backend-owned current admin identity and display representation.
- Editable display identity, persisted after reload.
- Security evidence covering password, 2FA, and backup-method context.
- Recent device, session, and access context sufficient to distinguish expected from suspicious access.

Permissions and invariants:

- The profile is explicitly self-profile/current-admin scope; the feature does not define management of another administrator.
- Changing display identity must not change the admin permission posture.
- Security and recent-access content must come from backend responses.
- Static green audit copy and static fallback session rows are prohibited when backend security/access data is requested.
- The feature does not specify unauthenticated/non-admin status codes for profile reads; do not invent them.

### 3. Storefront policy and public identity

Module: `admin/store-setting`

Goals:

- Maintain storefront contact and identity facts.
- Compose homepage content while preserving priority, active-state, uniqueness, and count rules.
- Configure discovery/visibility behavior with its public meaning intact.
- Maintain explicit footer, support, registry, and legacy commitments.

Visible information and settings:

- Structured brand/contact facts, including admin-side brand, contact, stats, and visitor count; public settings expose storefront identity fields.
- Homepage block priority/active state and configured content modules.
- Discovery and visibility rules.
- Footer/support links and targets.
- Registry/legacy commitment policy and whether related legacy behavior is intentionally preserved or retired.

Validation, errors, and persistence:

- Valid contact input is accepted; invalid contact data leaves the prior value unchanged.
- Invalid contact email disables the browser save action and shows a validation message.
- Valid admin identity updates must be reflected in both admin settings and public catalog settings/homepage.
- Valid homepage composition returns `200`; duplicate ordering or a negative news count returns `400`.
- Browser negative news count disables the homepage save action.
- Conflicting discovery/visibility combinations are rejected.
- Valid footer/support commitments succeed; malformed support targets return `400`.
- Browser saves must surface configured homepage/support results.
- Admin store-setting reads require admin authorization: unauthenticated `401`, shopper `403`.

Ownership and public meaning:

- Backend owns validation and the authoritative persisted setting state; public read models must reflect accepted admin updates.
- A setting’s public behavioral meaning must remain explicit. The feature does not provide field names, enum values, or exact URL formats beyond the stated validity rules.

### 4. Payment context and receive-money readiness

Modules: `admin/payment`, `admin/payment-collection`

These are related but not the same responsibility:

```text
Order/refund context
  └─ payment facts/signals → inform an operational decision

Collection configuration
  ├─ source active/inactive state
  ├─ payee identity
  ├─ QR/transfer instruction
  └─ readiness warnings → determine whether receive-money setup is ready
```

Goals:

- Show payment method and payment-related facts while an admin reads an order or reviews a refund.
- Manage configured receive-money sources, payee identity, and QR/transfer setup.
- Make readiness and warnings visible before a collection source is used live.

Visible information and controls:

- Order detail payment method/signals and refund-relevant payment facts.
- Collection sources and active/inactive state.
- Explicit payee identity for the selected source.
- QR or transfer receive-money instruction.
- Backend-derived readiness states and warnings.

Boundaries and errors:

- Payment facts inform order/refund operations but do not become payment execution controls.
- Payment context alone does not decide a refund outcome.
- Invalid collection setup cannot become live configuration; browser validation preserves the previous setup.
- Readiness must be derived from backend state/warnings; fabricated active badges are prohibited.
- The feature does not define payment or collection authorization status codes; do not infer them.

## Cross-module dependencies

| Dependency | Contract | Downstream implication |
|---|---|---|
| Customer ↔ User | Customer can expose a linked account; user can expose a linked customer. | Navigation is a handoff between ownership domains, not a merged model. Preserve the root context and use the destination domain’s controls. |
| Customer → commerce artifacts | Customer root links to order, refund, and review references. | Child artifacts are traversal targets; a missing child must not erase the customer summary. |
| User state → customer context | Account block/unblock is a user-domain state change; linked customer remains commerce-owned. | Refresh/fresh-read state after each reversible change and keep commerce actions outside account controls. |
| Admin profile identity → permission posture | Display identity can change independently of permissions. | Update identity without mutating authorization/role semantics. |
| Store settings → public catalog/homepage | Accepted identity, contact, homepage, and support settings are reflected publicly. | Verify with a fresh public read or homepage observation after admin save. |
| Store settings → validation | Contact, homepage ordering/count, discovery/visibility, and support targets have rejection rules. | Preserve previous valid state on rejected input; surface field/action-level browser feedback where specified. |
| Collection setup → readiness | Source, payee, and QR/transfer configuration feed backend readiness/warnings. | Do not label a source live/active unless backend state supports it; invalid setup remains non-live and prior setup is preserved in the browser case. |
| Payment context → order/refund review | Payment facts are contextual evidence. | Keep them visible at the relevant commerce surface without exposing payment execution or making them the refund decision. |

## Permissions, errors, settings, payment readiness, account, and security matrix

| Area | Authoritative behavior | Explicit negative/guardrail |
|---|---|---|
| Customer root | Admin can search/read customer commerce context. | No auth `401`; shopper/non-admin `403`; administrator accounts excluded from customer results. |
| User root | Admin can search/read paginated account state. | Empty/refined search is valid; unsuitable or stale state changes rejected. |
| Account state | User domain owns reversible block/unblock. | Fresh read must show toggled state and then restored original state. |
| Customer/user handoff | Linked context navigates to the other domain. | Do not copy commerce controls into user panel or account controls into customer root; unlinked account remains valid. |
| Admin profile | Current admin identity, display identity, password/2FA/backup evidence, recent access. | Display update cannot alter permissions; no static green audit copy or fallback session rows. |
| Store settings | Contact/public identity, homepage, discovery/visibility, registry/legacy, footer/support. | Invalid contact unchanged; conflicts/count/targets rejected; admin read `401`/shopper `403`. |
| Payment context | Payment facts shown on order/refund surfaces. | Informational only; no payment execution control or automatic refund decision. |
| Collection | Active/inactive sources, payee, QR/transfer setup, readiness warnings. | Invalid setup not live; prior setup preserved; readiness not fabricated. |

## Derived goals and implementation-facing tasks

These are discovery tasks derived from the accepted scenarios, not new behavior requirements:

1. Establish separate customer and user roots with explicit ownership labels and stable cross-domain handoff affordances.
2. Provide customer search/result/summary states, including administrator exclusion, empty commerce history, empty results, and preserved context across commerce links.
3. Provide paginated account search/read and account-only controls, including reversible block state with fresh-read verification and empty-to-nonempty refinement.
4. Keep the customer↔user handoff one-way by concern: commerce concern routes to customer; account concern routes to user.
5. Render current-admin identity, editable display identity, security evidence, and recent access from backend-owned data; ensure reload persistence and absence of static fallback content.
6. Implement store settings as validated policy groups: contact/public identity, homepage composition, discovery/visibility, registry/legacy, and footer/support.
7. Preserve prior valid settings after rejected input and verify accepted settings through the relevant public/homepage read model.
8. Keep payment facts contextual on order/refund views and separate from payment execution/refund-decision controls.
9. Implement collection source, payee, QR/transfer, and readiness states from backend data, with invalid setup blocked and prior setup retained in the browser path.
10. Treat authorization and validation failures as observable behavior: customer/store-setting `401`/`403`, store-setting `400` cases, and browser action disable/error states.

## Reusable test/design candidates

The following candidates recur across the approved scenarios and can be standardized without changing the contracts:

- **Admin-authenticated context fixture:** reusable admin session/current-admin identity for API and browser entry points; keep shopper and unauthenticated actors separate for `401`/`403` checks.
- **Customer/user identity fixture pair:** buyer customer, linked buyer account, administrator account, unknown search term, and customer without commerce history. Use explicit ownership metadata rather than treating customer and user as interchangeable.
- **Fresh-read assertion helper:** after any reversible or persisted change, reload or issue a fresh API read and assert the authoritative state. Applies to user block state, profile display identity, store settings, and collection payee/setup.
- **Cross-domain handoff assertion:** assert destination root and absence/presence of domain-specific controls, while preserving the originating entity’s ownership semantics.
- **Empty-state assertion:** distinguish valid empty customer commerce history and no-result searches from error boundaries; support replacing an empty account result with a later valid result.
- **Validation-preserves-previous-state helper:** submit invalid contact, homepage, support, or collection setup; assert the specified error/disabled action and unchanged prior valid state.
- **Backend-derived rendering guard:** assert visible identity/security/access/readiness data comes from the current backend response and reject static fallback/audit copy/fabricated active badges.
- **Public projection assertion:** after valid store identity/contact/homepage/support changes, verify admin settings and public catalog/homepage reflect the accepted facts.
- **Context-only payment assertion:** verify payment facts are visible in order/refund review while payment execution controls and automatic refund authority are absent.
- **Scenario tag/rule index:** use the UC rule as the behavior grouping and the SC ID as the stable traceability key; preserve API/browser/security/empty-result/visual tags when selecting coverage.

## Scenario ID index

All accepted scenarios in the approved feature files:

### `admin/customer`

| Rule | Scenario ID | Surface/tags | Contract focus |
|---|---|---|---|
| `UC-CUS-SEARCH` | `SC-CUS-SEARCH-001` | API | Search/open customer commerce context; commerce signals may disambiguate. |
| `UC-CUS-SEARCH` | `SC-CUS-SEARCH-005` | API, security | Unauthenticated customer root read → `401`. |
| `UC-CUS-SEARCH` | `SC-CUS-SEARCH-006` | API, security | Shopper customer root read → `403`. |
| `UC-CUS-SUMMARY` | `SC-CUS-SUMMARY-001` | API | Identity/commerce summary; preserve context across order/refund/review links; missing child does not erase root. |
| `UC-CUS-ACCOUNT-LINK` | `SC-CUS-ACCOUNT-LINK-001` | API | Show linked user; account concern hands off; commerce ownership unchanged. |
| `UC-CUS-COMMERCE-HISTORY` | `SC-CUS-COMMERCE-HISTORY-001` | API | Empty commerce history is valid. |
| `UC-CUS-ACCOUNT-HANDOFF` | `SC-CUS-ACCOUNT-HANDOFF-001` | API | Commerce-root view hands account concern to user domain. |
| `UC-CUS-SEARCH` | `SC-CUS-SEARCH-002` | Browser | Buyer customer result; administrator excluded. |
| `UC-CUS-SEARCH` | `SC-CUS-SEARCH-003` | Browser, empty-result | No-result search without error boundary. |
| `UC-CUS-SEARCH` | `SC-CUS-SEARCH-004` | Browser, security | Administrator search yields no customer result. |
| `UC-CUS-SUMMARY` | `SC-CUS-SUMMARY-002` | Browser | Customer identity and order/refund/review indicators. |
| `UC-CUS-SUMMARY` | `SC-CUS-SUMMARY-003` | Browser | Order/refund/review actions from customer root. |
| `UC-CUS-ACCOUNT-LINK` | `SC-CUS-ACCOUNT-LINK-002` | Browser | Linked account controls enter user management; commerce actions absent. |
| `UC-CUS-COMMERCE-HISTORY` | `SC-CUS-COMMERCE-HISTORY-002` | Browser | Newly registered customer with empty commerce history remains visible/valid. |

### `admin/user`

| Rule | Scenario ID | Surface/tags | Contract focus |
|---|---|---|---|
| `UC-USER-SEARCH` | `SC-USER-SEARCH-001` | API | Search paginated account list and read selected account state. |
| `UC-USER-STATE` | `SC-USER-STATE-001` | API | Valid account state change succeeds; stale/unsuitable change rejected. |
| `UC-USER-CUSTOMER-HANDOFF` | `SC-USER-CUSTOMER-HANDOFF-001` | API | Linked customer opens customer root; no-link account remains valid. |
| `UC-USER-SCOPE` | `SC-USER-SCOPE-001` | API | Commerce concern routes to customer-led context; account controls are not commerce support. |
| `UC-USER-SEARCH` | `SC-USER-SEARCH-002` | Browser | Buyer account shown without commerce history actions. |
| `UC-USER-SEARCH` | `SC-USER-SEARCH-003` | Browser | Unknown result replaced by buyer account after refined search. |
| `UC-USER-STATE` | `SC-USER-STATE-002` | Browser | Toggle block state, fresh-read, restore original, fresh-read again. |
| `UC-USER-CUSTOMER-HANDOFF` | `SC-USER-CUSTOMER-HANDOFF-002` | Browser | Linked customer context enters customer management. |
| `UC-USER-SCOPE` | `SC-USER-SCOPE-002` | Browser | Account panel exposes block and customer handoff only. |
| `UC-USER-SEARCH` | `SC-VISUAL-ADMIN-USERS-001` | Browser, visual | Desktop users visual contract (not analyzed; Figma out of scope). |

### `admin/admin-profile`

| Rule | Scenario ID | Surface/tags | Contract focus |
|---|---|---|---|
| `UC-APRO-IDENTITY` | `SC-APRO-IDENTITY-001` | API | Read current admin identity/operational representation. |
| `UC-APRO-IDENTITY` | `SC-APRO-IDENTITY-002` | API | Change display identity without changing permission posture. |
| `UC-APRO-SECURITY` | `SC-APRO-SECURITY-001` | API | Password, 2FA, and backup-method security context. |
| `UC-APRO-SECURITY` | `SC-APRO-SECURITY-002` | API | Recent device/session/access context for trust review. |
| `UC-APRO-UI` | `SC-APRO-UI-001` | Browser | Backend admin identity and security section render. |
| `UC-APRO-UI` | `SC-APRO-UI-002` | Browser | Display identity persists after reload. |
| `UC-APRO-UI` | `SC-APRO-UI-003` | Browser | Backend security posture; no static green audit copy. |
| `UC-APRO-UI` | `SC-APRO-UI-004` | Browser | Backend recent access; device/location visible; no static session rows. |
| `UC-APRO-UI` | `SC-VISUAL-ADMIN-PROFILE-001` | Browser, visual | Desktop profile visual contract (not analyzed; Figma out of scope). |

### `admin/store-setting`

| Rule | Scenario ID | Surface/tags | Contract focus |
|---|---|---|---|
| `UC-SET-CONTACT` | `SC-SET-CONTACT-001` | API | Valid contact accepted; invalid contact leaves prior value. |
| `UC-SET-HOMEPAGE` | `SC-SET-HOMEPAGE-001` | API | Valid homepage composition; ordering/uniqueness conflict rejected. |
| `UC-SET-DISCOVERY` | `SC-SET-DISCOVERY-001` | API | Visibility/discovery rule accepted with public meaning; conflicts rejected. |
| `UC-SET-REGISTRY` | `SC-SET-REGISTRY-001` | API | Registry/legacy commitment changes have explicit preserve/retire behavior. |
| `UC-SET-CONTACT` | `SC-SET-CONTACT-API-001` | API | Structured admin/public storefront identity read models. |
| `UC-SET-CONTACT` | `SC-SET-CONTACT-API-002` | API | Valid identity update reflected in admin and public settings. |
| `UC-SET-CONTACT` | `SC-SET-CONTACT-API-003` | API, security | Admin settings read unauthenticated `401`; shopper `403`. |
| `UC-SET-HOMEPAGE` | `SC-SET-HOMEPAGE-API-001` | API | Valid composition `200`; duplicate ordering/negative news count `400`. |
| `UC-SET-REGISTRY` | `SC-SET-REGISTRY-API-001` | API | Valid footer/support success; malformed targets `400`. |
| `UC-SET-CONTACT` | `SC-SET-CONTACT-UI-001` | Browser | Valid contact save appears on homepage. |
| `UC-SET-CONTACT` | `SC-SET-CONTACT-UI-002` | Browser | Invalid contact email disables save and shows validation. |
| `UC-SET-HOMEPAGE` | `SC-SET-HOMEPAGE-UI-001` | Browser | Homepage shows configured content modules. |
| `UC-SET-HOMEPAGE` | `SC-SET-HOMEPAGE-UI-002` | Browser | Negative news count disables homepage save. |
| `UC-SET-REGISTRY` | `SC-SET-REGISTRY-UI-001` | Browser | Homepage shows configured support links. |
| `UC-SET-CONTACT` | `SC-VISUAL-ADMIN-SETTINGS-001` | Browser, visual | Desktop settings visual contract (not analyzed; Figma out of scope). |

### `admin/payment`

| Rule | Scenario ID | Surface/tags | Contract focus |
|---|---|---|---|
| `UC-PAY-ORDER-CONTEXT` | `SC-PAY-ORDER-CONTEXT-001` | API | Payment method/signals inform order operations; no payment control surface. |
| `UC-PAY-REFUND-CONTEXT` | `SC-PAY-REFUND-CONTEXT-001` | API | Payment facts inform refund review; do not decide outcome alone. |

### `admin/payment-collection`

| Rule | Scenario ID | Surface/tags | Contract focus |
|---|---|---|---|
| `UC-PCOL-SOURCES` | `SC-PCOL-SOURCES-001` | API | Read configured source active/inactive state. |
| `UC-PCOL-PAYEE` | `SC-PCOL-PAYEE-001` | API | Change explicit receive-money payee identity. |
| `UC-PCOL-SETUP` | `SC-PCOL-SETUP-001` | API | Update QR/transfer setup; invalid setup not live. |
| `UC-PCOL-READINESS` | `SC-PCOL-READINESS-001` | API | Read readiness signals/warnings before live use. |
| `UC-PCOL-SOURCES` | `SC-PCOL-SOURCES-002` | Browser | Backend sources and readiness states render. |
| `UC-PCOL-PAYEE` | `SC-PCOL-PAYEE-002` | Browser | Payee identity persists after reload. |
| `UC-PCOL-SETUP` | `SC-PCOL-SETUP-002` | Browser | Invalid QR/transfer setup shows error and preserves prior setup. |
| `UC-PCOL-READINESS` | `SC-PCOL-READINESS-002` | Browser | Backend warnings drive readiness; no fabricated active badges. |
| `UC-PCOL-SOURCES` | `SC-VISUAL-ADMIN-COLLECT-001` | Browser, visual | Desktop collect visual contract (not analyzed; Figma out of scope). |

## Open contract limits

The approved features establish behavior and status-code expectations but do not define exact routes, payload schemas, field names, labels, URL formats, enum values, role names, or visual layout details. Those details must be resolved from an approved specification/use case or the relevant executable contract before implementation; they should not be invented from this handoff.

