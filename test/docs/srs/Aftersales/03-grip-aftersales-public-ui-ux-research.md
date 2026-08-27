# GRIP Aftersales — Public UI/UX Research & Design Guidance

**Status:** Final  
**Pipeline stage:** 03A — UI/UX research  
**Module:** Aftersales  
**Surface:** Public Storefront  
**Authority:** `02-grip-aftersales-srs.md`

---

# 1. Purpose

This file translates the approved Aftersales SRS into customer-facing interaction guidance.

It does **not** expand domain scope.

Design rule:

```text
SRS decides capability + semantics.
This file decides how customers understand and complete those capabilities.
```

Where a suggested UI pattern conflicts with the SRS or an implemented backend contract, the SRS/backend contract wins.

---

# 2. Existing GRIP surfaces this design must compose with

Public Aftersales is not a standalone service portal detached from commerce.

It composes with:

```text
Account
→ My Orders
→ Order detail
→ Aftersales entry

Order
→ historical item + fulfillment truth

Aftersales
→ return / claim case

Catalog
→ optional current product navigation
```

Strongest entry point:

> Start from the customer's existing Order whenever possible.

This avoids asking the customer to rediscover:

- order reference;
- purchased product;
- variant;
- purchase date;
- price;
- quantity;
- delivery identity.

Those facts already exist in Order.

---

# 3. Reference observations that matter for UX

## IKEA — Express return

IKEA lets customers prepare a return online by providing purchase information, selecting items, giving a reason and receiving a return barcode before the physical store step.

Useful interaction lesson:

```text
prepare request
→ clearly explain next operational step
```

Do not make request submission look like completed refund.

Source:  
https://www.ikea.com/us/en/customer-service/knowledge/articles/f41bb8c6-dab2-44c9-b6a7-a9f84be811b6.html

## IKEA — Missing delivery

IKEA asks customers to check split delivery/tracking before escalating a missing-item issue.

Useful interaction lesson:

> Show known Order truth before asking users to file a case.

Source:  
https://www.ikea.com/us/en/customer-service/knowledge/articles/74d6d65a-df6f-4f7f-90c3-f779ea35383d.html

## IKEA — Claim/warranty

Claims can require purchase evidence, description, photo evidence or inspection depending on issue/policy.

Useful interaction lesson:

> Ask only for evidence required for this case, not one giant universal form.

Sources:  
https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html  
https://www.ikea.com/us/en/customer-service/knowledge/articles/1323d2b0-48c2-4e01-bc3e-egcfd19f0e60.html

---

# 4. Public design principles

## P1 — Begin with customer intent, not internal case vocabulary

The customer should see language such as:

```text
Return an item
Something is missing
Item arrived damaged
Product has a quality problem
Warranty help
```

Avoid starting with:

```text
Create ReturnCase
Open Claim
Claim Type = D02
RMA
Disposition
```

`Return` and `Claim` remain important domain semantics, but the initial UI should use customer goals.

## P2 — Never ask twice for known facts

If the flow starts from Order, do not ask customer to type:

```text
order number
product name
SKU
purchase date
purchase price
```

unless verification is required by a separate secure lookup contract.

## P3 — Current truth before action

Before a missing-item claim, show relevant delivery truth.

Before a return, show actual eligible item/quantity.

Before a warranty claim, show only what the backend can safely assert about eligibility.

## P4 — One question per decision layer

Do not build a 20-field Aftersales mega-form.

Use progressive steps:

```text
What do you need help with?
→ Which item?
→ What happened / why return?
→ Required evidence only if needed
→ Return/resolution next step
→ Review
```

## P5 — Submitted is not solved

Case success language must reflect actual state.

Good:

```text
Your request was submitted
Case AFS-123
We'll review it / Bring the item to...
```

Bad:

```text
Done!
Refund complete
```

when refund/assessment has not happened.

## P6 — Put the next customer task above history

On an existing case:

```text
CURRENT STATE
NEXT ACTION

then
case details / timeline
```

The timeline is explanation, not the primary CTA.

