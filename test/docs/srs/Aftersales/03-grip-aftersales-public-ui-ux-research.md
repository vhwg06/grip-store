# GRIP Aftersales — Public UI/UX Research

**Status:** Final  
**Pipeline stage:** 03A — Public UI/UX research  
**Module:** Aftersales  
**Surface:** Public Storefront  
**Authority:** `02-grip-aftersales-srs.md` + existing GRIP SRS boundaries

---

# 1. Purpose

This document translates approved Aftersales semantics into a customer-facing interaction model.

It is not a visual mockup and does not create new domain capability.

Design rule:

> If a screen or control requires a capability not defined by the SRS, omit it rather than inventing the backend.

---

# 2. Documents this UI must respect

The public Aftersales surface is downstream of existing modules.

```text
../Order/02-grip-order-srs.md
    owns historical purchase + fulfillment truth

../Account/02-grip-account-srs.md
    owns customer identity/profile

../catalog/srs_001_product.md
    owns current product truth

../checkout/checkout_srs.md
    owns new purchase construction

02-grip-aftersales-srs.md
    owns return/claim case semantics
```

Public UI must therefore **compose**, not duplicate.

---

# 3. Reference UX findings

## IKEA — start from known purchase context

IKEA routes damaged-delivery issues through Track & Manage or Customer Service and tells customers with missing products to first inspect current order/split-delivery context.

This supports a GRIP pattern where Aftersales begins from the relevant Order whenever possible.

Sources:

- https://www.ikea.com/us/en/customer-service/track-manage-order/
- https://www.ikea.com/us/en/customer-service/knowledge/articles/9ef5ebf8-c4bf-449d-97f4-a0cef573807b.html
- https://www.ikea.com/us/en/customer-service/knowledge/articles/74d6d65a-df6f-4f7f-90c3-f779ea35383d.html

## IKEA — return flow asks for known structured inputs

IKEA's Express return flow asks for purchase proof/order context, products to return, requested details and a return reason before producing a barcode/next step.

This supports progressive structured return preparation rather than a generic support textarea.

Source:

- https://www.ikea.com/us/en/customer-service/knowledge/articles/f41bb8c6-dab2-44c9-b6a7-a9f84be811b6.html

## IKEA — claims need different evidence from normal returns

Warranty/claim guidance can require proof, inspection and photos, while a normal change-of-mind return does not inherently need defect evidence.

This supports separate customer flows.

Sources:

- https://www.ikea.com/us/en/customer-service/knowledge/articles/1c5gdc7d-3c3b-41cf-gd78-45b061b644f8.html
- https://www.ikea.com/us/en/customer-service/returns-claims/guarantee/

---

# 4. Public information architecture

Do not introduce a large standalone customer-service portal in the current scope.

Canonical entry hierarchy:

```text
My Orders / Order lookup
→ Order detail
   ├── normal tracking/actions owned by Order
   └── Aftersales entry when eligible
       ├── Return item
       └── Report a problem
```

Once a case exists:

```text
Order detail
→ existing Aftersales case
→ canonical case detail/status
```

A future Account navigation destination such as `Returns & claims` may be added only by an explicit Account/product decision.

Current UI must not silently expand Account IA.

---

# 5. Primary UX principle — ask intent before asking details

The first Aftersales decision should be understandable in customer language.

Recommended semantic split:

```text
I want to return this item

There is a problem with this item
```

If `problem` is selected, then narrow to supported issue types:

```text
Damaged
Missing
Not working / quality issue
Warranty issue
```

Do not begin with:

```text
case type enum
support category code
resolution type
refund status
```

---

# 6. Order detail integration

## 6.1 Keep normal Order concerns primary

Order detail already owns:

- current fulfillment state;
- tracking;
- delivery/collection information;
- cancel/reschedule where valid;
- purchase documents.

Aftersales controls must not visually compete with active delivery actions before the item is eligible.

## 6.2 Eligibility-driven actions

Each relevant line or fulfillment group can expose only currently valid actions returned by Aftersales.

Possible semantic states:

```text
eligible for return
eligible to report issue
existing active case
no current Aftersales action
```

Do not render disabled buttons for every imaginable action.

## 6.3 Existing case wins over duplicate action

If an active case already covers the relevant item/quantity, prefer:

```text
View return
View claim
```

over offering another identical request.

---

# 7. Return flow

Recommended flow:

```text
Order detail
→ Return item
→ select quantity if needed
→ choose reason
→ choose/see return method or instruction if available
→ review request
→ submit
→ confirmation + case reference + next step
```

## 7.1 Screen responsibility — Start

Show only the Order item snapshot needed to confirm:

- purchased title/selection;
- quantity purchased;
- quantity currently eligible;
- purchase/order reference if useful.

Historical display comes from Order, not current Catalog.

## 7.2 Quantity

If only one unit is eligible, do not force an unnecessary quantity chooser.

If multiple units are eligible, constrain selection to authoritative remaining eligibility.

## 7.3 Reason

Use a concise single-select set returned by the domain.

A generic `Other` option can expose free text only if accepted by the backend.

Do not make free-text explanation mandatory for every normal return.

## 7.4 Return method/instruction

Only show supported options.

A method card should communicate decision-relevant information such as:

```text
method name
where/how to return
cost if the domain provides it
important deadline if the domain provides it
```

Do not create maps, store selection, label printing or pickup scheduling unless those contracts actually exist.

## 7.5 Review before submit

The review state should summarize:

```text
item + quantity
reason
return method / instruction
known consequence / expectation
```

Avoid legal/policy walls when a short clear summary plus policy link is enough.

## 7.6 Confirmation

Confirmation must distinguish:

```text
Return request created
```

from:

```text
Refund completed
```

Show:

- case/reference;
- current state;
- concrete next step;
- link to case detail/order.

---

# 8. Claim flow

Recommended flow:

```text
Order detail
→ Report a problem
→ choose issue type
→ item + quantity
→ issue-specific guidance / checks
→ description
→ evidence if required + supported
→ review
→ submit
→ claim status
```

## 8.1 Missing-item flow should reduce false claims

Before a claim form, show relevant fulfillment context when another split delivery is still pending.

Example semantic guidance:

```text
This item is scheduled in another delivery.
View delivery status
```

Do not hard-block a legitimate exception unless the domain says it is ineligible; but do not hide known split-delivery facts.

## 8.2 Damaged item

For damage, make the selected purchased item obvious and then request only evidence required by contract.

If photo upload is supported:

- state what type of photo is useful;
- show upload progress/error;
- allow removal before submit;
- do not imply upload success before persistence succeeds.

If upload contract does not exist, omit the control entirely.

## 8.3 Quality / warranty

Avoid promising approval during submission.

Correct expectation:

```text
Submit issue
→ review required
→ decision/resolution follows
```

Do not display a fake automated warranty countdown if the backend does not publish exact eligibility.

---

# 9. Case detail / status UX

The Aftersales detail screen is a status and next-action surface, not another form after submission.

Recommended hierarchy:

```text
1. Current status
2. What happens next / what customer must do
3. Resolution / refund projection when known
4. Affected item(s)
5. Submitted reason/evidence summary
6. Activity/history
7. Linked order
```

## 9.1 Customer-facing status language

Map internal semantic states into plain language.

Examples:

```text
requested        → Request received
awaiting_return  → Waiting for your return
received         → Item received
under_review     → We're reviewing your claim
needs_information→ More information needed
resolved         → Resolved
rejected         → Request not approved
```

Use final Vietnamese copy during product localization; these are semantic examples only.

## 9.2 Status must not become decorative progress theater

Do not use a 5-step progress bar when the lifecycle branches or when later steps are not guaranteed.

A current-state card + short chronological history is safer for claims.

## 9.3 Needs-information state

When the case requires information, make the request actionable and specific.

Primary CTA should be the required action if supported.

Do not bury it in timeline text.

---

# 10. Refund UX

Refund is a consequence/projection, not the customer's primary mental model for every case.

Show it only when relevant.

Recommended separation:

```text
Case status: Resolved
Refund status: Processing
```

rather than one ambiguous label such as:

```text
Refunding return
```

Never show an estimated settlement date unless supplied by the financial contract.

---

# 11. Replacement / repair UX

Only render these resolution outcomes if the backend publishes them.

For a replacement, customer detail can show:

```text
Replacement approved
current replacement reference/status if available
```

Do not fabricate a new Order card if no Order/replacement contract exists.

For repair, do not show appointment scheduling unless a repair-service contract exists.

---

# 12. Generic exchange UX — intentionally absent

Current GRIP should not present a flow like:

```text
choose replacement SKU
→ calculate price difference
→ reserve stock
→ charge/refund difference
```

