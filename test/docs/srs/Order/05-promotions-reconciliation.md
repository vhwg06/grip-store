# Order — Promotions Reconciliation

**Status:** Active additive reconciliation — Promotions  
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

## 5. Result

Order continues to answer what was purchased and for what final amount, including stable purchase-time promotion evidence where applicable.
