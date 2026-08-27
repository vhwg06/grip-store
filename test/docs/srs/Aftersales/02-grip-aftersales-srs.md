# GRIP Aftersales Module — Software Requirements Specification

**Status:** Final  
**Pipeline stage:** 02 — SRS  
**Module:** Aftersales  
**Surfaces:** Public Storefront + Admin Console  
**Research input:** `01-grip-aftersales-ikea-reference-research.md`

---

# 1. Purpose

The Aftersales module owns post-purchase customer cases that begin **after an Order exists** and require a return, issue assessment, warranty decision or resolution.

Its job is to turn a post-purchase problem or return intent into an explicit, auditable case without corrupting historical Order truth.

Core model:

```text
Order
  ↓ historical purchase evidence
Aftersales Case
  ├── Return
  └── Claim
        ├── missing item
        ├── damaged item
        ├── defective / quality issue
        └── warranty issue

Case
  ↓ eligibility / assessment
Resolution
  ├── refund
  ├── replacement
  ├── replacement part, only if supported
  └── reject / no-action
```

Aftersales is not a second Order system, not WMS, not payment administration and not a generic customer-service CRM.

---

# 2. Existing GRIP contracts are authoritative constraints

This SRS is intentionally bounded by existing files under `test/docs/srs`.

## 2.1 Order boundary

`../Order/02-grip-order-srs.md` owns:

```text
order identity
purchase-time item snapshots
quantities
totals
fulfillment history/status
delivery/collection snapshot
purchase documents
Order lifecycle
```

Order explicitly excludes return/exchange, warranty claims and deep refund workflow.

Aftersales starts from Order-owned historical evidence and must not rewrite it.

Required invariant:

```text
Aftersales mutation
≠
Order historical snapshot mutation
```

Aftersales may publish a projection back to Order detail, such as `Return in progress` or `Claim resolved`, but Order remains authoritative for the purchase itself.

## 2.2 Checkout boundary

`../checkout/checkout_srs.md` ends at successful Order placement.

Aftersales does not reopen Checkout and does not edit the original purchase draft.

A return/exchange intent never mutates the old cart/checkout transaction.

## 2.3 Account boundary

`../Account/02-grip-account-srs.md` owns persistent customer identity/profile and reusable delivery information.

Aftersales can consume a minimal Account projection for support context when authorized.

Changing Account data must not rewrite:

```text
Order purchase snapshot
Aftersales case historical evidence
```

## 2.4 Catalog boundary

`../catalog/srs_001_product.md` owns current ProductModel/Variant truth and explicitly excludes returns, refunds and warranty claims.

Aftersales uses the Order line snapshot as historical purchase evidence.

Current Catalog may be used for optional product navigation/context, but must not replace historical purchased identity.

Catalog's warranty summary may be informative; warranty eligibility must come from an accepted warranty/policy contract, not from UI text alone.

## 2.5 Engagement boundary

`../Engagement/02-grip-engagement-srs.md` owns Saved Lists and Product Reviews.

Aftersales does not alter review eligibility directly.

If future policy says a refunded/returned item affects verified-purchase semantics, that requires an explicit Order ↔ Aftersales ↔ Engagement contract change.

## 2.6 Content boundary

`../Content/02-grip-content-srs.md` owns help/editorial content.

Aftersales may link to help content but does not author policy pages or CMS content.

---

# 3. Current scope

```text
Aftersales
├── Public Case Access
│   ├── start from Order
│   ├── case list / case detail
│   └── secure direct lookup only if required by existing Order access
├── Return
│   ├── eligibility
│   ├── item + quantity selection
│   ├── reason
│   ├── supported return method / instructions
│   ├── receipt / assessment projection
│   └── refund outcome projection
├── Claim
│   ├── missing item
│   ├── damaged item
│   ├── defective / quality issue
│   ├── warranty issue
│   ├── description / evidence when required
│   ├── assessment
│   └── resolution
├── Resolution
│   ├── refund
│   ├── replacement, when supported
│   ├── replacement part, when supported
│   └── rejection / no-action
├── Case Activity / Audit
└── Admin Aftersales Operations
    ├── case queue/search/filter
    ├── case detail
    ├── assessment
    ├── semantic resolution actions
    └── cross-domain navigation
```