## P7 — Make partial-item semantics visible

If an Order contains multiple items or quantity >1, the user must always understand which specific quantity the case affects.

---

# 5. Canonical Public IA

Aftersales should not become a large top-level navigation tree initially.

Recommended semantic IA:

```text
My Account
└── My Orders
    └── Order Detail
        ├── Return an item
        └── Report a problem

My Account
└── Returns & claims
    ├── Case list
    └── Case detail
```

The standalone `Returns & claims` destination is useful for tracking existing cases.

Case creation should still prefer Order context.

---

# 6. Order Detail integration

The Order page is the highest-value Aftersales entry.

Do not add a giant generic `Support` area disconnected from line items.

For each eligible Order or line, the owning Order surface can expose a compact semantic entry:

```text
Need help with this order?
[Return an item]
[Report a problem]
```

Eligibility rules:

- if no returnable item exists, hide/disable Return according to product convention;
- if no supported claim path exists, use approved help/support link rather than fake self-service;
- do not derive eligibility from visual order status only.

### Placement

The entry should appear after the customer has seen current fulfillment status and purchased items, not before the order identity/status header.

Reason:

For “missing item,” the existing delivery state can resolve the question without a case.

---

# 7. Entry chooser — Return vs problem

First screen should answer one question:

> What do you need help with?

Suggested semantic grouping:

```text
Return
- Return an item

Problem with an order/item
- Something is missing
- Item arrived damaged
- Product has a quality problem
- Warranty help
```

Do not show unsupported choices merely because they exist in the SRS as possible semantics.

### Card vs list pattern

Use simple tappable rows/cards with:

- short label;
- one explanatory line where ambiguity exists;
- no decorative marketing copy;
- no internal status/code.

At mobile width, one-column list is sufficient.

---

# 8. Return flow

Canonical UX:

```text
Order detail
→ Return an item
→ Choose item(s) + quantity
→ Reason, if required
→ Return method / next-step option, if supported
→ Review request
→ Submit
→ Case confirmation
```

## 8.1 Item selection

Each selectable line should show Order-owned snapshot context:

```text
thumbnail if available
purchase-time product title
variant/selection label
quantity purchased
quantity still eligible
purchase-time amount only when useful
```

Do not replace historical item name/price with current Catalog values.

### Quantity

For quantity >1, use explicit quantity control bounded by backend-provided returnable quantity.

Do not let the customer choose an impossible value and then fail late.

### Ineligible line

If some lines are ineligible while others are eligible:

- keep the Order understandable;
- explain ineligible line using customer-safe backend reason when available;
- do not block eligible siblings.

## 8.2 Return reason

Only show if required.

Good control:

```text
Why are you returning this?
[backend-supported options]
```

Optional free text appears only if contract supports it.

Do not create a taxonomy inside Figma that backend does not have.

## 8.3 Return method

If exactly one method exists:

- show it as the next step;
- do not make the user “select” a single fake choice.

If multiple methods are eligible:

Each option should expose decision-relevant differences actually provided by backend, for example:

```text
method name
where/how to return
fee, if applicable
important timing / instruction
```

Do not invent carrier labels, store inventory or pickup slots.

## 8.4 Review

Before submit show a compact immutable summary:

```text
Order
Items + quantity
Reason
Return method / next step
Known refund expectation only if backend can state it
```

The primary CTA should describe the consequence:

```text
Submit return request
```

not generic `Continue` on the final step.

## 8.5 Confirmation

Confirmation must include:

```text
case reference
actual case state
next required action
return instructions / deadline if supplied
link to case detail
link back to Order
```

Avoid celebratory success styling for an unresolved case.

---

# 9. Missing-item flow

This flow has a critical pre-check.

```text
Customer says missing
→ show current fulfillment truth
→ is item still in legitimate split/in-progress delivery?
```

## 9.1 Still on the way

If Order says the item is in another active fulfillment:

Show:

```text
This item is in another delivery
current status
estimate/tracking if available
```

Primary action should be Order tracking, not `Submit claim`.

