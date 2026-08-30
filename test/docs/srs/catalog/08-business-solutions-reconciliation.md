# Catalog — Business Solutions Reconciliation

**Status:** Active additive reconciliation — Business Solutions  
**Patch node:** `P003-business-solutions`  
**Parent state:** `P001-promotions`

**Extends:**
- `srs_001_product.md`
- `catalog-public-ui-ux-guide.md`
- `catalog-admin-ui-ux-research.md`
- `07-promotions-reconciliation.md`

**Vertical input:**
- `../BusinessSolutions/01-grip-business-solutions-reference-research.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`
- `../BusinessSolutions/03-grip-business-solutions-public-ui-ux-extension.md`
- `../BusinessSolutions/04-grip-business-solutions-admin-ui-ux-extension.md`
- `../BusinessSolutions/05-business-solutions-impact-map-and-review.md`

## 1. Source traceability

```text
BUS-01 → BUS-02 → BUS-03/BUS-04 → BUS-05 Catalog PATCH → this P003 transition
```

| P003 Catalog requirement | Immediate authority | Upstream trace |
| --- | --- | --- |
| Add contextual `Cần tư vấn?` / `Cần mua số lượng?` entry only where useful | BUS-03 §2; BUS-05 Catalog Public UI/UX PATCH | BUS-01 supports PlanningHelp and OrderAssistance entry modes without creating a separate browse universe |
| Proposal items reference canonical Catalog selections/PDP | BUS-02 §§8-9; BUS-03 §8; BUS-05 Catalog PATCH | BUS-01 requires a concrete purchasable product solution |
| Admin proposal builder reuses Catalog search/picker patterns | BUS-04 §6; BUS-05 Catalog Admin UI/UX PATCH | BUS-01 says assistance converges on products rather than retyped product truth |
| Product editing remains Catalog-owned; no Business Solutions fields on ProductModel forms | BUS-02 §§6,9; BUS-05 Catalog SRS NO PATCH + Admin PATCH | BUS-01 rejects a second Catalog/product master |
| Preserve P001 Promotions price/effective-price semantics | BUS-02 §12; BUS-05 Promotions NO PATCH; existing P001 state | BUS-01 keeps quotation/commercial context separate from pricing-rule ownership |

Untraceable Catalog behavior is a planning gap and must not be invented in P003/Figma.

## 2. Purpose

Connect Catalog discovery/selection to Business Solutions without moving product truth or product editing into the new capability.

## 3. Public Catalog reconciliation

Where context makes business assistance useful, Catalog may expose a lightweight entry such as:

```text
Cần tư vấn?
Cần mua số lượng?
```

Do not put this CTA on every product by default.

Business Solutions proposal items may link back to canonical PDP/product views. Proposal presentation must not recreate Catalog browse/discovery UI.

## 4. Admin Catalog reconciliation

Business Solutions proposal building reuses canonical Catalog product search/selection patterns:

```text
search/select sellable Catalog item
→ choose selection/variant
→ quantity
→ optional proposal note
```

Do not add request/proposal/quotation fields to ProductModel/Variant editors.

Unavailable/unpublished selections must be surfaced to the Business Solutions workflow rather than silently substituted.

## 5. P001 Promotions state preserved

Preserve:

```text
Catalog regular price truth
effective promotion projection
Khuyến mãi admin ownership outside Product editor
no fake Flash Sale semantics
```

Business Solutions may display quoted commercial values, but does not change Promotion or Catalog ownership.

## 6. Explicit non-changes

Do not add:

```text
customer-specific proposal fields to ProductModel
quotation fields to Variant/SKU
wholesale price lists
manual price override tooling
Business Solutions workflow inside Catalog Admin
second product browser
```

## 7. Patch execution steps

```text
1. Resolve Catalog Public/Admin surfaces at P001-promotions.
2. Add contextual Business Solutions entry points only where the need is credible.
3. Reuse canonical Catalog presentation/linking for proposal items.
4. Reuse Catalog search/selection in the Business Solutions proposal builder without modifying Product editors.
5. Preserve P001 Promotions semantics.
6. Verify P003 evidence only; do not perform unrelated Catalog cleanup.
```

## 8. Desired state after `P003-business-solutions`

```text
Catalog @ P003-business-solutions

Public
- contextually useful assistance CTA may lead into Business Solutions
- proposal items can navigate to canonical Catalog product detail
- no duplicate business-only browse universe

Admin
- proposal builder consumes Catalog search/selection patterns
- Product/Variant editors remain free of Business Solutions fields

Ownership
- Catalog owns product identity/sellability/current product truth
- Promotions owns discount rules/effective promotion
- Business Solutions owns customer-specific request/proposal/quotation
```

## 9. Completion evidence

P003 Catalog is complete only when assistance entry/selection reuse is visible without duplicating Catalog or contaminating Product editing with Business Solutions fields.