# GRIP Order Module — Software Requirements Specification

**Status:** Final  
**Pipeline stage:** 02 — SRS  
**Module:** Order  
**Surfaces:** Public Storefront + Admin Console  
**Research input:** `01-grip-order-ikea-reference-research.md`

---

# 1. Purpose

The Order module owns the canonical post-purchase record and the customer/operator view of what happens after Checkout successfully places an order.

Its job is to preserve historical purchase truth while exposing current fulfillment progress and only those post-purchase actions that remain valid.

The central model is:

```text
Checkout
   ↓ successful placement
Order
   ├── historical purchase snapshot
   ├── current lifecycle state
   ├── fulfillment progress
   ├── post-purchase action eligibility
   ├── purchase documents
   └── published projections/contracts
```

Order is not a second Checkout and not a warehouse-management system.

---

# 2. Existing GRIP contracts are authoritative constraints

This SRS is intentionally bounded by already-approved modules.

## 2.1 Checkout boundary

`../checkout/checkout_srs.md` owns the purchase journey through successful order placement.

Order starts after placement.

Order does not own:

```text
cart mutation before placement
checkout draft data entry
pre-placement fulfillment selection
pre-placement commercial calculation
pre-placement payment selection
```

## 2.2 Account boundary

`../Account/02-grip-account-srs.md` may surface recent orders or route to My Orders.

Order remains authoritative for:

```text
order identity
ordered-item snapshots
order totals
order status
fulfillment state
order delivery snapshot
receipt/invoice behavior
post-purchase mutations defined here
```

Account profile/address changes never rewrite historical Orders.

## 2.3 Engagement boundary

`../Engagement/02-grip-engagement-srs.md` consumes Order purchase evidence for review eligibility.

Engagement must not read Order persistence directly.

## 2.4 Catalog boundary

`../catalog/srs_001_product.md` owns current ProductModel/Variant data and explicitly excludes Order behavior.

Order line snapshots do not silently change when Catalog changes later.

## 2.5 Content boundary

`../Content/02-grip-content-srs.md` owns editorial content.

Order may link to help/content destinations but does not absorb CMS/editorial authoring.

---

# 3. Current scope

```text
Order
├── Public Order Access
│   ├── authenticated order history
│   └── direct order lookup when non-account checkout exists
├── Order Detail
├── Historical Purchase Snapshot
├── Fulfillment Projection
│   ├── delivery
│   └── collection
├── Tracking
├── Post-purchase Action Eligibility
│   ├── cancel, where supported
│   └── reschedule, where supported
├── Purchase Documents
├── Order Activity / History
├── Engagement Purchase Eligibility Contract
└── Admin Order Operations
    ├── order queue/search/filter
    ├── order detail
    ├── fulfillment/status inspection
    ├── permitted state-aware actions
    └── cross-domain navigation
```

---

# 4. Explicit current-scope exclusions

The following are **not required** by this SRS:

```text
inventory ownership
warehouse stock operations
pick/pack workstation workflow
shipping-label purchase/printing
carrier account configuration
fulfillment-location administration
fraud scoring
manual/draft order creation
arbitrary post-purchase order editing
adding products after placement
repricing/promotions after placement
return/exchange workflow
warranty claims
warehouse return inspection/restock workflow
customer-service CRM
internal staff chat
order tags/automation engine
payment-gateway administration
full refund orchestration independent from another valid order action
```

Returns, exchanges, claims and deeper refund workflows can enter a later Aftersales capability without changing Order's historical ownership.

---

# 5. Core ownership model

## 5.1 Order owns

Order is authoritative for:

- order identity/reference;
- purchaser/account reference where applicable;
- purchase timestamp;
- purchase-time item snapshots;
- quantities;
- purchase-time price/totals snapshots;
- purchase-time delivery/collection snapshot;
- canonical order lifecycle;
- fulfillment grouping/progress exposed by the current platform;
- tracking projection when supplied by fulfillment integration;
- post-purchase action eligibility;
- order activity/history emitted by Order-owned operations;
- purchase-document references when supported;
- verified-purchase evidence published to Engagement.

