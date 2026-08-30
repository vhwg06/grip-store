# Content — Promotions Reconciliation

**Status:** Active additive reconciliation — Promotions  
**Patch node:** `P001-promotions`  
**Parent state:** `BASE`

**Extends:**
- `02-grip-content-srs.md`
- `03-grip-content-ui-ux-research.md`

**Vertical input:**
- `../Promotions/02-grip-promotions-srs.md`
- `../Promotions/03-grip-promotions-public-ui-ux-extension.md`

## 1. Purpose

Apply Promotions to Content without turning Content into a pricing or promotion-management system.

Content remains owner of editorial meaning and composition.

## 2. Promotions relationship

Canonical ownership:

```text
Content owns editorial meaning/composition
Catalog owns product truth
Promotions owns promotion truth
```

When Content presents an offer/campaign story, authoritative commerce values remain external:

```text
discount value
effective price
validity
coupon code state
eligibility
usage limit
```

Content may own editorial copy such as:

```text
"Ưu đãi setup văn phòng tháng 9"
```

but displayed product discount truth comes from the current Promotions/Catalog commerce projection.

## 3. Public Content UI reconciliation

Existing Content reading/discovery UX remains the base.

A content item may render canonical product references with current promotional pricing when the referenced Catalog projection exposes it.

Do not hard-code promotional price into an article block.

If a promotion expires:

```text
article remains published
→ live commerce projection updates
```

unless the editorial content itself was intentionally time-bounded.

## 4. Admin Content reconciliation

Existing structured authoring remains the base.

Admin may add typed references/offer destinations when supported, but must not expose promotion rule editing inside Content authoring.

## 5. Explicit non-changes

This Promotions reconciliation does not add:

```text
Business Solutions CTA / consultation action
business request/proposal/quotation workflow
campaign-management engine
promotion rule editor
customer-specific pricing source
```

Business Solutions is activated later and receives its own Content reconciliation at BUS-06.

## 6. Patch execution steps

Task Provider resolves this file as the complete Content transition for `P001-promotions`.

```text
1. Resolve existing Content Public/Admin canonical surfaces.
2. Reconcile editorial offer/product references so current promotion projection can be rendered when relevant.
3. Keep authoritative discount/effective-price/validity truth external to authored article content.
4. Preserve Content ownership of editorial copy/composition only.
5. Keep promotion rule editing out of Content Admin.
6. Do not introduce Business Solutions blocks or consultation actions in this patch.
7. Verify resulting Content state; do not tune unrelated article layout/craft.
```

## 7. Desired state after `P001-promotions`

```text
Content @ P001-promotions

Public
- editorial content can reference products/offers
- referenced products may display current authoritative promotional projection
- authored blocks do not hard-code mutable promotional price truth
- promotion expiry updates live commerce projection without rewriting unrelated editorial content

Admin
- structured authoring can reference offer/product destinations where supported
- no promotion rule/value/eligibility editor exists inside Content

Ownership
- Content owns editorial meaning/composition
- Promotions owns promotion truth
- Catalog owns product truth

Not present yet
- Business Solutions CTA
- consultation/request/proposal/quotation behavior
```

## 8. Completion evidence

A Content Figma patch is complete only when Promotions-related editorial/product-reference behavior above is represented. Business Solutions blocks, consultation actions, or general editor cleanup are not evidence for `P001-promotions`.
