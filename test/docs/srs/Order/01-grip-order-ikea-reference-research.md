# GRIP Order — IKEA / Reference Research

**Status:** Final  
**Pipeline stage:** 01 — External research  
**Module:** Order  
**Surfaces covered:** Public Storefront + Admin Console  
**Research date:** 2026-08-27

---

## 1. Purpose

This file records verified post-purchase behavior from IKEA and selected mature commerce references that can inform the GRIP Order module.

It is **not** a GRIP specification and it is **not** a screen blueprint.

Research trace:

```text
verified external evidence
→ observed behavior
→ product / UX implication
→ candidate value for GRIP
```

Rules:

- IKEA public behavior is treated as customer-experience evidence only.
- No claim is made about IKEA's internal employee/backoffice order tooling unless public evidence exists.
- Shopify is used as an admin-workflow reference, not as a requirement to clone Shopify.
- commercetools is used as a domain/state-separation reference, not as a required backend model.
- A behavior appearing in this research does not automatically enter GRIP scope.
- GRIP ownership and feasibility are decided in `02-grip-order-srs.md`.

---

# 2. Existing GRIP constraints that this research must respect

Order is not a greenfield island. Existing specifications already assign boundaries to it.

## 2.1 Checkout handoff

`../checkout/checkout_srs.md` establishes that Checkout ends at order placement, while post-purchase tracking, rescheduling, cancellation, returns and claims belong to Order/Aftersales.

Therefore Order research must start **after successful placement** and must not redesign:

```text
cart
checkout data collection
fulfillment option selection before placement
payment selection before placement
commercial calculation before placement
```

## 2.2 Account projection

`../Account/02-grip-account-srs.md` establishes that Account can surface recent orders and route to canonical Order surfaces, but Order remains authoritative for:

```text
order identity
ordered item snapshots
order totals
order status
fulfillment state
order delivery snapshot
receipt / invoice behavior
cancel / reschedule / refund behavior where supported
```

Therefore Order must provide a canonical public list/detail contract that Account can project or navigate into.

## 2.3 Engagement dependency

`../Engagement/02-grip-engagement-srs.md` establishes that Order is authoritative for verified-purchase eligibility used by product reviews.

Therefore Order must expose purchase evidence through a published contract rather than allowing Engagement to inspect Order persistence directly.

## 2.4 Catalog separation

`../catalog/srs_001_product.md` explicitly excludes order, payment, return and refund behavior from Catalog.

Catalog owns the current product model. Order must preserve purchase-time snapshots rather than silently following later Catalog edits.

## 2.5 Content separation

`../Content/02-grip-content-srs.md` owns editorial composition and typed references. It does not create Order behavior.

Order should not absorb support/editorial CMS capability simply because post-purchase help links may appear on an order surface.

---

# 3. IKEA public order access

## E1 — Signed-in purchase history and guest-style direct lookup coexist

### Observed — IKEA US

IKEA's Track & Manage page states that a customer can access an order using:

```text
order number
+
email OR phone number used for the order
```

IKEA Family members can also see previous orders through their account.

### Product implication

A post-purchase experience should not assume every order is attached to an authenticated account.

Two valid access paths can coexist:

```text
authenticated account
→ order history

non-account / direct access
→ order reference + purchaser contact verification
```

### GRIP candidate

Useful if current GRIP Checkout permits unidentified customers. It avoids forcing registration merely to see an order.

### Source

IKEA US — Track and manage your order  
https://www.ikea.com/us/en/customer-service/track-manage-order/

---

# 4. IKEA order detail is a post-purchase task surface

## E2 — Order detail combines status, purchase facts and fulfillment facts

### Observed — IKEA US

Track & Manage exposes customer-useful information including:

- order status;
- purchased items;
- purchase time;
- delivery information;
- estimated arrival;
- tracking-related information;
- receipt access for supported purchases;
- delivery rescheduling where supported.

### Product implication

