# GRIP Order — Public UI/UX Research

**Status:** Final  
**Pipeline stage:** 03A — UI/UX research  
**Module:** Order  
**Surface:** Public Storefront  
**Domain authority:** `02-grip-order-srs.md`  
**Reference research:** `01-grip-order-ikea-reference-research.md`

---

## 1. Purpose

This document translates the approved Order SRS into public customer tasks, information hierarchy, canonical screens/states and responsive interaction guidance.

It does **not** expand Order domain scope.

Design rule:

```text
SRS capability
→ user task
→ information requirement
→ interaction pattern
→ screen/state responsibility
```

Never reverse this direction by inventing a screen feature and then creating domain semantics to justify it.

---

# 2. Boundary guardrails

Public Order must stay consistent with existing GRIP files:

- `../checkout/checkout_srs.md`: Checkout ends at placement. Do not place cart/checkout editing inside Order.
- `../Account/02-grip-account-srs.md`: Account may surface My Orders/recent orders, but canonical list/detail/actions are Order-owned.
- `../Engagement/02-grip-engagement-srs.md`: review eligibility is a backend contract from Order, not a public Order-management screen feature.
- `../catalog/srs_001_product.md`: current Catalog is optional navigation context; historical item data is Order-owned.
- `../Content/02-grip-content-srs.md`: support/editorial help content can be linked but is not authored or managed by Order.

Do not add public UI for:

```text
returns/exchanges
warranty claims
manual refund requests
editing placed product lines
adding products to an order
repricing/promotions
warehouse operations
carrier configuration
```

unless `02-grip-order-srs.md` changes first.

---

# 3. Public UX principle

A customer opens Order because they want answers, not because they want to inspect a data record.

The surface should answer in this order:

```text
1. What is happening now?
2. What can I do now?
3. When/how will I receive it?
4. What exactly did I buy/pay for?
5. Where is my proof of purchase?
```

This is the strongest reusable pattern from IKEA Track & Manage.

Do not lead with internal metadata or a receipt-style wall of fields when the order is still active.

---

# 4. Canonical public entry points

Current SRS requires only these semantic entry paths.

## 4.1 Authenticated path

```text
Account Overview / My Orders
→ Order list
→ Order detail
```

Account may show recent orders, but selecting one lands on the same canonical Order detail used elsewhere.

## 4.2 Direct lookup path

Required only when GRIP supports non-account Checkout:

```text
Track order
→ order reference
→ email OR phone used on order
→ canonical order detail
```

No OTP UI is required.

## 4.3 Post-checkout path

After successful placement, Checkout can route directly to the newly created canonical Order detail/confirmation context.

Do not create a separate long-lived “confirmation product” that diverges from Order detail semantics.

---

# 5. Public information architecture

Recommended semantic IA:

```text
Orders
├── My Orders
├── Track Order                  // when direct lookup is required
└── Order Detail
    ├── Status / progress
    ├── Available actions
    ├── Fulfillment / tracking
    ├── Items purchased
    ├── Order summary
    ├── Delivery / collection snapshot
    ├── Purchase documents
    └── Help path
```

This is semantic IA, not a mandated desktop sidebar.

---

# 6. My Orders — task model

The list exists to support fast recognition and re-entry.

Primary user questions:

```text
Which order am I looking for?
Which ones are still active?
What is the current state?
When did I place it?
How much was it?
```

## 6.1 Minimum list-item information

Per `ORD-PUB-LST-001`, each order row/card should prioritize:

```text
order reference
order date
customer-facing status
fulfillment summary
grand total when permitted
small item summary/thumbnail when available
```

Do not turn the list into mini Order Detail.

## 6.2 Historical robustness

Order cards must still render when:

- current Catalog item is discontinued;
- product image is unavailable;
- current title differs from historical title;
- one Catalog reference no longer resolves.

Historical identity/reference/status must be enough to open the order.

## 6.3 Default sorting

Newest first.

Do not add sort controls unless actual order volume/user research justifies them.