## 5.2 Order does not own current Catalog truth

Order may retain Catalog references for navigation, but historical rendering uses Order snapshots.

Required invariant:

```text
Catalog product changes
≠
Order snapshot changes
```

## 5.3 Order does not own Account profile truth

Order stores the delivery/contact snapshot applicable to the placed transaction.

Later Account edits do not rewrite it.

## 5.4 Order does not own Checkout draft truth

The successful placement boundary transforms accepted Checkout facts into Order-owned immutable historical facts.

After placement, the Order is not edited by reopening the Checkout draft.

---

# 6. Order creation / placement handoff

## ORD-PLC-001 — Create from successful Checkout placement

An Order is created only from a successful placement contract from Checkout.

Placement must supply enough accepted information to establish:

```text
order identity
purchaser context
ordered line snapshots
commercial totals
fulfillment selection/snapshot
delivery or collection data
payment result/projection required by Order
placement timestamp
```

The exact transport contract belongs to implementation/API design.

## ORD-PLC-002 — No partial visible Order on failed placement

If Checkout placement fails before Order creation is committed, the public Order history must not expose a falsely completed order.

## ORD-PLC-003 — Placement is idempotent by accepted transaction identity

Retrying the same accepted placement must not create duplicate customer orders.

The concrete idempotency key is an API/domain design decision.

---

# 7. Historical purchase snapshot

## ORD-SNP-001 — Ordered line snapshot

Every order line preserves purchase-time information sufficient for a customer/operator to understand what was purchased.

Minimum semantic projection:

```text
catalog selection reference
purchase-time product title
purchase-time variant/selection label where applicable
SKU/reference where applicable
quantity
unit amount
effective line amount
```

Only fields accepted by the actual commerce contract are persisted.

## ORD-SNP-002 — Current Catalog is optional context, not authority

Order detail may link to the current Catalog product when still resolvable.

The current Catalog title, status or price must never silently replace historical Order snapshot values.

## ORD-SNP-003 — Totals snapshot

Order preserves the accepted purchase-time commercial summary.

It may include, according to Checkout's accepted contract:

```text
merchandise subtotal
discount/reward effects
fulfillment/service charge
tax if applicable
grand total
currency
```

Order does not recalculate a historical order from current Catalog prices.

## ORD-SNP-004 — Delivery/collection snapshot

The placed Order preserves the accepted fulfillment destination/collection facts required to understand and operate the transaction.

Editing Account saved delivery data does not rewrite this snapshot.

---

# 8. State model — concern separation

Order must not represent all post-purchase concerns with one combined mega-status.

At minimum separate:

```text
Order lifecycle
Fulfillment lifecycle
Payment/refund projection, when present
```

Returns remain a separate future concern.

## 8.1 Order lifecycle

Current minimum semantic lifecycle:

```text
active
├── cancel → canceled
└── all fulfillment work reaches successful terminal state → completed
```

`active` is the business fact that the placed order still has current work/progress.

`completed` means the current Order fulfillment responsibility has reached successful completion.

`canceled` is terminal for the canceled order transaction.

The implementation may use richer internal states, but they must map to these semantics without exposing technical workflow codes directly to customers.

## 8.2 Fulfillment lifecycle

Fulfillment state is modeled per fulfillment group when the platform supports split fulfillment.

Customer-facing delivery progress can map to understandable stages such as:

```text
preparing
picking
preparing_delivery
in_transit
delivered
```

Collection can use the actual supported semantic stages, such as:

```text
preparing
ready_for_collection
collected
```

Do not create unsupported states merely for UI variety.

## 8.3 Exception projection

If the fulfillment provider exposes meaningful exception states such as delayed/unavailable, Order can surface them as fulfillment context.

An exception is not automatically a new Order lifecycle state.

---

# 9. Fulfillment grouping

## ORD-FUL-001 — One Order may contain multiple fulfillment groups

When one placed Order is fulfilled in multiple deliveries/collections, Order can represent:

```text
Order
└── Fulfillment[]
    ├── fulfillment identity
    ├── covered order lines / quantities
    ├── method
    ├── current state
    ├── estimate/schedule when available
    └── tracking when available
```