Offer claim/support only when backend still permits escalation.

## 9.2 Delivery says it should be present

Then continue:

```text
select affected item + quantity
→ minimal description if required
→ evidence only if contract requests it
→ review
→ submit
```

This prevents duplicate or premature support work.

---

# 10. Damaged / quality / warranty flow

These issue types share layout grammar but not necessarily eligibility/evidence rules.

Canonical skeleton:

```text
Issue kind
→ affected item + quantity
→ describe problem
→ required evidence
→ policy/eligibility result where safe
→ review
→ submit
```

## 10.1 Description

Ask for customer language:

```text
Tell us what happened
```

Avoid forcing customers to diagnose internal failure categories.

## 10.2 Photo evidence

When required:

- state why photos are needed;
- show count/type constraints returned by product contract;
- show upload progress/failure clearly;
- allow retry/remove;
- never show a successful file state before upload completion.

When not required, omit the whole media section.

## 10.3 Warranty

Do not make customers browse warranty PDF/legal detail before starting.

If eligibility can be resolved:

```text
This purchase may be covered
```

or equivalent safe language can be shown according to backend result.

If assessment is required, say so.

Never promise approval solely because date appears inside a warranty window.

---

# 11. Existing case list

Semantic destination:

```text
Returns & claims
```

List should optimize recognition and next action.

Each case row/card:

```text
case reference
Return / Problem label
source order reference
created date
affected item summary
current customer-facing state
next-action badge only if customer action exists
```

Default order: most recently updated/created according to product contract; choose one consistent rule.

No need for advanced filters at low case volume.

Candidate minimal filter only if needed:

```text
Open
Resolved
```

Do not copy Admin filter complexity to Public.

---

# 12. Public case detail

Recommended hierarchy:

```text
1. Case reference + source order
2. Current state
3. Next customer action / important instruction
4. Affected items
5. Resolution / refund / replacement projection
6. Submitted issue / reason / evidence summary
7. Timeline
8. Help route
```

## 12.1 State language

Translate domain state into plain customer language without changing meaning.

Examples:

```text
requested / submitted        → Request submitted
awaiting_return              → Waiting for your return
received                     → Item received
assessing / reviewing        → We're reviewing it
additional_info_required     → We need more information
resolution_in_progress       → Resolution in progress
resolved                     → Resolved
rejected                     → Not approved
```

Final copy should use product language chosen globally.

Do not show backend enums verbatim.

## 12.2 Next action card

If customer action is needed, use a compact high-priority task area.

Examples:

```text
Return the item by [date]
Provide requested photos
Review replacement details
```

Only show data actually provided by backend.

## 12.3 Refund projection

Refund block should show separate state.

Example hierarchy:

```text
Refund
Amount: ...            // backend-provided
Status: Processing
Method: ...            // only if safe/available
```

Never infer “money received” from case resolution alone.

## 12.4 Replacement projection

Show:

```text
Replacement approved
reference / status if supplied
tracking link if downstream contract exposes it
```

Do not recreate fulfillment management inside Aftersales.

---

# 13. Empty states

## No cases

Useful copy direction:

```text
No returns or claims yet.
If you need help with an order, open My Orders and choose the order.
```

Primary CTA:

```text
View my orders
```

Do not add generic contact/support CTA as the first action when self-service begins from Order.

## No eligible return items

Explain:

```text
There are no items currently available for self-service return in this order.
```

Then show customer-safe policy/support route when defined.

Do not silently present an empty item selector.

---

# 14. Error and stale-state behavior

Aftersales is stateful; eligibility can change while the customer is acting.

Required patterns:

## Eligibility changed before submit

```text
Your request couldn't be submitted because this order changed.
[refresh latest eligibility]
```

Preserve non-sensitive form input when safe.

## Case mutation conflict

When additional-info action or cancellation becomes stale:

- do not fake success;
- reload canonical case state;
- explain latest state.

## Upload failure

Keep other form data and allow retry.

## Backend unavailable

Do not remove existing case history or imply the case disappeared.

---

# 15. Mobile composition

