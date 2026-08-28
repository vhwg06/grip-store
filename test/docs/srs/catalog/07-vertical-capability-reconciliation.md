# Catalog — Vertical Capability Reconciliation

**Status:** Final additive reconciliation  
**Extends:**
- `srs_001_product.md`
- `catalog-public-ui-ux-guide.md`
- `04-merchandising-cart-interactions.md`
- `catalog-admin-ui-ux-research.md`

**New vertical inputs:**
- `../Promotions/02-grip-promotions-srs.md`
- `../Promotions/03-grip-promotions-public-ui-ux-extension.md`
- `../Promotions/04-grip-promotions-admin-ui-ux-extension.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`
- `../BusinessSolutions/03-grip-business-solutions-public-ui-ux-extension.md`
- `../BusinessSolutions/04-grip-business-solutions-admin-ui-ux-extension.md`

## 1. Purpose

This file extends the existing Catalog planning set after Promotions and Business Solutions were defined.

It does not replace ProductModel/Variant semantics.

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

Promotions adds a commerce layer inside the broader Catalog experience:

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

The existing Product SRS exclusion of promotion rules from the ProductModel aggregate remains correct. The new Promotions SRS is the companion authority for simple promotion rules.

## 3. Public Catalog UI reconciliation

Existing Catalog Public UX remains the base.

The current merchandising/pricing owner file already distinguishes:

```text
Discount
Flash Sale
generic merchandising states
```

The new Promotions capability now provides the missing authoritative commercial input.

### Effective promotion pricing

When an effective automatic product discount applies, existing listing/PDP pricing composition should use:

```text
effective promotional price
regular price
saving amount / discount percent when authoritative
validity when useful
```

Do not create a second product tile or separate promotion card system.

### Flash Sale

The existing rule remains:

```text
Flash Sale
≠ discountPercent alone
```

A time-bounded campaign label/countdown may appear only when an accepted promotion type provides authoritative campaign semantics and timing.

Promotions V1 does not require a Flash Sale type, therefore existing UI must not synthesize Flash Sale from ordinary automatic discounts.

### Business Solutions entry points

Catalog may expose contextual assistance entry points only where they reduce friction for SME buyers.

Possible examples:

```text
Cần mua số lượng / cần tư vấn?
Nhờ GRIP lên phương án
```

These are optional handoffs into Business Solutions.

Rules:

- do not add the CTA to every product by default;
- do not embed request/proposal fields in PDP;
- proposal browsing remains a Business Solutions task;
- canonical product detail remains Catalog-owned.

## 4. Catalog Admin reconciliation

Existing Product administration remains unchanged in responsibility:

```text
create/configure/publish ProductModel
manage variants
manage category/master data
```

Promotions adds one commerce management destination in the existing Admin shell:

```text
Khuyến mãi
├── Mã khuyến mãi
└── Giảm giá tự động
```

This is an extension of Catalog/commerce administration, not ProductModel editing.

Do not put promotion value, validity, coupon code or usage limit fields inside the Product editor.

Product/category selection used by Promotions should reuse existing Catalog selection/search patterns.

Business Solutions Admin may also reuse Catalog product selection when building proposals, but it must not add proposal/customer-specific fields to ProductModel forms.

## 5. Cross-capability contract

```text
Catalog
  supplies product identity + regular price

Promotions
  supplies effective promotion result

Business Solutions
  references Catalog selections in proposals

Checkout
  revalidates current purchasability/commercial state

Order
  snapshots final purchase truth
```

## 6. Explicit non-changes

This reconciliation does not add:

```text
inventory ownership
wholesale price lists
quantity-tier pricing
customer-specific pricing
promotion rule DSL
proposal fields inside ProductModel
business-membership roles inside Catalog
```

## 7. Result

Catalog remains the same product-centered capability, vertically extended by:

```text
simple Promotions management/presentation
+
contextual Business Solutions handoffs
```

No breaking Catalog boundary migration is required.