## ORD-FUL-002 — Summary state is derived

List views may expose one concise fulfillment/order summary.

That summary is a projection and must not destroy detail about partial/split fulfillment.

## ORD-FUL-003 — Tracking is fulfillment-specific

Tracking number/link/provider information belongs to the relevant fulfillment/parceled delivery when supplied.

Do not attach one fake global tracking number to an order with multiple independent fulfillments.

---

# 10. Public order access

## ORD-PUB-ACC-001 — Authenticated customer order history

An authenticated customer can view Orders associated with their account identity according to authorization rules.

This is the canonical Order-owned list consumed/navigated from Account.

## ORD-PUB-ACC-002 — Direct lookup for non-account orders

If current Checkout supports placing an order without an Account association, Order must provide a secure direct-access path.

Current minimum reference pattern:

```text
order reference
+
purchaser email OR phone captured on the order
```

No OTP flow is required by this SRS.

If the current security contract chooses a stronger opaque access token instead, that contract may replace the contact-check pattern.

## ORD-PUB-ACC-003 — Authorization isolation

A customer can never access another customer's Order merely by changing a route identifier.

Direct lookup must verify the required secondary purchaser context before returning private order detail.

## ORD-PUB-ACC-004 — Not-found and mismatch are safe

Lookup failure must not disclose whether a private order exists when the supplied verification context does not match.

---

# 11. Public order list

## ORD-PUB-LST-001 — Canonical list

Authenticated customers can browse their own orders.

Minimum useful projection:

```text
order reference
order date
current customer-facing status
fulfillment summary
grand total, when permitted
small item summary/thumbnail projection, when available
```

The list must remain useful without requiring current Catalog products to be available.

## ORD-PUB-LST-002 — Recent-first ordering

Default order is newest purchase first unless product requirements explicitly choose another sorting rule.

## ORD-PUB-LST-003 — Scalable retrieval

Order history supports pagination/incremental retrieval.

Exact UI mechanics are a design decision.

## ORD-PUB-LST-004 — Account projection does not duplicate list ownership

Account may show a small recent-order projection and route to this canonical list/detail.

---

# 12. Public order detail

## ORD-PUB-DTL-001 — Required information hierarchy

Canonical Order detail must expose, where applicable:

```text
order reference + purchase date
current status/progress
currently valid primary action(s)
fulfillment/delivery/collection information
tracking / estimate / schedule
ordered item snapshots
commercial summary
purchase document access
help/escalation route when current flow cannot self-serve
```

## ORD-PUB-DTL-002 — Historical item independence

Order detail remains understandable even if the current Catalog product is renamed, repriced, inactive or discontinued.

## ORD-PUB-DTL-003 — Current Catalog navigation is optional

A historical line may link to the canonical current product only when the reference is valid and public.

Broken Catalog references must not break Order detail.

---

# 13. Customer-facing action eligibility

## ORD-ACT-001 — Eligibility is authoritative and fresh

Cancel/reschedule actions are available only when the current Order/Fulfillment contract says they are eligible.

The UI must not infer eligibility solely from a stale locally cached status label.

## ORD-ACT-002 — Unsupported actions are not implied

If a placed order cannot currently be canceled or rescheduled through GRIP, the UI must not show a misleading self-service control.

It may instead show the appropriate support/help path when defined.

## ORD-ACT-003 — State-aware mutation

All customer mutations follow:

```text
open current order
→ resolve current eligibility
→ choose action
→ show consequence / required input
→ confirm when consequential
→ execute
→ refresh canonical order + fulfillment + history
```

---

# 14. Cancellation

## ORD-CAN-001 — Cancel only while eligible

A customer or authorized operator can cancel an order only while the owning domain reports cancellation eligibility.

Cancellation must re-check eligibility at execution time.

## ORD-CAN-002 — Cancellation is not arbitrary editing

Cancellation terminates the applicable transaction/order according to domain rules.

It does not reopen Checkout or permit editing purchased lines in place.

## ORD-CAN-003 — Consequence visibility

Before confirmation, UI must communicate supported consequences returned by the domain, such as:

```text
order will stop processing
refund consequence/status if applicable
fulfillment impact
```

Do not display inventory-restock or payment options that the current backend does not expose.

## ORD-CAN-004 — Canonical refresh

After successful cancellation:

- order lifecycle reflects canceled;
- active fulfillment actions disappear;
- any payment/refund projection returned by the backend is refreshed;
- activity/history records the transition.

## ORD-CAN-005 — Stale cancellation fails safely

If the order becomes ineligible between view and submit, cancellation fails without pretending success and the latest state is shown.

---

# 15. Rescheduling

## ORD-RSC-001 — Reschedule only supported fulfillment

Rescheduling applies only when the current fulfillment service and state support it.

## ORD-RSC-002 — Valid choices come from fulfillment contract

If rescheduling requires selecting a new date/slot, the Order surface consumes currently valid options from the owning fulfillment contract.

It must not invent arbitrary dates client-side.

## ORD-RSC-003 — Snapshot/history update

Successful reschedule updates the current fulfillment schedule projection and records the event/history required by the platform.

The original purchase facts remain historical.

## ORD-RSC-004 — Ineligible transition

If rescheduling is no longer available, the UI removes/blocks the action and presents the current canonical state or support path.

---

# 16. Payment/refund projection boundary

## ORD-PAY-001 — Order may expose payment/refund state needed for post-purchase understanding

Where the current platform provides it, Order detail can expose a concise payment/refund projection such as:

```text
paid
refund_pending
partially_refunded
refunded
```

Only actual backend states may be used.

## ORD-PAY-002 — No standalone refund engine required

This SRS does not require Order Admin to become a generic payment-gateway console.

A refund initiated as a consequence of a supported cancellation/aftersales operation is represented from the owning financial contract.

Independent refund orchestration requires a separate explicit scope decision.

---

# 17. Purchase documents

## ORD-DOC-001 — Receipt/invoice access when supported

Order detail can expose receipt/invoice access when a canonical document exists.

## ORD-DOC-002 — Documents use historical transaction facts

Document contents must not be reconstructed from current Catalog price/title data.

## ORD-DOC-003 — No fake document generation

If no receipt/invoice contract exists for an order, UI must not offer a non-functional download action.

---

# 18. Order activity/history

## ORD-HIS-001 — Read-only operational history

Order can expose a chronological history of meaningful Order-owned events when available.

Examples:

```text
placed
fulfillment state changed
tracking added
rescheduled
canceled
completed
refund projection changed
```

## ORD-HIS-002 — Current state remains primary

Timeline/history explains how the order reached its current state. It does not replace the current-status summary.

## ORD-HIS-003 — Internal-only data remains internal

Internal operator/audit metadata must not leak into the customer-facing timeline unless explicitly approved for public projection.

---

# 19. Engagement verified-purchase contract

## ORD-ENG-001 — Published eligibility query

Order publishes a contract allowing Engagement to determine whether an authenticated customer has eligible purchase evidence for a canonical reviewed Catalog product.

Conceptually:

```text
ReviewEligibility(account_id, product_ref)
→ eligible | not_eligible
```

The transport shape is an API decision.

## ORD-ENG-002 — Historical evidence comes from Order

Eligibility uses Order-owned historical lines, not current Cart/Checkout or Catalog state.

## ORD-ENG-003 — Canceled-only purchases are not eligible evidence

An order that was fully canceled before successful fulfillment does not establish verified-purchase review evidence.

## ORD-ENG-004 — Fulfillment-success requirement

Current GRIP verified-purchase semantics require the purchased product to have reached successful fulfillment before it becomes eligible evidence.

For a delivery order this means the relevant fulfillment is delivered.

For collection this means the relevant fulfillment is collected.

If implementation lacks line-level fulfillment and only supports order-level completion, eligibility may conservatively require completed Order state.

This rule satisfies Engagement's requirement that exact eligibility remain Order-owned.

---

# 20. Admin Order queue

## ORD-ADM-LST-001 — Order operations entry point

Authorized operators can access an Order list/queue.

## ORD-ADM-LST-002 — Human-readable search

