# GRIP Aftersales — Public UI/UX Research & Design Guidance

**Status:** Final  
**Pipeline stage:** 03A — UI/UX research  
**Module:** Aftersales  
**Surface:** Public Storefront  
**Authority:** `02-grip-aftersales-srs.md`

---

# 1. Purpose

This file converts the approved Aftersales SRS into public interaction guidance while preserving the IKEA evidence boundary.

Rule:

```text
IKEA evidence tells us what observable customer behavior exists.
GRIP SRS decides which behavior GRIP supports.
UI/UX must not invent missing domain/workflow semantics.
```

---

# 2. IKEA public behavior that is safe to design from

## Return

IKEA publicly supports:

```text
change-of-mind return
proof-of-purchase based policy
online Express Return preparation
item selection / requested return information
return barcode
physical store return
refund after accepted return conditions
```

Normal exchange is described as:

```text
return old item
→ make a new purchase
```

Sources:

- https://www.ikea.com/us/en/customer-service/knowledge/articles/426ef947-4a4d-42f4-b940-dd12970a04f5.html
- https://www.ikea.com/us/en/customer-service/knowledge/articles/f41bb8c6-dab2-44c9-b6a7-a9f84be811b6.html

## Missing delivery item

IKEA tells customers to:

```text
check order confirmation
check all boxes
check split deliveries in Track & manage my order
→ contact Customer Service if still missing
```

Source:

https://www.ikea.com/us/en/customer-service/knowledge/articles/74d6d65a-df6f-4f7f-90c3-f779ea35383d.html

## Damaged item

IKEA publicly exposes Customer Service handling and possible outcomes such as:

```text
replace at store
home-delivered replacement
refund
```

Source:

https://www.ikea.com/us/en/customer-service/knowledge/articles/9ef5ebf8-c4bf-449d-97f4-a0cef573807b.html

## Missing product part

IKEA may let the customer:

```text
order coded part online
pick up part in store
arrange part delivery through Customer Service
```

Source:

https://www.ikea.com/us/en/customer-service/knowledge/articles/93d34e4a-3b1c-4989-812e-acdcfaf56ee8.html

## Quality / warranty

IKEA asks for purchase evidence and may require photos/inspection. Warranty decision is made after evaluation; covered issues can lead to replacement or refund depending on the situation.

Sources:

- https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html
- https://www.ikea.com/us/en/customer-service/knowledge/articles/e180645a-7a2f-4c30-99ce-e340dd1118b3.html
- https://www.ikea.com/us/en/customer-service/knowledge/articles/1323d2b0-48c2-4e01-bc3e-egcfd19f0e60.html

---

# 3. What must NOT be copied as if IKEA does it

There is no sufficient public evidence for an IKEA customer UI with a universal flow such as:

```text
Create claim
→ Reviewing
→ Additional info required
→ Approved
→ Resolution in progress
→ Resolved
```

There is also no public evidence that IKEA exposes one unified self-service claim wizard covering every problem type.

Therefore GRIP design must not use those structures unless the GRIP backend/SRS explicitly adds them.

---

# 4. Compose with existing GRIP Order

The strongest GRIP entry remains:

```text
Account
→ My Orders
→ Order Detail
→ aftersales intent
```

Reason:

Order already owns:

```text
order reference
purchase-time product identity
quantity
purchase date
fulfillment/tracking truth
```

Do not ask the customer to type those facts again when they are already authenticated and inside the Order.

---

# 5. Customer intent navigation

Use customer language, not internal domain vocabulary.

Recommended semantic choices:

```text
Return an item
Something is missing from my order
Item arrived damaged
Product is missing a part
Product has a quality problem
Warranty help
```

Avoid making `Claim` the first choice merely because IKEA uses the word in Customer Service documentation.

The customer should choose the problem they actually recognize.

---

# 6. Return UI

This is the strongest candidate for genuine self-service because IKEA publicly exposes Express Return preparation.

Canonical GRIP shape:

```text
Order detail
→ Return an item
→ select backend-eligible item(s) + quantity
→ return reason, if required
→ supported method/instructions
→ review
→ submit / prepare return
→ actual next step
```

## Item selection

Render historical Order snapshot information:

```text
purchase-time product title
variant/selection
quantity purchased
quantity currently returnable
```

Do not silently replace historical facts with current Catalog values.

## Return eligibility

UI consumes backend eligibility.

Do not hard-code:

```text
if purchase_date < 180 days → eligible
```

The IKEA policy has conditions/exclusions and GRIP policy may differ.

## Return reason

Show only when required by the GRIP contract.

Do not invent a reason taxonomy in Figma.

## Return method

If backend provides one method, show it as instruction rather than a fake choice.

If backend provides multiple methods, show only the information needed to choose among them.

## Confirmation

Use precise state language.

Good:

```text
Return request prepared
Bring these items to...
```

Bad:

```text
Return complete
Refunded
```

when the physical return/refund has not completed.

---

# 7. Missing-order-item UI

Follow IKEA's observable troubleshooting order.

Canonical shape:

```text
Something is missing
→ show purchased item / expected quantity
→ show fulfillment groups / split delivery
→ item still on the way?
   ├── yes → continue tracking
   └── no  → supported Customer Service/case path
```