Canonical Order detail should not be only a receipt-like static record.

A useful mental model is:

```text
Order Detail
= historical purchase snapshot
+ current fulfillment progress
+ currently valid post-purchase actions
```

### Source

IKEA US — How can I check the status of my order?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/912e6gbg-fd30-4760-8602-672301485691.html

---

# 5. IKEA exposes a staged customer-facing order status

## E3 — Status is expressed as understandable progress

### Observed — IKEA US

IKEA currently explains these customer-facing stages:

```text
Preparing order
Picking order
Preparing delivery
On its way
Delivered
```

The important behavior is not the exact labels. It is that progress is communicated in customer language rather than internal warehouse codes.

### Action gating is status-dependent

IKEA also ties available actions to progress:

- while preparing, cancellation and delivery-date change may still be available;
- once picking has progressed, cancellation may be too late;
- after shipping, unwanted items move into return behavior instead of cancellation.

### Product implication

Order actions must be derived from current eligibility/state.

Do not model public Order detail as:

```text
status label
+
always-visible action buttons
```

Prefer:

```text
current state
→ eligible actions
→ consequence / next state
```

### Source

IKEA US — Track and manage your order  
https://www.ikea.com/us/en/customer-service/track-manage-order/

---

# 6. Cancellation and rescheduling are constrained mutations

## E4 — Rescheduling can disappear after processing advances

### Observed — IKEA US

IKEA states that customers can change a delivery date through order management while the order is still eligible. If the option is no longer available because processing has advanced, support may be required.

### Product implication

`Reschedule` is not a permanent property of every delivery order.

Required semantic pattern:

```text
Order/Fulfillment state
+
service constraints
→ reschedule eligibility
```

### Source

IKEA US — Can I change the delivery date of my order?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/db0d081c-91g7-4g92-gef8-5b78gegbb3d2.html

---

## E5 — Cancellation stops being available when operational work has progressed

### Observed — IKEA US

IKEA's status guidance states that cancellation can still be possible during early preparation and can become unavailable during picking/processing.

### Product implication

Cancellation needs explicit eligibility and must not be represented as a generic destructive edit.

Useful behavioral sequence:

```text
request cancel
→ fresh eligibility check
→ explain consequence
→ confirm
→ backend mutation
→ refresh canonical order state
```

### Source

IKEA US — Track and manage your order  
https://www.ikea.com/us/en/customer-service/track-manage-order/

---

# 7. Paid orders are intentionally less editable than carts

## E6 — Add / replace / service-change behavior is restricted after payment

### Observed — IKEA US

IKEA FAQ states that after payment is collected:

- items generally cannot simply be added to an existing order;
- replacing items is not treated as normal order editing;
- changing a delivery order into pickup may require cancellation and a new purchase;
- removing items can be possible only while the order is still processing.

### Product implication

The post-purchase Order surface should not become a second Checkout editor.

Strong candidate invariant for GRIP:

> Order preserves what was purchased. Post-purchase mutations are explicit domain actions, not arbitrary editing of the original checkout draft.

### Sources

IKEA US — FAQ / Order Changes  
https://www.ikea.com/us/en/customer-service/faq/

IKEA US — Why is my order split? / related order-change guidance  
https://www.ikea.com/us/en/customer-service/knowledge/articles/6g358398-3684-4e20-gd26-e45c4657edb8.html

---

# 8. One order can have multiple fulfillment units

## E7 — Split deliveries are visible to the customer

### Observed — IKEA US

IKEA explains that products from one order can ship from different locations and therefore arrive as separate deliveries. Track & Manage can show multiple deliveries/details.

### Product implication

A single order-level `deliveryStatus` is insufficient when the actual fulfillment is split.

Candidate semantic model:

```text
Order
└── Fulfillment[]
    ├── lines / quantities
    ├── method
    ├── status
    ├── estimate / schedule
    └── tracking
```

A summary status may still exist for list views, but detail should preserve fulfillment grouping when the backend supports it.

