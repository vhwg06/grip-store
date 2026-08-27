# GRIP Aftersales Module — Software Requirements Specification

**Status:** Final  
**Pipeline stage:** 02 — SRS  
**Module:** Aftersales  
**Surfaces:** Public Storefront + Admin Console  
**Research input:** `01-grip-aftersales-ikea-reference-research.md`

---

# 1. Purpose

The Aftersales module owns post-purchase exception workflows that begin after a valid Order exists and that are not part of normal Order tracking/cancellation/rescheduling.

Its purpose is to let a customer or authorized operator resolve a problem with a purchased item without mutating historical purchase truth.

Core model:

```text
Order
  ↓ purchase evidence
Aftersales
├── Return
├── Claim
├── Evidence
├── Resolution
└── Refund / replacement projection
```

Core invariant:

> Order remains the source of historical purchase truth. Aftersales owns the exception workflow around that purchase.

---

# 2. Existing GRIP contracts are authoritative constraints

This SRS is intentionally bounded by already-approved files under `test/docs/srs`.

## 2.1 Order boundary

`../Order/02-grip-order-srs.md` owns:

```text
order identity
purchase-time item snapshots
quantities
purchase-time totals
fulfillment state
tracking
order cancellation / rescheduling where supported
purchase documents
order history
```

Aftersales must not edit these historical facts.

Order explicitly leaves these concerns to a later Aftersales capability:

```text
return / exchange workflow
warranty claims
warehouse return inspection / restock
full refund orchestration independent from valid post-purchase action
```

This SRS takes only the subset needed for customer return/claim resolution and intentionally continues to exclude warehouse/inventory operations.

## 2.2 Checkout boundary

`../checkout/checkout_srs.md` owns purchase construction through successful order placement.

Aftersales does not reopen Checkout or modify a completed purchase by editing the old checkout draft.

## 2.3 Account boundary

`../Account/02-grip-account-srs.md` owns customer identity/profile and may navigate to canonical Order surfaces.

Aftersales consumes authenticated customer identity when present but does not duplicate profile persistence.

Historical order address/contact facts remain Order snapshots and are not replaced by current Account values.

## 2.4 Catalog boundary

`../catalog/srs_001_product.md` owns current ProductModel/Variant truth and explicitly excludes warranty-claim, return and refund behavior.

Aftersales references purchased Order lines.

Current Catalog state may be used only where a published integration is required for a new purchase or replacement context.

## 2.5 Engagement boundary

`../Engagement/02-grip-engagement-srs.md` owns saved lists and reviews.

Aftersales does not own product feedback/review moderation.

## 2.6 Content boundary

`../Content/02-grip-content-srs.md` owns editorial/help content.

Aftersales may link to help/policy content but does not become a CMS.

---

# 3. Current semantic scope

```text
Aftersales
├── Public access from canonical Order context
├── Return
│   ├── eligibility
│   ├── request
│   ├── line + quantity selection
│   ├── reason
│   ├── instructions / method when supported
│   ├── lifecycle
│   └── refund outcome projection
├── Claim
│   ├── damaged item / delivery
│   ├── missing item
│   ├── product fault / quality issue
│   └── warranty issue
├── Claim evidence
├── Resolution
│   ├── refund
│   ├── replacement when supported
│   ├── repair when supported
│   └── reject / no coverage
├── Customer Aftersales detail/status
├── Admin Aftersales queue
├── Admin case detail / decision workflow
└── Audit/activity history
```

---

# 4. Explicit current-scope exclusions

The following are **not required** by this SRS:

```text
warehouse receiving workstation
inventory restock / stock mutation
return-bin / warehouse-location management
reverse-logistics carrier purchasing
shipping-label generation
carrier account administration
store-directory / store desk operations
spare-parts catalog / BOM
repair-center scheduling
technician dispatch
customer-service chat / CRM inbox
call-center telephony
AI claim adjudication
fraud scoring
policy authoring UI
arbitrary goodwill refund
payment-gateway administration
store-credit wallet
arbitrary order editing
adding/replacing purchased lines in-place
exchange repricing engine
exchange inventory reservation
new Checkout bypass for replacement sales
```

