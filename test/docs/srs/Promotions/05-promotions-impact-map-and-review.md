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

### Catalog Admin UI/UX — PATCH

Existing Catalog Admin currently excludes promotion management.

Promotions adds `Khuyến mãi` as a simple commerce extension in the existing Admin shell, while ProductModel editing remains unchanged.

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

No standalone Promotions customer page.

### Checkout Admin UI/UX — NO PATCH REQUIRED

Promotion authoring belongs in Catalog/commerce Admin, not Checkout Admin. Checkout Admin does not need promotion configuration.

### Content SRS/UI — PATCH

Content may reference/promote active offers editorially but must consume promotion truth rather than authoring discount values/eligibility.

### Order SRS — PATCH

Order needs purchase-time promotion evidence sufficient to explain final totals and later remedies.

### Order Public/Admin UI — PATCH

Display final discount/effect as part of historical commercial truth where useful. Do not expose current mutable promotion configuration.

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

## 4. Patch execution

Apply additive reconciliation inside the affected existing module documentation after Membership and Business Solutions are also defined, so shared files are patched once.