Operators can locate orders using supported human-recognizable identifiers such as:

```text
order reference
customer name
customer email
customer phone
```

Product/SKU search may be added only if backend support makes it reliable and useful.

Internal database IDs must not be required for normal lookup.

## ORD-ADM-LST-003 — Operational filters

The queue can filter by a small set of supported dimensions such as:

```text
order lifecycle
fulfillment status
fulfillment method
payment/refund projection when relevant
placed date
```

Do not create a broad analytics filter builder in this module.

## ORD-ADM-LST-004 — Queue-first prioritization

The default Admin experience should prioritize orders requiring current work/attention rather than treating every historical order equally.

The exact views depend on supported backend signals.

---

# 21. Admin Order detail

## ORD-ADM-DTL-001 — Canonical operator detail

Authorized operators can inspect:

```text
order reference + timestamps
order lifecycle
payment/refund projection where supported
fulfillment groups/status/tracking
purchase-time line snapshots
commercial totals
delivery/collection snapshot
customer/account projection
activity/history
currently valid operational actions
```

## ORD-ADM-DTL-002 — Account data is projection/link

Order Admin may show the minimal customer identity/contact context required to operate the order.

Full Account editing remains Account-owned.

Selecting customer context can navigate to canonical Account Admin when useful and authorized.

## ORD-ADM-DTL-003 — Catalog data is projection/link

Order Admin can link a line to canonical Catalog Admin/current product context.

Historical order data remains Order-owned and must not be replaced by current Catalog data.

## ORD-ADM-DTL-004 — Sensitive data minimization

Order Admin displays only payment/customer data required for the task.

Never expose payment credentials/secrets.

---

# 22. Admin mutations

## ORD-ADM-ACT-001 — Permission boundary

Only authorized operators can execute Order mutations.

Backend authorization remains mandatory even when UI hides an action.

## ORD-ADM-ACT-002 — No generic status dropdown

The Admin UI must not offer arbitrary mutation of a raw status field.

Operators execute semantic commands such as:

```text
Cancel order
Reschedule fulfillment
```

only when those commands are supported and eligible.

## ORD-ADM-ACT-003 — Consequential confirmation

Destructive/financially meaningful actions require explicit confirmation and consequence visibility.

## ORD-ADM-ACT-004 — Reason when contract requires it

If a domain command requires a cancellation/reschedule reason, Admin must collect one of the supported values or required text according to the backend contract.

Do not invent a reason taxonomy in UI.

## ORD-ADM-ACT-005 — Fresh read after mutation

After success, Admin refreshes canonical Order state/history rather than applying optimistic fake state as final truth.

---

# 23. Privacy and authorization

## ORD-PRV-001

Authenticated customers can access only Orders associated with their identity.

## ORD-PRV-002

Direct non-account lookup requires secondary purchaser verification or an approved secure access token.

## ORD-PRV-003

Admin Order access is permission-controlled.

## ORD-PRV-004

Cross-module projections respect the owning module's authorization rules.

## ORD-PRV-005

Payment credentials, authentication secrets and unrelated Account data are never exposed through Order.

---

# 24. Integrity invariants

```text
1. A placed Order preserves purchase-time facts independently from current Catalog changes.
2. Account profile/address changes never mutate historical Order snapshots.
3. Order actions are eligibility-driven, never inferred from visual status alone.
4. Order is not reopened as Checkout after placement.
5. Split fulfillment is not collapsed into false single-delivery truth.
6. Customer-facing status uses understandable semantic projection, not internal workflow codes.
7. Admin uses semantic commands, not arbitrary status editing.
8. Engagement purchase verification comes through Order's published contract.
9. A canceled-before-fulfillment order is not verified-purchase evidence.
10. Order access is identity/verification scoped and cannot leak another customer's order.
```

---

# 25. Canonical Public flows

## Authenticated history

```text
Account / My Orders
→ Order list
→ Order detail
```

## Direct lookup

```text
Track order
→ order reference
→ purchaser contact verification
→ valid? 
   ├── yes → Order detail
   └── no  → safe failure
```

## Track fulfillment

```text
Order detail
→ current status
→ fulfillment group
→ estimate/schedule
→ tracking when available
```

