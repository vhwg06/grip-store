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

Expected Promotions evidence includes effective promotional price treatment with regular price/savings presentation where authoritative.

### Catalog Admin UI/UX — PATCH

Promotions adds `Khuyến mãi` as a simple commerce extension in the existing Admin shell while ProductModel editing remains unchanged.

Expected evidence:

```text
Mã khuyến mãi
Giảm giá tự động
```

### Checkout — PATCH

Checkout already has generic coupon/discount behavior. Reconcile it to Promotions V1:

```text
one active coupon
percentage / fixed / free shipping
minimum order
current-context revalidation
successful placed purchase consumes usage
```

Public evidence includes:

```text
coupon entry
apply state
remove state
validation/error feedback
commercial-summary discount effect
```

Checkout Admin does not own promotion authoring.

### Account — NO PATCH REQUIRED

Base Promotions V1 adds no Account-owned promotion surface, coupon wallet, or rewards center.

### Engagement — NO PATCH REQUIRED

Saved Lists continue consuming current Catalog commerce projection. Promotions adds no Engagement-owned rule/workflow.

### Content — PATCH

Content may tell an offer story and render current authoritative commerce projection where relevant, but it must not become promotion truth or rule authoring.

### Order — PATCH

Order preserves purchase-time promotion evidence sufficient to explain final totals and later remedies. It must not expose current mutable promotion configuration as Order-owned truth.

### Aftersales — NO DIRECT PATCH REQUIRED

Aftersales may consume stable historical paid/promotion allocation from Order; it does not re-evaluate current Promotions or gain a Promotions workflow.

## 3. Cross-capability review

```text
Catalog regular product/price truth
→ Promotions computes effective offer
→ Checkout applies/revalidates coupon
→ Order snapshots result
```

PASS.

Promotions does not require Membership for base V1; Membership may later add eligibility context.

PASS.

## 4. `P001-promotions` Module patch activation

PROMO-06 activates **Module-local patch nodes**, not one cumulative cross-product reconciliation file.

Direct `P001-promotions` nodes:

```text
Catalog
→ docs/srs/catalog/07-promotions-reconciliation.md

Checkout
→ docs/srs/checkout/05-promotions-reconciliation.md

Content
→ docs/srs/Content/04-promotions-reconciliation.md

Order
→ docs/srs/Order/05-promotions-reconciliation.md
```

No `P001-promotions` node exists for:

```text
Account
Engagement
Aftersales
```

Those Modules remain at `BASE` for P001 and may enter a Figma run only as dependency compatibility tasks.

The no-patch audit artifacts remain planning evidence; they are not Module state nodes and do not authorize Figma mutation.

Membership and Business Solutions source artifacts may already exist, but P002/P003 Module nodes remain absent until their own CAP-06 turns.

See `../vertical-capability-sequencing.md`.

## 5. Task Provider execution

Agent-facing Figma execution uses only the registered task id:

```bash
npm run task -- --task figma-p001-promotions
```

Task registry resolves:

```text
figma-p001-promotions
→ pipeline = figma
→ patch = P001-promotions
```

Task Provider then derives:

```text
direct patch Modules = Catalog / Checkout / Content / Order
↓
Figma dependency closure
↓
per-Module resolver
↓
PATCH or COMPATIBILITY task
```

The caller/agent does not pass pipeline id, product patch id, graph path, changed seed, change-doc list, Module docs, or Figma node ids.

For direct PATCH tasks, the Module patch document itself defines execution steps + resulting desired state. Only a verified Module patch gap may authorize writer mutation.

For dependency-only COMPATIBILITY tasks, any discovered need for a direct change is a `DOC_GAP` and stops the pipeline; the Figma writer must not invent the missing patch.

## 6. Promotions completion evidence

`P001-promotions` is complete only when provider task `figma-p001-promotions` closes with explicit Promotions evidence for every resolved Module task.

General Figma tuning is not evidence.

Examples of non-evidence:

```text
spacing cleanup
gallery polish
unrelated copy changes
generic composition tuning
fulfillment/timeline cleanup
Business Solutions blocks
Membership context
```

PROMO-07 requires the product to remain coherent through the Promotions roadmap point only.
