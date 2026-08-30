# Content — Business Solutions Reconciliation

**Status:** Active additive reconciliation — Business Solutions  
**Patch node:** `P003-business-solutions`  
**Parent state:** `P001-promotions`

**Extends:**
- `02-grip-content-srs.md`
- `03-grip-content-ui-ux-research.md`
- `04-promotions-reconciliation.md`

**Vertical input:**
- `../BusinessSolutions/01-grip-business-solutions-reference-research.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`
- `../BusinessSolutions/03-grip-business-solutions-public-ui-ux-extension.md`
- `../BusinessSolutions/04-grip-business-solutions-admin-ui-ux-extension.md`
- `../BusinessSolutions/05-business-solutions-impact-map-and-review.md`

## 1. Source traceability

```text
BUS-01 → BUS-02 → BUS-03/BUS-04 → BUS-05 Content PATCH → this P003 transition
```

| P003 Content requirement | Immediate authority | Upstream trace |
| --- | --- | --- |
| Relevant business guidance may expose a typed CTA into Business Solutions | BUS-02 §18; BUS-03 §§2,14; BUS-05 Content PATCH | BUS-01 says a business need should transition into assistance/planning when useful |
| Content remains editorial/inspiration and does not own customer-specific request state | BUS-02 §18; BUS-05 Content PATCH | BUS-01 distinguishes general guidance from a concrete customer-specific solution workflow |
| Preserve canonical product/promotion references rather than hardcoding mutable commerce truth | BUS-03 §§8,10; existing P001 Content state | BUS-01 requires proposals/quotes to converge on current purchasable product/commercial context |
| No proposal/quotation editor inside Content authoring | BUS-04 §§3-4; BUS-05 Content PATCH | BUS-01 rejects a second workflow universe |

Untraceable Content behavior is a planning gap and must not be invented in P003/Figma.

## 2. Purpose

Allow editorial guidance to hand a relevant business need into Business Solutions while preserving Content ownership boundaries.

## 3. Public Content reconciliation

Relevant business-oriented content may expose a contextual CTA such as:

```text
Cần GRIP hỗ trợ lên phương án?
```

The action enters the canonical Business Solutions request flow, optionally carrying safe contextual intent where supported.

Once a customer-specific request exists, Business Solutions owns that workflow.

## 4. Admin Content reconciliation

Structured Content authoring may use a typed Business Solutions destination/action where supported.

Do not add request/proposal/quotation editing, operator assignment, consultation state or commercial workflow into Content Admin.

## 5. P001 Promotions state preserved

Preserve:

```text
Content owns editorial meaning/composition
Catalog owns product truth
Promotions owns promotion truth
mutable commerce values are not hardcoded into editorial content
```

Business Solutions CTA does not change those owners.

## 6. Explicit non-changes

Do not add:

```text
customer-specific request records inside Content
proposal/quotation authoring
CRM fields
business workflow timeline
manual pricing
second product catalogue
```

## 7. Patch execution steps

```text
1. Resolve Content Public/Admin surfaces at P001-promotions.
2. Add Business Solutions CTA only on relevant business guidance/content.
3. Route the CTA into the canonical Business Solutions request flow.
4. Preserve product/promotion reference ownership from P001.
5. Keep customer-specific request/proposal/quotation state out of Content.
6. Verify P003 evidence only; do not perform unrelated Content cleanup.
```

## 8. Desired state after `P003-business-solutions`

```text
Content @ P003-business-solutions

Public
- relevant business guidance can lead into Business Solutions
- generic editorial content remains generic until the user starts a request

Admin
- authoring may select a typed Business Solutions CTA/destination
- no request/proposal/quotation workflow exists inside Content

Ownership
- Content = inspiration/editorial
- Business Solutions = customer-specific need → proposal/quotation
```

## 9. Completion evidence

P003 Content is complete only when a contextually relevant Business Solutions handoff exists without turning Content into the request/proposal workflow.