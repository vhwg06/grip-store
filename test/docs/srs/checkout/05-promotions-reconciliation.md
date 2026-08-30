# Checkout — Promotions Reconciliation

**Status:** Active additive reconciliation — Promotions  
**Extends:**
- `checkout_srs.md`
- `checkout_ui_ux_research.md`
- `checkout-admin-ui-ux-research.md`

**Vertical input:**
- `../Promotions/02-grip-promotions-srs.md`
- `../Promotions/03-grip-promotions-public-ui-ux-extension.md`
- `../Promotions/04-grip-promotions-admin-ui-ux-extension.md`

## 1. Purpose

Apply Promotions V1 to the existing focused Checkout journey.

Checkout remains the purchase-completion capability:

```text
purchase intent
→ buyer / delivery / commercial validation
→ payment
→ place order
```

Promotions adds commercial context; it does not create a parallel checkout flow.

## 2. Promotions integration

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

Automatic Product Discounts are reflected in effective product/commercial values and do not require customer code entry.

## 3. Public Checkout UI reconciliation

Extend existing Checkout UX with a compact coupon affordance, for example:

```text
+ Thêm mã khuyến mãi
```

or:

```text
Mã khuyến mãi
[________] [Áp dụng]
```

After application, show resolved state + discount effect and allow removal.

Do not create a Promotions step in the Checkout progress model.

## 4. Existing Checkout UX remains the base

Preserve:

```text
focused transaction environment
+ semantic stages
+ progressive disclosure
+ completed information remains reviewable
```

Promotion behavior appears only where commercial decisions require it.

## 5. Order placement result

Successful placement may pass purchase-time promotion evidence to Order so the final amount remains explainable later.

Checkout does not manage the promotion after placement.

## 6. Admin Checkout reconciliation

No Promotions management is added to Checkout Admin.

```text
promotion authoring → Catalog/Promotions Admin
placed order truth  → Order Admin
```

## 7. Explicit non-changes

This Promotions reconciliation does not add:

```text
Membership BusinessContext
Business Solutions PurchaseHandoff
quotation comparison/revalidation UX
multiple coupon stacking
loyalty reward wallet
business-specific payment engine
purchase approval chain
post-placement order editing
```

Membership and Business Solutions receive their own Checkout reconciliation only at their roadmap CAP-06 turns.

## 8. Result

```text
Catalog / Promotions
→ existing Checkout with simple coupon/effective-price behavior
→ Order
```

Checkout preserves its existing task model.