Generic exchange is intentionally not a first-class current capability.

A customer who wants another sellable product can return the old item and make a new independent purchase through Catalog/Checkout unless a supported claim-resolution replacement exists.

---

# 5. Core ownership model

## 5.1 Aftersales owns

Aftersales is authoritative for:

```text
AftersalesCase identity
case type
case lifecycle
selected Order line references + requested quantities
customer reason / issue classification
customer-provided description
case evidence references when supported
return-request state
claim-decision state
resolution decision
resolution rationale where required
case activity / audit history
financial consequence request/reference
replacement/repair consequence reference when supported
```

## 5.2 Order remains authoritative for purchase facts

Aftersales consumes Order projections/contracts for:

```text
order identity
purchaser identity/reference
purchase timestamp
historical line snapshots
purchased quantities
fulfillment grouping + delivered/collected quantities
payment/refund projection if published
```

Required invariant:

```text
Aftersales resolution
≠ mutate historical Order line snapshot
```

## 5.3 Catalog remains authoritative for current sellable truth

A historical purchased line is identified from Order, not rebuilt from current Catalog.

If a replacement or new purchase needs current product availability, that information comes through Catalog/fulfillment contracts and does not overwrite the original Order snapshot.

---

# 6. Aftersales case model

Conceptual minimum:

```text
AftersalesCase
- id
- case_reference
- order_ref
- account_ref?
- type
- status
- created_at
- updated_at
- requested_by
- items[]
- reason
- description?
- evidence_refs[]?
- resolution?
- refund_projection?
- activity[]
```

Case types in current scope:

```text
return
claim_damage
claim_missing
claim_quality
claim_warranty
```

Do not expose implementation enum names directly to customers.

---

# 7. Case items and quantities

## AFS-ITM-001 — Case is line-aware

A case references one or more historical Order lines.

The customer/operator must be able to identify exactly which purchased item is affected.

## AFS-ITM-002 — Partial quantity supported

For an Order line with quantity greater than one, Aftersales can represent an affected quantity smaller than the purchased quantity.

Example:

```text
ordered quantity = 4
returned quantity = 1
remaining unaffected quantity = 3
```

## AFS-ITM-003 — Remaining eligible quantity is authoritative

The system must reject a new request that would make active/resolved Aftersales quantities exceed the quantity eligible under the current contract.

The UI must consume current eligibility rather than infer remaining quantity locally.

## AFS-ITM-004 — Split fulfillment matters

For missing/damaged delivery claims, eligibility may depend on fulfillment-level delivery state.

An item still expected in another Order fulfillment group must not automatically be treated as missing.

---

# 8. Public access and authorization

## AFS-PUB-ACC-001 — Start from authorized Order context

The preferred public entry point is the canonical Order detail or an Order-owned action projection.

Examples:

```text
Return item
Report a problem
```

Exact labels are UX decisions.

## AFS-PUB-ACC-002 — Reuse Order authorization

Authenticated customers can create/view Aftersales cases only for Orders they are authorized to access.

For non-account Orders, Aftersales may reuse the secure verified Order-access context defined by `../Order/02-grip-order-srs.md`.

Aftersales must not invent a weaker lookup mechanism.

## AFS-PUB-ACC-003 — No cross-customer enumeration

Changing a case/order identifier must never expose another customer's private purchase or Aftersales data.

---

# 9. Eligibility model

## AFS-ELG-001 — Eligibility is server-authoritative

Public/Admin clients must obtain current eligibility from the owning domain contract.

Eligibility may depend on:

```text
case type
purchase date
delivery/collection state
purchased line + quantity
existing Aftersales cases
applicable return/warranty policy
product/category exception
financial/refund constraints
```

The UI must not implement policy by hardcoded date arithmetic alone.

