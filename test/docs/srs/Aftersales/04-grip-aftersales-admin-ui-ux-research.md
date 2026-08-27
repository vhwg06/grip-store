# GRIP Aftersales — Admin UI/UX Research & Design Guidance

**Status:** Final  
**Pipeline stage:** 03B — UI/UX research  
**Module:** Aftersales  
**Surface:** Admin Console  
**Authority:** `02-grip-aftersales-srs.md`

---

# 1. Purpose

This file defines Admin interaction guidance for the GRIP Aftersales capability.

Important evidence boundary:

> IKEA does not publicly expose enough of its internal returns/claims backoffice UI to treat any specific queue, lifecycle, screen hierarchy or operator action model as “how IKEA Admin works”.

Therefore this file does **not** claim to reproduce IKEA's internal Admin system.

IKEA public evidence contributes only:

- customer problem categories;
- information customers are asked to provide;
- publicly described support routes;
- publicly described outcomes such as replacement/refund;
- case/order reference behavior.

Everything else in this file is a **GRIP UI decision bounded by the SRS**.

---

# 2. Existing GRIP boundaries

Admin Aftersales composes with existing owning modules:

```text
Order Admin
→ purchase + fulfillment truth

Account Admin
→ customer identity/profile

Catalog Admin
→ current product context

Aftersales Admin
→ only supported post-purchase support/return operations
```

Do not duplicate full Order, Account or Catalog editing inside Aftersales.

---

# 3. What IKEA public evidence justifies for operator context

The following public facts are useful context even though the internal screen is unknown.

## Existing claim

IKEA asks for case or order number when a claim is already in progress.

Useful GRIP implication:

```text
operator should be able to locate/support a case using its case/order reference
```

Source:

https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html

## Missing delivery

IKEA tells the customer to check order contents and split deliveries before Customer Service escalation.

Useful GRIP implication:

```text
Order fulfillment context should be near missing-item support work
```

Source:

https://www.ikea.com/us/en/customer-service/knowledge/articles/74d6d65a-df6f-4f7f-90c3-f779ea35383d.html

## Damaged item

IKEA publicly describes co-worker-handled options including store replacement, home-delivered replacement and refund.

Useful GRIP implication:

```text
if GRIP supports those operations,
operator sees only the operations actually available for this case
```

Source:

https://www.ikea.com/us/en/customer-service/knowledge/articles/9ef5ebf8-c4bf-449d-97f4-a0cef573807b.html

## Warranty

IKEA says warranty claims require proof of purchase, may require photos, are subject to inspection, and an IKEA co-worker makes the final decision.

Useful GRIP implication:

```text
purchase evidence + supplied evidence + actual allowed decision
should be available together when GRIP supports warranty handling
```

Source:

https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html

---

# 4. What must NOT be presented as IKEA Admin behavior

Do not attribute any of the following to IKEA without separate evidence:

```text
Needs attention queue
Return/Claim tabs
specific workflow columns
requested → reviewing → approved lifecycle
RMA terminology
raw Claim aggregate fields
refund approval screen
operator audit timeline layout
specific permission roles
specific SLA dashboard
specific case filters
```

GRIP may implement some of these later, but they would be GRIP decisions.

---

# 5. Current GRIP Admin scope

Current Admin capability is minimal:

```text
find supported Aftersales case
→ open case
→ inspect source Order + affected item + customer-reported issue
→ inspect evidence when present
→ execute only currently supported backend action
→ reload canonical result
```

No additional workflow should be designed unless the SRS/backend needs it.

---

# 6. Case discovery

If persistent cases are implemented, Admin needs a way to find them.

## Search

Use only backend-supported human-recognizable identifiers, preferably:

```text
case reference
order reference
```

Customer name/email/phone search may be added only when the actual search contract supports it and access is permitted.

Do not require internal UUID for normal work.

## List/queue

A case list is allowed if operational volume requires it, but the SRS does not mandate an invented “Needs attention” workflow.

Minimal useful row:

```text
case reference
source order
customer-safe issue/return intent
affected item summary
actual backend status
updated time, if provided
```

Do not invent state-derived priority badges without backend semantics.

---

# 7. Case detail hierarchy

Recommended GRIP hierarchy:

```text
Header
- case reference
- source order
- actual backend status
- supported action(s), if any

Main
- customer-reported intent/problem
- affected item(s) + quantity
- submitted information/evidence
- current outcome/instruction

Context
- Order projection + canonical Order link
- minimal customer projection + Account link
- optional current Catalog link
- downstream refund/replacement projection when available
```

This is a GRIP usability decision, not an IKEA-backoffice observation.

---

# 8. Return support in Admin

Show only data the current Return contract actually provides.

Candidate fields:

```text
affected Order item(s)
affected quantity
customer return reason, if collected
selected/supported return method
return instructions/reference
actual return/refund status supplied by backend
```

Do not invent operational controls such as:

```text
Mark received
Inspect
Restock
Approve return
```

unless those commands actually exist in the GRIP backend.

The previous document assumed these commands as a universal lifecycle. That assumption is removed.

---

# 9. Missing-order-item support in Admin

Put Order fulfillment truth next to the customer's report.

