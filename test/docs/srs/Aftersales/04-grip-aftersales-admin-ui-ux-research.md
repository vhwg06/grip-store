# GRIP Aftersales — Admin UI/UX Research & Design Guidance

**Status:** Final  
**Pipeline stage:** 03B — UI/UX research  
**Module:** Aftersales  
**Surface:** Admin Console  
**Authority:** `02-grip-aftersales-srs.md`

---

# 1. Purpose

This file translates the approved Aftersales SRS into an operator-facing workflow.

It is deliberately constrained.

Admin Aftersales must help an operator:

```text
find work
→ understand the case
→ inspect only relevant Order/customer context
→ make one valid decision/action
→ verify canonical result
```

It must **not** become:

```text
CRM
WMS
payment gateway console
inventory admin
free-form order editor
analytics suite
```

---

# 2. Evidence boundary

IKEA does not publicly expose its internal return/claims backoffice UI in enough detail to copy or claim as reference.

Therefore:

- IKEA public behavior informs case semantics and customer expectations;
- Shopify Admin informs common operational return-processing patterns;
- commercetools informs useful state separation at the domain level;
- GRIP SRS remains the only authority for actual capability.

### Secondary reference — Shopify

Shopify separates creating a return, processing received return items and issuing a refund. This supports a work-oriented admin flow rather than one combined `Returned` button.

Source:  
https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/creating-returns

### Secondary reference — commercetools

commercetools represents order/shipment/payment/return concerns separately, including per-return-item states.

Source:  
https://docs.commercetools.com/api/projects/orders

---

# 3. Existing GRIP admin boundaries

Admin Aftersales composes with existing modules:

```text
Order Admin
→ source transaction / fulfillment history

Account Admin
→ customer identity/profile context

Catalog Admin
→ current product context, optional

Aftersales Admin
→ case lifecycle / evidence / assessment / resolution
```

Core rule:

> Show enough neighboring context to make the decision; navigate to the owning module for deeper work.

Do not duplicate full Order, Account or Catalog administration inside case detail.

---

# 4. Admin UX principles

## P1 — Queue first

The default Aftersales Admin surface should answer:

> What needs attention now?

Not:

> Show every case ever created.

Resolved history remains searchable but should not dominate the default view.

## P2 — Actions, not statuses

Never design a raw dropdown like:

```text
Status:
[requested ▼]
```

Operators perform semantic actions:

```text
Mark return received
Start/complete assessment
Request more information
Approve refund
Approve replacement
Reject claim
```

Only actions supported in the current state appear.

## P3 — One source of truth per concern

Order state stays Order-owned.

Case state stays Aftersales-owned.

Refund state comes from the financial projection.

Do not blend them into one ambiguous colored badge.

## P4 — Decision context near the action

Before an operator approves/rejects a case, show the evidence and policy/eligibility context necessary to decide.

Do not force repeated navigation between five pages for common decisions.

## P5 — Keep internal and customer-visible text distinct

If a workflow supports internal note and customer-facing explanation, label them explicitly.

Never let operators accidentally expose internal notes.

## P6 — Fresh canonical state after every consequential action

Do not trust optimistic UI as final state.

After mutation:

```text
execute command
→ fetch canonical case
→ fetch relevant resolution/refund projection
→ render result/history
```

---

# 5. Canonical Admin IA

Recommended semantic IA:

```text
Admin
└── Aftersales
    ├── Cases
    │   ├── Needs attention
    │   ├── Open
    │   └── Resolved
    └── Case detail
```

`Needs attention`, `Open`, `Resolved` may be tabs/saved filters rather than separate routes.

Avoid exposing taxonomy/configuration pages unless an actual domain contract later supports them.

No current:

```text
Return policy builder
Warranty policy editor
Reason taxonomy manager
Refund rules engine
```

---

# 6. Work queue

The queue is the operational center.

## 6.1 Default view

Prefer cases requiring operator work.

Examples of derivable attention signals:

```text
newly submitted
review needed
return received and awaiting assessment
customer supplied requested info
resolution failed / requires follow-up
```

Only use signals actually published by backend.

## 6.2 Row information hierarchy

A row should let an operator answer quickly:

```text
What is this?
Who/order is it about?
What item is affected?
What state is it in?
Does it need me now?
How old is the case?
```

Recommended fields:

```text
case reference
case type / issue kind
order reference
customer display identity
small affected-item summary
case state
attention/next-work indicator
created / last updated time
```

Do not stuff the row with:

```text
full address
all order lines
payment detail
full claim description
long internal notes
```

