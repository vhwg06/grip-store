# Public Auth — Wave A discovery handoff

## Source boundary

Derived only from `AGENTS.md` and `test/modules/auth/{README.md,behavior.feature,manifest.yaml,behavior.steps.ts}`. The feature is the behavioral source of truth; the step bindings expose the browser/API observation boundary. This is a behavior handoff, not a screen blueprint.

## User goals and tasks

Primary goal: a shopper/account holder authenticates and maintains an explicit identity so protected flows are available. A visitor can register a new account.

User tasks:

- Log in with valid credentials; receive a visible authentication error for invalid credentials; receive validation feedback when required login values are empty.
- Choose OAuth authentication and start the provider redirect.
- Keep an authenticated session available after a page refresh, then log out and lose that session.
- Open registration, submit required details, see validation feedback for an empty submission, see a duplicate-email error, or have a unique registration accepted.
- Through the auth boundary, obtain/refresh access and refresh tokens, read the authenticated identity, and log out.
- Read the shopper profile when authenticated; understand that unauthenticated protected reads/updates are rejected and removed check-in surfaces are absent.

Registration acceptance is only observed as navigation away from the signup surface; the scenarios do not establish automatic login.

## Domain concepts

Visitor; registered account; shopper/account holder; email and password credentials; unique or duplicate registration email; authenticated session; OAuth provider redirect; access token; refresh token; authenticated user identity (`id`, `email`, `username`); role; shopper profile; legacy shopper profile; protected endpoint; removed check-in mutation/read models; removed loyalty-points projection.

## Observable information shape

- Authenticated browser state is represented by a visible `user-avatar`; it remains visible after reload and is not visible after logout.
- Login and signup expose visible error feedback. Exact copy is not specified; the binding accepts login/signup error messages or a `role="alert"`. Invalid login and duplicate email are distinct semantic error cases.
- The registration contract observed by the browser includes name, email, and password fields plus a submit action.
- OAuth exposes a provider-authentication action and, after activation, a URL matching `oauth`, `authorize`, or `login`. The provider list and callback result are not specified.
- Successful `/v1/auth/login` and `/v1/auth/refresh` responses contain both an access token and a refresh token. The binding recognizes `accessToken`/`token`/`access_token` for login access, `refreshToken`/`refresh_token` for refresh, and `accessToken`/`token` plus `refreshToken`/`refresh_token` for refresh responses. Tokens are opaque to the user.
- `/v1/auth/me` returns identity and role: `id`, `email`, `username`, and `role` are required by the binding.
- `/v1/profile` returns an identity (`id` at the root or `user.id`). `/v1/user/profile` returns a legacy profile that must not expose `points`.
- Removed check-in endpoints have no read or mutation model and respond with `404`.

Exact field labels, error payload shape/copy, token storage/lifetime, OAuth provider names, profile fields beyond identity, and role-specific permissions are unspecified.

## Validation and error semantics

| Case | Observable contract |
|---|---|
| Empty login required values | Visible validation error. |
| Missing login email at API boundary | `400` or `422`. Login body is `{ email, password }`. |
| Invalid credentials | Visible authentication error in browser; API `401`. |
| Empty registration required values | Visible validation error. |
| Duplicate registration email | Visible duplicate-email error. |
| Valid unique registration | Registration accepted; browser leaves signup URL. |
| Missing auth for protected reads/updates | `401` for `/v1/auth/me`, `/v1/profile`, `/v1/user/profile`, email update, and notification update. |
| Invalid refresh token | Refresh API `401`. Refresh body is `{ refresh_token }`. |
| Logout without token | Logout API `401`. |
| Authenticated logout | API accepts `200`, `204`, or `400`; browser session becomes unavailable. |
| Removed check-in endpoints | Every probed endpoint responds `404`, including the authenticated mutation probe. |

Backend remains authoritative for validation, authentication, permissions, session/token transitions, and persistence integrity. No frontend-computed auth state is authoritative.

## Auth, OAuth, session, and permission contract

- Credential login authenticates a registered account and establishes browser-visible identity.
- OAuth starts a provider redirect; completion, callback handling, and provider inventory are outside the accepted scenarios.
- Session persistence is proven by a real page reload followed by a fresh browser assertion. Logout is a state transition in the reverse direction.
- Auth API boundary: `POST /v1/auth/login`, `GET /v1/auth/me`, `POST /v1/auth/refresh`, and `POST /v1/auth/logout`.
- Protected profile boundary: `GET /v1/profile`, unauthenticated `PATCH /v1/profile/email`, unauthenticated `PATCH /v1/profile/notifications`, and `GET /v1/user/profile`.
- A bearer access token is supplied for authenticated API reads/logout. Absence of authentication is rejected with `401`; no role-based allow/deny behavior is specified beyond returning `role`.
- The legacy profile remains readable when authenticated but excludes loyalty points. Check-in mutation and read models remain unavailable (`404`).

