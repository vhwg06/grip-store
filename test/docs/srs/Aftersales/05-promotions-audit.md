# Aftersales — Promotions Audit

**Status:** NO DIRECT PATCH REQUIRED — Promotions

## Baseline reviewed

- current Aftersales research/SRS/Public/Admin artifacts
- `../Promotions/02-grip-promotions-srs.md`
- Order Promotions reconciliation

## Promotions relationship

Aftersales may need historical net paid amounts or line-level commercial allocation when calculating/explaining a valid remedy.

That truth comes from Order purchase-time evidence.

Aftersales must not re-evaluate current Promotion rules or current coupon validity.

No new Aftersales workflow is required for Promotions.

## Result

The only required integration is indirect:

```text
Promotions
→ Checkout
→ Order purchase-time promotion evidence
→ Aftersales consumes relevant Order truth
```

Therefore Promotions is `NO DIRECT PATCH REQUIRED` for Aftersales.

Membership and Business Solutions are later roadmap capabilities and are not part of this audit. They receive their own audit/reconciliation decision when activated.