---

# 4. Explicit current-scope exclusions

The following are **not required** by this SRS:

```text
warehouse receiving workstation
restock-bin/location operations
inventory quantity mutation UI
carrier account configuration
shipping-label purchase/printing
full reverse-logistics optimization
payment gateway console
manual arbitrary refund tool
chargeback/dispute management
fraud investigations
store POS return workflow
cash drawer operations
customer-service CRM / ticketing inbox
live chat
email campaign/notification authoring
repair technician scheduling
field-service dispatch
supplier/vendor claims
product recall workflow
buy-back/resale program
generic exchange transaction engine
exchange-item repricing/reservation
new Checkout creation from Aftersales
return analytics dashboard
policy-rule authoring UI
```

If an external operational system owns these capabilities, Aftersales can consume a projection or issue a published command without absorbing that system's UI/domain.

---

# 5. Core ownership model

## 5.1 Aftersales owns

Aftersales is authoritative for:

- Aftersales case identity/reference;
- case type;
- source Order reference;
- affected Order line(s) and quantities;
- customer-stated reason/issue;
- case lifecycle;
- eligibility result snapshot/reason where needed;
- evidence references captured for the case;
- assessment outcome;
- resolution decision;
- return instructions/method projection when supported;
- refund/replacement request reference to downstream capability;
- current resolution projection;
- case activity/audit events.

## 5.2 Aftersales does not own historical purchase facts

The authoritative purchase facts remain Order-owned.

Aftersales references affected lines/quantities and may snapshot only the minimal information required for case durability/audit.

## 5.3 Aftersales does not own current product commerce truth

Current Catalog price, title, publication state or stock must not be used to recalculate the original purchase.

## 5.4 Aftersales does not own money movement

Aftersales can decide/request a refund outcome according to accepted rules.

Actual financial execution/status belongs to the platform's payment/financial contract.

Required separation:

```text
case resolution = refund approved/requested
≠
funds successfully settled back to customer
```

## 5.5 Aftersales does not own warehouse restock

If a returned item reaches warehouse/store inspection, Aftersales may receive a semantic assessment such as:

```text
received
accepted
rejected
```

Current scope does not require Aftersales Admin to choose inventory location, restock quantity or disposition bins.

---

# 6. Case types

Current case types are exactly:

```text
return
claim
```

Do not create a generic case with arbitrary subtypes that erase meaningful rules.

## 6.1 Return

A Return represents customer intent to send back purchased goods under the applicable return policy.

Typical intent:

```text
changed mind
no longer needed
product not suitable
```

The exact reason values come from the accepted domain contract.

## 6.2 Claim

A Claim represents an issue with purchased/fulfilled goods requiring assessment or remedy.

Current supported semantic issue kinds:

```text
missing_item
damaged_item
defective_or_quality
warranty
```

If backend does not support one kind, UI must not expose it.

---

# 7. Case identity and relationship to Order

## AFS-CASE-001 — Stable case identity

Every accepted case receives a stable public/operator reference independent from the Order reference.

Conceptually:

```text
Order ORD-123
├── Case AFS-001
└── Case AFS-002
```

## AFS-CASE-002 — One Order can have multiple cases

Separate issues over time or for separate item sets may create separate cases.

The system must not assume one Order = one Aftersales case.

## AFS-CASE-003 — Case must reference an Order

Current GRIP Aftersales cases require canonical Order purchase evidence.

Standalone retail receipt-only cases that do not map to a GRIP Order are outside current scope.

## AFS-CASE-004 — Affected line/quantity precision

A case identifies the exact affected Order line(s) and quantity.

A partial return/claim must not mark an entire Order as returned/failed.

---

# 8. Public eligibility entry point

## AFS-PUB-ELG-001 — Start from canonical Order when authenticated

Primary public entry:

```text
My Orders
→ Order detail
→ Return or report a problem
```

This avoids re-entering purchased item identity and gives Aftersales authoritative Order evidence.

## AFS-PUB-ELG-002 — Eligibility is authoritative and fresh