Public Aftersales must be comfortable on mobile because aftersales often occurs near the physical product/delivery.

Mobile principles:

- one primary task per viewport section;
- full-width item rows/cards;
- sticky bottom CTA only when it does not cover important instruction/error content;
- evidence upload reachable from device media flow;
- concise state/next-action summary before timeline;
- no desktop table compressed into horizontal scrolling.

### Return item selection mobile

Use stacked cards with quantity control below item identity.

### Case detail mobile

Order:

```text
state
next action
items
resolution
history
```

Do not place a long metadata sidebar above the actual task.

---

# 16. Desktop composition

Desktop can use wider context but should stay simple.

Recommended detail composition:

```text
Main column
- state + next action
- affected items
- issue / resolution
- timeline

Secondary rail
- case reference
- source Order link
- created/updated metadata
- help link
```

Do not turn public case detail into an admin dashboard.

For creation flows, a centered bounded form width is preferable to a full-screen dense grid.

---

# 17. Cross-module navigation

## Order

Always preserve easy route:

```text
View order
```

Order owns tracking/purchase truth.

## Catalog

A current product link is optional.

Never use current product page as the only way to identify historical affected item.

## Account

Customer profile/address editing is not part of case flow unless another contract explicitly requires it.

## Content/help

Contextual help links may appear after the main task and must route to Content/help source rather than duplicate large policy prose inside the transactional UI.

---

# 18. Accessibility

Required considerations:

- state cannot rely on color alone;
- item selection uses semantic controls and clear labels;
- upload controls expose progress/error text;
- focus moves to validation summary/first error after failed submit;
- timeline is readable in document order;
- destructive/cancel-case confirmation has clear action naming;
- touch targets support mobile use;
- image evidence preview has accessible remove/retry labels.

---

# 19. Public canonical screen/state inventory

Design should cover at least:

```text
Order detail — Aftersales eligible entry
Order detail — no self-service eligibility
Intent chooser
Return item selection
Return reason
Return method / instructions
Return review
Return confirmation
Missing item — still in split delivery
Missing item — claim eligible
Damage/quality/warranty issue input
Evidence required
Evidence upload failure
Claim review
Claim confirmation
Returns & claims — empty
Returns & claims — populated
Case detail — awaiting customer return
Case detail — reviewing
Case detail — additional info required
Case detail — refund pending
Case detail — replacement in progress
Case detail — resolved
Case detail — rejected
stale eligibility/error
not found / unauthorized-safe failure
```

Not every state requires a separate route/frame if interaction design can represent it faithfully.

---

# 20. Explicit UI exclusions

Do not design:

```text
warehouse restock screen
shipping label purchase console
carrier setup
refund amount calculator
payment credentials
manual refund form
generic exchange configurator
inventory availability editor
repair technician scheduler
CRM conversation inbox
return analytics dashboard
policy rule builder
```

These are outside `02-grip-aftersales-srs.md`.

---

# 21. Design acceptance checklist

A Public Aftersales design is ready only if all are true:

```text
[ ] Creation starts from Order context where possible.
[ ] Customer chooses intent in plain language.
[ ] Return and Claim are not visually/semantically collapsed.
[ ] Item + quantity affected by case are always understandable.
[ ] Missing-item path checks current fulfillment truth first.
[ ] Evidence is conditional, not universally required.
[ ] Submit state does not pretend case is approved/resolved.
[ ] Refund state is visibly distinct from case state.
[ ] Next customer task is above timeline/history.
[ ] Historical Order data is not replaced with current Catalog data.
[ ] Mobile flow is task-first and does not compress desktop tables.
[ ] No unsupported exchange/WMS/payment behavior appears.
[ ] Error/stale-state designs refresh canonical state rather than fake success.
```

---

# 22. Design handoff

The strongest public mental model is:

```text
I bought this
→ I need help with this specific item
→ tell GRIP what happened
→ give only necessary evidence
→ understand what happens next
→ track the case until resolved
```

The UI should feel like a continuation of the Order journey, not a separate enterprise support application.
