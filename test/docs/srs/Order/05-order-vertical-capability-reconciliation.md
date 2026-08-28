# Order — Vertical Capability Reconciliation

**Status:** Final additive reconciliation

**Extends:** `02-grip-order-srs.md`, `03-grip-order-public-ui-ux-research.md`, `04-grip-order-admin-ui-ux-research.md`

**Inputs:** Promotions, Membership, Business Solutions SRS.

## 1. Canonical boundary

Order remains the canonical placed-purchase record. New vertical capabilities add purchase-time context; they do not change post-placement ownership.

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

## 3. Business context

When Checkout was performed for a Business, Order may preserve:

```text
business reference
business display snapshot when useful
acting Account/member reference when useful
```

Membership changes later do not rewrite historical business purchases.

Public Order can show a compact `Mua cho <Business>` summary. Admin Order can show/link the Business context. Member management remains Membership-owned.

## 4. Business Solutions provenance

When placement originated from an accepted business proposal/quotation, Order may preserve optional references:

```text
business request
proposal
quotation
```

Public/Admin UI may provide secondary navigation back to the source request/quotation when useful.

Order status, tracking and post-purchase actions remain primary.

## 5. Aftersales relationship

Aftersales may consume the historical net paid amount and promotion allocation to explain a refund/replacement outcome. It must not re-evaluate current Promotions.

## 6. Explicit non-changes

Order does not gain:

```text
post-placement repricing
promotion management
business member management
quotation revision
arbitrary order editing
```

## 7. Result

Order continues to answer:

> What was actually purchased, under which customer/business context, for what final amount, and what is happening now?

The vertical capabilities enrich that historical snapshot without changing the Order lifecycle boundary.