Return/claim actions are shown only from current backend eligibility.

The UI must not derive final eligibility from local calculations such as `purchase_date + 180 days`.

## AFS-PUB-ELG-003 — Explain ineligibility safely

When the backend supplies a customer-safe reason, UI can explain why self-service is unavailable and provide the approved support path.

Do not expose internal policy codes.

## AFS-PUB-ELG-004 — Fulfillment evidence before missing-item claim

For `missing_item`, Aftersales must consume Order fulfillment truth so split/in-progress deliveries are not incorrectly presented as missing.

If the relevant quantity is still legitimately in transit, self-service missing-item claim should not pretend the item is lost.

---

# 9. Return requirements

## AFS-RET-001 — Select returned items and quantities

Customer selects eligible Order line(s) and quantity to return.

Selection cannot exceed currently returnable quantity after accounting for prior accepted cases.

## AFS-RET-002 — Return reason

A return requires a reason only if the accepted backend contract requires one.

UI uses supported values; it must not invent its own taxonomy.

## AFS-RET-003 — Eligibility is per item/quantity

Eligibility can differ between lines in the same Order.

One ineligible line must not automatically block another eligible line.

## AFS-RET-004 — Return method

If operations support multiple methods, backend supplies eligible methods/instructions.

Examples of semantics the UI may render **only when supported**:

```text
return in person
mail / drop-off
pickup
```

Method availability is not hard-coded in the design.

## AFS-RET-005 — Submission is not refund completion

Successful return submission creates/updates a Return case.

It does not imply:

```text
item received
item accepted
refund completed
```

## AFS-RET-006 — Return lifecycle

Minimum semantic lifecycle:

```text
requested
→ awaiting_return          // when physical return is required
→ received                 // when receipt is confirmed
→ assessing                // optional when inspection is required
→ approved
→ resolution_in_progress
→ resolved
```

Alternative terminal states:

```text
rejected
canceled                   // only before irreversible processing, if supported
```

Implementation may collapse states not supported by actual operations, but must not imply completion too early.

## AFS-RET-007 — No generic exchange engine

Current GRIP does not require a general exchange transaction.

For change-of-mind exchange intent:

```text
return existing item
+
new purchase through Catalog/Checkout
```

Aftersales must not create/edit a replacement Checkout automatically.

---

# 10. Claim requirements

## AFS-CLM-001 — Claim issue kind

Customer selects one supported issue kind:

```text
missing_item
damaged_item
defective_or_quality
warranty
```

## AFS-CLM-002 — Description

A Claim captures a customer-readable issue description when required by the contract.

## AFS-CLM-003 — Evidence requirement is contextual

Backend can require case evidence appropriate to the issue, for example:

```text
none
photo(s)
additional description
inspection required
```

The UI must not require photo upload for every case.

## AFS-CLM-004 — Purchase proof comes from Order

For a valid GRIP Order, the customer should not be asked to re-upload a receipt merely to prove a purchase already present in Order.

If policy requires an additional purchase document, the contract must state why it is needed.

## AFS-CLM-005 — Warranty eligibility

Warranty claim eligibility must resolve from an accepted warranty/policy contract using Order purchase evidence.

Do not use a global warranty duration.

Do not trust current Catalog editorial text as the sole authoritative eligibility rule.

## AFS-CLM-006 — Claim lifecycle

Minimum semantic lifecycle:

```text
submitted
→ reviewing
→ additional_info_required   // only when needed
→ approved
→ resolution_in_progress
→ resolved
```

Alternative terminal state:

```text
rejected
```

## AFS-CLM-007 — Claim may resolve without return

A claim does not require return of the whole product unless the accepted resolution/assessment contract requires it.

---

# 11. Resolution model

Supported semantic resolutions:

```text
refund
replacement
replacement_part
no_action / rejected
```

Only resolutions actually supported by the backend may be offered.

## AFS-RES-001 — Resolution is a semantic command

Admin does not set a raw `status` to arbitrary values.

Examples:

```text
Approve refund
Approve replacement
Request additional information
Reject claim
Mark return received
Accept return
```

## AFS-RES-002 — Refund

When a case resolution requires refund:

```text
Aftersales
→ create/request refund through financial contract
→ persist returned reference/projection
→ expose refund status
```

Aftersales must not fabricate successful payment settlement.

## AFS-RES-003 — Replacement

Replacement is available only if a downstream fulfillment/order capability supports it.

Aftersales owns the case decision and reference to the resulting replacement operation.

Current scope does not require:

```text
replacement inventory reservation UI
warehouse picking UI
carrier label UI
```

## AFS-RES-004 — Replacement part

Expose only when GRIP has a real part identity/fulfillment contract.

Otherwise use support escalation rather than a fake spare-parts picker.

## AFS-RES-005 — Rejection

A rejected case requires a supported, customer-safe reason or explanation according to backend policy.

Internal notes and customer-facing explanation are separate fields if both exist.

---

# 12. Refund projection

## AFS-RFD-001 — Refund state is separate from case state

Case can be `resolved` from a business-decision perspective while financial settlement still has its own projection, depending on the financial contract.

Supported examples only when backend provides them:

```text
refund_requested
refund_pending
refunded
refund_failed
```

## AFS-RFD-002 — Partial refund

Refund amount can relate only to affected lines/quantities and permitted charges.

UI must display backend-calculated amount; it must not recalculate from current Catalog price.

## AFS-RFD-003 — No arbitrary amount entry by default

Current Admin scope does not require operators to type any free-form refund amount.

If future policy permits manual adjustments, that requires explicit domain/API scope.

---

# 13. Public case list and detail

## AFS-PUB-LST-001 — My returns & claims

Authenticated customers can view their own Aftersales cases.

Minimum list projection:

```text
case reference
case type
source order reference
created date
current customer-facing state
affected item summary
```

## AFS-PUB-DTL-001 — Canonical case detail

Case detail exposes, where applicable:

```text
case reference + source order
current state
next required customer action
selected item(s)/quantity
reason / reported issue
return method / instructions
submitted evidence projection
assessment/result
resolution
refund/replacement projection
case timeline
help path
```

## AFS-PUB-DTL-002 — Current task first

If the customer must act, such as provide additional information or return an item, that action must be more prominent than historical timeline detail.

## AFS-PUB-DTL-003 — No internal notes

Internal operator notes, risk flags and audit metadata must never appear in public case detail unless explicitly designated customer-visible.

---

# 14. Public case creation flow

## AFS-PUB-CRT-001 — Select issue from Order context

Flow starts from one Order or eligible Order line and asks for customer intent in plain language.

Canonical options are semantic, not internal case codes:

```text
Return an item
Something is missing
Item arrived damaged
Product has a quality problem
Warranty help
```

Only supported options appear.

## AFS-PUB-CRT-002 — Keep forms minimal

Do not ask for information already available from Order/Account unless review/correction is required.

## AFS-PUB-CRT-003 — Review before consequential submit

Before final submission, customer can review:

```text
selected items / quantity
case reason / issue
required evidence
return method / next step when known
expected resolution information when contract can state it safely
```

## AFS-PUB-CRT-004 — Canonical success

After successful submit:

- show case reference;
- show actual current state;
- show next step;
- link to canonical case detail;
- do not imply approval when case still requires assessment.

---

# 15. Admin Aftersales queue

## AFS-ADM-LST-001 — Case operations entry point

Authorized operators can access an Aftersales case queue.

## AFS-ADM-LST-002 — Human-readable search

Search can use supported identifiers such as:

```text
case reference
order reference
customer name/email/phone
SKU/product snapshot text when backend supports reliable search
```

Internal database IDs are not required for normal work.

## AFS-ADM-LST-003 — Operational filters

Keep filters limited to useful dimensions:

```text
case type
issue kind
case state
resolution state
created date
needs customer action / needs operator action, when derivable
```

Avoid generic analytics/filter-builder complexity.

## AFS-ADM-LST-004 — Work-first default

Default queue should prioritize cases requiring operator action rather than all historical resolved cases.

---

# 16. Admin case detail

## AFS-ADM-DTL-001 — Required operator context

Case detail can expose:

```text
case reference / lifecycle
source Order projection
affected line(s)/quantity
customer minimal contact projection
reported reason / issue
evidence
eligibility/assessment context
return instructions/status
refund/replacement projection
case activity/history
currently valid semantic actions
```

## AFS-ADM-DTL-002 — Order is linked, not duplicated

Admin can navigate to canonical Order detail.

Aftersales must not recreate every Order operational field.

## AFS-ADM-DTL-003 — Account is projection/link

Minimal customer context is shown for resolution work.

Profile editing remains Account-owned.

## AFS-ADM-DTL-004 — Catalog is optional context

Operator can navigate to current Catalog context when useful.

Historical case decisions use Order purchase evidence/policy contract, not current product price/title.

---

# 17. Admin assessment and mutation

## AFS-ADM-ACT-001 — Permission boundary

Only authorized operators can perform Aftersales mutations.

Backend authorization is mandatory.

## AFS-ADM-ACT-002 — No raw status dropdown

Do not expose arbitrary case-state editing.

The UI invokes semantic commands supported for the current case state.

## AFS-ADM-ACT-003 — Fresh eligibility before consequence

Financial/replacement decisions must re-check current case state and relevant eligibility before execution.

## AFS-ADM-ACT-004 — Consequence confirmation

Actions such as approve refund, approve replacement or reject claim require clear consequence and confirmation where material.

## AFS-ADM-ACT-005 — Customer-visible vs internal explanation

If the platform stores both:

```text
customer-facing reason
internal note
```

they must be visually and semantically distinct.

## AFS-ADM-ACT-006 — Canonical refresh after mutation

After success, refresh case + downstream resolution projection from canonical backend state.

Do not leave optimistic local status as final truth.

---

# 18. Case activity / audit

## AFS-HIS-001 — Meaningful case events

Aftersales records meaningful lifecycle/resolution events where supported:

```text
case created
customer info/evidence added
return method selected
return received
assessment started/completed
refund requested
replacement requested
case rejected
case resolved
```

## AFS-HIS-002 — Public timeline is a projection

Customer timeline contains only customer-useful events.

Internal audit can contain operator identity, permission-relevant metadata and internal reasons.

## AFS-HIS-003 — Current state remains primary

Timeline explains progression but does not replace the current task/state summary.

---

# 19. Privacy and authorization

## AFS-PRV-001

Customers can access only cases associated with Orders they are authorized to access.

## AFS-PRV-002

Evidence uploads/references are private by default and visible only to authorized actors.

## AFS-PRV-003

Admin access is permission-controlled.

## AFS-PRV-004

Cross-domain projections respect owning-module authorization.

## AFS-PRV-005

Payment credentials, authentication secrets and unrelated Account data are never exposed.

## AFS-PRV-006

Customer-facing views must not expose internal rejection/risk/audit notes.

---

# 20. Integrity invariants

```text
1. Aftersales never rewrites historical Order purchase snapshots.
2. Return and Claim are separate case semantics.
3. Case submission is not equivalent to approval, receipt or refund completion.
4. Eligibility is backend/domain-owned, never inferred only by UI date math.
5. Cases are item/quantity-aware; partial returns do not mutate the whole Order.
6. Refund state is separate from case lifecycle and Order lifecycle.
7. Admin uses semantic commands, never arbitrary raw status editing.
8. Warranty eligibility uses purchase evidence + policy contract, not one global duration.
9. Missing-item claims consult Order fulfillment truth before treating an item as missing.
10. General exchange is not a current transaction engine; normal exchange intent is return + new purchase.
11. Warehouse restock/location mechanics remain outside current Aftersales Admin.
12. Current Catalog changes never alter historical return/refund calculations.
```

---

# 21. Canonical Public flows

## Return

```text
Order detail
→ Return an item
→ eligible lines
→ select item + quantity
→ reason if required
→ eligible return method/instructions
→ review
→ submit
→ case reference + next step
→ case detail
```

## Missing item

```text
Order detail
→ Report a problem
→ Something is missing
→ check Order fulfillment truth
   ├── still in valid split/in-progress fulfillment
   │     → explain current delivery state
   └── unresolved missing quantity
         → select affected item
         → provide required info
         → submit claim
```

## Damaged / quality / warranty