Useful context:

```text
ordered quantity
fulfillment groups
current delivery status
tracking/estimate when available
```

The operator should not have to infer from free text whether another split delivery is still active.

Do not expose a generic refund/replacement action set unless the current backend specifically allows it for this issue.

---

# 10. Damaged-item support in Admin

If GRIP implements IKEA-like damaged-item remedies, detail should show:

```text
affected item
customer description
evidence if collected
actual supported remedy options
```

Potential remedies observed publicly at IKEA include:

```text
store replacement
home-delivered replacement
refund
```

But the Admin screen shows only actions supported by GRIP for the current case.

No raw status dropdown is needed.

---

# 11. Missing-part support in Admin

If GRIP has a real part contract, operator context can include:

```text
purchased product
requested/missing part reference
actual supported part fulfillment option
```

If GRIP does not have part identity/fulfillment, Admin should route the issue through the supported general Customer Service path rather than expose a fake parts catalog.

---

# 12. Quality / warranty support in Admin

For an implemented quality/warranty path, show decision-relevant evidence only:

```text
source Order + purchase date
purchased item
customer description
photos/files when present
actual coverage/policy result if backend provides it
inspection requirement/result if provided
currently valid supported action
```

Do not add a manual warranty-date calculator or policy editor.

Do not expose current Catalog marketing text as the authoritative warranty decision.

---

# 13. Evidence UI

Evidence is contextual, not universal.

If evidence exists:

```text
customer description
photo/file evidence
additional information requested/provided, if supported
```

Requirements:

- customer-submitted evidence is read-only unless the backend explicitly supports correction;
- image/file failure does not make the whole case disappear;
- do not expose unrelated customer files;
- distinguish customer-visible text from internal-only data if both actually exist.

Do not invent an internal-note feature solely because typical support tools have one.

---

# 14. Actions

Actions come from the real backend contract and current state.

Good pattern:

```text
backend says available_actions = [...]
→ UI renders those semantic actions
```

Bad pattern:

```text
Status [dropdown]
→ operator can force arbitrary state
```

Examples such as `Refund`, `Replace`, or `Request more information` may appear only if implemented.

Do not design the full action catalog first and treat it as a requirement.

---

# 15. Refund projection

Where financial integration returns data, show it separately:

```text
Refund
amount        backend-provided
status        backend-provided
reference     if safe/useful
```

Do not:

- compute amount from current Catalog price;
- mark refund complete because support case is closed;
- create a generic payment/refund console inside Aftersales.

---

# 16. Replacement projection

Where a replacement operation exists, show only the downstream projection:

```text
replacement reference
status
tracking/canonical link when published
```

Do not add warehouse, inventory allocation, carrier or label controls to Aftersales Admin.

---

# 17. Status presentation

There is no SRS-defined universal Claim lifecycle.

Therefore:

```text
backend state
→ plain operator/customer-safe label where appropriate
```

Do not build a fixed visual stepper such as:

```text
Submitted → Review → Approval → Resolution → Done
```

unless the implemented contract truly has those states.

---

# 18. Cross-module navigation

## Order

Always prefer a canonical `View order` link for purchase/fulfillment depth.

## Account

Use `View customer` for full Account-owned context.

Aftersales does not edit Account profile fields.

## Catalog

Use current product link only as optional current context.

Historical support evidence remains tied to Order purchase facts.

---

# 19. Permissions

Admin access remains permission-controlled according to the platform's existing access model.

UI may hide unavailable actions for usability, but backend authorization remains authoritative.

This file does not invent Aftersales-specific role names or permission matrices.

---

# 20. Stale/concurrent actions

For every consequential operator action:

```text
execute action
→ backend validates latest case/state
→ success: reload canonical case + downstream projection
→ stale/ineligible: show latest state and new valid actions
```

Do not force the stale local view over canonical state.

---

# 21. Error states

## Case load failure

Preserve the searched case reference and allow retry.

## Action failure

Keep case context visible and show failure near the attempted action.

## Evidence unavailable

Render evidence unavailable state without treating the whole case as nonexistent.

## Order/Account/Catalog link failure

Cross-module failure must not erase valid Aftersales case information.

---

# 22. Responsive behavior

Admin is desktop-first but must remain usable at smaller widths.

Desktop:

```text
case context + evidence + action
with compact source-context rail
```

Narrow width:

```text
status/action
→ issue + item
→ evidence
→ downstream outcome
→ source context
```

Do not compress a dense desktop table into unusable horizontal scrolling when a stacked list is more appropriate.

---

# 23. Figma design gate

Before adding an Admin Aftersales screen, state, filter or action, verify:

1. Is it required by `02-grip-aftersales-srs.md` or an actual backend contract?
2. If described as IKEA behavior, is there direct public IKEA evidence?
3. Are Order/Account/Catalog facts shown as projections rather than duplicated ownership?
4. Are only real backend actions exposed?
5. Has an invented Claim lifecycle or generic status editor slipped back in?
6. Are refund/replacement states coming from their owning downstream contract?
7. Could the operator complete the supported task without unrelated CRM/WMS/payment features?

If the answer is unclear, do not invent the element.
