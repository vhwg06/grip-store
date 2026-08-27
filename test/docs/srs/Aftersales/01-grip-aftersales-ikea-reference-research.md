# GRIP Aftersales — IKEA Reference Research

**Status:** Final  
**Pipeline stage:** 01 — External research  
**Module:** Aftersales  
**Market:** IKEA United States  
**Research date:** 2026-08-27

---

# 1. Purpose

This file records **publicly observable IKEA behavior only** for returns, missing/damaged purchases, product quality problems and warranty claims.

It is not an inferred IKEA domain model and it is not the GRIP specification.

Research rule:

```text
IKEA public evidence
→ observed behavior
→ possible GRIP value
```

Anything described as a GRIP decision belongs in `02-grip-aftersales-srs.md` and must not be presented as something IKEA internally models or owns.

---

# 2. Existing GRIP boundary

The existing Order SRS already excludes:

```text
return / exchange workflow
warranty claims
warehouse return processing
independent refund orchestration
```

Therefore Aftersales begins only after a GRIP Order exists.

This research does not change ownership already defined in:

- `../Order/02-grip-order-srs.md`
- `../Account/02-grip-account-srs.md`
- `../catalog/srs_001_product.md`
- `../checkout/checkout_srs.md`

---

# 3. What IKEA publicly calls a claim

## Observed — IKEA US

IKEA's public article **How do I make a claim?** introduces the flow as:

> trouble with a product or delivery

The customer is directed to Customer Service by phone/chat when the FAQ does not resolve the problem.

For an existing claim, IKEA asks for a **case number or order number**.

IKEA also states that missing/damaged issues should be reported within **7 days** after purchase or home delivery.

### What this proves

Publicly observable IKEA behavior supports this statement:

```text
Claim
= a customer-service case concerning a problem
  with a product or delivery
```

### What this does NOT prove

The public material does not establish IKEA's internal:

```text
Claim aggregate
Claim lifecycle enum
Claim ownership boundary
assessment state machine
refund orchestration model
admin case schema
```

Those must not be attributed to IKEA without separate evidence.

### Source

IKEA US — How do I make a claim?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html

---

# 4. Change-of-mind return

## Observed — IKEA US

IKEA permits returns when a customer is not satisfied or changes their mind.

Current published policy states:

- new/unopened products: return within 365 days with proof of purchase;
- opened products: return within 180 days with proof of purchase;
- some product categories/conditions are excluded;
- returned merchandise is assessed before the full-refund condition is accepted;
- refund is normally made to the original payment method;
- for a normal exchange, the customer first returns the old item and then makes a new purchase.

### Important distinction

This is explicitly a **return-policy** flow. IKEA does not describe ordinary change-of-mind returns as a product/delivery claim.

### GRIP value candidate

GRIP should preserve a visible difference between:

```text
I changed my mind / want to return
```

and:

```text
there is a problem with the product or delivery
```

The exact GRIP domain structure is decided later in the SRS.

### Sources

IKEA US — What is IKEA's return policy?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/426ef947-4a4d-42f4-b940-dd12970a04f5.html

IKEA US — Can I return an opened or assembled product?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/1dfe6100-2442-4647-9569-22f99238g065.html

---

# 5. Express return is online preparation, not proof of completed refund

## Observed — IKEA US

IKEA provides an Express Return flow for in-store returns.

The customer can prepare the return online, including selecting the purchase/products and supplying requested return information. IKEA sends a return barcode by SMS/email, and the customer must still bring the product to an IKEA store within the stated period.

The published flow therefore contains at least two observable stages:

```text
online return preparation
→ physical store return
```

The online submission itself is not described as completion of the physical return or refund.

### GRIP value candidate

Do not design `request submitted` as equivalent to `refund completed`.

### Source

IKEA US — Can I return a product in store? / Express return  
https://www.ikea.com/us/en/customer-service/knowledge/articles/f41bb8c6-dab2-44c9-b6a7-a9f84be811b6.html

---

# 6. Missing item after delivery

## Observed — IKEA US

When something appears missing after delivery or pickup, IKEA tells the customer to first:

1. confirm the item was actually included in the order;
2. check all packages/boxes;
3. check whether the order was split across multiple deliveries in **Track & manage my order**;
4. contact IKEA Customer Service if the item is still missing.

### What this proves

IKEA does not immediately treat every apparent missing item as an independent claim form.

Existing Order/fulfillment information is checked first.

### GRIP value candidate

Before GRIP offers escalation for a missing item, the UI should surface canonical Order fulfillment truth where available.

### Source

