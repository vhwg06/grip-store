# Wave A handoff: admin notifications discovery

## Source boundary

This handoff is derived only from:

- `test/modules/admin/noty/README.md`
- `test/modules/admin/noty/behavior.feature`

The feature file is the executable behavior source of truth for this slice. No frontend, backend, designer, or Figma source was inspected. The visual scenario is therefore recorded as a dependency and coverage item, not interpreted beyond its wording.

## Product goal

An operations administrator can inspect outbound-notification readiness and trace outbound notification history. Website-facing push sending must be gated by readiness, and the browser surface must expose the same server-backed state clearly enough to compose, send, reload, filter, and distinguish successful, empty, and failure outcomes.

## Scenario inventory

| Scenario ID | Tags / rule | Contract to preserve |
| --- | --- | --- |
| `SC-NOTY-SEND-001` | `@accepted @api`, `UC-NOTY-SEND` | Read current outbound readiness. A sufficient readiness state permits the outbound send behavior; insufficient readiness blocks the send before dispatch. |
| `SC-NOTY-HISTORY-001` | `@accepted @api`, `UC-NOTY-HISTORY` | Open the outbound list, then notification or send-set history. Return outbound notifications, show corresponding outcome states, and keep minimal history distinguishable from an untraceable failure. |
| `SC-NOTY-SEND-002` | `@accepted @browser`, `UC-NOTY-SEND` | Notification channel settings expose outbound channel readiness controls. |
| `SC-NOTY-SEND-003` | `@accepted @browser`, `UC-NOTY-SEND` | The browser compose flow can send a website push and show the sent campaign in the outbound table. |
| `SC-NOTY-SEND-004` | `@accepted @browser`, `UC-NOTY-SEND` | Saving channel readiness and sending a website push results in the browser reporting the push campaign as sent. |
| `SC-NOTY-HISTORY-002` | `@accepted @browser`, `UC-NOTY-HISTORY` | A notification created through the API appears in outbound history after a browser reload, with its outcome state visible. |
| `SC-NOTY-HISTORY-003` | `@accepted @browser @empty-result`, `UC-NOTY-HISTORY` | Searching for a non-existent campaign renders no matching campaigns as a normal empty result, without an error boundary. |
| `SC-VISUAL-ADMIN-MESSAGES-001` | `@accepted @browser @visual` | The desktop messages surface matches its visual contract. The referenced Figma surface was not inspected in this discovery. |
| `SC-NOTY-SEND-005` | `@deferred @browser`, `UC-NOTY-SEND` | When failure injection is configured and the notification-settings request fails, show an explicit notification-readiness error and do not fabricate defaults. |

## Behavior semantics

### Readiness and permissions

- The actor is an admin, described more specifically as an operations administrator. Notification management and outbound readiness are therefore an admin-surface concern.
- The current outbound readiness must be readable and visible before dispatch.
- Sufficient readiness allows the send behavior; insufficient readiness prevents dispatch. The block must happen before dispatch, not only after a send attempt.
- Browser channel settings expose readiness controls, and the saved readiness is used by the subsequent send flow.
- The approved behavior does not define the exact readiness fields, threshold, status vocabulary, API shape, or unauthorized-user response. Do not infer disabled-control behavior, redirect behavior, status codes, or error payloads from this handoff.
- No explicit denied-permission scenario exists. Permission coverage should preserve the admin-only actor boundary, but the exact authorization contract remains an open dependency.

### Compose and send

- The supported channel in this slice is a website-facing push notification.
- The browser has a compose flow that can submit the push.
- After a successful browser send, the sent campaign must be visible in the outbound table and the flow must report the campaign as sent.
- A send performed with insufficient readiness must not dispatch. The feature does not specify whether the compose UI is disabled, whether an inline message is shown, or which fields are required.

### Sent history and traceability

- The outbound list returns outbound notifications.
- A notification or send-set can be opened to inspect its history and corresponding outcome states.
- Minimal history must remain distinguishable from an untraceable failure; the visible result cannot collapse both into an indistinguishable absence of information.
- API-created notifications are server-backed: after browser reload, the notification must be present in outbound history and its outcome state must be visible.
- Exact history fields, timestamps, identifiers, ordering, pagination, and outcome-state names are not specified by the approved sources.

### Search and empty results

- The history surface is filterable/searchable by campaign, as demonstrated by the non-existent-campaign scenario.
- A search with no match is a valid empty state: show no matching campaigns and keep the page out of the error-boundary state.
- Search syntax, matching fields, query timing, reset behavior, pagination, and the exact empty-state copy are unspecified.

### Error behavior

- The only explicit error case is deferred and requires configured notification failure injection.
- If the notification-settings request fails, the browser must show an explicit notification-readiness error.
- The UI must not substitute fabricated/default readiness data when that request fails.
- The approved sources do not define retry, recovery, error codes, or whether compose/send controls remain available during the error.

