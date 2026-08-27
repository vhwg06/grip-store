# GRIP Order — Admin UI/UX Research

**Status:** Final  
**Pipeline stage:** 03B — UI/UX research  
**Module:** Order  
**Surface:** Admin Console  
**Domain authority:** `02-grip-order-srs.md`  
**Reference research:** `01-grip-order-ikea-reference-research.md`

---

## 1. Purpose

This document translates the approved Order SRS into an operator-oriented Admin workflow.

It is intentionally optimized for:

```text
find work
→ understand current state
→ understand what happened
→ execute only a valid next action
```

It does **not** expand the Order domain.

Admin UI must remain simple enough for an operator who does not need deep ecommerce-system knowledge.

---

# 2. Boundary guardrails

Admin Order must respect the previously defined GRIP modules:

- `../checkout/checkout_srs.md`: Admin Order does not edit the original Checkout draft or rerun checkout.
- `../Account/02-grip-account-srs.md`: customer profile/account administration remains Account-owned; Order shows only necessary projection/link.
- `../Engagement/02-grip-engagement-srs.md`: review moderation may navigate to Order evidence, but Order does not absorb review moderation.
- `../catalog/srs_001_product.md`: Catalog owns current product/variant data; Order owns historical purchased-line snapshot.
- `../Content/02-grip-content-srs.md`: editorial/support content management remains Content-owned.

Do not design Admin Order as a generic commerce super-console.

Current exclusions include:

```text
warehouse stock control
picking/packing workstation
carrier setup
shipping-label purchase
manual/draft order creation
arbitrary line editing
adding products after placement
repricing/promotions
return/exchange processing
warranty claims
fraud operations
full payment gateway console
CRM/support inbox
rules/automation engine
```

---

# 3. Admin UX principle

A useful Order Admin is task-oriented rather than entity-form-oriented.

The operator should not have to understand the entire domain before taking a common action.

The default mental model should be:

```text
Orders requiring work
→ identify one order
→ inspect the reason/current state
→ perform a permitted command
→ verify the resulting state
```

Avoid:

```text
giant generic table
→ giant editable form
→ raw status dropdown
```

---

# 4. External pattern worth adopting

Shopify Admin provides reusable workflow evidence for:

- Orders as a central operations queue;
- human-readable search;
- status-based filtering;
- separate payment/fulfillment/order dimensions;
- an Order Detail surface containing historical product facts and current operational context;
- a timeline for understanding changes;
- state-aware cancellation/refund/fulfillment behavior.

GRIP should take the workflow principle, not Shopify's feature breadth.

The strongest simplification for GRIP is:

```text
few meaningful views
few meaningful filters
one canonical detail
semantic actions only
```

---

# 5. Canonical Admin information architecture

Recommended semantic IA:

```text
Orders
├── Needs attention / Active
├── All orders
└── Order Detail
    ├── Current state
    ├── Valid actions
    ├── Fulfillment
    ├── Ordered items
    ├── Commercial/payment projection
    ├── Customer/delivery snapshot
    ├── Activity/history
    └── Cross-module links
```

Do not create separate admin sections for every low-level status unless real operational volume proves it useful.

---

# 6. Order queue — operator questions

The queue should answer:

```text
Which orders need work now?
Which order is the customer asking about?
What broad state is it in?
Is fulfillment progressing normally?
Is there an exception I should inspect?
```

It should **not** attempt to show every Order field.

---

# 7. Queue columns

Recommended minimum desktop columns, subject to actual backend fields:

```text
Order
Placed
Customer
Total
Order status
Fulfillment status
Fulfillment method
```

Optional only when operationally justified:

```text
Payment/refund status
Exception indicator
Scheduled/estimated fulfillment date
```

Avoid adding:

```text
internal database ID
full address
all item names
all payment metadata
all timestamps
```

into the primary table.

---

# 8. Human-readable search

Per `ORD-ADM-LST-002`, normal operator lookup should support values they actually receive from customers:

```text
order reference
customer name
email
phone
```

