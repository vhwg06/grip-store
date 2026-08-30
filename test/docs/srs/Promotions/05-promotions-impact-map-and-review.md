# Promotions — Impact Map & Review

**Pipeline stages:** PROMO-05 / PROMO-06 / PROMO-07

## 1. Existing baseline inspected

```text
catalog/srs_001_product.md
catalog/catalog-public-ui-ux-guide.md
catalog/04-merchandising-cart-interactions.md
catalog/catalog-admin-ui-ux-research.md
checkout/checkout_srs.md
checkout/checkout_ui_ux_research.md
checkout/checkout-admin-ui-ux-research.md
Content/02-grip-content-srs.md
Content/03-grip-content-ui-ux-research.md
Order/02-grip-order-srs.md
Order/03-grip-order-public-ui-ux-research.md
Order/04-grip-order-admin-ui-ux-research.md
```

## 2. Impact decisions

### Catalog Product SRS — NO BREAKING PATCH

The existing ProductModel SRS correctly keeps promotion rules outside the ProductModel aggregate. Promotions extends the broader Catalog/commerce capability without putting discount rules inside Variant/ProductModel.

Required reconciliation is additive documentation only:

```text
Catalog product truth + regular price
+
Promotions effective commercial projection
```

### Catalog Public UI/UX — PATCH

Existing merchandising/pricing UI already has slots for discount, sale and flash-sale semantics and explicitly asks for an authoritative promotion/campaign contract.

Promotions SRS now supplies that business contract.

Patch by linking the existing Catalog public pricing/merchandising behavior to the Promotions capability rather than inventing a new product-card system.

Expected Promotions evidence includes effective promotional price treatment with regular price/savings presentation where authoritative.

### Catalog Admin UI/UX — PATCH

Existing Catalog Admin currently excludes promotion management.

Promotions adds `Khuyến mãi` as a simple commerce extension in the existing Admin shell, while ProductModel editing remains unchanged.

Expected Promotions evidence includes simple operator flows for:

```text
Mã khuyến mãi
Giảm giá tự động
```

### Checkout SRS — PATCH

Checkout already has generic coupon/discount behavior. Reconcile it to the GRIP Promotions V1 rules:

```text
one active coupon
percentage / fixed / free shipping
minimum order
current-context revalidation
successful placed purchase consumes usage
```

Do not import loyalty/reward complexity into Promotions.

### Checkout Public UI/UX — PATCH

Extend existing focused Checkout with compact coupon entry + commercial-summary feedback.

Expected Promotions evidence includes:

```text
coupon entry
apply state
remove state
validation/error feedback
commercial-summary discount effect
```

No standalone Promotions customer page.

### Checkout Admin UI/UX — NO PATCH REQUIRED

Promotion authoring belongs in Catalog/commerce Admin, not Checkout Admin. Checkout Admin does not need promotion configuration.

### Account — NO PATCH REQUIRED

Base Promotions V1 does not add an Account-owned promotion surface, coupon wallet, or rewards center.

If Account appears in the Catalog dependency closure, it is compatibility-only for this active change.

### Engagement — NO PATCH REQUIRED

Saved Lists continue consuming current Catalog commerce projection. Promotions does not add an Engagement-owned rule or workflow.

If Engagement appears in the dependency closure, verify compatibility only.

### Content SRS/UI — PATCH

Content may reference/promote active offers editorially but must consume promotion truth rather than authoring discount values/eligibility.

Expected Promotions evidence is the ability to present current offer/promotion projection where relevant without Content becoming the promotion source of truth.

### Order SRS — PATCH

Order needs purchase-time promotion evidence sufficient to explain final totals and later remedies.

### Order Public/Admin UI — PATCH

Display final discount/effect as part of historical commercial truth where useful. Do not expose current mutable promotion configuration.

Expected Promotions evidence is a stable purchase-time discount/promotion explanation in the relevant Order surfaces.

### Aftersales — NO DIRECT PATCH REQUIRED

Aftersales consumes historical paid/promotion allocation from Order where existing remedy logic needs it. It does not re-evaluate current Promotions and gains no separate Promotions workflow.

If Aftersales appears in the dependency closure, verify compatibility only.

## 3. Cross-capability review

```text
Catalog regular product/price truth
→ Promotions computes effective offer
→ Checkout applies/revalidates coupon
→ Order snapshots result
```

PASS.

Promotions does not require Membership for base V1; Membership may later provide eligibility context.

PASS.

## 4. CAP-06 activation

PROMO-06 is applied **immediately for Promotions** after this impact map is accepted.

Do not defer Promotions reconciliation until Membership or Business Solutions are defined, and do not combine future capability decisions into Promotions Module reconciliation files.

Current active Module reconciliation/audit files are Promotions-specific:

```text
catalog/07-promotions-reconciliation.md
checkout/05-promotions-reconciliation.md
Content/04-promotions-reconciliation.md
Order/05-promotions-reconciliation.md
Engagement/04-promotions-audit.md
Aftersales/05-promotions-audit.md
```

Membership and Business Solutions source artifacts may already exist, but they remain inactive for current Module reconciliation until their own CAP-06 turns.

See `../vertical-capability-sequencing.md`.

## 5. Figma active change authority

For the Promotions Figma dependency pass, this document is the run-level active change authority.

```text
--change Promotions
--change-doc docs/srs/Promotions/05-promotions-impact-map-and-review.md
```

The dependency graph only selects logical Module scope. Child harnesses must classify Promotions for each selected Module as exactly one of:

```text
CHANGE_VERIFIED: Promotions
CHANGE_GAP: Promotions
CHANGE_NOT_APPLICABLE: Promotions
```

Only a Promotions `CHANGE_GAP` may authorize mutation.

Unrelated pre-existing visual/craft defects are not Promotions patch intent and must not trigger general Figma tuning.

PROMO-07 is complete only when the end-to-end product remains coherent through the Promotions activation point and the canonical Figma dependency pass provides explicit Promotions evidence for every selected Module.
