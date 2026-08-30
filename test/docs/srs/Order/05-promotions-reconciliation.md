# Order — Promotions Reconciliation

**Status:** Active additive reconciliation — Promotions  
**Patch node:** `P001-promotions`  
**Parent state:** `BASE`

**Extends:**
- `02-grip-order-srs.md`
- `03-grip-order-public-ui-ux-research.md`
- `04-grip-order-admin-ui-ux-research.md`

**Vertical input:**
- `../Promotions/02-grip-promotions-srs.md`

## 1. Canonical boundary

Order remains the canonical placed-purchase record.

Promotions adds purchase-time commercial evidence; it does not change post-placement ownership.

## 2. Promotion result

When a placed Order used a promotion, preserve enough purchase-time evidence to explain the final amount:

```text
promotion reference/name when useful
applied code when appropriate
effect type
discount amount
line/shipping allocation when later explanation requires it
```

Later edits or expiry of a Promotion must never change historical Order totals.

Public/Admin Order UI may show the purchase-time discount as part of the commercial breakdown. It must not show current mutable promotion status as though it belonged to the historical Order.

## 3. Aftersales relationship

Aftersales may consume the historical net paid amount and promotion allocation to explain a refund/replacement outcome.

Aftersales must not re-evaluate current Promotions.

## 4. Explicit non-changes

This Promotions reconciliation does not add:

```text
Membership BusinessContext
Business Solutions proposal/quotation provenance
post-placement repricing
promotion management
business member management
quotation revision
arbitrary order editing
```

Membership and Business Solutions receive separate Order reconciliation artifacts at their own roadmap CAP-06 turns.

## 5. Patch execution steps

Task Provider resolves this file as the complete Order transition for `P001-promotions`.

```text
1. Resolve existing Order Public/Admin canonical surfaces.
2. Reconcile commercial breakdown so purchase-time promotion/discount evidence is visible where needed.
3. Keep historical final totals stable after promotion expiry/edit.
4. Preserve only purchase-time promotion evidence, never current mutable promotion configuration.
5. Keep promotion authoring and repricing out of Order.
6. Preserve enough allocation/net-paid evidence for later Aftersales explanation.
7. Verify resulting Order state; do not tune unrelated fulfillment/timeline/copy/layout.
```

## 6. Desired state after `P001-promotions`

```text
Order @ P001-promotions

Public/Admin
- final commercial breakdown can show stable purchase-time promotion evidence
- discount amount/effect is explainable
- applied code/reference may be shown when appropriate
- later Promotion changes never rewrite historical totals
- current promotion status/configuration is not presented as Order-owned truth

Aftersales contract
- historical net paid amount/promotion allocation can be consumed for remedy explanation
- current Promotions are not re-evaluated

Not present yet
- Membership BusinessContext
- Business Solutions proposal/quotation provenance
```

## 7. Completion evidence

An Order Figma patch is complete only when purchase-time promotion evidence is represented as stable historical commercial truth. Fulfillment spacing, timeline cleanup, operator copy changes, or unrelated actions are not evidence for `P001-promotions`.