## Cancel

```text
Order detail
→ cancellation eligible?
   ├── no  → no self-service cancel
   └── yes
        → show consequence
        → confirm
        → execute
        → fresh Order state
```

## Reschedule

```text
Order detail
→ reschedule eligible?
   ├── no  → no self-service reschedule
   └── yes
        → load valid dates/slots
        → choose
        → confirm
        → execute
        → fresh Fulfillment state
```

---

# 26. Canonical Admin flow

```text
Orders
→ operational queue/search/filter
→ open Order
→ inspect current + historical context
→ eligible action?
   ├── none → read/support context
   └── yes
        → semantic action
        → consequence/confirmation
        → execute
        → canonical refresh + history
```

---

# 27. Acceptance scenarios

## AS-01 — Checkout placement creates historical truth

Given a Checkout has been successfully placed  
When Order is created  
Then ordered lines, totals and fulfillment snapshot reflect accepted placement facts.

## AS-02 — Catalog price changes later

Given an existing Order  
And Catalog changes the current Variant price  
When the Order is viewed  
Then the Order still shows the purchase-time price.

## AS-03 — Catalog product becomes discontinued

Given an existing Order line referencing a Catalog product  
When the product becomes discontinued  
Then the historical Order detail remains readable.

## AS-04 — Account address changes

Given an existing delivered Order  
When the customer edits saved delivery information in Account  
Then the historical Order delivery snapshot does not change.

## AS-05 — Authenticated history isolation

Given customer A and customer B have different Orders  
When customer A browses My Orders  
Then customer B's Orders are not exposed.

## AS-06 — Direct lookup success

Given a non-account Order exists  
When the correct order reference and purchaser contact verification are supplied  
Then canonical Order detail can be accessed.

## AS-07 — Direct lookup mismatch

Given an order reference exists  
When purchaser verification does not match  
Then private Order detail is not disclosed.

## AS-08 — Split fulfillment

Given one Order has two fulfillment groups  
When Order detail is viewed  
Then each group's lines/status/tracking can be understood independently.

## AS-09 — Eligible cancellation

Given an active Order is currently cancellation-eligible  
When the customer confirms cancellation  
Then the backend transition succeeds and fresh Order state is shown as canceled.

## AS-10 — Stale cancellation

Given cancellation was visible  
And fulfillment advances before submission  
When cancellation is submitted  
Then stale eligibility is rejected and latest Order state is shown.

## AS-11 — Reschedule

Given a fulfillment is reschedule-eligible  
When the customer chooses a currently valid slot and confirms  
Then the updated schedule is shown from canonical fulfillment state.

## AS-12 — No invented action

Given an Order does not support self-service reschedule  
When Order detail is viewed  
Then UI does not imply that rescheduling is available.

## AS-13 — Receipt availability

Given a canonical purchase document exists  
When Order detail is viewed  
Then the user can access it.

## AS-14 — Review eligibility success

Given an authenticated customer bought a product  
And the relevant fulfillment completed successfully  
When Engagement requests review eligibility  
Then Order can return eligible.

## AS-15 — Review eligibility canceled purchase

Given the customer's only purchase evidence was fully canceled before successful fulfillment  
When Engagement requests eligibility  
Then Order returns not eligible.

## AS-16 — Admin human lookup

Given an operator knows an order reference or customer contact value  
When they search Orders  
Then they can locate matching authorized Order context without internal IDs.

## AS-17 — Admin cannot arbitrary-edit status

Given an operator opens Order detail  
Then no generic raw-status dropdown is offered as a substitute for valid domain actions.

## AS-18 — Admin mutation refresh

Given an authorized operator executes an eligible Order action  
When it succeeds  
Then the UI reloads canonical Order state and history.

---

# 28. Required outputs for downstream design

Public UI/UX research must cover only the public requirements in this SRS and is written in:

`03-grip-order-public-ui-ux-research.md`

Admin UI/UX research must cover only the Admin requirements in this SRS and is written in:

`04-grip-order-admin-ui-ux-research.md`

Neither design file may expand domain scope without first changing this SRS.