Those belong in detail.

## 6.3 Human-readable search

Primary search should accept identifiers operators actually know:

```text
case reference
order reference
customer name
email
phone
```

SKU/product snapshot search can be included only if backend reliably supports it.

Do not require internal UUID.

## 6.4 Filters

Candidate operational filters:

```text
Case type: Return / Claim
Issue kind: Missing / Damaged / Quality / Warranty
Case state
Needs action
Resolution type/status
Created date
```

Keep filter count small.

Do not add generic query-builder behavior.

## 6.5 Sort

Default sort should serve work prioritization, for example oldest waiting work first or latest activity first, depending on backend/product decision.

Do not silently use a sort whose meaning operators cannot understand.

---

# 7. Queue state design

Distinct states required:

## Loading

Use structural skeleton/loader without fake case data.

## Empty — no cases

```text
No aftersales cases yet.
```

## Empty — filter has no matches

Preserve filters and offer `Clear filters`.

Do not show the global no-data empty state.

## Error

Keep search/filter input and provide retry.

## Stale row

Opening the case should always load current canonical detail; row state is a summary only.

---

# 8. Case detail — overall composition

Case detail should optimize decision-making, not simply display every database field.

Recommended desktop composition:

```text
Header
├── case reference
├── case type / issue
├── current case state
├── attention signal
└── valid primary action(s)

Main column
├── customer-reported issue / return intent
├── affected item(s) + quantity
├── evidence
├── assessment / resolution
└── activity/history

Context rail
├── source Order projection + link
├── customer projection + Account link
├── current product link, optional
└── refund/replacement projection
```

The exact visual layout can vary, but this hierarchy should survive.

---

# 9. Header and action area

The header should answer:

```text
What case?
What state?
What do I need to do?
```

### Primary action

Show at most one strongest current action when possible.

Examples:

```text
Review case
Mark return received
Resolve case
```

Secondary actions can be grouped but should stay state-valid.

### No action state

If waiting for customer/downstream system:

```text
Waiting for customer information
Refund processing
Waiting for return
```

Do not manufacture a button just to make the page feel actionable.

---

# 10. Affected item section

Use Order historical snapshot.

Per affected line:

```text
purchase-time item title
variant/selection label
SKU/reference where available
ordered quantity
affected quantity
purchase-time unit/line amount where decision-relevant
fulfillment reference/status context when relevant
```

Do not overwrite with current Catalog title/price.

### Partial quantity

Make affected quantity prominent.

Example:

```text
Affected: 1 of 3 purchased
```

This reduces operator errors that accidentally resolve the whole line/order.

---

# 11. Return case detail

Return-specific information can include:

```text
return reason
selected item(s)/quantity
eligibility result/context
return method/instructions
physical return state
assessment result
refund projection
```

## 11.1 Return progression

Visually preserve meaningful stages:

```text
Requested
→ Waiting for return
→ Received
→ Assessment
→ Resolution
```

Only show stages supported by implementation.

Do not make a fake universal five-step stepper if some return types skip steps.

## 11.2 Mark return received

If this command exists:

- show expected item/quantity;
- confirmation names the actual items;
- do not expose restock location or inventory disposition in current scope;
- after success refresh canonical case.

## 11.3 Assess return

If inspection outcome is required, present only supported assessment values.

Avoid generic editable status.

If a return cannot be accepted, require supported reason/customer explanation according to backend contract.

---

# 12. Claim case detail

Claim-specific context:

```text
issue kind
description
submitted evidence
Order fulfillment context where relevant
warranty/eligibility projection where relevant
assessment state
resolution options
```

## 12.1 Missing item

Put fulfillment truth adjacent to claim:

```text
expected quantity
delivered/split fulfillment projection
tracking/status link to Order
```

The operator should not have to infer from customer prose whether another shipment is still active.

## 12.2 Damaged / quality

Evidence area should support:

```text
image thumbnails
open larger view
file error/unavailable state
customer description
```

Do not expose unrelated customer uploads.

## 12.3 Warranty

Show customer-safe/internal eligibility evidence from accepted policy contract, such as:

```text
purchase date
policy reference
coverage/eligibility result
assessment requirement
```

Do not design a manual calendar calculation workflow.

---

# 13. Evidence UI

Evidence is central for some Claims but irrelevant for many Returns.

Recommended structure:

```text
Evidence
├── customer description
├── photo/file evidence, when present
└── requested additional information, when applicable
```

### Operator actions

If contract supports `Request additional information`:

- action specifies what is needed using supported structure/text;
- customer-facing message must be previewable;
- case enters the actual waiting state;
- previous evidence remains visible/read-only.

Do not make the operator edit customer-submitted evidence.

---

# 14. Resolution workspace

Resolution is the most consequential Admin area.

Do not render all possible resolutions all the time.

Backend/current state provides valid commands.

Potential supported actions:

```text
Approve refund
Approve replacement
Approve replacement part
Reject
```

## 14.1 Refund action

Before confirmation show:

```text
affected items/quantity
backend-calculated refund amount
refund destination/method summary when safe
case consequence
```

Current SRS does not permit arbitrary free-form refund amount entry by default.

If amount is not available from backend, do not invent a calculator.

### Confirmation copy direction

Use specific action names:

```text
Approve refund
```

not:

```text
Save changes
```

## 14.2 Replacement action

Show only downstream data Aftersales actually controls/receives.

Do not add:

```text
warehouse selection
stock allocation
pick list
shipping carrier setup
```

If downstream replacement is created, show returned reference/status and route to canonical owning surface if one exists.

## 14.3 Reject action

Rejection needs stronger protection than ordinary save.

Recommended flow:

```text
Reject claim
→ choose/enter supported reason
→ separate internal note if available
→ preview customer-visible explanation
→ confirm
```

Do not allow empty customer explanation if backend requires one.

---

# 15. Refund projection

Keep refund visually separate from case resolution.

Recommended card:

```text
Refund
Amount      1,200,000 ₫
Status      Processing
Reference   ...       // if useful/safe
Updated     ...
```

Only show actual backend fields.

Distinct states may include:

```text
Requested
Processing
Refunded
Failed
```

If refund fails after case approval, the case detail must surface the operational problem rather than still showing an unqualified green `Resolved` experience.

Attention signal can be derived only if backend marks it actionable.

---

# 16. Replacement projection

Keep replacement outcome concise:

```text
Replacement
Status
Reference
tracking / owning-flow link if published
```

Do not duplicate Order/Fulfillment detail if replacement is represented by another canonical transaction.

---

# 17. Case activity/history

Operator history should answer:

> Who/what changed this case and why?

Meaningful events:

```text
case submitted
operator opened/reviewed only if audit chooses to record it
additional info requested
customer information added
return received
assessment completed
refund requested
refund state changed
replacement requested
case rejected/resolved
```

### Visual hierarchy

Newest-first can help operational review, but chronological order is acceptable if globally consistent.

Each event can include:

```text
time
action
actor type/display identity if allowed
customer-visible/internal reason where relevant
```

Do not expose low-level event bus payloads.

---

# 18. Cross-domain context rail

## Order projection

Show minimal facts:

```text
order reference
purchase date
order status
fulfillment relevant to affected item
link: View order
```

Do not duplicate full Order history.

## Customer projection

Show minimal support context:

```text
name
email/phone as authorized
account reference/state if useful
link: View customer
```

Do not edit Account fields from Aftersales.

## Catalog projection

Optional current product context:

```text
current product link
current status if useful
```

Historical claim remains based on Order/policy evidence.

---

# 19. Internal note boundary

If internal notes are supported in implementation, they must be clearly marked:

```text
Internal note — customers cannot see this
```

Customer-facing explanation uses a separate component/field.

Never use one generic textarea with an ambiguous visibility toggle hidden elsewhere.

If internal notes are not supported by backend, do not invent them simply because Admin products commonly have notes.

---

# 20. Permissions

UI action availability should reflect permissions but must not be the security boundary.

Patterns:

```text
view-only operator
→ can inspect case
→ no mutation controls

resolution permission
→ supported resolution actions visible
```

If an operator lacks permission:

- do not render misleading active controls;
- backend must still reject unauthorized direct requests.

Avoid exposing an editable permission matrix inside Aftersales; admin access belongs to Account/Admin access contracts.

---

# 21. Stale-state and concurrency UX

Common failure:

Two operators open the same case.

Required UX:

```text
Operator A resolves
Operator B attempts stale action
→ backend rejects stale/ineligible mutation
→ show conflict message
→ reload canonical case
→ preserve safe unsent note text if possible
```

Do not overwrite current state with Operator B's stale local view.

### Suggested copy direction

```text
This case changed since you opened it. We've loaded the latest state.
```

Then show the new valid action set.

---

# 22. Error handling

## Action failure

Keep case context visible.

Do not navigate back to queue on failed resolution.

## Downstream refund/replacement unavailable

Case decision and downstream execution may differ.

