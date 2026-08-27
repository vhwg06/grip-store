# GRIP Aftersales Module — Software Requirements Specification

**Status:** Final  
**Pipeline stage:** 02 — SRS  
**Module:** Aftersales  
**Surfaces:** Public Storefront + Admin Console  
**Research input:** `01-grip-aftersales-ikea-reference-research.md`

---

# 1. Purpose

Aftersales handles post-purchase customer needs that occur after a canonical GRIP Order exists.

This SRS intentionally adopts only behavior that is either:

1. already required by existing GRIP module boundaries; or
2. directly justified by the IKEA public behavior recorded in the research file.

Important rule:

> This file defines GRIP behavior. It does not claim IKEA uses the same internal domain model, lifecycle, state names or backoffice architecture.

---

# 2. Existing GRIP ownership constraints

## Order owns

From `../Order/02-grip-order-srs.md`:

```text
order identity
purchase-time item snapshots
quantity and totals
fulfillment state/history
delivery/collection snapshot
purchase documents
```

Aftersales must never rewrite historical Order truth.

## Checkout owns

Checkout ends at successful Order placement.

Aftersales does not reopen or edit the original Checkout.

## Account owns

Customer identity/profile remains Account-owned.

## Catalog owns

Current product identity/content/commercial truth remains Catalog-owned.

Aftersales uses Order purchase evidence for the historical transaction.

## Content owns

Policy/help/editorial pages remain Content-owned where such a module contract exists.

---

# 3. Current GRIP scope

Current Aftersales scope is deliberately small:

```text
Aftersales
├── Return support
│   ├── determine whether self-service return is available
│   ├── choose affected Order item(s)/quantity
│   ├── capture return reason when required
│   ├── expose supported return instructions/method
│   └── expose refund outcome/projection when available
│
└── Product / delivery problem support
    ├── missing order item
    ├── damaged item
    ├── missing product part
    ├── product quality problem
    └── warranty problem
```

A stable case/reference may be created where the backend supports case handling.

---

# 4. Explicit non-scope

Do not add any of the following without a new SRS decision:

```text
warehouse receiving workstation
restock/disposition workflow
inventory mutation
carrier label purchase/printing
reverse-logistics optimizer
payment gateway administration
manual arbitrary refund console
chargeback/dispute handling
CRM/ticket inbox
staff chat
supplier claims
repair technician scheduling
field service
product recall workflow
buy-back/resale program
return-policy authoring
warranty-policy authoring
generic exchange engine
replacement inventory allocation UI
new Checkout creation from Aftersales
analytics dashboard
```

---

# 5. GRIP decision: separate customer intents in the UI

IKEA public behavior distinguishes ordinary returns from product/delivery problems.

GRIP therefore exposes separate customer intents:

```text
Return an item

Problem with product or delivery
├── Something is missing from my order
├── Item arrived damaged
├── Product is missing a part
├── Product has a quality problem
└── Warranty help
```

This is a **GRIP navigation/product decision based on observed IKEA behavior**.

It must not be described as proof of IKEA's internal aggregate structure.

---

# 6. No invented universal Claim state machine

The previous version of this SRS defined a detailed Claim lifecycle such as:

```text
submitted
→ reviewing
→ additional_info_required
→ approved
→ resolution_in_progress
→ resolved
```

That lifecycle is removed.

Public IKEA evidence does not establish that internal model.

Current rule:

> Aftersales renders only case/status values actually published by the implemented GRIP backend contract.

The design may use customer-friendly copy for those states, but must not invent workflow states merely to complete a visual stepper.

---

# 7. Return behavior

## AFS-RET-001 — Start from an Order

When authenticated Order history exists, the preferred return entry starts from the canonical Order detail.

The user should not need to re-enter known purchase identity.

## AFS-RET-002 — Item and quantity selection

A return identifies the exact Order line(s) and quantity affected.

The UI must not mark an entire Order as returned when only part of it is involved.

## AFS-RET-003 — Backend eligibility

