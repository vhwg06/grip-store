# GRIP Aftersales — Admin UI/UX Research

**Status:** Final  
**Pipeline stage:** 03B — Admin UI/UX research  
**Module:** Aftersales  
**Surface:** Admin Console  
**Authority:** `02-grip-aftersales-srs.md` + existing GRIP SRS boundaries

---

# 1. Purpose

This document translates the approved Aftersales domain into a low-ambiguity Admin workflow for operators.

It does **not** attempt to recreate IKEA's internal backoffice. Public evidence for IKEA's employee-facing return/claim console is not available.

Admin guidance therefore comes from:

```text
GRIP SRS boundaries
+ verified IKEA customer/process semantics
+ external operational return patterns where useful
```

The UI must not create capabilities that the SRS does not authorize.

---

# 2. Authoritative neighboring modules

Admin Aftersales must compose existing domains instead of becoming a generic operations super-screen.

```text
../Order/02-grip-order-srs.md
    Order truth + fulfillment + payment/refund projection

../Account/02-grip-account-srs.md
    customer identity/profile

../catalog/srs_001_product.md
    current Catalog truth

02-grip-aftersales-srs.md
    return/claim cases + decisions + resolutions
```

Cross-domain information inside Aftersales is read-only context or navigation unless the owning module explicitly publishes a command.

---

# 3. External workflow findings

## IKEA process evidence

Public IKEA guidance shows that operators may need to evaluate:

- proof of purchase/order context;
- whether a reported item is actually missing versus split delivery;
- damaged/faulty product circumstances;
- warranty eligibility/evidence;
- replacement/refund options after evaluation.

This means the Admin case detail needs decision-relevant Order context, not only a text ticket.

Sources:

- https://www.ikea.com/us/en/customer-service/knowledge/articles/74d6d65a-df6f-4f7f-90c3-f779ea35383d.html
- https://www.ikea.com/us/en/customer-service/knowledge/articles/9ef5ebf8-c4bf-449d-97f4-a0cef573807b.html
- https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html

## Shopify Admin reference

Shopify separates:

```text
return creation
→ expected returned items
→ processing/receiving
→ refund now or later
```

It also supports partial processing and explicit return management.

The useful GRIP lesson is concern separation, not feature parity.

Sources:

- https://help.shopify.com/en/manual/fulfillment/managing-orders/returns
- https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/creating-returns

## commercetools domain reference

commercetools models Order, shipment, payment and return state separately.

This supports the existing GRIP rule that Aftersales lifecycle must not be represented by mutating one Order mega-status.

Source:

- https://docs.commercetools.com/api/projects/orders

---

# 4. Admin product philosophy

GRIP Admin is for operators who need to resolve work quickly without deep ecommerce/domain knowledge.

Therefore:

> Show the problem, the evidence, the valid next actions, and the consequence.

Do not expose infrastructure/domain internals and expect the operator to derive the business action.

Bad pattern:

```text
status dropdown = UNDER_REVIEW / RMA_04 / FIN_PENDING
```

Preferred pattern:

```text
Current: Waiting for review
Actions:
- Approve return
- Reject return
- Request more information
```

---

# 5. Admin information architecture

Current Aftersales Admin should remain small:

```text
Aftersales
├── Work queue
└── Case detail
```

Optional saved queue views can exist only when they are justified by volume and supported by the query contract.

Do not create separate top-level products for:

```text
Returns
Claims
Refunds
Warranty
Warehouse returns
```

unless future scale/product requirements demand it.

A single queue with case-type/status filtering is simpler and still preserves semantic distinctions in detail.

---

# 6. Queue-first workflow

The default Admin destination should answer:

> What requires attention now?

Recommended default priority groups:

```text
needs information / customer replied
new claims awaiting review
return requests awaiting decision
received returns awaiting resolution
approved cases with unresolved financial/replacement outcome
```

Exact sorting is a backend/product policy decision.

Do not encode SLA logic in the UI unless the domain publishes it.

---

# 7. Queue row information

Every row/card should provide enough context to decide whether to open it without becoming a mini-case detail.

Candidate projection:

```text
case reference
case type
current status
order reference
customer display identity
primary item summary
created / last-updated time
attention indicator derived from backend
refund/resolution warning only when operationally useful
```

Avoid showing:

```text
full address
full evidence gallery
all order lines
long customer description
internal object IDs
```

in the queue.

---

# 8. Search

Operators should not need internal IDs.

Search should use backend-supported human-recognizable identifiers such as:

```text
case reference
order reference
customer name
email
phone
```

If SKU/product search is reliable and supported, it can be added later.

Do not simulate search client-side over a partial loaded page.

---

# 9. Filtering

Useful filters, only when supported:

```text
case type
status
issue/reason
created date
resolution state
refund state
```

Recommended default filter design:

- small number of high-value dimensions;
- human language;
- easy clear/reset;
- active filter summary visible;
- filter state shareable/persisted only if the application already has that pattern.

Avoid a BI-style advanced filter builder for routine work.

---

# 10. Case detail hierarchy

The Admin detail should be organized around operator judgment.

Recommended hierarchy:

```text
1. Case summary + current state
2. Valid next actions
3. Customer request / issue
4. Affected purchased item(s) + quantities
5. Relevant Order/fulfillment context
6. Evidence
7. Resolution / financial consequence
8. Activity / audit
9. Cross-domain links
```

The action area should not float independently from the state/evidence needed to understand the consequence.

---

# 11. Case header

Header should make the case recognizable:

```text
case reference
case type
current state
created time
linked order reference
customer display identity
```

Use badges/pills only as secondary scanning aids.

The status must also be readable as text with clear meaning.

---

# 12. Customer request section

Show what the customer actually submitted:

```text
reason / issue type
description if present
requested quantity
return method if chosen
customer-provided evidence
```

Keep customer-authored facts visually distinct from operator notes/decisions.

Do not silently rewrite the customer's original issue text.

---

# 13. Order context section

Aftersales needs enough Order evidence for a decision without cloning Order Admin.

Minimum useful projection:

```text
order reference
purchase date
historical item snapshot
quantity purchased
relevant delivered/collected fulfillment state
other Aftersales quantities affecting same line
payment/refund projection when relevant
```

Provide a clear link to canonical Order detail for more.

Do not add Order editing controls inside this section.

---

# 14. Missing-item decision support

For `claim_missing`, surface split-fulfillment facts prominently.

Useful operator context:

```text
ordered quantity
fulfilled/delivered quantity
remaining fulfillment groups
expected future delivery when supplied
tracking when supplied
```

This reduces accidental replacement/refund of merchandise still in transit.

Do not force the operator to manually reconcile unrelated Order tabs.

---

# 15. Evidence UX

If evidence attachments are supported:

- show thumbnail + filename/type metadata appropriate to the platform;
- allow zoom/open safely;
- distinguish customer evidence from internal attachments if internal attachments ever exist;
- handle missing/unavailable evidence gracefully;
- do not use image presence as automatic proof of claim validity.

If the backend has no evidence contract, omit the entire evidence-upload/edit surface.

---

# 16. Semantic action model

No raw lifecycle status editor.

Actions derive from current case state + operator permission + capability.

Examples:

## Return

```text
Approve return
Reject return
Mark item received
Cancel return request, where valid
Resolve with refund
```

## Claim

```text
Request information
Approve claim
Reject claim
Resolve with refund
Resolve with replacement
Resolve with repair
```

Only show the subset allowed by the backend.

---

# 17. Action confirmation pattern

Consequential actions should use a short confirmation surface containing:

```text
action
what changes
financial / replacement consequence if known
required reason/input
irreversibility warning where relevant
```

Avoid confirmation dialogs that merely repeat the button label.

Example:

```text
Resolve with refund

Affected item: [snapshot]
Quantity: 1
Refund consequence: [backend-provided amount/projection]
Reason: [required if contract requires]

Confirm refund resolution
```

The UI must never calculate authoritative refund value on its own.

---

# 18. Reject action

Rejection requires a supported reason when the SRS/domain requires one.

Prefer structured reasons plus optional internal/customer-safe detail rather than one unrestricted textarea.

Clearly distinguish:

```text
customer-visible explanation
internal operator note
```

if both are supported.

Do not expose an internal note publicly by default.

---

# 19. Request-information action

This state should be used only when concrete customer input blocks a decision.

Operator flow:

```text
Request information
→ choose/enter required information request
→ confirm customer-visible message
→ case becomes needs_information
```

When customer supplies information through a supported public contract:

```text
needs_information
→ information received
→ under_review
```

Do not turn this into a general two-way CRM/chat product.

---

# 20. Return received is not restocked

This distinction must be obvious in Admin wording.

Valid Aftersales action:

```text
Mark return received
```

Not implied:

```text
Restock to warehouse A / bin 14
Adjust inventory +1
```

Inventory/warehouse mutation is explicitly out of scope.

If a future WMS consumes a return event, it does so through a separate integration.

---

# 21. Refund UX

Financial state should appear as a separate block from case state.

Example:

```text
Case
Resolved

Refund
Pending
Amount: [financial contract]
Method: [safe projection if allowed]
```

Do not merge into a single status.

## Refund failure

If financial execution fails after an approved resolution:

- do not roll back historical case decision visually without domain instruction;
- surface actionable financial failure/retry path only if a supported command exists;
- otherwise show the failure and route to the owning financial operation.

Admin Aftersales must not become a payment-gateway console.

---

# 22. Replacement UX

Replacement action exists only if the backend publishes a real replacement capability.

