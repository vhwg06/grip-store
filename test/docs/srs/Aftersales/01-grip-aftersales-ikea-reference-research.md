# GRIP Aftersales — IKEA / Reference Research

**Status:** Final  
**Pipeline stage:** 01 — External research  
**Module:** Aftersales  
**Surfaces covered:** Public self-service + Admin operations  
**Research date:** 2026-08-27

---

# 1. Purpose

This file records externally verified behavior that can inform the GRIP Aftersales module.

It is **research, not the GRIP specification**.

Research trace:

```text
verified behavior
→ product/domain implication
→ candidate value for GRIP
→ later scope decision in 02-grip-aftersales-srs.md
```

Rules:

- Existing GRIP SRS files remain authoritative for current product boundaries.
- Do not infer IKEA internal/backoffice behavior when it is not publicly documented.
- Public IKEA evidence is used primarily for customer behavior and policy semantics.
- Shopify and commercetools are used only as secondary references for admin/domain patterns that IKEA does not publicly expose.
- A referenced capability does not automatically enter GRIP scope.

---

# 2. Existing GRIP boundary before research

The current GRIP Order SRS explicitly excludes:

```text
return/exchange workflow
warranty claims
warehouse return inspection/restock workflow
full refund orchestration independent from another valid order action
```

and reserves those for a later Aftersales capability.

This means Aftersales starts from an already-placed Order and must not become:

```text
Checkout
Catalog
Account
WMS
Payment gateway console
CRM
```

Order remains the historical purchase authority.

---

# 3. IKEA separates return intent from product/delivery claims

## E1 — Change-of-mind return is a policy-governed flow

### Observed — IKEA US

IKEA US publishes a return policy with different windows for unopened and opened products and requires proof of purchase for the standard full-refund path. Certain categories or conditions are excluded.

IKEA also states that product condition is assessed before the return is accepted.

### Product implication

A return is not simply:

```text
customer clicks Return
→ money refunded
```

It requires at least:

```text
purchase evidence
item/quantity selection
policy eligibility
condition / channel constraints
accepted return
refund outcome
```

### GRIP candidate

Model **Return** as a first-class Aftersales case with explicit eligibility and lifecycle.

Do not derive eligibility purely in the UI from purchase date.

### Sources

- IKEA US — What is IKEA's return policy?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/426ef947-4a4d-42f4-b940-dd12970a04f5.html
- IKEA US — What if my item does not meet the return policy?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/04028083-c5d5-4fd2-9d4d-d6c2c90c6b88.html

---

# 4. Return preparation can be self-service without making acceptance automatic

## E2 — IKEA Express return

### Observed — IKEA US

IKEA allows customers to prepare an in-store return online. The customer supplies proof-of-purchase information, selects products, provides requested details including a reason, submits, receives a barcode, and later brings the product to a store.

The online step accelerates the operation; it does not remove the physical return/assessment step.

### Product implication

A valuable self-service design can separate:

```text
request / preparation
≠
physical receipt / inspection
≠
refund completion
```

### GRIP candidate

Public UI should allow a customer to initiate an eligible return from the canonical Order context and then clearly show what must happen next.

Do not show `Refunded` simply because a return request was submitted.

### Source

- IKEA US — Can I return a product in store? / Express return  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/f41bb8c6-dab2-44c9-b6a7-a9f84be811b6.html

---

# 5. Return logistics are not one universal method

## E3 — Channel varies by item / situation

### Observed — IKEA US

IKEA documents several return routes, including store return, small-item mail return, and large-item pickup/support arrangements. Different locations may not support returns.

### Product implication

Return method should be modeled as an **eligible option/result**, not as a hard-coded universal flow.

Conceptually:

```text
return case + item characteristics + policy/context
→ allowed return method(s)
```

### GRIP candidate

For current GRIP scope, expose only return methods actually supported by backend/operations.

Do not invent labels, carriers, pickup scheduling or store-location workflows unless there is a real contract.

### Sources

- IKEA US FAQ — returns by mail / large-item pickup  
  https://www.ikea.com/us/en/customer-service/faq/
- IKEA US — Can I mail my return to an IKEA store?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/c9d5c73d-7egc-46g2-8183-c87c6928f766.html

---

# 6. Refund is an outcome of an accepted aftersales operation

## E4 — Refund method follows purchase/return rules

### Observed — IKEA US

IKEA normally refunds an accepted return to the original payment method when the standard receipt-supported conditions are met, with documented exceptions using a return/refund card.

### Product implication