```text
Order detail
→ Report a problem
→ choose issue
→ select item + quantity
→ collect contextual description/evidence
→ submit
→ reviewing
→ resolution / additional info / rejected
```

## Case tracking

```text
My returns & claims
→ case detail
→ current state + next action
→ resolution/refund/replacement projection
→ timeline
```

---

# 22. Canonical Admin flow

```text
Aftersales
→ work queue
→ open case
→ inspect Order + case context
→ eligibility / evidence sufficient?
   ├── no
   │   → request supported additional info OR reject if valid
   └── yes
       → semantic assessment/resolution command
       → consequence confirmation
       → execute
       → canonical refresh
       → downstream refund/replacement projection
```

---

# 23. Acceptance scenarios

## AS-01 — Start return from Order

Given an authenticated customer owns a delivered Order with an eligible item  
When they choose Return an item  
Then Aftersales receives Order-owned purchase evidence and shows only currently eligible item/quantity.

## AS-02 — Partial quantity return

Given an Order line quantity is 3 and only 2 remain returnable  
When return UI opens  
Then customer cannot request quantity greater than 2.

## AS-03 — Return submission is not refund

Given customer submits a valid return request  
When the case is created  
Then the case shows its actual next state and does not claim refund completion.

## AS-04 — Missing item still in split delivery

Given an Order is split into two fulfillments  
And the questioned item is still in a valid in-progress fulfillment  
When customer chooses Something is missing  
Then UI explains the current fulfillment rather than creating a false missing-item resolution.

## AS-05 — Missing item after fulfilled quantity mismatch

Given Order fulfillment indicates the relevant quantity should already be delivered  
When customer reports the item missing  
Then a missing-item Claim can be submitted if current claim eligibility permits it.

## AS-06 — Damaged item with photo required

Given current Claim contract requires photo evidence  
When customer submits a damaged-item claim without required evidence  
Then submission is blocked with a clear requirement.

## AS-07 — Claim type without photo requirement

Given current Claim contract does not require media  
When customer submits valid text/input  
Then UI does not force photo upload.

## AS-08 — Warranty uses policy contract

Given a purchased item has a valid warranty policy  
When the customer opens Warranty help  
Then eligibility is resolved from Order purchase evidence and warranty policy rather than a UI hard-coded date rule.

## AS-09 — Catalog price changes

Given an Order line originally cost X  
And current Catalog price changes to Y  
When a refund resolution is calculated  
Then Aftersales uses backend historical/commercial entitlement and does not calculate from Y.

## AS-10 — Admin cannot freely set case status

Given an operator opens a case  
Then Admin exposes only currently valid semantic actions and no arbitrary raw status dropdown.

## AS-11 — Refund approved but pending

Given a valid case resolution requests a refund  
When financial contract reports refund pending  
Then case UI shows refund pending and does not say the customer has already received funds.

## AS-12 — Replacement resolution

Given an approved Claim supports replacement  
When operator confirms replacement  
Then Aftersales records the resolution and downstream reference without requiring warehouse picking UI in Aftersales.

## AS-13 — General exchange intent

Given a customer wants another product instead  
When current scope has no replacement resolution for that case  
Then UI guides return + new purchase rather than creating an unsupported exchange transaction.

## AS-14 — Historical Order unchanged

Given an Aftersales case resolves with refund or replacement  
When the source Order is viewed  
Then its purchase-time line/title/price/delivery snapshots remain historical truth.

## AS-15 — Cross-account isolation

Given customer A knows customer B's case reference  
When A attempts to access B's case  
Then private case data is not disclosed.

---

# 24. Design handoff constraints

The UI/UX research stage may choose hierarchy, composition and responsive interaction, but must not introduce unsupported domain behavior.

Design must preserve:

```text
Order as historical authority
Return ≠ Claim
submission ≠ approval
case lifecycle ≠ refund lifecycle
partial item/quantity semantics
fresh eligibility
semantic admin actions
minimal cross-domain projections
```

The two UI/UX files following this SRS are independent surface guides:

```text
03-grip-aftersales-public-ui-ux-research.md
04-grip-aftersales-admin-ui-ux-research.md
```