Do not begin with a large evidence form.

The Order information may resolve the customer's concern without opening a case.

If GRIP does not yet support self-service issue submission, the correct outcome is a contextual support route, not a fake submit button.

---

# 8. Damaged-item UI

IKEA publicly routes this through delivery reporting / Customer Service and exposes several possible remedies.

GRIP should therefore structure the UI around:

```text
identify affected purchased item
→ explain damage / supply required evidence if backend asks
→ show actual available next action or support route
```

Do not assume every damaged item must first be returned.

Do not display all of these permanently:

```text
Replace
Refund
Home delivery
```

The action set must come from actual GRIP capability/state.

---

# 9. Missing-part UI

A missing part is not the same customer task as a missing entire Order item.

Recommended entry copy:

```text
Product is missing a part
```

If GRIP has a supported part-reference system:

```text
identify product
→ identify part/code
→ show supported obtain-part option
```

If GRIP does not have that contract:

```text
show product/order context
→ route to Customer Service
```

Do not invent a spare-parts picker from IKEA screenshots/text alone.

---

# 10. Quality-problem UI

Canonical minimal shape:

```text
Product has a quality problem
→ identify purchased item
→ explain problem
→ collect only backend-required evidence
→ show coverage/support path
```

The customer should not need to diagnose an internal defect code.

Ask in customer language:

```text
Tell us what happened
```

If photos are required:

- explain why;
- show actual count/size/type constraints;
- show upload progress/failure honestly;
- preserve the rest of the form on failure.

If photos are not required, omit the upload section entirely.

---

# 11. Warranty-help UI

Do not imply warranty approval from date alone.

Useful information hierarchy:

```text
purchased item
purchase date / order reference
known warranty information if authoritative
what information IKEA/GRIP needs next
inspection/photo requirement if any
```

Use cautious copy when evaluation is still required.

Good:

```text
This product may be covered. We'll need to review the issue.
```

Bad:

```text
Your warranty claim is approved
```

before actual decision.

---

# 12. Existing case/reference UI

IKEA publicly refers to an existing claim by case or order number, so a GRIP case reference is reasonable when the backend implements persistent cases.

If a case exists, its detail may show:

```text
case reference
source order
customer-safe current status
affected item(s)
latest instruction / outcome
supported downstream refund/replacement reference
```

But the UI must not fabricate a fixed lifecycle or stepper.

If backend only provides:

```text
Open
Resolved
```

then design those states honestly instead of inventing five intermediate phases.

---

# 13. Do we need a standalone “Returns & claims” page?

Not automatically.

IKEA evidence proves that an existing claim has a case/order reference, but it does not prove the exact account IA GRIP should use.

GRIP decision:

- Order detail is sufficient as the primary creation/entry point now.
- Add a standalone Aftersales case list only when backend/product requirements justify repeated case tracking.

Do not create extra navigation simply because the domain has a name.

---

# 14. Status language

Status copy must come from real backend semantics.

Do not design a universal vocabulary first and force backend behavior into it.

Translation principle:

```text
backend state
→ customer-safe plain language
```

not:

```text
Figma stepper
→ backend must implement these states
```

---

# 15. Refund presentation

Where a downstream financial projection exists, keep it separate from the support/return fact.

Example:

```text
Refund
Amount: backend-provided
Status: backend-provided
```

Do not calculate from current Catalog price.

Do not infer `money received` from `return accepted` or `case resolved`.

---

# 16. Replacement presentation

Where the supported flow creates a replacement, show only returned downstream information:

```text
replacement reference
current status
tracking / canonical link when available
```

Do not duplicate warehouse/fulfillment administration in public Aftersales.

---

# 17. Error / stale behavior

For any consequential submission:

```text
submit
→ backend validates current eligibility/capability
→ success: render canonical result
→ stale/ineligible: explain latest state and refresh
```

Do not show optimistic fake final success.

Upload failures must preserve other safe user input.

Order/Catalog link failures must not make an already-created Aftersales reference disappear.

---

# 18. Mobile guidance

Aftersales is naturally mobile-heavy because customers may be standing next to the delivered product.

Use:

- one clear task per section;
- stacked item cards;
- large media-upload controls when needed;
- Order status before missing-item escalation;
- explicit next step after return preparation;
- no compressed desktop tables.

---

# 19. Desktop guidance

Keep public desktop similarly simple.

Creation/support flow:

```text
bounded main column
Order/item context
current question/action
```

Existing case/detail, when implemented:

```text
main: current status + action + affected items
secondary: case/order references + help
```

Do not make public Aftersales look like an operator dashboard.

---

# 20. Figma design gate

Before creating a Public Aftersales screen/state, the designer must answer:

1. Which requirement in `02-grip-aftersales-srs.md` authorizes it?
2. Is the behavior directly observed at IKEA, or a clearly labeled GRIP decision?
3. If it is a state/action, does a real backend contract support it?
4. Does the design reuse Order truth instead of asking for known facts again?
5. For missing items, is split-delivery truth shown before escalation?
6. For return submission, does the UI avoid implying refund completion?
7. Has any invented universal Claim lifecycle/wizard slipped back in?

If any answer is unclear, do not invent the screen/state.