`Return` and `Refund` are related but not identical concepts.

```text
Return lifecycle
        ↓ accepted outcome
Refund instruction/status
```

Refund state can lag return acceptance.

### GRIP candidate

Aftersales owns the business decision/outcome that a return or claim requires a refund. A payment/financial contract owns the actual money movement.

Aftersales should expose refund projection/status without becoming payment-gateway administration.

### Source

- IKEA US — If I return a product, how is it refunded?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/0245372e-gcgd-406e-9994-4c3548e9g07c.html

---

# 7. General exchange does not need to be a complex separate transaction type

## E5 — IKEA US general exchange behavior

### Observed — IKEA US

IKEA's current US return guidance states that if the customer wants to exchange an item, the normal pattern is to return the existing item and make a new purchase. Special policies can exist for selected categories such as mattresses.

### Product implication

A generic `Exchange` engine can create unnecessary complexity:

```text
new product reservation
price difference
payment collection/refund
inventory allocation
fulfillment
```

### GRIP candidate

For current scope:

- do **not** build a generic exchange transaction engine;
- represent ordinary change-of-mind exchange as `return + new purchase` guidance;
- allow a **replacement resolution** for damaged/defective claims where the case outcome explicitly supports replacement.

This preserves customer value without pulling Checkout/Inventory back into Aftersales.

### Source

- IKEA US — What is IKEA's return policy?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/426ef947-4a4d-42f4-b940-dd12970a04f5.html

---

# 8. Missing/damaged delivery problems form a different intent from returns

## E6 — Missing merchandise must first distinguish split delivery

### Observed — IKEA US

IKEA instructs customers who believe an item is missing to first verify purchased items and check Track & Manage to determine whether the order was split into multiple deliveries. If the item is still missing, the customer contacts support with the order number.

### Product implication

Aftersales should not create a false claim when current Order fulfillment already explains the apparent issue.

### GRIP candidate

Before starting a missing-item case:

```text
Order / fulfillment truth
→ unresolved delivered quantity?
→ only then allow missing-item issue path
```

Order remains the source for delivery/split-fulfillment facts.

### Sources

- IKEA US — What do I do if I have a missing product?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/g877ed3b-4e47-468e-903e-718818f2g6df.html
- IKEA US — What can I do if something is missing from my delivery?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/74d6d65a-df6f-4f7f-90c3-f779ea35383d.html

---

# 9. Damaged product resolution is outcome-oriented

## E7 — Multiple valid resolutions

### Observed — IKEA US

For products damaged during/after delivery, IKEA documents several potential resolutions depending on context, including replacement, home delivery of a replacement, or refund.

### Product implication

A claim should not be modeled as a forced return.

```text
Issue Claim
→ assess
→ resolution
   ├── replacement
   ├── replacement part
   ├── refund
   └── reject / unsupported
```

The valid outcome depends on policy, item, evidence and operational capability.

### GRIP candidate

Create a first-class **Claim** concept separate from Return.

Admin should choose only domain-supported resolution commands, not freely edit a status field.

### Source

- IKEA US — What can I do if my item was damaged during or after delivery?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/9ef5ebf8-c4bf-449d-97f4-a0cef573807b.html

---

# 10. Missing or damaged parts can be resolved without replacing the full product

## E8 — Spare/replacement part path

### Observed — IKEA US

IKEA may provide or ship a missing/damaged part. For some hardware, a part number from assembly instructions can be used to order a spare part directly.

### Product implication

The smallest effective resolution can be better than a full-product return/replacement.

### GRIP candidate

Current SRS may support a `replacement_part` resolution only if GRIP has a real part-reference/fulfillment contract.

Otherwise the UI should route the customer to support rather than pretending a self-service part catalog exists.

### Sources

- IKEA US — What should I do if my item has missing or damaged parts?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/g7fb36d2-c919-41f3-8936-2g7e6d1e1194.html
- IKEA US — What can I do if my product is missing some parts?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/93d34e4a-3b1c-4989-812e-acdcfaf56ee8.html

---

# 11. Warranty claim is not the same as standard return

## E9 — Warranty eligibility uses product-specific coverage and proof

### Observed — IKEA US

IKEA states that only certain products have extended limited warranties. Warranty claims require proof of purchase, can require inspection and photos, and are decided after evaluation. Warranty duration can differ significantly by product family.

### Product implication

Warranty eligibility requires historical purchase evidence plus a warranty/policy contract.

It must not be represented by one global `within 365 days` rule.

### GRIP candidate