Product/SKU search is secondary and should exist only if reliable backend support is already available.

Do not force normal support work to begin from UUIDs.

## Search interaction

One primary search field is preferable to multiple separate identifier inputs.

If different search types behave differently, communicate them through hint/copy rather than a configuration-heavy query builder.

---

# 9. Filters and views

## 9.1 Keep filter vocabulary operational

Useful candidate filters from the SRS:

```text
order lifecycle
fulfillment status
fulfillment method
placed date
payment/refund projection when relevant
```

Do not expose unsupported technical states.

## 9.2 Default views

A simple initial set is preferable:

```text
Needs attention / Active
All orders
Completed
Canceled
```

Only include a view when the backend can define it unambiguously.

For example, do not create `Needs attention` from arbitrary frontend guesses. It must be derived from meaningful server/domain signals.

## 9.3 Saved/custom views

Shopify supports extensive customized views, but GRIP does not need that complexity now.

Treat saved custom views as future optimization, not current requirement.

---

# 10. Queue states

Design at least:

```text
loading
loaded with results
no orders exist
no results for search/filter
recoverable load error
partial/stale refresh indicator if implementation needs it
```

`No orders exist` and `No results` are different states.

The latter should preserve the active query/filter and make clearing it easy.

---

# 11. Order detail — operator hierarchy

The operator first needs to orient around identity and current state.

Recommended top section:

```text
Order reference
Placed date/time
Order lifecycle
Fulfillment summary
Payment/refund projection when relevant
Primary valid action(s)
```

Then:

```text
Fulfillment groups
Ordered items
Customer + delivery/collection snapshot
Commercial summary
Activity/history
Cross-module navigation
```

Do not begin with a long form of editable fields.

---

# 12. Status design — separate concerns visually

The Admin should make it clear that these answer different questions:

```text
Order status        → Is this transaction active/completed/canceled?
Fulfillment status  → Where is physical fulfillment?
Payment/refund      → What is the financial projection?
```

Do not compress all three into one ambiguous badge.

A compact group of labeled statuses is better than an unexplained cluster of colors.

---

# 13. Order Detail — historical item section

The operator needs the facts of the transaction as it occurred.

Primary line facts:

```text
purchase-time product name
variant/selection snapshot
SKU/reference when available
quantity
purchase-time unit/line amount
```

## Current Catalog link

A separate link can navigate to current Catalog Admin context if resolvable.

Do not update the historical line display when the current Catalog name/price changes.

If Catalog reference is unavailable, the historical line remains fully inspectable.

---

# 14. Customer context

Show only customer information needed to operate the order.

Candidate projection:

```text
customer/account display identity
email/phone used for the order
account reference/link when associated
```

Delivery/collection snapshot belongs in the Order context and can differ from the customer's current Account profile.

## Cross-link

When authorized:

```text
Order
→ Customer account
```

routes to Account Admin.

Do not embed full profile editing into Order detail.

---

# 15. Delivery / collection snapshot

The operator should distinguish:

```text
historical placed destination/service facts
vs
current fulfillment schedule/progress
```

For delivery, show only actual supported fields such as:

```text
recipient
contact
address snapshot
service type
current schedule/estimate
instructions snapshot when relevant
```

For collection:

```text
location
collector snapshot where applicable
scheduled window
current collection state
```

Do not create a generic editable address form.

Any allowed post-purchase change must be represented through a semantic supported command.

---

# 16. Fulfillment groups

If one Order has multiple fulfillments, Admin detail should make the split explicit.

Each group can show:

```text
covered items/quantities
method
status
schedule/estimate
tracking/provider projection
available fulfillment-specific action
```

This matters operationally because one delivery can be delayed while another is complete.

Do not hide split fulfillment behind one global state.

---

# 17. Activity/history timeline

A timeline is useful for support and operational diagnosis.

Current in-scope history is read-only and based on meaningful Order-owned events.

Candidate events:

```text
order placed
fulfillment state changed
tracking added
rescheduled
canceled
completed
refund/payment projection changed
```

## Timeline design rules