## AFS-ELG-002 — Eligibility result explains allowed intent

The result should distinguish at least:

```text
eligible
ineligible
requires_operator_review
```

Where useful it may also provide a customer-safe reason or next route.

## AFS-ELG-003 — Re-check on submit

Eligibility must be revalidated when a consequential request is submitted.

A stale screen cannot force an invalid return/claim into existence.

---

# 10. Normal return workflow

## AFS-RET-001 — Return is a specific intent

A normal return represents a customer choosing to return an eligible purchased item independent of a product defect claim.

Typical customer intents include changed mind / no longer needed / unsuitable, using only reason values accepted by the domain.

## AFS-RET-002 — Select item + quantity

The return request identifies affected Order line(s) and quantity.

## AFS-RET-003 — Reason

A return requires one reason from the supported return-reason catalog or policy contract.

Do not use unrestricted free text as the only classification mechanism.

## AFS-RET-004 — Evidence is not automatically required

A normal policy return must not force damage photos or warranty evidence unless the current policy specifically requires it.

## AFS-RET-005 — Return method/instruction is contract-driven

If the backend supports one or more return methods, the request can expose only currently valid methods/instructions.

Examples might include:

```text
bring to accepted location
mail / parcel return
pickup
```

This SRS does not require all methods and does not create store/carrier administration.

## AFS-RET-006 — Request confirmation

Successful return initiation returns a stable case/reference and clear next step.

Do not claim the refund is completed merely because the return request was accepted.

---

# 11. Return lifecycle

Current minimum semantic lifecycle:

```text
requested
├── reject → rejected
└── accept → approved
               ↓
            awaiting_return
               ↓
            received
               ↓
            resolved

requested / approved / awaiting_return
└── cancel request, where allowed → canceled
```

Implementation may compress states only if no observable behavior is lost.

## AFS-RET-ST-001 — Requested

Customer/admin has submitted the return intent but final operational eligibility/processing may still be pending.

## AFS-RET-ST-002 — Approved/rejected

A return requiring operator review can be explicitly approved or rejected.

Automated policy acceptance may transition directly into the approved/awaiting-return state.

## AFS-RET-ST-003 — Received

`received` means the returned item has been acknowledged by the applicable operational process.

It does **not** mean inventory has been restocked.

## AFS-RET-ST-004 — Resolved

Resolved means all Aftersales responsibilities for that return have reached terminal outcome under the current contract.

Refund can still have its own financial projection if settlement is asynchronous.

---

# 12. Claim workflow

## AFS-CLM-001 — Claims are distinct from normal return

Current claim intents:

```text
damaged item / delivery
missing item
quality / fault
warranty
```

## AFS-CLM-002 — Claim starts from purchase evidence

A claim references the affected historical Order line and quantity.

The customer does not manually type product title/price as authoritative evidence.

## AFS-CLM-003 — Structured issue type first

The customer selects the supported issue type before entering optional free-text detail.

This enables correct evidence and resolution behavior.

## AFS-CLM-004 — Description

A concise problem description can be required for issue types that need operator assessment.

## AFS-CLM-005 — Evidence attachments are conditional

Photos/documents may be requested only when:

- the issue type requires them; and
- the current platform has a supported evidence-upload/storage contract.

If no such contract exists, UI must not show fake upload controls.

## AFS-CLM-006 — Missing-item pre-check

Before a missing-item claim is accepted, current Order fulfillment context should be checked for split/incomplete delivery where available.

## AFS-CLM-007 — Warranty is not automatically approved by age

Warranty claims require the applicable evidence and operator/domain decision.

Purchase age can inform eligibility but is not the only decision rule.

---

# 13. Claim lifecycle

Minimum semantic lifecycle:

```text
submitted
→ under_review
├── needs_information
│      ↓ customer/operator supplies allowed evidence
│   under_review
├── rejected
└── approved
      ↓
   resolving
      ↓
   resolved
```

## AFS-CLM-ST-001 — Submitted