## Minimum visible data shape

These are observable facts required by the feature, not a proposed payload or component API.

| Surface | Minimum visible information | Not defined |
| --- | --- | --- |
| Readiness | Whether outbound sending is ready; channel-readiness controls; saved readiness used by send | Field names, control types, threshold, status labels, persistence response |
| Compose result | The website-push campaign is identified in the outbound table and reported as sent | Compose fields, campaign identifier format, confirmation copy, row columns |
| Outbound list | Outbound notifications/campaigns are returned and distinguishable | Ordering, pagination, columns, loading state, identity fields |
| Notification/send-set history | Corresponding outcome state is visible; minimal history is traceable | Event schema, timestamps, actor, delivery detail, outcome vocabulary |
| Search empty state | No matching campaigns; no error boundary | Empty-state copy, illustration, reset affordance |
| Settings failure | An explicit notification-readiness error; no fabricated readiness defaults | Error copy, retry, error code, control availability |

## Dependencies and sequencing

1. Admin authentication/authorization context for the operations-administrator surface. The exact permission-denied contract is not present in the feature.
2. Notification-management browser entry point and channel-settings surface, including a readable readiness state and a save operation.
3. Server-backed readiness used as the send gate, with a way to represent both sufficient and insufficient readiness for API verification.
4. Website-push compose and send capability, plus an outbound table that can render the resulting sent campaign.
5. API notification creation contract so browser history can be validated after a reload (`SC-NOTY-HISTORY-002`).
6. Outbound list, notification/send-set history, outcome-state rendering, and campaign search/filter behavior.
7. Failure injection/configuration for the deferred settings-request error scenario (`SC-NOTY-SEND-005`).
8. The desktop messages visual contract for `SC-VISUAL-ADMIN-MESSAGES-001`; visual evidence is intentionally outside this source-constrained discovery.
9. Test isolation for sends, readiness changes, and API-created notifications. Any shared persistent state must be run serially and verified with a fresh API read or reload where the behavior requires it.

Recommended dependency order is readiness read/gate -> channel settings save -> compose/send -> outbound table/history -> API-to-browser reload -> search empty state -> injected settings failure. The visual scenario remains a separate validation dependency.

## Derived implementation/test tasks

- Establish the admin notification-management entry point under the operations-administrator permission boundary.
- Implement/read the current outbound readiness and make the send gate enforce the sufficient/insufficient branches before dispatch.
- Expose channel-readiness controls in browser settings and persist the saved state used by the send flow.
- Cover the website-push compose path, successful send reporting, and sent-campaign row in the outbound table.
- Expose the outbound list and notification/send-set history with a visible outcome state and traceable minimal history.
- Create a notification through the public API, reload the browser, and verify the server-backed history row and outcome state.
- Implement campaign search and the normal no-match empty state without routing it through an error boundary.
- Add the configured settings-request failure path with an explicit readiness error and no fallback/fabricated defaults. This is deferred until failure injection is available.
- Record the visual-contract scenario as a separate validation task; do not derive visual details from the feature wording alone.
- Add explicit permission-denial coverage only after the authorization contract (role, response/redirect, and control visibility) is supplied; current scenarios cover the admin actor, not denial semantics.
- Keep state-changing scenarios isolated/serial and verify reversible readiness changes in both directions with a fresh read where the underlying state supports reversal, per repository rules.

## Reusable interaction candidates

These interaction units recur across the accepted browser scenarios and are candidates for shared bindings/page objects. Their names are descriptive only; exact selectors and API calls are not specified here.

- `openAdminNotificationManagement`
- `openNotificationChannelSettings`
- `readOutboundReadiness`
- `setAndSaveChannelReadiness`
- `openWebsitePushCompose`
- `sendWebsitePush`
- `assertSentCampaignInOutboundTable`
- `openOutboundList`
- `openNotificationOrSendSetHistory`
- `assertOutcomeStateVisible`
- `createNotificationThroughApi`
- `reloadAndReadOutboundHistory`
- `searchCampaign`
- `assertNoMatchingCampaignsWithoutErrorBoundary`
- `configureNotificationSettingsFailure`
- `assertExplicitReadinessErrorWithoutDefaults`

## Open contract questions

- What exact permission/authorization rule defines an operations administrator, and what should an unauthorized user see or receive?
- What fields and labels make up channel readiness, and what constitutes “sufficient” readiness?
- What compose fields are required for a website push, and what identifies a campaign in the table?
- Which outcome states must be rendered for a notification and a send-set?
- What is the minimal trace record and how is it distinguished from an untraceable failure?
- Which campaign fields are searchable, and what are the empty, loading, retry, and pagination contracts?
- What failure-injection mechanism enables `SC-NOTY-SEND-005`, and what recovery behavior is expected after the request fails?
- What visual reference and comparison method will validate `SC-VISUAL-ADMIN-MESSAGES-001` once visual work is authorized?
