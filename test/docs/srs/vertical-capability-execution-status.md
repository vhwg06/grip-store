# GRIP Vertical Capability Execution — Current Checkpoint

**Status:** `P001-promotions` Module patch activation complete; Figma execution must run through Task Provider; Membership next  
**Depends on:** `test/docs/srs/README.md`, `test/docs/srs/vertical-capability-sequencing.md`

## Current roadmap

```text
P001-promotions planning / CAP-06     ✅
P001-promotions Module patch graphs   ✅
P001-promotions Figma                 🔄 requires Task Provider run
P002-membership                       ⏭ next CAP-06 activation
P003-business-solutions               ⏳ after Membership
```

## Current Module state checkpoint

Direct `P001-promotions` Module nodes exist for:

```text
Catalog
Checkout
Content
Order
```

No direct P001 node exists for:

```text
Account
Engagement
Aftersales
```

At the P001 checkpoint those Modules remain at their latest earlier state (`BASE` today) and are compatibility-only when dependency closure reaches them.

Membership and Business Solutions source planning remains prepared but is not activated as P002/P003 Module nodes yet.

## Promotions desired state

```text
Catalog
→ promotional/effective pricing projection
→ Khuyến mãi / Mã khuyến mãi / Giảm giá tự động
→ Product/Variant regular-price ownership preserved

Checkout
→ coupon entry/apply/remove/revalidation/error states
→ automatic discount/commercial-summary effect
→ no Promotions checkout stage

Content
→ editorial offer/product references may render authoritative current promotion projection
→ no promotion-rule ownership
→ no Business Solutions CTA yet

Order
→ stable purchase-time promotion evidence
→ historical totals never follow later Promotion edits/expiry

Account / Engagement / Aftersales
→ no direct Promotions-owned UI/workflow patch
→ compatibility verification only
```

## Figma execution checkpoint

The earlier dependency PASS is not valid evidence that Promotions Figma completed. It ran as a generic Module-quality reconciliation and reported unrelated tuning rather than explicit Promotions patch evidence.

Canonical execution now starts only through Task Provider:

```bash
npm run task -- --pipeline figma --patch P001-promotions
```

Task Provider resolves pipeline configuration, direct Module patch nodes, dependency closure, each Module's state and exact task inputs.

The caller does not supply:

```text
graph path
changed seed
active-change document list
Module docs
Figma URL/node id
```

Direct Module tasks run in `PATCH` mode. Dependency-only Modules run in `COMPATIBILITY` mode.

If a compatibility Module is discovered to require a direct Promotions change, the result is `DOC_GAP`; Figma mutation is forbidden until a canonical P001 Module patch is defined.

## Membership source planning

Prepared artifacts remain under `Membership/`:

```text
01-grip-membership-reference-research.md
02-grip-membership-srs.md
03-grip-membership-public-ui-ux-extension.md
04-grip-membership-admin-ui-ux-extension.md
05-membership-impact-map-and-review.md
```

They become active Module state only when P002/Membership reaches CAP-06 and the affected Module graphs receive `P002-membership` nodes.

## Business Solutions source planning

Prepared source artifacts remain under `BusinessSolutions/` and activate as `P003-business-solutions` Module nodes only after Membership.

## Completion meaning

At this checkpoint:

```text
Promotions planning / Module patch activation = complete
Promotions Figma                             = not yet proven under Task Provider execution
Membership Module patch activation          = not started
Business Solutions Module patch activation  = not started
```

Do not infer `P001-promotions` completion from a Figma PASS that was not produced from a provider-resolved task package.
