# Content — Promotions Reconciliation

**Status:** Active additive reconciliation — Promotions  
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

## 6. Result

Content can tell an offer story while live commercial truth remains owned by Catalog/Promotions.