The case exists and is awaiting review/processing.

## AFS-CLM-ST-002 — Under review

Authorized operator/domain evaluates current evidence and policy.

## AFS-CLM-ST-003 — Needs information

Use only when a concrete missing input blocks a decision.

The customer-facing message must state what is needed without exposing internal notes.

## AFS-CLM-ST-004 — Approved/rejected

The decision is explicit and recorded.

Rejection requires a supported reason.

## AFS-CLM-ST-005 — Resolving/resolved

Approved case enters resolution execution and becomes resolved only when Aftersales work is complete according to the selected resolution contract.

---

# 14. Resolution model

Supported resolution types are capability-gated:

```text
refund
replacement
repair
no_coverage / rejected
```

Not every case type supports every resolution.

## AFS-RES-001 — Resolution is semantic

Admin must choose a valid business resolution rather than manually assigning final status.

## AFS-RES-002 — Refund resolution

A refund is permitted only as consequence of a valid return/claim decision.

Aftersales requests/records the financial consequence through the published payment/refund contract.

## AFS-RES-003 — Replacement resolution

Replacement may be selected only if a real replacement-fulfillment contract exists.

This SRS does not require Aftersales to create a fake new Order or bypass Checkout.

If the implementation cannot fulfill replacements, the UI must not offer replacement.

## AFS-RES-004 — Repair resolution

Repair appears only if a supported repair/service contract exists.

This SRS does not require repair-center scheduling or technician management.

## AFS-RES-005 — Rejection/no coverage

Rejected cases record a supported reason and must not trigger financial or fulfillment consequences.

---

# 15. Refund boundary

## AFS-RFD-001 — Operational decision and money movement are separate

Required separation:

```text
Aftersales resolution state
≠ refund/payment state
```

A case can be approved/resolved operationally while a refund is still pending settlement.

## AFS-RFD-002 — No arbitrary standalone refund

Admin cannot issue a refund from Aftersales without a valid associated return/claim resolution.

Generic payment-gateway administration remains out of scope.

## AFS-RFD-003 — Refund projection

Where supported, Aftersales detail may show a financial projection such as:

```text
not_requested
pending
partially_refunded
refunded
failed
```

Use only actual backend states.

## AFS-RFD-004 — Order projection can reflect outcome

Order may consume the resulting refund projection through an integration contract, consistent with `../Order/02-grip-order-srs.md`.

Aftersales must not rewrite purchase-time totals as though the historical transaction never occurred.

---

# 16. Public Aftersales detail

## AFS-PUB-DTL-001 — Case reference + linked Order

Public detail shows:

```text
case reference
linked order reference
case type
current customer-facing status
next required action / expectation
selected item snapshots
reason / submitted issue
resolution when decided
refund/replacement projection when supported
customer-visible activity
```

## AFS-PUB-DTL-002 — Current state is primary

A timeline can explain progress but must not replace a clear current-state summary.

## AFS-PUB-DTL-003 — Internal notes stay internal

Admin notes, staff identifiers and internal decision metadata are not exposed publicly unless explicitly marked customer-visible.

## AFS-PUB-DTL-004 — Terminal cases remain readable

Resolved/rejected/canceled cases remain accessible according to retention/access rules.

---

# 17. Public entry from Order

## AFS-ORD-001 — Order can project Aftersales eligibility/actions

Order detail can consume Aftersales eligibility for delivered/eligible lines and expose canonical actions.

Example semantic actions:

```text
Return item
Report damaged item
Report missing item
Report product problem
```

The final UI may consolidate these under one entry, but backend ownership remains Aftersales.

## AFS-ORD-002 — Existing case projection

If an active/resolved case already affects an Order line, Order can link to the canonical Aftersales case rather than duplicate its workflow.

## AFS-ORD-003 — Order history remains Order-owned

Aftersales does not replace Order tracking/history.

---

# 18. Admin Aftersales queue

## AFS-ADM-LST-001 — Queue-first entry point

Authorized operators can access an Aftersales work queue.