That requires Catalog + Checkout + inventory + payment semantics not present in the approved Aftersales SRS.

For ordinary change-of-product intent:

```text
return old item
→ browse/buy new item independently
```

This follows the simplified reference pattern observed in IKEA's general return policy.

---

# 13. Error and edge states

Public design must include at least:

```text
eligibility loading
eligibility failed
no eligible items
partial eligible quantity
request became ineligible before submit
case not found / unauthorized
existing overlapping case
submission failed
attachment failed, if attachments exist
refund projection unavailable
linked current Catalog item unavailable
terminal resolved
terminal rejected
terminal canceled
```

## 13.1 Stale eligibility

If submit fails because eligibility changed:

- preserve safe user-entered detail where possible;
- refresh canonical state;
- explain that the action is no longer available;
- provide next valid route.

Do not silently retry a consequential mutation with changed semantics.

---

# 14. Responsive behavior

Public Aftersales must work well on mobile because post-purchase issue reporting often happens while the customer is near the delivered product.

## Mobile

Prefer:

```text
single-column flow
large semantic choices
sticky primary action only when it does not cover content
native-feeling photo selection if supported
compact Order item summary
```

Avoid:

```text
multi-column forms
wide comparison tables
small status pills as sole status communication
horizontal steppers that overflow
```

## Desktop

Use additional width to improve reading/grouping, not to invent more fields.

A reasonable pattern can be:

```text
main workflow/detail
+
compact Order/item context rail
```

but this is composition guidance, not a mandated layout.

---

# 15. Accessibility

Required behavior:

- issue/return reason choices must be keyboard accessible;
- selected states cannot rely only on color;
- status meaning needs text;
- validation associates with the correct field;
- evidence previews have accessible labels;
- upload progress/error is announced where supported;
- destructive/cancel-request actions require explicit confirmation when consequential;
- focus moves to meaningful error/confirmation content after submit.

---

# 16. Information minimization

Do not ask the customer to re-enter data already authoritative in Order/Account unless it is needed for the new case.

Avoid asking again for:

```text
product title
purchase price
order date
purchase address
customer email
```

when the authorized Order context already supplies it.

Ask only for new Aftersales facts:

```text
affected quantity
reason / issue type
problem description when needed
evidence when needed
return method choice when supported
```

---

# 17. Public flow ownership matrix

| UI concern | Owner / source |
| --- | --- |
| Order reference / historical item | Order |
| Fulfillment status | Order |
| Current account identity | Account |
| Current product navigation | Catalog |
| Return/claim eligibility | Aftersales |
| Case status | Aftersales |
| Return reason | Aftersales policy/contract |
| Evidence | Aftersales evidence contract |
| Refund status | Financial projection consumed by Aftersales/Order |
| New replacement purchase | Catalog + Checkout |

This matrix should be used during Figma review to catch accidental domain duplication.

---

# 18. Canonical screen/state inventory for Figma

Minimum public design coverage:

```text
A. Order detail — eligible Aftersales entry
B. Order detail — existing case projection
C. Return — item/quantity
D. Return — reason
E. Return — method/instruction, only if supported
F. Return — review
G. Return — confirmation
H. Claim — issue type
I. Claim — description/evidence
J. Claim — review
K. Claim — confirmation
L. Aftersales detail — return in progress
M. Aftersales detail — claim under review
N. Aftersales detail — needs information
O. Aftersales detail — resolved + refund pending
P. Aftersales detail — rejected
Q. Ineligible / no action
R. Stale-submit failure
S. Mobile equivalents/recomposition
```

Do not add standalone exchange, warehouse return, repair scheduling or support-chat screens.

---

# 19. Figma guardrails

Before a Public Aftersales design can pass:

```text
[ ] Historical item information comes from Order semantics.
[ ] Return and claim are visibly distinct intents.
[ ] No fake eligibility rules are hardcoded into UI copy.
[ ] No request confirmation is mislabeled as refund completion.
[ ] Missing-item flow respects split fulfillment context.
[ ] Evidence upload exists only if backend contract supports it.
[ ] Generic exchange engine is absent.
[ ] Replacement/repair UI is capability-gated.
[ ] Current state + next action are more prominent than timeline decoration.
[ ] Mobile flow remains task-complete.
[ ] No Account/Catalog/Checkout editor is recreated inside Aftersales.
```