- chronological ordering must be obvious;
- each event names the semantic change;
- timestamps are readable;
- actor/source may be shown only if available and authorized;
- internal technical payload is hidden;
- current state still appears in the header and is not derived by the operator manually from timeline entries.

## Not currently required

```text
staff comments
mentions
attachments
tags
```

Do not add them merely because Shopify has them.

---

# 18. Semantic actions only

This is a non-negotiable admin interaction rule from `ORD-ADM-ACT-002`.

Do not expose:

```text
Status: [dropdown]
```

for free mutation.

Expose only supported commands:

```text
Cancel order
Reschedule delivery
```

or other commands explicitly added to the SRS later.

The domain decides which actions are valid from the current state.

---

# 19. Action placement

## Primary action area

Actions that are currently possible and operationally important belong near the status header.

## Secondary actions

Fulfillment-specific actions belong with the relevant fulfillment group when targeting only that group.

## Destructive action

Cancellation should not visually compete with normal navigation.

Use clear consequence wording and confirmation.

Do not hide a dangerous action in an ambiguous icon-only menu if the operator needs to understand its meaning.

---

# 20. Admin cancellation UX

Flow:

```text
Cancel order
→ fresh eligibility
→ consequence summary
→ required reason, only if backend contract requires it
→ confirm
→ execute
→ refresh canonical state/history
```

## Consequence summary

Only present real consequences returned by backend/domain.

Examples may include:

```text
fulfillment will stop
refund state/result
order will become canceled
```

Do not show Shopify-specific controls such as inventory restock toggles unless GRIP later defines those contracts.

## Stale eligibility

If the order becomes non-cancelable before submission:

- reject safely;
- refresh canonical state;
- explain that processing advanced;
- preserve operator orientation on the same order.

---

# 21. Admin reschedule UX

If rescheduling is supported:

```text
Reschedule
→ identify target fulfillment
→ load valid dates/slots
→ choose
→ show before/after summary
→ confirm
→ execute
→ refresh
```

Do not let operators type arbitrary fulfillment dates unless the fulfillment contract explicitly allows free-form scheduling.

For split fulfillment, the target must be explicit.

---

# 22. Payment/refund projection

Current Order SRS permits only the projection needed for post-purchase understanding.

Admin may show actual supported states such as:

```text
Paid
Refund pending
Partially refunded
Refunded
```

Do not expose:

- card credentials;
- raw gateway secrets;
- a generic manual payment console;
- standalone refund workflows that the SRS has not defined.

If cancellation results in refund behavior, show the canonical result returned by the owning financial contract.

---

# 23. Purchase documents

When supported, Order Admin can provide the same canonical receipt/invoice artifact or operator-appropriate document action.

Do not regenerate from current Catalog state.

If the document does not exist, omit the action rather than presenting a broken control.

---

# 24. Cross-module links

Cross-links are important for support context but must preserve ownership.

## Account

```text
customer projection
→ Account Admin detail
```

Use for profile/account tasks.

## Catalog

```text
historical order line
→ current Catalog Admin product
```

Use for current product context, not historical transaction correction.

## Engagement

Review moderation can arrive at Order as evidence context.

Order should present only normal Order detail; do not create special review-moderation controls here.

## Content

Help/editorial links may route to canonical Content/public help surfaces; no Content authoring inside Order.

---

# 25. Permissions

Admin UI must assume backend authorization is authoritative.

Design implications:

```text
operator can view but not mutate
→ show readable detail
→ hide/disable actions according to permission contract
```

Avoid implying that a hidden button is the only security mechanism.

For destructive/financially meaningful actions, permission failure returned by the backend must be handled explicitly.

---

# 26. Data minimization

Order operations can contain sensitive customer and financial context.

UI should display only what the current task requires.

Do not place:

```text
password/security data
payment secrets
unrelated Account profile fields
private Engagement saved-list data
```

inside Order detail.

---

# 27. Desktop composition

Admin Order is desktop-first because queue scanning and multi-section operational context benefit from width.

Recommended structure:

```text
Page header / view controls
Search + compact filters
Order table
```

Detail:

```text
Identity/status/action header
Main operational column
Supporting context column where useful
Timeline lower in flow
```

Use width to improve scanability, not to fill the page with fields.

---

# 28. Mobile/responsive Admin

Mobile Admin should remain usable for lookup and urgent inspection/action, but it does not need to mimic the desktop table.

Recommended recomposition:

```text
search
→ compact filter control
→ order cards/list rows
→ detail sections stacked
```

Prioritize:

```text
order reference
customer
status
fulfillment
current action
```

Secondary commercial/history information can move lower.

Never use horizontal scrolling as the only way to access essential status/action data.

---

# 29. Canonical Admin screens/states

Minimum design inventory:

```text
ADM-ORD-01  Orders — active/needs-work queue
ADM-ORD-02  Orders — all
ADM-ORD-03  Orders — no results
ADM-ORD-04  Order Detail — active single fulfillment
ADM-ORD-05  Order Detail — split fulfillment
ADM-ORD-06  Order Detail — completed
ADM-ORD-07  Order Detail — canceled
ADM-ORD-08  Cancel confirmation
ADM-ORD-09  Cancel stale/failure
ADM-ORD-10  Reschedule selection
ADM-ORD-11  Reschedule result/failure
ADM-ORD-12  Order detail unavailable / unauthorized
```

These are canonical semantic states, not a demand for twelve unrelated frames if a component/state system can express them cleanly.

---

# 30. Error and stale-state behavior

Admin operations must explicitly distinguish:

```text
load failure
no result
permission denied
unsupported action
action no longer eligible
mutation rejected
mutation succeeded but refresh failed
```

The last case is especially important: do not revert to pretending the mutation failed if backend success is already known; instead communicate that fresh canonical state could not be loaded and allow retry.

Where backend result is ambiguous, do not guess final state.

---

# 31. Simplicity rules for GRIP Admin

To preserve the GRIP principle of easy administration:

```text
1. Search by human terms.
2. Use a small filter set.
3. Keep one canonical Order Detail.
4. Separate statuses by meaning.
5. Show only valid semantic actions.
6. Explain destructive consequences before submit.
7. Refresh canonical state after mutation.
8. Link to other modules instead of recreating them.
9. Hide technical implementation vocabulary.
10. Do not add configuration merely because reference products have it.
```

---

# 32. Admin design non-goals

Do not design:

```text
fulfillment center/WMS dashboard
pick list
packing station
shipping-label screen
carrier settings
inventory reservation console
return/exchange console
refund workbench
fraud dashboard
manual order composer
bulk order editor
workflow/rules builder
support-ticket system
operator chat/comments
```

unless a future SRS explicitly adds them.

---

# 33. Admin UX acceptance checklist

```text
[ ] Operator can locate an order using human-recognizable values.
[ ] Queue emphasizes current operational state without showing every field.
[ ] Order, fulfillment and payment/refund statuses are not conflated.
[ ] Historical purchased-line data is visibly distinct from current Catalog context.
[ ] Customer context is minimal and Account-owned editing is linked out.
[ ] Split fulfillments can be inspected separately.
[ ] Timeline explains meaningful state changes without leaking technical payloads.
[ ] No raw status dropdown exists.
[ ] Cancel/reschedule are shown only when supported and currently eligible.
[ ] Consequential actions show consequence and confirmation.
[ ] Mutation success is followed by canonical refresh/history.
[ ] Permission/read-only states are understandable.
[ ] Mobile preserves lookup/status/action capability.
[ ] No WMS/Aftersales/payment-console scope has leaked into Order Admin.
```

---

# 34. Final Admin design direction

The Admin Order surface should behave like a **simple operational cockpit**:

```text
FIND
↓
ORIENT
↓
UNDERSTAND
↓
ACT
↓
VERIFY
```

not like:

```text
open database row
→ edit arbitrary fields
→ hope the workflow remains valid
```

That is the reference value to carry forward into Figma while remaining inside GRIP's existing domain contracts.