## 6.4 Pagination

Use pagination or incremental loading according to frontend conventions.

The UX requirement is continuity and scalable retrieval, not a specific control.

---

# 7. My Orders — canonical states

Design at least:

```text
loading
loaded with orders
empty history
incremental loading / next page
recoverable load failure
order unavailable after navigation
```

## Empty history

Keep it simple:

- state that there are no orders yet;
- provide a route back to canonical shopping/Catalog if useful;
- do not invent loyalty/content promotion here.

---

# 8. Track Order lookup

This flow exists to solve access, not authentication/account acquisition.

## 8.1 Form semantics

Minimum fields when the SRS contact-verification pattern is used:

```text
Order reference
Email or phone used for purchase
```

The UI can choose one contact field with clear accepted formats or a segmented choice, depending on implementation contract.

## 8.2 Failure behavior

For mismatch/not-found:

- do not reveal that a valid private order exists for another contact;
- use a neutral failure message;
- preserve safe user-entered values where appropriate;
- offer retry/help without exposing private order metadata.

## 8.3 Account upsell boundary

Do not require account creation to continue.

If GRIP later wants an optional sign-in convenience, that belongs to Account integration and must not block direct access.

---

# 9. Order Detail — top-of-page hierarchy

The first viewport should optimize for current post-purchase intent.

Recommended order:

```text
Order reference + purchase date
Current status/progress
Current fulfillment estimate/schedule
Primary eligible action(s)
Secondary tracking/help
```

Historical item details and price breakdown follow below.

For completed/canceled orders, the hierarchy can compress progress and elevate the historical summary/document action.

---

# 10. Customer-facing status presentation

## 10.1 Use semantic language

Public status should communicate progress such as:

```text
Đang chuẩn bị
Đang lấy hàng
Chuẩn bị giao
Đang giao
Đã giao
```

or equivalent language defined by the accepted copy system.

Do not expose raw technical states like:

```text
FULFILLMENT_PENDING_V2
DISPATCHER_HANDOFF
OMS_WORKFLOW_17
```

## 10.2 Progress visualization

A lightweight step/progress representation is useful when there is one clear sequential fulfillment.

But never force split or exceptional fulfillment into a misleading single stepper.

If the order has multiple fulfillment groups, each group should communicate its own state.

## 10.3 Completed/canceled

Terminal states should be visually clear without looking like an error page.

Canceled orders should preserve:

- what was ordered;
- cancellation state;
- payment/refund projection when supported;
- purchase history/audit facts.

---

# 11. Fulfillment groups

When `ORD-FUL-001` applies, detail should group items by actual fulfillment unit.

Example semantic composition:

```text
Delivery 1
  status
  ETA / schedule
  tracking
  item A ×1
  item B ×2

Delivery 2
  status
  ETA / schedule
  tracking
  item C ×1
```

## 11.1 Avoid false global truth

Do not show one global “Delivered” badge if only one of several deliveries is complete.

A concise order summary can say something like “1 of 2 deliveries completed” when supported by the read model.

## 11.2 Tracking

Tracking action belongs next to the fulfillment it tracks.

If no tracking exists, do not render a dead tracking row/button.

---

# 12. Delivery / collection information

Display the placed-order snapshot, not live Account profile values.

For delivery, relevant information may include only what the contract supports:

```text
recipient/contact
address
service type
current schedule/estimate
instructions snapshot when useful
```

For collection:

```text
collection location
scheduled window when applicable
collection status
collector snapshot when applicable
```

Do not introduce editable address fields into normal Order detail.

If a supported action changes a future delivery date, use the Reschedule flow rather than an inline editable Order form.

---

# 13. Ordered items

## 13.1 Historical presentation

Render Order-owned snapshot fields as the primary facts:

```text
purchase-time product name
purchase-time selection/variant label
SKU/reference when useful
quantity
purchase-time amount
```

## 13.2 Current Catalog links

If current Catalog reference resolves publicly, the historical line may link to Product Detail.

