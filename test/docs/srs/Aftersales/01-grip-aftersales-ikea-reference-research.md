# GRIP Aftersales — IKEA / Reference Research

**Status:** Final  
**Pipeline stage:** 01 — External research  
**Module:** Aftersales  
**Surfaces covered:** Public Storefront + admin-adjacent operational patterns  
**Research date:** 2026-08-27

---

## 1. Purpose

This file records verified external behavior that can inform the GRIP Aftersales module.

It is not a GRIP specification and it is not a screen blueprint.

Research trace:

```text
verified evidence
→ observed behavior
→ product/UX implication
→ candidate value for GRIP
```

Rules:

- IKEA US is the primary customer-facing reference.
- Public IKEA evidence must not be presented as evidence of IKEA's internal backoffice UI.
- External admin products may be used only as workflow references where IKEA internal evidence is unavailable.
- A reference capability does not automatically enter GRIP scope.
- Final ownership and scope are decided by `02-grip-aftersales-srs.md` and already-approved GRIP SRS files.

---

# 2. Existing GRIP boundary before this research

Current GRIP documents already establish a clean handoff:

```text
Checkout
→ successful placement
→ Order
→ post-purchase exception / return / claim
→ Aftersales
```

`../Order/02-grip-order-srs.md` explicitly leaves these outside Order:

```text
return / exchange workflow
warranty claims
warehouse return inspection / restock workflow
full refund orchestration independent from another valid order action
```

The same Order SRS keeps historical purchase truth in Order.

Therefore Aftersales should consume Order evidence and must not recreate or rewrite the historical order.

---

# 3. IKEA does not expose one undifferentiated “aftersales” problem

The strongest research finding is separation by customer intent.

Observed IKEA customer-service behavior distinguishes at least:

```text
changed mind / normal return
missing or damaged delivery
missing or damaged product parts
fault / quality issue
warranty claim
```

These flows differ in:

- eligibility window;
- required proof;
- evidence;
- resolution choices;
- whether an item must physically return;
- whether an operator must inspect/decide.

### GRIP implication

Do not model every post-purchase issue as one generic support ticket with a free-text reason.

The customer should first communicate the semantic intent.

---

# 4. Normal returns — policy is eligibility, not just a button

## E1 — Return windows and proof of purchase

### Observed — IKEA US

IKEA US states that:

- new and unopened products can generally be returned within 365 days with proof of purchase;
- opened products can generally be returned within 180 days with proof of purchase;
- some categories have exceptions;
- products that are modified, dirty, stained or otherwise outside policy may be rejected.

Refunds are generally returned to the original payment method when the required purchase evidence exists.

### Product implication

Return availability is a policy decision based on the purchased item and purchase context.

A public UI should ask the backend for current eligibility rather than infer it from an order date alone.

### Source

IKEA US — What is IKEA's return policy?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/426ef947-4a4d-42f4-b940-dd12970a04f5.html

---

# 5. IKEA Express return — useful self-service preparation pattern

## E2 — Prepare return online before going to store

### Observed — IKEA US

IKEA's Express return flow lets the customer prepare a return online.

The published process includes:

```text
proof of purchase / order number
→ select products to return
→ provide requested details
→ choose return reason
→ submit
→ receive return barcode by SMS/email
→ bring barcode + products to store within the stated period
```

IKEA documents a 14-day period for using the generated Express return barcode.

### Product implication

A useful self-service return flow separates:

```text
request / preparation
from
physical receipt / inspection
from
refund outcome
```

Those are different states and should not be collapsed into `returned=true`.

### Source

IKEA US — Can I return a product in store?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/f41bb8c6-dab2-44c9-b6a7-a9f84be811b6.html

---

# 6. Exchange is not necessarily a first-class commerce engine

## E3 — General exchange is return + new purchase

### Observed — IKEA US

IKEA states that if a customer wants to exchange an item, the normal pattern is to return the item first and then make a new purchase.

There are product-specific exceptions such as IKEA's mattress exchange policy.

