# Checkout — Vertical Capability Reconciliation

**Status:** Final additive reconciliation  
**Extends:**
- `checkout_srs.md`
- `checkout_ui_ux_research.md`
- `checkout-admin-ui-ux-research.md`

**New vertical inputs:**
- `../Promotions/02-grip-promotions-srs.md`
- `../Membership/02-grip-membership-srs.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`

## 1. Purpose

This file reconciles the current GRIP Checkout journey with the three new vertical capabilities.

Checkout remains the purchase-completion capability.

```text
purchase intent
→ buyer / delivery / commercial validation
→ payment
→ place order
```

The new capabilities provide context or purchase input. They do not create parallel checkout flows.

## 2. Promotions integration

Current GRIP V1 promotion behavior follows `Promotions/02-grip-promotions-srs.md`.

Checkout supports:

```text
one active Coupon code
apply
remove
revalidate on relevant cart change
percentage-off-order
fixed-amount-off-order
free-shipping coupon
commercial-summary effect
```

Coupon validation may return actionable business reasons:

```text
INVALID_CODE
NOT_STARTED
EXPIRED
MINIMUM_NOT_MET
NOT_APPLICABLE
USAGE_LIMIT_REACHED
```

Only successful order placement consumes Coupon usage.

Automatic Product Discounts are already reflected in effective product/commercial values and do not require customer code entry.

### UI reconciliation

Extend the existing focused Checkout UX with a compact coupon affordance:

```text
+ Thêm mã khuyến mãi
```

or:

```text
Mã khuyến mãi
[________] [Áp dụng]
```

After application, show resolved state + discount effect and allow removal.

Do not create a Promotions step in the checkout progress model.

## 3. Membership / BusinessContext integration

A signed-in Account with active Membership may perform a purchase for a Business.

Checkout can receive:

```text
BusinessContext
├── business_ref
└── acting_account_ref
```

The context must be explicit when it affects the purchase.

Suggested UX:

```text
Mua cho
GRIP Studio
[Thay đổi]
```

This is not a second identity/login system and must not replace buyer/delivery information.

Membership remains authoritative for whether the Account is allowed to act for the Business.

## 4. Business Solutions PurchaseHandoff

Checkout can start from an accepted Business Solutions proposal/quotation.

Input may include:

```text
business_ref
proposal_ref
quotation_ref?
Catalog selections + quantities
quoted commercial context
```

Checkout must revalidate current:

```text
product sellability
quantity constraints
commercial values
promotion applicability
other current purchase rules
```

An accepted quotation is not a guarantee that a current checkout can be placed unchanged.

## 5. Quotation change communication

When a purchase handoff differs materially from the accepted quotation, the customer must see the difference before final commitment.

Example:

```text
Một số thông tin đã thay đổi từ khi báo giá được tạo.

Báo giá Q-2026-018        17.800.000đ
Hiện tại                  18.100.000đ

[Xem thay đổi]
```

Do not silently replace a quoted commercial value.

## 6. Existing checkout UX remains the base

The current Checkout UI/UX principle remains authoritative:

```text
focused transaction environment
+ semantic stages
+ progressive disclosure
+ completed information remains reviewable
```

Vertical capability additions must fit inside those patterns.

Do not add:

```text
Promotions step
Membership step
Business Solutions step
```

just because those capabilities exist.

Their context appears only where needed in the existing purchase flow.

## 7. Order placement result

Successful placement transfers canonical responsibility to Order.

The placed result can contain snapshots/references for:

```text
applied promotion effect
BusinessContext
Business Solutions proposal/quotation provenance
```

Checkout does not continue managing them after placement.

## 8. Admin Checkout reconciliation

No new Promotions/Membership/Business Solutions management is added to Checkout Admin.

```text
promotion authoring        → Catalog/Promotions Admin
business membership        → Membership Admin
proposal/quotation work    → Business Solutions Admin
placed order operations    → Order Admin
```

Checkout Admin remains limited to whatever pre-placement/checkout observability is explicitly required by the existing product.

Do not duplicate the above workflows inside Checkout Admin.

## 9. Explicit non-changes

This reconciliation does not add:

```text
multiple coupon stacking
loyalty reward wallet
business-specific payment engine
purchase approval chain
manual quote editing in Checkout
custom business checkout
post-placement order editing
```

## 10. Result

The vertical chain becomes:

```text
Account
+ Membership context
+ optional Business Solutions handoff
+ Promotions
        ↓
existing Checkout
        ↓
Order
```

Checkout grows by accepting richer business/commercial context while preserving its existing task model.