## Scenario index

| Rule | Scenario IDs |
|---|---|
| Login and credential validation | `SC-AUTH-LOGIN-001` valid login; `SC-AUTH-LOGIN-002` invalid credentials; `SC-AUTH-LOGIN-003` empty login validation |
| OAuth | `SC-AUTH-OAUTH-001` initiate provider redirect |
| Session | `SC-AUTH-SESSION-001` persist after refresh; `SC-AUTH-SESSION-002` logout/invalidate |
| Signup | `SC-AUTH-SIGNUP-001` show form; `SC-AUTH-SIGNUP-002` empty-field validation; `SC-AUTH-SIGNUP-003` duplicate email; `SC-AUTH-SIGNUP-004` unique email accepted |
| Auth API | `SC-AUTH-API-001` login tokens; `SC-AUTH-API-002` invalid login `401`; `SC-AUTH-API-003` missing email `400/422`; `SC-AUTH-API-004` authenticated user identity/role; `SC-AUTH-API-005` unauthenticated `/me` `401`; `SC-AUTH-API-006` refresh tokens; `SC-AUTH-API-007` invalid refresh `401`; `SC-AUTH-API-008` authenticated logout; `SC-AUTH-API-009` unauthenticated logout `401` |
| Profile API | `SC-AUTH-PROFILE-001` authenticated profile identity; `SC-AUTH-PROFILE-002` unauthenticated profile `401`; `SC-AUTH-PROFILE-003` unauthenticated email update `401`; `SC-AUTH-PROFILE-004` unauthenticated notification update `401`; `SC-AUTH-PROFILE-005` legacy profile without points; `SC-AUTH-PROFILE-006` unauthenticated legacy profile `401`; `SC-AUTH-PROFILE-007` removed check-in mutation `404`; `SC-AUTH-PROFILE-008` all removed check-in reads `404` |

Manifest coverage is one-to-one with these 27 IDs; feature and step paths are `modules/auth/behavior.feature` and `modules/auth/behavior.steps.ts`.

## Dependencies and state handling

- Browser scenarios require the Cucumber `ScenarioWorld`, browser lifecycle, and the auth interaction boundary. API scenarios require the shared API client.
- Valid-account scenarios require `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` supplied through the official test environment. Invalid credentials are fixed test values.
- API identity/profile/logout scenarios first obtain a valid access token through the login API; refresh scenarios first obtain a valid refresh token. Bearer authorization is the dependency between those calls.
- Signup duplicate-email coverage depends on the configured registered email. Unique signup creates a timestamp/randomized persistent account; shared persistent mutations must remain serial and use official APIs/data setup per `AGENTS.md`.
- OAuth coverage depends on a configured provider redirect being reachable enough to produce the observed redirect URL. No provider callback or account provisioning is asserted.

## Fresh-read and reversibility requirements

- Session persistence must be checked after an actual page reload, not only immediately after login.
- Logout must be verified in the opposite direction from login: the browser binding checks the post-logout identity marker is absent. `AGENTS.md` additionally requires reversible state changes to be checked after reload or a fresh API read; the API logout scenario currently asserts only its allowed response status, so any follow-on verification must preserve that fresh-read requirement.
- Protected identity/profile assertions are made from fresh API responses; removed check-in absence is probed with four fresh reads, each expected to be `404`.
- Signup acceptance and OAuth currently assert navigation/redirect only; they do not prove a fresh account/profile read or completed OAuth session. Do not promote those observations into stronger behavior without a spec change.

## Reusable interaction and information candidates

Interaction candidates: credential submission; inline validation/auth/duplicate-email feedback; OAuth redirect initiation; registration submission; authenticated-session reload; logout; bearer-authenticated read; refresh-token exchange; unauthenticated protected request; removed-endpoint absence probe.

Information candidates: identity (`id`, email, username, role); authenticated/unauthenticated state; access/refresh token pair at the API boundary; validation versus authentication versus duplicate-email errors; OAuth redirect destination; shopper profile identity; legacy-profile exclusion of loyalty points; `401` permission boundary and `404` removed-surface boundary.

These candidates describe reusable behavior/information units only; placement, hierarchy, navigation, and visual composition are intentionally unspecified.