The link should be treated as navigation to **current** product context.

Do not replace historical name/price with current Catalog projection.

## 13.3 Broken/currently unavailable product

If Catalog link is not valid:

- keep historical line readable;
- omit or disable current-product navigation gracefully;
- do not show “product missing” as if the order itself were corrupted.

---

# 14. Commercial summary

Order detail should present the same accepted transaction semantics preserved by the Order snapshot.

Recommended hierarchy:

```text
Merchandise subtotal
Discount/reward effects if present
Delivery/service fee if present
Tax if present
Total
```

No recalculation from current prices.

Payment/refund projection should be adjacent only when it helps the post-purchase task.

Do not expose payment credentials.

---

# 15. Cancellation UX

Cancellation is a consequential command, not a passive link.

## 15.1 Visibility

Show `Cancel order` only when current eligibility says self-service cancellation is possible.

If the UI wants to preserve discoverability after eligibility closes, use explanatory status/help text rather than a fake active control.

## 15.2 Flow

```text
Cancel order
→ fresh eligibility
→ consequence summary
→ confirmation
→ submit
→ canonical refresh
```

## 15.3 Confirmation content

Only show consequences supplied/guaranteed by the domain contract.

Potential supported content:

```text
order processing will stop
refund status/consequence
fulfillment impact
```

Do not invent exact refund timing.

## 15.4 Stale-state failure

If cancellation becomes unavailable during submission:

- keep the user on canonical Order context;
- explain that the order changed;
- refresh status/actions;
- do not show success toast followed by contradictory state.

---

# 16. Reschedule UX

## 16.1 Eligibility

Show the action only for a fulfillment that can currently be rescheduled.

## 16.2 Selection

The user chooses only from current valid options returned by fulfillment/order contract.

Do not use a free calendar that lets users select impossible dates.

## 16.3 Flow

```text
Reschedule
→ load valid dates/slots
→ select
→ review
→ confirm
→ canonical refresh
```

## 16.4 Split fulfillment

If only one fulfillment group is reschedulable, the action must clearly target that group rather than implying the entire order changes.

---

# 17. Purchase documents

When a receipt/invoice exists:

- place the action in a predictable Order Detail section;
- label the actual document type;
- do not fabricate a generic “Invoice” if only receipt is supported;
- provide download/open behavior according to the document contract.

Document access should remain available in historical terminal orders where permitted.

---

# 18. Help/escalation pattern

Self-service should come first when available.

A useful hierarchy, consistent with IKEA behavior:

```text
current state/tracking
→ valid self-service action
→ help/contact path if self-service is insufficient
```

Do not turn Order Detail into a generic customer-service portal.

Support entry should preserve order reference/context when the downstream support capability accepts it.

---

# 19. Information hierarchy by order phase

## 19.1 Active / early processing

Prioritize:

```text
status
ETA/schedule
cancel/reschedule eligibility
fulfillment details
```

## 19.2 In transit

Prioritize:

```text
in-transit status
tracking
ETA
split-delivery context
```

## 19.3 Completed

Prioritize:

```text
completed state
items/totals
purchase documents
historical fulfillment summary
```

No return/exchange CTA unless a future Aftersales SRS explicitly adds it.

## 19.4 Canceled

Prioritize:

```text
canceled state
refund/payment projection when available
items/totals
history
```

---

# 20. Responsive behavior

Public Order must be designed for both desktop and mobile.

## Desktop

Use available width to keep current status/action context visible while presenting structured detail below or beside it.

Do not create dense admin-style tables for customer history.

## Mobile

Recommended principles:

- stack identity/status/actions vertically;
- make primary eligible action reachable without horizontal scrolling;
- use cards/sections for fulfillment groups;
- keep monetary summary scannable;
- collapse secondary historical metadata before hiding primary fulfillment facts;
- never move destructive action so close to navigation that accidental taps become likely.

Responsive recomposition is allowed; semantic information/action priority must remain the same.

---

