# GRIP Vertical Capability Execution — Current Checkpoint

**Status:** Promotions planning activated; Membership next  
**Depends on:** `test/docs/srs/README.md`, `test/docs/srs/vertical-capability-sequencing.md`

## Current roadmap

```text
Promotions          ✅ planning + CAP-06 activation
Membership          ⏭ next activation
Business Solutions  ⏳ queued after Membership
```

## Promotions active canonical checkpoint

Current existing-Module planning inputs represent:

```text
baseline GRIP
+
Promotions
```

Active Promotions reconciliation/audit includes:

```text
Catalog
→ promotional/effective pricing projection
→ Promotions Admin extension

Checkout
→ coupon apply/remove/revalidation
→ discount commercial-summary behavior

Content
→ current promotion/offer projection

Order
→ purchase-time promotion evidence

Engagement
→ no direct Promotions patch required

Aftersales
→ no direct Promotions workflow patch required

Account
→ no Promotions reconciliation required for base V1
```

Membership and Business Solutions source planning remains prepared but is not active canonical Module reconciliation yet.

## Figma execution checkpoint

The next Promotions Figma dependency pass must distinguish dependency scope from patch intent.

Canonical execution context:

```text
original changed Module seed = Catalog
active change = Promotions
active change authority = Promotions/05-promotions-impact-map-and-review.md
```

Command shape:

```bash
npm run figma:pipeline -- \
  --graph docs/srs/figma-pipeline-dependencies.json \
  --changed Catalog \
  --change Promotions \
  --change-doc docs/srs/Promotions/05-promotions-impact-map-and-review.md \
  --max-repairs 3
```

The graph may select the full Catalog dependency closure. That closure is review scope only.

For each Module, the child harness must return one of:

```text
CHANGE_VERIFIED: Promotions
CHANGE_GAP: Promotions
CHANGE_NOT_APPLICABLE: Promotions
```

Only `CHANGE_GAP` may authorize writer mutation.

A successful child writer lifecycle must close with fresh reviewer evidence that Promotions is verified. General layout/copy/craft tuning without Promotions evidence does not prove the Promotions patch completed.

## Membership source planning

Prepared source artifacts remain available under `Membership/`:

```text
01-grip-membership-reference-research.md
02-grip-membership-srs.md
03-grip-membership-public-ui-ux-extension.md
04-grip-membership-admin-ui-ux-extension.md
05-membership-impact-map-and-review.md
```

They become active Module reconciliation only when Membership reaches CAP-06.

## Business Solutions source planning

Prepared source artifacts remain available under `BusinessSolutions/` and are activated only after Membership.

## Completion meaning

At this checkpoint:

```text
Promotions planning / canonical reconciliation = active
Promotions Figma patch = requires active-change evidence from canonical figma:pipeline run
Membership canonical activation = not started
Business Solutions canonical activation = not started
```

Do not infer Promotions Figma completion from a dependency-pipeline PASS that lacked explicit Promotions change evidence.
