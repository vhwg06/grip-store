# Engagement — Promotions Audit

**Status:** NO PATCH REQUIRED — Promotions

## Baseline reviewed

- `02-grip-engagement-srs.md`
- `03-grip-engagement-ui-ux-research.md`
- `../Promotions/02-grip-promotions-srs.md`

## Promotions

Saved Lists already render current Catalog commerce projection rather than preserving an old saved price.

Therefore active promotional pricing can flow through the same current Catalog projection without changing Engagement ownership.

Engagement does not own:

```text
coupon application
promotion rules
promotion authoring
```

## Result

```text
Saved Lists + Reviews
```

remain coherent and unchanged for Promotions.

Membership and Business Solutions are later roadmap capabilities and are not part of this audit. They receive their own audit/reconciliation decision at their CAP-06 turns if needed.