Aftersales should query/use:

```text
Order purchase evidence
+
product/warranty policy reference
+
claim issue/evidence
→ warranty claim eligibility / assessment
```

Catalog can expose current warranty summary, but historical claim eligibility must not silently change because product content is edited later.

### Sources

- IKEA US — What is IKEA Warranty?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/16939445-gb19-415g-8060-55d1bf1e8410.html
- IKEA US — After use, my product stopped working. Is there a warranty?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/1323d2b0-48c2-4e01-bc3e-egcfd19f0e60.html
- IKEA US — Kitchen guarantees  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/e8d6fa84-4b98-4114-8b03-792413b8c7d8.html

---

# 12. Claims need evidence, but evidence requirements are contextual

## E10 — Proof, inspection and photos

### Observed — IKEA US

IKEA's claim/warranty guidance requires proof of purchase and says claims can be subject to inspection; photos may be requested depending on the issue.

### Product implication

Evidence should be driven by claim type/policy, not required globally for every aftersales case.

### GRIP candidate

A Claim can expose a backend-defined evidence requirement such as:

```text
none
text description
photo evidence
inspection required
```

Do not force media upload into ordinary returns unless policy requires it.

### Sources

- IKEA US — How do I make a claim?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html
- IKEA US FAQ — Product warranties  
  https://www.ikea.com/us/en/customer-service/faq/

---

# 13. A case/reference number matters once support work exists

## E11 — Existing claim lookup uses case/order reference

### Observed — IKEA US

IKEA asks customers with an existing claim to provide the case or order number when contacting support.

### Product implication

Once an aftersales case exists, it needs a stable identity independent from the Order identity.

### GRIP candidate

```text
Order #123
└── Aftersales Case AF-456
```

One Order can potentially have multiple independent cases over time or for different items.

### Source

- IKEA US — How do I make a claim?  
  https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html

---

# 14. Secondary admin reference — Shopify

IKEA does not publicly document its internal aftersales admin console. Shopify is therefore used only as a workflow reference, not as evidence of IKEA implementation.

## R1 — Return creation and processing are separate steps

Shopify Admin distinguishes creating a return from processing received return items and issuing a refund. It also supports return reasons and later financial action.

### Useful pattern for GRIP

```text
create/request return
→ expected items
→ receive/assess
→ process resolution/refund
```

This reinforces the same semantic separation found in IKEA's public behavior.

### Source

- Shopify Help Center — Creating and processing returns and exchanges  
  https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/creating-returns

---

# 15. Secondary domain reference — commercetools

## R2 — Return state should not be collapsed into Order state

commercetools models Order state, shipment state, payment state and return information separately. Return items carry their own return shipment/payment state.

### Useful pattern for GRIP

Keep separate concerns:

```text
Order lifecycle            // Order-owned
Aftersales case lifecycle  // Aftersales-owned
Return physical state      // if implemented
Refund projection          // financial contract
```

Do not add `returned` as a magic new Order lifecycle state that destroys partial-item semantics.

### Source

- commercetools HTTP API — Orders / ReturnInfo  
  https://docs.commercetools.com/api/projects/orders

---

# 16. Research synthesis

The strongest product model emerging from the evidence is:

```text
Order
  ↓ historical purchase + fulfillment evidence
Aftersales
├── Return
│   ├── eligibility
│   ├── selected items / quantities
│   ├── reason
│   ├── return method / instructions when supported
│   ├── receipt / assessment
│   └── refund outcome
└── Claim
    ├── missing item
    ├── damaged item
    ├── defective / quality issue
    ├── warranty issue
    ├── evidence / inspection
    └── resolution
        ├── replacement
        ├── replacement part (only if supported)
        ├── refund
        └── rejected / unsupported
```

Key research conclusions:

1. Return and Claim should be separate semantic case types.
2. Submission/request is not equivalent to acceptance or refund completion.
3. Historical purchase proof comes from Order, not current Catalog or Account state.
4. Warranty eligibility is product/policy-specific, not a global return-window rule.
5. A claim can resolve without a return.
6. Refund is an outcome/projection, not the whole Aftersales domain.
7. General-purpose exchange is not required for GRIP current scope; return + new purchase is sufficient unless a specific replacement resolution applies.
8. Warehouse restock and payment gateway operations are separate capabilities and should not leak into current Aftersales UI.
9. Admin should work from a case queue and semantic resolution commands rather than arbitrary status mutation.
10. Public UI should start from Order context whenever possible so item identity and purchase proof do not need to be re-entered.