Return availability comes from the accepted GRIP backend/policy contract.

UI must not independently decide final eligibility from a hard-coded date calculation.

## AFS-RET-004 — Return reason only when required

If the backend requires a return reason, the UI uses supported values.

Do not invent reason taxonomy in design.

## AFS-RET-005 — Supported return method/instructions

The UI renders only methods actually returned by the backend/operations contract.

Examples may include in-person return, mail or pickup only when implemented.

## AFS-RET-006 — Submission is not refund completion

A successful online return request/preparation must not be presented as proof that:

```text
physical return completed
assessment completed
refund completed
```

## AFS-RET-007 — Ordinary exchange

Current GRIP does not implement a generic exchange transaction.

For ordinary exchange intent, the supported model is:

```text
return existing item
+
new purchase through normal Catalog/Checkout
```

This follows the currently published IKEA US pattern.

---

# 8. Missing order item behavior

## AFS-MIS-001 — Show Order truth first

Before escalating an apparently missing item, GRIP must use canonical Order fulfillment information where available.

The customer should be able to see whether:

```text
order was split
another delivery is still active
item may still be on the way
```

## AFS-MIS-002 — Escalation only after known fulfillment context

If the item is still unresolved after the available Order/fulfillment checks, GRIP may offer the supported Customer Service/case path.

## AFS-MIS-003 — No invented resolution menu

The cited IKEA missing-delivery article does not enumerate a universal set of final outcomes.

GRIP therefore must not expose `refund / replacement / reject` merely because other issue types have those options.

Only backend-supported actions may appear.

---

# 9. Damaged item behavior

## AFS-DMG-001 — Affected item

The flow identifies the affected Order item and quantity.

## AFS-DMG-002 — Known supported outcomes may be exposed only when available

IKEA publicly documents these damaged-item outcomes:

```text
store replacement
home-delivered replacement
refund
```

GRIP may support equivalent actions only when its backend/operations contract actually supports them.

## AFS-DMG-003 — No mandatory return assumption

The UI must not force every damaged-item case through a generic return step unless the current GRIP contract explicitly requires that step.

---

# 10. Missing product part behavior

## AFS-PART-001 — Distinguish part from full product

A customer can report that the product itself was received but a component/part is missing.

## AFS-PART-002 — Spare-part path is conditional

IKEA publicly supports part-code lookup and multiple part-fulfillment paths.

GRIP exposes a part-specific self-service path only if GRIP has:

```text
part identity/reference
+
supported fulfillment operation
```

Otherwise the UI routes to Customer Service/support instead of inventing a spare-parts catalog.

---

# 11. Quality problem behavior

## AFS-QLT-001 — Purchase evidence

The quality-support flow must identify the relevant purchased Order item.

## AFS-QLT-002 — Return/warranty coverage may affect next step

The backend may determine whether the issue falls under ordinary return policy, warranty or another supported service path.

The UI must not hard-code one universal period.

## AFS-QLT-003 — Resolution only when supported

Where the GRIP contract supports it, the UI may expose replacement or refund.

Do not promise either before the backend confirms availability/eligibility.

---

# 12. Warranty behavior

## AFS-WAR-001 — Product-specific coverage

Warranty support must not assume all products share one duration or policy.

## AFS-WAR-002 — Purchase proof

Order evidence supplies the purchase reference for GRIP-originated orders.

If the actual warranty contract requires an additional proof document, the UI may request it.

## AFS-WAR-003 — Evidence/inspection can be required

The backend may request:

```text
photos
additional information
inspection
```

Only request evidence that the contract requires for the current issue.

## AFS-WAR-004 — No approval promise from dates alone

UI must not state that a warranty claim is approved merely because the apparent purchase date falls within a displayed period.

---

# 13. Case/reference behavior

IKEA publicly asks customers with an existing claim to provide a case or order number.

GRIP may therefore create a stable Aftersales case reference when a support case is accepted.

## AFS-CASE-001

A case reference is distinct from the source Order reference.

