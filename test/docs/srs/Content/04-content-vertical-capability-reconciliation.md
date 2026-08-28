# Content — Vertical Capability Reconciliation

**Status:** Final additive reconciliation  
**Extends:**
- `02-grip-content-srs.md`
- `03-grip-content-ui-ux-research.md`

**New vertical inputs:**
- `../Promotions/02-grip-promotions-srs.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`

## 1. Purpose

Content remains the owner of editorial meaning and composition.

Promotions and Business Solutions add two new destinations Content may reference without changing Content into a pricing or customer-workflow system.

## 2. Promotions relationship

Current Content semantics remain:

```text
Content owns editorial meaning/composition
Catalog owns product truth
Promotions owns promotion truth
```

When Content presents an offer/campaign story, it must consume current promotion data rather than copy authoritative values into editorial content.

Examples of promotion truth that must remain external:

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

but the actual discount displayed beside products must come from Promotions/Catalog commerce projection.

## 3. Public Content UI reconciliation

Existing Content reading/discovery UX remains the base.

A content item can render canonical product references with current promotional pricing when the referenced Catalog projection exposes it.

Do not hard-code promotional price into an article block.

If a promotion expires:

```text
article remains published
→ live commerce projection updates
```

unless the editorial content itself was intentionally time-bounded.

## 4. Business Solutions handoff

Relevant business guidance may include a contextual CTA into Business Solutions.

Example:

```text
Guide: Setup văn phòng nhỏ

...editorial guidance...

Cần GRIP lên phương án cho doanh nghiệp của bạn?
[Nhận tư vấn]
```

The CTA creates/starts a Business Solutions journey.

Content does not own:

```text
customer requirement
consultation state
proposal
quotation
revision
```

## 5. Admin Content reconciliation

Existing structured authoring remains the base.

Admin may add typed references/CTA blocks to:

```text
Promotion / offer destination when supported
Business Solutions entry point
```

but must not expose promotion rule editing or Business Solutions workflow controls inside Content authoring.

## 6. Explicit non-changes

Content does not become:

```text
campaign-management engine
promotion authoring tool
CRM
business request form builder
quotation editor
product pricing source
```

## 7. Result

Content grows by gaining richer typed handoffs:

```text
editorial inspiration
→ Catalog commerce
→ optional Promotions context
→ optional Business Solutions assistance
```

while preserving its existing editorial boundary.