## AFS-ADM-LST-002 — Human-readable search

Operators can locate cases using supported values such as:

```text
case reference
order reference
customer name
email
phone
```

Internal IDs must not be required for normal work.

## AFS-ADM-LST-003 — Operational filters

Useful filters may include only backend-supported dimensions:

```text
case type
status
reason / issue type
created date
resolution state
refund state
```

Do not add filter complexity without operational value.

## AFS-ADM-LST-004 — Work requiring attention is prioritized

Default views should make pending review / needs-information / unresolved cases easy to identify.

---

# 19. Admin case detail

## AFS-ADM-DTL-001 — Decision-relevant context

Case detail can compose:

```text
case summary
current state
customer identity projection
canonical Order link + purchase snapshot
selected lines / quantities
fulfillment context relevant to issue
evidence
reason / description
customer-visible messages/status
refund/replacement projection
activity / audit
available semantic actions
```

## AFS-ADM-DTL-002 — Cross-domain data remains projection/link

Admin Aftersales must not recreate Account/Order/Catalog editors.

## AFS-ADM-DTL-003 — Permission-aware actions

UI shows only actions the current operator is authorized to perform.

Backend authorization remains mandatory.

---

# 20. Admin actions

## AFS-ADM-ACT-001 — No raw status dropdown

Operators act through semantic commands such as:

```text
Approve return
Reject return
Mark return received
Request information
Approve claim
Reject claim
Resolve with refund
Resolve with replacement
Resolve with repair
```

Only commands supported by the current case state/capability are shown.

## AFS-ADM-ACT-002 — Consequence visibility

Before consequential actions, UI explains known effects from the backend, especially refund/replacement consequences.

## AFS-ADM-ACT-003 — Canonical refresh

After mutation, the UI refreshes the latest case, linked financial projection and activity.

## AFS-ADM-ACT-004 — Stale transition fails safely

If another operator/process changes the case before submission, the stale action fails and the latest canonical state is shown.

---

# 21. Activity / audit

## AFS-HIS-001 — Meaningful history

Aftersales records meaningful domain events such as:

```text
case created
information requested
information supplied
return approved/rejected
return received
claim approved/rejected
resolution selected
refund requested / updated
case resolved/canceled
```

## AFS-HIS-002 — Actor and time

Admin-mutating events record actor identity/reference and timestamp where the audit platform supports it.

## AFS-HIS-003 — Public projection is curated

Customer-visible history exposes only customer-safe events.

---

# 22. Privacy and security

## AFS-PRV-001

Customers can access only their authorized Aftersales cases.

## AFS-PRV-002

Admin access is permission controlled.

## AFS-PRV-003

Evidence attachments, when supported, are private by default and must use authorized access.

## AFS-PRV-004

Do not expose payment credentials, internal fraud data or unrelated Account information.

## AFS-PRV-005

Cross-domain projections obey the owning module's authorization rules.

---

# 23. Integrity invariants

```text
1. Order remains authoritative for historical purchase truth.
2. Aftersales never rewrites historical Order snapshots.
3. A case affects explicit Order lines + quantities.
4. Active/resolved Aftersales quantities cannot exceed current eligible purchased quantity.
5. Missing-item claims consider split fulfillment where available.
6. Normal return and defect/warranty claim remain semantically distinct.
7. Return/claim state is separate from refund/payment state.
8. Refund requires a valid Aftersales resolution; no arbitrary standalone refund.
9. Replacement/repair actions appear only when a real capability contract exists.
10. Generic exchange is not a first-class engine in current scope.
11. Admin uses semantic commands, not raw status mutation.
12. Warehouse restock/inventory mutation remains outside Aftersales.
```

---

# 24. Canonical Public flows

## Return an item

```text
Order detail
→ choose eligible item / Return
→ current eligibility
→ quantity
→ reason
→ return method/instruction if supported
→ review
→ submit
→ case reference + next step
→ status / received / refund projection
```

## Report damaged product