# 21. Loading, stale and error states

Design must explicitly cover:

```text
Order list loading
Order list failure
Order detail loading
Order detail not found / unauthorized-safe state
Fulfillment tracking unavailable
Catalog reference unresolved
Document unavailable
Action eligibility loading
Action stale/ineligible at submit
Mutation failure
Mutation success + canonical refresh
```

## Principle

The UI must distinguish:

```text
we do not have data yet
vs
this data/action does not exist
vs
this action failed
```

Do not use one generic empty-state component for all three.

---

# 22. Accessibility

Required UX implications:

- status meaning cannot rely on color alone;
- progress/stepper must have semantic text;
- destructive action confirmation is keyboard/screen-reader operable;
- focus returns to meaningful updated context after mutation;
- tracking/document actions have clear labels;
- repeated fulfillment groups have programmatically distinguishable headings;
- monetary and date information must be readable without relying on visual alignment alone.

---

# 23. Suggested canonical public screens

This is the minimum design inventory, not permission to add extra domain behavior.

```text
PUB-ORD-01  My Orders — loaded
PUB-ORD-02  My Orders — empty
PUB-ORD-03  Track Order — lookup
PUB-ORD-04  Track Order — safe mismatch/failure
PUB-ORD-05  Order Detail — active single fulfillment
PUB-ORD-06  Order Detail — active split fulfillment
PUB-ORD-07  Order Detail — in transit
PUB-ORD-08  Order Detail — completed
PUB-ORD-09  Order Detail — canceled
PUB-ORD-10  Cancel confirmation
PUB-ORD-11  Reschedule selection
PUB-ORD-12  Reschedule confirmation/result
PUB-ORD-13  Order action stale/failure
```

Variants can be reduced/combined during Figma execution if one component/state system expresses them clearly.

---

# 24. Cross-module navigation requirements

## Account

```text
Account Overview
→ recent order
→ canonical Order Detail

My Orders
→ canonical Order list
```

Do not recreate Order actions inside Account cards.

## Catalog

```text
historical Order line
→ current Product Detail, only if valid
```

Do not use Catalog as historical order truth.

## Checkout

```text
successful placement
→ canonical placed Order context
```

Do not route the customer back into editable Checkout for post-purchase management.

## Engagement

No special public Order UI is required for review eligibility. That is a published backend/domain contract.

---

# 25. Design non-goals

Do not design:

```text
returns center
exchange wizard
claim/warranty wizard
refund request wizard
shipment-label UI
warehouse picking
manual order editor
order-item add/remove editor
support ticket inbox
review eligibility settings
```

These are outside the current SRS.

---

# 26. Public UX acceptance checklist

A design is ready for downstream Figma/implementation only when it can answer yes to all of these:

```text
[ ] My Orders is recognisable without opening every order.
[ ] Direct lookup does not require Account when anonymous checkout exists.
[ ] Order Detail leads with current status and current actionability.
[ ] Historical product/price/address facts do not depend on live Catalog/Account data.
[ ] Split fulfillments can be understood independently.
[ ] Tracking is attached to the correct fulfillment.
[ ] Cancel is visible only when eligible and requires consequence confirmation.
[ ] Reschedule uses backend-provided valid options.
[ ] Stale action submission refreshes canonical state instead of faking success.
[ ] Receipt/invoice appears only when the actual document exists.
[ ] Completed/canceled orders remain useful historical records.
[ ] Mobile preserves the same semantic priority as desktop.
[ ] No return/exchange/warranty/payment-admin scope has leaked into Public Order.
```

---

# 27. Final public design direction

The public Order experience should feel like a **post-purchase control surface**, not a database record and not another checkout.

The durable structure is:

```text
STATUS
↓
WHAT YOU CAN DO
↓
FULFILLMENT / TRACKING
↓
WHAT YOU BOUGHT
↓
WHAT YOU PAID
↓
DOCUMENTS / HELP
```

That structure carries the strongest IKEA value while staying inside the GRIP Order SRS.