If available, confirmation should show:

```text
what purchased item is being resolved
replacement identity/reference from backend
how fulfillment will proceed, only if known
```

Do not let operator search Catalog, arbitrarily choose another SKU, change price and create pseudo-orders inside Aftersales unless a future explicit exchange/replacement SRS introduces that capability.

---

# 23. Repair UX

Repair is capability-gated.

If supported, Admin can choose repair only within the published service contract.

Do not design:

```text
technician calendar
parts inventory
repair center queue
field service routing
```

under current Aftersales.

---

# 24. Activity / audit timeline

Timeline is useful for operator context but must remain secondary to current state/action.

Possible events:

```text
case created
return approved/rejected
information requested/supplied
item received
claim approved/rejected
resolution chosen
refund requested/updated
case resolved
```

For Admin events show actor/time where allowed.

Do not expose noisy technical transport events.

---

# 25. Concurrency / stale state UX

Aftersales decisions are operationally consequential, so stale-state handling must be explicit.

Pattern:

```text
operator opens case
→ another operator/process changes case
→ first operator submits old action
→ backend rejects stale transition
→ UI refreshes canonical case
→ show concise explanation
```

Do not auto-replay a decision after state changed.

---

# 26. Permissions

Action visibility is permission-aware.

Examples of potentially separate permissions:

```text
view Aftersales
review returns
review claims
approve/reject
record return receipt
resolve with refund
resolve with replacement/repair
```

Exact permission model is implementation/access-contract owned.

The UI must not assume every admin user can perform every resolution.

---

# 27. Responsive Admin behavior

Desktop is the primary dense-operations environment, but the UI should recompose rather than break at narrow widths.

## Desktop

Queue can use a table/list with strong scanability.

Case detail can use:

```text
main decision/context column
+
secondary sticky summary/action context
```

if this matches the established GRIP Admin shell.

## Narrow/mobile

Do not squeeze the entire desktop table.

Use:

```text
stacked case cards
filter drawer/sheet
single-column case detail
semantic action menu / bottom action area
```

Critical evidence and consequences must remain visible before confirmation.

---

# 28. Empty/loading/error states

Admin Figma must cover:

```text
queue loading
empty queue
search no results
filtered no results
queue load error
case loading
case not found
permission denied
evidence unavailable
linked Order unavailable / authorization error
stale transition
mutation failed
refund projection failed/unavailable
terminal resolved
terminal rejected
terminal canceled
```

Do not treat all errors as a toast.

State-changing failures need persistent context near the attempted action.

---

# 29. Admin ownership matrix

| UI concern | Owner/source |
| --- | --- |
| Case identity/status | Aftersales |
| Return/claim reason | Aftersales |
| Customer submitted issue/evidence | Aftersales |
| Historical product/quantity | Order |
| Fulfillment status/tracking | Order |
| Customer profile | Account |
| Current product detail | Catalog |
| Refund/payment projection | financial contract / Order projection |
| Warehouse restock | OUT OF SCOPE |
| New replacement purchase | Catalog + Checkout unless explicit replacement contract |

Use this table as a Figma review gate.

---

# 30. Canonical Admin screen/state inventory for Figma

Minimum coverage:

```text
A. Aftersales queue — default attention view
B. Queue — search/filter active
C. Queue — empty/no result/error
D. Return case — requested
E. Return case — awaiting return
F. Return case — received / action required
G. Return case — resolved + refund pending
H. Claim case — submitted/under review
I. Claim case — evidence context
J. Claim case — needs information
K. Claim case — approve/reject decision
L. Claim case — resolution selection where capability exists
M. Case — resolved
N. Case — rejected
O. Stale mutation conflict
P. Permission-limited operator
Q. Narrow/mobile recomposition
```

Explicitly excluded from Figma scope:

```text
warehouse receiving/restock
inventory screens
payment gateway console
CRM inbox/chat
exchange product selector/repricing
repair scheduling
carrier return-label administration
```

---

# 31. Figma/Admin review guardrails

```text
[ ] Queue is task-oriented, not a generic database table.
[ ] Search uses human-recognizable identifiers.
[ ] Return and claim semantics stay distinct.
[ ] Order/Account/Catalog context is read-only projection/navigation.
[ ] No raw case-status dropdown exists.
[ ] Actions are semantic and state/permission-aware.
[ ] Return received is not represented as inventory restock.
[ ] Refund state is visually separate from case state.
[ ] Refund amount/status is not calculated client-side.
[ ] Replacement/repair controls exist only when capability contracts exist.
[ ] Missing-item claims show relevant split-fulfillment context.
[ ] Customer evidence and internal notes are not conflated.
[ ] Stale transitions fail visibly and refresh canonical state.
[ ] Admin narrow/mobile state remains operable.
[ ] No CRM/WMS/payment-console scope has leaked into Aftersales.
```