## AFS-CASE-002

A case always links back to the relevant Order and affected item(s) where the GRIP flow originates from an Order.

## AFS-CASE-003

The SRS does not define a universal case lifecycle enum.

Case status is backend-contract-driven.

---

# 14. Resolution and downstream boundaries

## Refund

If a supported Aftersales operation results in refund, the UI may show the financial status/reference supplied by the payment/financial contract.

Aftersales must not fabricate settlement success.

## Replacement

If a supported issue results in replacement, the UI may show the replacement reference/status supplied by the owning Order/Fulfillment capability.

Aftersales does not absorb warehouse allocation or shipping operations.

## Replacement part

Expose only when a real part + fulfillment contract exists.

---

# 15. Public requirements

## AFS-PUB-001 — Entry from Order

Order detail can expose customer-facing aftersales intents supported for that Order.

## AFS-PUB-002 — Existing case access

If the backend supports persistent cases, an authenticated customer can view their own case reference and current customer-safe status.

## AFS-PUB-003 — No internal terminology required

Customer UI uses intent language such as:

```text
Return an item
Something is missing
Item arrived damaged
Missing part
Quality problem
Warranty help
```

A generic `Claim` label is not required as the first interaction.

## AFS-PUB-004 — Safe status rendering

Only customer-safe backend state/status may be shown.

Do not invent a stepper or claim-state progression not supported by backend truth.

---

# 16. Admin requirements

IKEA does not publicly document enough of its internal aftersales backoffice UI to use as an implementation reference.

Therefore Admin requirements are intentionally minimal and GRIP-specific.

## AFS-ADM-001 — Find cases

Authorized operators can find supported Aftersales cases by human-recognizable values such as case reference or Order reference when backend search supports them.

## AFS-ADM-002 — See source context

Case detail can show the minimum Order/customer/product context needed to help the customer, with links to canonical owning modules.

## AFS-ADM-003 — Only backend-valid actions

Admin exposes only explicit semantic operations supported by the backend for the current case.

No raw arbitrary status dropdown is required.

## AFS-ADM-004 — No invented IKEA workflow

The Admin UI must not claim to reproduce IKEA's internal claim/return console because no such public evidence is available.

## AFS-ADM-005 — Canonical refresh after mutation

After an operator action succeeds, reload canonical case/downstream state rather than pretending an optimistic local state is final truth.

---

# 17. Integrity invariants

```text
1. Aftersales never rewrites historical Order snapshots.
2. Return intent and product/delivery-problem intent remain visibly distinct.
3. Missing-item support checks known Order/split-delivery truth first.
4. A submitted return request is not automatically a completed refund.
5. Resolution options appear only when the current backend supports them.
6. Missing-part self-service requires a real part/fulfillment contract.
7. Warranty handling is product/policy-specific, not one global duration.
8. No universal Claim lifecycle is invented from IKEA public evidence.
9. IKEA public behavior and GRIP product decisions must remain explicitly distinguishable.
10. Admin behavior is GRIP-specific unless direct IKEA evidence exists.
```

---

# 18. Canonical customer flows

## Return

```text
Order detail
→ Return an item
→ select eligible item/quantity
→ reason if required
→ supported return instructions/method
→ submit/prep return
→ show actual next step/status
```

## Missing order item

```text
Order detail
→ Something is missing
→ show order/box/split-delivery context
→ still unresolved?
   ├── no  → continue Order tracking
   └── yes → supported Customer Service/case path
```

## Damaged item

```text
Order detail
→ Item arrived damaged
→ identify affected item
→ collect required information
→ show only available supported resolution/support options
```

## Missing part

```text
Order detail
→ Product is missing a part
→ part-reference path exists?
   ├── yes → supported part flow
   └── no  → Customer Service/support
```

## Quality / warranty

```text
Order detail
→ Quality problem / Warranty help
→ purchase evidence
→ required information/photos/inspection as instructed
→ backend/customer-service assessment
→ supported outcome
```