```text
Order detail
→ Report a problem
→ damaged
→ choose item + quantity
→ describe issue
→ evidence if required/supported
→ submit
→ under review
→ resolution
```

## Report missing item

```text
Order detail
→ fulfillment check
→ item still expected?
   ├── yes → show Order tracking context
   └── no  → create missing-item claim
```

## Warranty / quality claim

```text
Order detail
→ product problem / warranty
→ select item
→ describe issue
→ evidence if required
→ submit
→ review
→ approved or rejected
→ supported resolution
```

---

# 25. Canonical Admin flow

```text
Aftersales queue
→ open case
→ inspect Order + case context
→ determine valid semantic action
→ execute
→ refresh
→ continue until terminal resolution
```

For a return:

```text
requested
→ approve/reject
→ awaiting return
→ received
→ valid financial consequence
→ resolved
```

For a claim:

```text
submitted
→ review
→ request info OR decide
→ approved/rejected
→ supported resolution
→ resolved
```

---

# 26. Acceptance scenarios

## AS-01 — Start from own Order

Given an authenticated customer owns an eligible Order  
When they open Order detail and start Aftersales  
Then only eligible purchased lines/actions are offered.

## AS-02 — Unauthorized case isolation

Given a customer does not own the linked Order  
When they request the Aftersales case  
Then private case data is not returned.

## AS-03 — Partial return

Given quantity 3 was purchased and all 3 are return eligible  
When customer requests return for quantity 1  
Then the case affects only quantity 1.

## AS-04 — Quantity overrun

Given only quantity 1 remains eligible  
When a new request attempts quantity 2  
Then the request is rejected without creating excess Aftersales quantity.

## AS-05 — Return does not mean refund completed

Given a return request is accepted  
When the item has not yet reached refund completion  
Then UI does not show `refunded`.

## AS-06 — Missing split delivery

Given an Order line is still expected in another active fulfillment group  
When customer starts a missing-item flow  
Then current fulfillment context is surfaced and the system does not falsely classify the item as definitively missing.

## AS-07 — Claim evidence

Given a claim type requires supported photo evidence  
When customer submits without required evidence  
Then the request is rejected with actionable validation.

## AS-08 — No fake evidence upload

Given the platform has no evidence-upload contract  
Then the UI does not render a non-functional attachment control.

## AS-09 — Warranty requires decision

Given a purchased item is within a nominal warranty period  
When a claim is submitted  
Then it is not automatically approved solely because of purchase age.

## AS-10 — Semantic admin action

Given a return is `requested` and the operator is authorized  
When the operator approves it  
Then the case transitions through the approved return command and history records the action.

## AS-11 — Stale admin action

Given an operator is viewing stale case state  
When another process changes the case before submit  
Then invalid stale mutation fails and latest state is shown.

## AS-12 — Refund boundary

Given a valid return/claim resolution produces a refund  
When Aftersales requests the financial consequence  
Then refund status is represented independently from case lifecycle.

## AS-13 — No arbitrary refund

Given no valid return/claim resolution exists  
When an operator attempts a standalone Aftersales refund  
Then the operation is unavailable/rejected.

## AS-14 — No generic exchange engine

Given a customer simply wants another product  
Then current Aftersales does not edit the old Order into another SKU; normal path is return plus a new Catalog/Checkout purchase.

## AS-15 — Historical independence

Given Catalog title/price or Account address changes after purchase  
When Aftersales renders the purchased item  
Then historical purchase facts still come from Order snapshot.

---

# 27. Implementation guardrails

Later API/database/UI work must preserve these boundaries:

```text
Aftersales references Order
Aftersales does not clone Order persistence
Aftersales case status is not Order status
Aftersales resolution is not payment status
Return receipt is not inventory restock
Replacement decision is not permission to bypass Checkout
```

Any implementation requiring new inventory, payment, replacement-fulfillment, media-upload or repair-service capabilities must introduce an explicit published contract rather than hiding that expansion inside this module.
