# Catalog — Promotions Reconciliation

**Status:** Active additive reconciliation — Promotions  
**Patch node:** `P001-promotions`  
**Parent state:** `BASE`

**Extends:**
- `srs_001_product.md`
- `catalog-public-ui-ux-guide.md`
- `04-merchandising-cart-interactions.md`
- `catalog-admin-ui-ux-research.md`

**Vertical input:**
- `../Promotions/02-grip-promotions-srs.md`
- `../Promotions/03-grip-promotions-public-ui-ux-extension.md`
- `../Promotions/04-grip-promotions-admin-ui-ux-extension.md`

## 1. Purpose

Apply the Promotions capability to the existing Catalog product/commerce experience without importing later roadmap capabilities.

Catalog remains product-centered. Promotions supplies effective commerce behavior around existing product truth.

## 2. Domain reconciliation

`Catalog/Product` remains authoritative for:

```text
ProductModel
Variant
SKU
regular selling price
current product/variant identity
current sellability/publication
category/product references
```

Promotions adds:

```text
Catalog regular price
+
Promotions effective discount
→ public promotional price projection
```

Required invariant:

```text
Variant regular price
≠ promotional effective price
```

Promotion activation/expiry must not rewrite ProductModel/Variant regular-price history.

Promotion rules remain outside the ProductModel aggregate.

## 3. Public Catalog UI reconciliation

Existing Catalog Public UX remains the base.

When an effective automatic product discount applies, listing/PDP pricing may show:

```text
effective promotional price
regular price
saving amount / discount percent when authoritative
validity when useful
```

Do not create a second product tile or separate promotion-card system.

### Flash Sale

Existing rule remains:

```text
Flash Sale
≠ discountPercent alone
```

Promotions V1 does not require a Flash Sale type. Ordinary automatic discounts must not synthesize Flash Sale labels/countdowns.

## 4. Catalog Admin reconciliation

Existing Product administration remains responsible for ProductModel/Variant/category setup.

Promotions adds a simple commerce-management destination in the existing Admin shell:

```text
Khuyến mãi
├── Mã khuyến mãi
└── Giảm giá tự động
```

This is not ProductModel editing.

Do not put promotion value, validity, coupon code, or usage-limit fields inside the Product editor.

Product/category selection used by Promotions should reuse existing Catalog selection/search patterns.

## 5. Cross-capability contract at this roadmap point

```text
Catalog
  supplies product identity + regular price

Promotions
  supplies effective promotion result

Checkout
  applies/revalidates supported coupon behavior

Order
  snapshots final promotion evidence
```

## 6. Explicit non-changes

This Promotions reconciliation does not add:

```text
Business Solutions entry points
proposal/customer-specific fields
business-membership roles
inventory ownership
wholesale price lists
quantity-tier pricing
customer-specific pricing
promotion rule DSL
```

Business Solutions is a later roadmap capability and must receive its own Catalog reconciliation when BUS-06 is activated.

## 7. Patch execution steps

Task Provider resolves this file as the complete Catalog transition for `P001-promotions`.

```text
1. Resolve the existing Catalog Public + Catalog Admin canonical surface set.
2. Reconcile Public pricing states to distinguish regular price from effective promotional price.
3. Preserve authoritative savings only; do not synthesize Flash Sale semantics.
4. Reconcile Admin navigation/workflow so Khuyến mãi exposes:
   - Mã khuyến mãi
   - Giảm giá tự động
5. Reuse existing product/category selection patterns for promotion applicability.
6. Keep Product/Variant editing free of promotion-rule fields.
7. Verify the resulting Catalog state; do not tune unrelated Catalog craft/layout.
```

## 8. Desired state after `P001-promotions`

```text
Catalog @ P001-promotions

Public
- regular product/Variant price remains Catalog truth
- effective promotional price can be projected on listing/PDP
- regular price remains secondary evidence when discounted
- authoritative saving can be shown
- ordinary promotion never becomes fake Flash Sale/countdown

Admin
- existing commerce shell contains Khuyến mãi
- Khuyến mãi supports Mã khuyến mãi and Giảm giá tự động workflows
- promotion applicability reuses Catalog product/category selection
- Product editor does not own promotion value/code/validity/usage-limit fields

Ownership
- ProductModel / Variant / SKU / regular price remain unchanged owners
- Promotions owns discount rule/effective result

Not present yet
- Membership behavior
- Business Solutions entry/proposal/quotation behavior
```

## 9. Completion evidence

A Catalog Figma patch is complete only when the actual canonical Catalog surfaces visibly satisfy the desired state above. General spacing/gallery/copy cleanup is not evidence that `P001-promotions` was implemented.