### Sources

IKEA US — Why is my order split?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/6g358398-3684-4e20-gd26-e45c4657edb8.html

IKEA US — Missing parts from your order?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/d7df886c-1693-4745-gbf7-1f223398742e.html

---

# 9. Tracking and exceptions should remain understandable

## E8 — Late-delivery guidance starts from current tracking information

### Observed — IKEA US

For a late delivery, IKEA directs customers first to delivery communications or Track & Manage for current status/tracking, then to support if the delay persists.

### Product implication

Order detail should make current fulfillment facts easy to inspect before routing the user into support.

Useful hierarchy:

```text
current fulfillment status
→ latest estimate / schedule
→ tracking when available
→ exception/help path when needed
```

### Source

IKEA US — My delivery is late. Where is it?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/d6fc4g58-74g6-4129-b2d3-53700bc12e38.html

---

# 10. Purchase documents belong in post-purchase history

## E9 — Receipts / invoices are retrievable from purchase history where supported

### Observed — IKEA US

IKEA documents digital receipt / invoice access through purchase history for supported account and purchase contexts.

### Product implication

A purchase document is attached to historical transaction context. It should not require rebuilding the order from current Catalog data.

### GRIP candidate

Order detail can expose a canonical document action when a receipt/invoice contract exists.

Do not invent document generation if the backend does not support it.

### Source

IKEA US — Managing your IKEA purchase records: receipts, invoices and pro-forma requests  
https://www.ikea.com/us/en/customer-service/knowledge/articles/6997001a-6a6a-4ee9-9fec-0a70de0468f9.html

---

# 11. Admin reference limitation

No public evidence was found for IKEA's internal employee order-management interface.

Therefore this research **does not** claim that IKEA staff use any specific table, queue, timeline or action placement.

For Admin UX, use mature commerce references only for reusable workflow patterns.

---

# 12. Shopify Admin — order operations reference

## R1 — Queue/search/filter is the operational entry point

### Observed — Shopify Admin documentation

Shopify's Orders area supports:

- searching by order number and customer information;
- searching by product-related information;
- filtering by fulfillment/payment/date and other operational dimensions;
- customizable order views.

### Product implication

An operator should be able to locate work using human-recognizable commerce information, without knowing internal database IDs.

### GRIP candidate

Admin Order should start from a task-oriented order list/queue with search and a small set of high-value filters.

Do not clone Shopify's full configurability unless GRIP volume requires it.

### Sources

Shopify Help — Managing orders  
https://help.shopify.com/en/manual/fulfillment/managing-orders

Shopify Help — Searching and viewing orders  
https://help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders/searching-orders

---

## R2 — Order, payment, fulfillment and return are separate status dimensions

### Observed — Shopify Admin documentation

Shopify documents independent operational statuses such as:

```text
order status
payment status
fulfillment status
return status
```

### Domain implication

One mega-enum such as:

```text
PAID_AND_PICKING_AND_NOT_RETURNED
```

is a poor model.

Different concerns can move independently and answer different operator questions.

### GRIP candidate

At minimum, Order UI/domain should not conflate:

```text
order lifecycle
payment/refund projection
fulfillment lifecycle
```

Returns should remain separate if/when Aftersales enters scope.

### Source

Shopify Help — Understanding your order statuses  
https://help.shopify.com/en/manual/fulfillment/managing-orders/order-status

---

## R3 — Historical product facts are snapshots

### Observed — Shopify Admin documentation

Shopify states that product information shown on an order reflects what was true when the order was placed and does not silently change when the product is edited later.

### Domain implication

This directly reinforces the existing GRIP Account/Catalog boundary:

```text
current Catalog
!=
historical Order snapshot
```

### GRIP candidate

Order line identity can retain a Catalog reference for navigation, but must render purchase-time title/variant/price/quantity snapshot from Order.

### Source

Shopify Help — Viewing and managing order details  
https://help.shopify.com/en/manual/fulfillment/managing-orders/managing-order-details

