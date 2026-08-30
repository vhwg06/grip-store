# Order — Business Solutions Reconciliation

**Status:** Active additive reconciliation — Business Solutions  
**Patch node:** `P003-business-solutions`  
**Parent state:** `P002-membership`

**Extends:**
- `02-grip-order-srs.md`
- `03-grip-order-public-ui-ux-research.md`
- `04-grip-order-admin-ui-ux-research.md`
- `05-promotions-reconciliation.md`
- `06-membership-reconciliation.md`

**Vertical input:**
- `../BusinessSolutions/01-grip-business-solutions-reference-research.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`
- `../BusinessSolutions/03-grip-business-solutions-public-ui-ux-extension.md`
- `../BusinessSolutions/04-grip-business-solutions-admin-ui-ux-extension.md`
- `../BusinessSolutions/05-business-solutions-impact-map-and-review.md`

## 1. Source traceability

```text
BUS-01 → BUS-02 → BUS-03/BUS-04 → BUS-05 Order PATCH → this P003 transition
```

| P003 Order requirement | Immediate authority | Upstream trace |
| --- | --- | --- |
| Preserve optional Business Solutions provenance after successful placement | BUS-02 §16; BUS-05 Order SRS PATCH | BUS-01 IKEA-BUS-04: assisted purchase continues into canonical Order and remains explainable |
| Public Order may show source business/quotation context only when useful | BUS-03 §13; BUS-05 Order Public UI/UX PATCH | BUS-01 rejects a duplicate order-history universe |
| Order Admin may navigate back to originating request/proposal/quotation | BUS-04 §13; BUS-05 Order Admin UI/UX PATCH | BUS-01 keeps support continuity while Order remains purchase authority |
| Preserve P001 Promotions evidence and P002 BusinessContext history | existing P001/P002 Order states; BUS-02 §§12,16 | BUS-01 treats proposal/quotation as upstream intent, not a replacement for final purchase truth |
| Do not duplicate proposal/quotation lifecycle or post-purchase workflow in Order | BUS-02 §§16,21; BUS-03 §§13,16 | BUS-01 explicitly avoids a second commerce/procurement stack |

Untraceable Order behavior is a planning gap and must not be invented in P003/Figma.

## 2. Purpose

Preserve useful Business Solutions provenance on the canonical placed Order without making Order own request/proposal/quotation lifecycle.

## 3. Purchase-time provenance

When placement originated from a Business Solutions handoff, Order may preserve stable references/context such as:

```text
business_ref
proposal_ref?
quotation_ref?
```

The exact storage shape is implementation-specific; the product invariant is stable historical provenance.

## 4. Public Order reconciliation

Where useful to explain the purchase, show compact source context such as:

```text
Mua cho: GRIP Studio
Nguồn: Báo giá Q-2026-018
```

The user may navigate to the related Business Solutions detail when appropriate.

Do not copy proposal revision or quotation lifecycle controls into Order.

## 5. Admin Order reconciliation

Order Admin may expose originating Business Solutions references/navigation for support and audit context.

Tracking, cancellation, status and post-purchase operations remain Order/Aftersales-owned. Request/proposal/quotation editing remains Business Solutions-owned.

## 6. Existing P001/P002 state preserved

Preserve:

```text
P001 Promotions
- stable purchase-time promotion evidence
- immutable historical totals

P002 Membership
- stable business purchase context
- later member/role/business-state changes do not rewrite historical Order
```

Business Solutions provenance is additional purchase-time history, not live mutable workflow state.

## 7. Explicit non-changes

Do not add:

```text
proposal editor
quotation editor
revision workflow
current Membership role editor
retroactive repricing
purchase approval
credit workflow
second order tracker
fulfillment ownership
```

## 8. Patch execution steps

```text
1. Resolve Order Public/Admin surfaces at P002-membership.
2. Add compact Business Solutions provenance only for Orders originating from that flow.
3. Provide useful navigation to the originating request/quotation without duplicating workflow state.
4. Preserve all P001 promotion and P002 business-history invariants.
5. Keep post-purchase operations in Order/Aftersales and proposal/quotation actions in Business Solutions.
6. Verify P003 evidence only; do not tune unrelated Order craft.
```

## 9. Desired state after `P003-business-solutions`

```text
Order @ P003-business-solutions

Public
- canonical Order remains the purchase-history surface
- Business Solutions-origin Orders can show compact source provenance
- no proposal/quotation workflow is duplicated

Admin
- source request/proposal/quotation can be inspected/navigated where useful
- Order operations remain Order-owned

Historical invariants
- P001 promotion evidence remains stable
- P002 BusinessContext history remains stable
- P003 source provenance remains stable after upstream proposal/quotation lifecycle changes
```

## 10. Completion evidence

P003 Order is complete only when Business Solutions-origin purchases are explainable through stable provenance without duplicating Business Solutions or weakening existing Order history invariants.