### Product implication

GRIP should not automatically create a generic exchange engine involving repricing, replacement SKU selection, inventory reservation and balance collection merely because the word “exchange” exists in customer language.

A simpler valid model is:

```text
return old purchase
+
new independent purchase through Catalog/Checkout
```

Specific replacement behavior can still exist as a claim resolution.

### Source

IKEA US — What is IKEA's return policy?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/426ef947-4a4d-42f4-b940-dd12970a04f5.html

---

# 7. Damaged delivery — issue reporting belongs near Order context

## E4 — Damage can be reported from Track & Manage

### Observed — IKEA US

For a product delivered in a damaged state, IKEA instructs customers to report the problem as soon as possible through Track & Manage or Customer Service.

If damage is identified during delivery, IKEA describes a flow where a co-worker can process a damage report and arrange a replacement delivery.

If damage is found later, published resolution options can include:

- replacement in store when available;
- replacement by home delivery;
- refund.

### Product implication

The natural entry point for a delivery-related problem is the canonical Order and fulfillment context, not a generic support homepage.

The customer should not need to re-enter purchase facts that Order already owns.

### Source

IKEA US — What can I do if my item was damaged during or after delivery?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/9ef5ebf8-c4bf-449d-97f4-a0cef573807b.html

---

# 8. Missing item — first disambiguate fulfillment reality

## E5 — Check split delivery before creating an issue

### Observed — IKEA US

IKEA tells customers who think an item is missing to first verify:

- the purchase list;
- package contents;
- whether the order has been split into multiple deliveries;
- whether another delivery is still scheduled.

Only after those checks does the guidance route the customer to Customer Service for resolution.

Published resolution options include replacement/pickup/home delivery/refund depending on context.

### Product implication

Before allowing a “missing item” claim, GRIP should expose the relevant Order fulfillment projection so the user does not create a false claim for an item that is still in transit in another fulfillment group.

### Sources

IKEA US — What can I do if something is missing from my delivery?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/74d6d65a-df6f-4f7f-90c3-f779ea35383d.html

IKEA US — What do I do if I have a missing product?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/g877ed3b-4e47-468e-903e-718818f2g6df.html

---

# 9. Missing/damaged part is not necessarily a whole-product return

## E6 — Parts can have a smaller resolution

### Observed — IKEA US

IKEA states that when only a part is missing or damaged, a replacement part may be shipped or obtained through a store depending on part size and availability.

Some hardware can be ordered through a spare-parts portal.

### Product implication

The domain should allow a product issue to resolve without requiring a full return.

However GRIP should not invent a spare-parts catalog/BOM unless another approved domain provides that capability.

### Source

IKEA US — What should I do if my item has missing or damaged parts?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/g7fb36d2-c919-41f3-8936-2g7e6d1e1194.html

---

# 10. Claims and warranty require evidence + decision

## E7 — Claim evidence and operator decision

### Observed — IKEA US

IKEA's claims guidance says:

- the customer should have an order number/receipt;
- some missing/damaged issues should be reported within the applicable claim window;
- warranty claims require proof of purchase;
- inspection may be required;
- photos may be requested;
- IKEA co-workers make the final claim decision.

### Product implication

A warranty/product-fault flow is not just an automatic date comparison.

The system needs to represent:

```text
claim submitted
→ evidence/context reviewed
→ decision
→ resolution
```

### Source

IKEA US — How do I make a claim?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html

---

# 11. Warranty resolution is semantic, not a raw refund action

## E8 — Repair / replacement / refund depending on applicable conditions

### Observed — IKEA US

IKEA's limited-warranty information states that covered products are examined and, depending on the applicable warranty, IKEA may repair or replace the defective product.

Related quality-issue guidance also describes replacement or refund outcomes after conditions are met.

### Product implication

Refund is often the financial result of a valid aftersales decision.

GRIP should avoid a generic “refund anything” workflow inside Aftersales.

Model:

```text
valid return / claim resolution
→ financial consequence
→ refund projection/result from payment contract
```