---

## R4 — Timeline gives operators causal history

### Observed — Shopify Admin documentation

Shopify order detail includes a Timeline containing order events, payment events and internal operational comments.

### Product implication

Current status alone is often insufficient for support/operations. Operators need to understand **what changed and when**.

### GRIP candidate

A read-only Order activity/history timeline is useful if the backend emits meaningful events.

Internal free-form comments/tags are **not automatically in scope**.

### Source

Shopify Help — Viewing and managing order details  
https://help.shopify.com/en/manual/fulfillment/managing-orders/managing-order-details

---

## R5 — Destructive mutations carry consequences

### Observed — Shopify Admin documentation

Cancellation can interact with refund state, inventory restocking, fulfillment progress and customer notification. Some orders cannot be canceled because of their current state or fulfillment restrictions.

### Product implication

An Admin `Cancel` button cannot be modeled as a context-free status change.

### GRIP candidate

Admin cancellation should:

```text
check eligibility freshly
show consequence
require reason when contract requires it
confirm
execute one domain command
refresh canonical state/history
```

Do not adopt Shopify-specific restock/payment options unless those capabilities exist in GRIP.

### Source

Shopify Help — Canceling orders  
https://help.shopify.com/en/manual/fulfillment/managing-orders/canceling-orders

---

# 13. commercetools — domain/state reference

## R6 — Order, shipment and payment states are independent

### Observed — commercetools API

commercetools exposes separate fields/concepts for:

```text
orderState
shipmentState
paymentState
```

It also models deliveries/parcels/tracking separately and supports return information as another concern.

### Product implication

This reinforces concern separation rather than requiring one linear global order state machine.

### GRIP candidate

Use separate semantic axes and derive customer-facing/queue summaries from them.

### Source

commercetools — Orders HTTP API  
https://docs.commercetools.com/api/projects/orders

---

# 14. What GRIP should take from the research

High-value candidates consistent with existing GRIP boundaries:

```text
Public
├── account order history
├── direct lookup for non-account orders when anonymous checkout exists
├── canonical order detail
├── purchase-time line/price/delivery snapshots
├── understandable status/progress
├── fulfillment groups + tracking
├── state-gated cancel/reschedule
└── receipt/invoice link when supported

Admin
├── order queue/list
├── human-readable search
├── small operational filter set
├── order detail
├── separate status dimensions
├── state-aware actions
├── read-only activity/history
└── cross-links to Account/Catalog without duplicating ownership

Integration
├── Checkout → immutable placed-order snapshot
├── Account → Order projection/navigation
├── Catalog reference + historical snapshot separation
└── Engagement → verified-purchase eligibility contract
```

---

# 15. What GRIP should not take automatically

The research does **not** justify adding the following to current Order scope:

```text
warehouse / inventory management
shipping-label purchasing
carrier administration
fulfillment-location configuration
fraud scoring
manual order creation / draft orders
arbitrary post-purchase product editing
promotions / repricing
customer service CRM
internal chat / comments
complex tags / automation rules
return-merchandise authorization workflow
exchange workflow
warranty claims
warehouse inspection / restock workflow
full payment-gateway administration
```

Some may later belong to Inventory, Fulfillment, Aftersales, Payment or Support capabilities.

---

# 16. Research conclusion

The strongest reusable model is:

```text
Checkout
   ↓ place
Order
   ├── preserves what was purchased
   ├── exposes what is happening now
   ├── exposes only actions still valid now
   └── publishes projections/contracts to Account + Engagement
```

For customers, the order page should answer:

```text
What did I buy?
What is happening now?
When/how will I receive it?
What can I still do?
Where is my proof of purchase?
```

For operators, the order surface should answer:

```text
Which orders need attention?
What is this order's current state?
What happened to it?
What action is valid next?
What customer/product context do I need without duplicating those domains?
```

That is the appropriate reference boundary for the GRIP Order SRS.