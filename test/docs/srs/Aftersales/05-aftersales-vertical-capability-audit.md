# Aftersales — Vertical Capability Audit

**Status:** NO DIRECT PATCH REQUIRED

## Baseline reviewed

- current Aftersales research/SRS/Public/Admin artifacts
- Promotions / Membership / Business Solutions SRS
- Order vertical reconciliation

## Promotions

Aftersales may need historical net paid amounts or line-level commercial allocation when calculating/explaining a valid remedy.

That truth comes from Order purchase-time evidence.

Aftersales must not re-evaluate current Promotion rules or current coupon validity.

No new Aftersales workflow is required.

## Membership

A business-linked Order can enter the same valid return/claim/warranty flows as allowed by existing Aftersales rules.

Current business membership role changes do not rewrite the customer/business context captured by the historical Order.

No separate business-claim domain has been accepted.

## Business Solutions

Proposal/quotation provenance does not change post-purchase remedy ownership.

If a Business Solutions purchase becomes an Order, Aftersales begins from the Order like any other purchase.

No proposal-revision or quotation workflow belongs in Aftersales.

## Result

Aftersales remains coherent without direct SRS/UI changes.

The only required integration is indirect:

```text
Promotions / Membership / Business Solutions
→ Checkout
→ Order purchase-time snapshot
→ Aftersales consumes relevant Order truth
```

Therefore this vertical pass is `NO DIRECT PATCH REQUIRED`.