### Sources

IKEA US — Product Warranties  
https://www.ikea.com/us/en/customer-service/returns-claims/guarantee/

IKEA US — What can I do if my IKEA product has quality issues?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/e180645a-7a2f-4c30-99ce-e340dd1118b3.html

---

# 12. Public source limitation — IKEA internal admin UI

No reliable public evidence was found for IKEA's internal employee-facing Aftersales workbench.

Therefore this research does **not** claim IKEA uses:

```text
specific queue layouts
specific admin tabs
specific case statuses
specific permission matrices
specific warehouse-return screens
specific refund approval screens
```

Admin UI recommendations for GRIP must be derived from GRIP domain needs plus clearly labeled external operational references.

---

# 13. Reference admin pattern — Shopify returns

## R1 — Return is separate from refund

### Observed — Shopify Admin

Shopify documents return processing as distinct concerns:

```text
return request / expected items
→ receive / process returned items
→ issue refund now or later
```

The admin can create returns, handle return shipping information, process returned items and issue refunds.

### GRIP value

Keep operational return state separate from financial refund state.

Do not use one `status` field to mean both.

### Source

Shopify Help — Returns and exchanges  
https://help.shopify.com/en/manual/fulfillment/managing-orders/returns

Shopify Help — Creating and processing returns and exchanges  
https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/creating-returns

---

# 14. Reference domain pattern — commercetools

## R2 — Separate order / shipment / payment / return concerns

### Observed — commercetools Orders API

commercetools represents order, shipment and payment state separately and attaches structured return information to an Order.

Return items also have separate shipment and payment state semantics.

### GRIP value

This reinforces the GRIP Order decision already made:

```text
Order lifecycle
≠ Fulfillment lifecycle
≠ Payment/refund state
≠ Aftersales return/claim lifecycle
```

Aftersales can reference the canonical Order without turning Order into a mega-state machine.

### Source

commercetools — Orders API  
https://docs.commercetools.com/api/projects/orders

---

# 15. Candidate capability map for GRIP

Research supports this minimal semantic map:

```text
Aftersales
├── Return
│   ├── eligibility
│   ├── request
│   ├── reason
│   ├── return instruction / method when supported
│   ├── receipt / processing state
│   └── refund consequence
├── Claim
│   ├── damaged delivery
│   ├── missing item
│   ├── product fault / quality
│   └── warranty
├── Evidence
├── Resolution
│   ├── refund
│   ├── replacement when supported
│   ├── repair when supported
│   └── reject / no coverage
└── Admin operations
```

This map does **not** imply all listed resolutions are available in version 1.

The SRS must restrict them to actual GRIP contracts.

---

# 16. Concepts GRIP should not copy automatically

Research does not justify introducing these capabilities into the current module without an explicit contract:

```text
warehouse receiving / binning / restock
inventory mutation
reverse-logistics carrier purchasing
shipping-label generation
store directory / store return desk operations
spare-parts BOM/catalog
repair-center scheduling
technician dispatch
CRM inbox/chat/call-center tooling
generic goodwill refund
arbitrary exchange repricing
return-fee engine
store-credit wallet
policy authoring engine
AI claim assessment
fraud scoring
```

---

# 17. Research conclusions

The strongest patterns to carry into GRIP are:

1. Start from the historical Order/purchased item whenever possible.
2. Separate normal return from damaged/missing/warranty claims.
3. Resolve eligibility server-side from current policy + purchase evidence.
4. Keep return/claim operational state separate from refund/payment state.
5. Allow partial-item/quantity semantics; do not assume every issue affects the whole Order.
6. Avoid generic exchange complexity; normal exchange can remain return + new purchase.
7. Claim resolution may be replacement/refund/repair/rejection, but only when supported by a real contract.
8. Do not make the customer re-enter Order truth already known by the system.
9. Do not invent IKEA internal admin behavior where no public evidence exists.
10. Keep warehouse, inventory, CRM and payment-gateway administration outside Aftersales.