Show actual failure/pending state and retry/escalation only if backend supports it.

## Evidence inaccessible

Show unavailable evidence state without treating the whole case as missing.

## Cross-module link failure

Order/Account/Catalog link failure must not destroy case detail.

---

# 23. Desktop-first admin composition

Aftersales Admin is primarily a work surface, so desktop can use denser information than Public.

Recommended queue:

- real table at desktop width;
- sticky header optional;
- compact but readable rows;
- search + small filter group above;
- pagination/incremental retrieval according to backend.

Recommended detail:

- main work column + context rail;
- persistent action area only when it does not obscure evidence/history;
- avoid modal-only case processing for complex assessment.

### Why not a giant drawer for everything

A drawer can work for quick triage, but full case assessment may include evidence, history and consequential resolution.

Use canonical detail page for full work.

---

# 24. Responsive / narrow Admin

Admin must remain usable at narrow widths even if desktop is primary.

Do not horizontally squeeze the full table.

Narrow queue:

```text
case reference + state
issue / item summary
customer/order
attention + age
```

Use stacked row cards/list items.

Narrow detail ordering:

```text
state + primary action
issue/evidence
affected items
resolution
Order/customer context
history
```

Do not put context rail before the actual work.

---

# 25. Bulk actions

Current SRS does not require bulk resolution, bulk refund, bulk rejection or bulk status change.

Do not design bulk checkboxes merely because the queue is a table.

Bulk consequential actions are high-risk and need separate domain support.

If selection is not used for any current operation, omit row checkboxes.

---

# 26. Color and status usage

Status color is secondary to text.

Use restrained semantic emphasis:

```text
needs action       → attention emphasis
waiting            → neutral/info
resolved           → success/supporting
rejected/failed    → clear negative/error semantics
```

Do not create ten bespoke colors for every backend enum.

Case type and state are different dimensions; avoid representing both with competing badge rainbows.

---

# 27. Canonical Admin screen/state inventory

Design should cover at least:

```text
Aftersales queue — needs attention
Aftersales queue — open
Aftersales queue — resolved
queue loading
queue empty global
queue empty filtered
queue error
Return detail — requested
Return detail — waiting for return
Return detail — received / assessment needed
Return detail — refund pending
Claim detail — new review
Claim detail — missing item with fulfillment context
Claim detail — damaged with evidence
Claim detail — warranty assessment
Claim detail — additional info required
Claim detail — approve refund confirmation
Claim detail — approve replacement confirmation
Claim detail — rejection confirmation
Case detail — resolved
Case detail — rejected
refund failed/pending projection
replacement projection
stale mutation conflict
permission/read-only state
cross-module projection unavailable
```

Not every state must be a separate page if the design represents it correctly.

---

# 28. Explicit Admin UI exclusions

Do not design:

```text
raw case status dropdown
raw Order status editing
warehouse receiving/restock location UI
inventory mutation
carrier setup
shipping-label purchase
payment gateway console
manual arbitrary refund amount editor
chargeback workflow
generic exchange order builder
repair dispatch board
CRM inbox/chat
policy rule builder
reason taxonomy manager
return analytics dashboard
bulk refund/reject controls
```

These are outside current scope.

---

# 29. Design acceptance checklist

An Admin Aftersales design is ready only if:

```text
[ ] Default queue prioritizes work requiring attention.
[ ] Search uses human-recognizable identifiers.
[ ] Filters are operational and limited.
[ ] Case type, case state, refund state and Order state remain distinct.
[ ] Detail clearly identifies affected line + quantity.
[ ] Order historical data is preserved as authority.
[ ] Missing-item claim shows relevant fulfillment truth.
[ ] Evidence appears only where relevant.
[ ] Operator mutations are semantic commands, not status editing.
[ ] Refund action uses backend-calculated entitlement.
[ ] Reject flow distinguishes customer explanation from internal note if both exist.
[ ] Consequential actions have clear confirmation.
[ ] Canonical state is refreshed after mutation.
[ ] Stale concurrent actions fail safely and reload latest state.
[ ] Full Account/Order/Catalog admin is not duplicated.
[ ] No WMS/payment/CRM/exchange-engine scope leaked into screens.
[ ] Narrow-width layout prioritizes work before context/history.
```

---

# 30. Design handoff

The strongest operator mental model is:

```text
A customer has a problem with a known purchase.

What exactly is affected?
What evidence/policy applies?
What valid action can I take now?
Did the downstream resolution actually happen?
```

The Admin UI should make those four questions easy to answer and nothing more.
