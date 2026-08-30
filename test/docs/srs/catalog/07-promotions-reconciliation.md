# Catalog — Promotions Reconciliation

**Status:** Active additive reconciliation — Promotions  
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

## 7. Result

Catalog is vertically extended by simple Promotions management/presentation while preserving ProductModel/Variant/regular-price semantics.