IKEA US — What can I do if something is missing from my delivery?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/74d6d65a-df6f-4f7f-90c3-f779ea35383d.html

---

# 7. Damaged item during or after delivery

## Observed — IKEA US

### Damage noticed during delivery

IKEA states that the delivery driver can report damage immediately. An IKEA co-worker can process a damage report, arrange a replacement and communicate a new delivery date.

### Damage noticed after delivery

IKEA tells the customer to contact Customer Service with the order number/order confirmation.

Published resolution options include:

```text
replace at an IKEA store, if available
arrange home delivery of a replacement
refund the damaged item
```

The exact option depends on availability/context and is handled with an IKEA co-worker.

### GRIP value candidate

For damaged-item support, only show resolution options that the backend/operations actually supports.

Do not infer a generic mandatory return step because IKEA explicitly shows replacement/refund paths that do not all share one published sequence.

### Source

IKEA US — What can I do if my item was damaged during or after delivery?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/9ef5ebf8-c4bf-449d-97f4-a0cef573807b.html

---

# 8. Missing product parts

## Observed — IKEA US

If a product is missing parts, IKEA first asks the customer to check all boxes and identify whether the missing part has a code in the assembly guide.

Depending on the part, IKEA may support:

```text
order the part online
pick up the part at an IKEA store
arrange delivery through Customer Service
```

### GRIP value candidate

A missing-part problem does not necessarily imply replacing or returning the entire product.

GRIP should expose a spare/replacement-part path only if GRIP actually has a supported part identity and fulfillment contract.

### Source

IKEA US — What can I do if my product is missing some parts?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/93d34e4a-3b1c-4989-812e-acdcfaf56ee8.html

---

# 9. Product quality issue / product stopped working

## Observed — IKEA US

IKEA tells customers with a product quality problem to check whether the purchase is still inside the ordinary return policy or covered by an extended warranty.

The customer should have proof of purchase/order information available.

For covered quality issues, IKEA publicly describes possible outcomes including:

```text
replacement
home delivery of replacement
refund
```

### GRIP value candidate

Quality-problem support should not hard-code one global return window or one universal resolution.

### Sources

IKEA US — What can I do if my IKEA product has quality issues?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/e180645a-7a2f-4c30-99ce-e340dd1118b3.html

IKEA US — After use, my product stopped working. Is there a warranty?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/1323d2b0-48c2-4e01-bc3e-egcfd19f0e60.html

---

# 10. Warranty claim

## Observed — IKEA US

IKEA states that only certain products have extended limited warranties.

For a warranty claim:

- proof of purchase is required;
- the claim is subject to inspection;
- photos may be requested;
- an IKEA co-worker makes the final decision.

### What this proves

Warranty support is not simply `purchase_date < global_duration`.

IKEA publicly exposes evaluation/inspection as part of warranty handling.

### What this does NOT prove

The public source does not define IKEA's internal warranty-claim state machine or software architecture.

### Source

IKEA US — How do I make a claim?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html

---

# 11. Observable IKEA problem categories and outcomes

The following table is evidence-backed at the public behavior level.

| Customer problem | Observable IKEA path | Observable outcomes |
| --- | --- | --- |
| Change of mind / not satisfied | Return policy / Express Return / store or supported return route | accepted return → refund; ordinary exchange = return then new purchase |
| Missing order item | verify order + boxes + split delivery, then Customer Service | support resolution not fully enumerated publicly in the cited article |
| Item damaged in/after delivery | delivery report or Customer Service | store replacement, home-delivered replacement, refund |
| Missing product part | check boxes + part code / Customer Service | online part order, store pickup, part delivery depending on part |
| Quality issue | check return/warranty coverage + Customer Service | replacement or refund where conditions are met |
| Warranty issue | proof of purchase + possible photos + inspection + co-worker decision | final remedy depends on warranty decision |

---

# 12. Research conclusions for GRIP

Only the following conclusions are safe to carry forward from IKEA evidence:

1. **Return** is a customer flow for change-of-mind/not-satisfied purchases and is governed by return policy.
2. IKEA uses **claim** as a customer-service concept for trouble with a product or delivery.
3. A missing item should be checked against Order/split-delivery truth before escalation.
4. Damaged-item support can lead to replacement or refund.
5. Missing parts can have a smaller part-specific remedy.
6. Quality/warranty handling can require proof, photos and inspection.
7. IKEA has a stable case/order reference for an already-open claim.
8. Public IKEA material does **not** justify inventing a detailed internal Claim lifecycle or backoffice model.

The GRIP SRS may make product/domain decisions from these observations, but every such decision must be labeled as **GRIP behavior**, not as an IKEA fact.
