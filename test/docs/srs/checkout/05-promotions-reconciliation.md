# Checkout — Promotions Reconciliation

**Status:** Active additive reconciliation — Promotions  
**Patch node:** `P001-promotions`  
**Parent state:** `BASE`

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

## 8. Patch execution steps

Task Provider resolves this file as the complete Checkout transition for `P001-promotions`.

```text
1. Resolve the existing Checkout canonical Public/Admin surface set.
2. Add/reconcile compact coupon entry without creating a new progress step.
3. Cover coupon applied state, removal and actionable validation/error states.
4. Reflect automatic product discounts/current coupon effect in the commercial summary.
5. Preserve the existing focused transaction hierarchy and progressive disclosure.
6. Keep promotion authoring out of Checkout Admin.
7. Verify resulting Checkout state; do not tune unrelated copy/layout/craft.
```

## 9. Desired state after `P001-promotions`

```text
Checkout @ P001-promotions

Public
- one active coupon can be entered/applied
- applied coupon is visible and removable
- invalid/not-started/expired/minimum/not-applicable/usage-limit outcomes are actionable
- relevant cart changes trigger promotion revalidation
- automatic product discounts require no code
- promotion effect is visible in commercial totals
- no standalone Promotions checkout stage exists

Admin
- no promotion authoring/configuration is introduced

Placement
- successful purchase can hand stable purchase-time promotion evidence to Order
- unsuccessful/abandoned checkout does not permanently consume coupon usage

Not present yet
- Membership BusinessContext
- Business Solutions quotation/PurchaseHandoff behavior
```

## 10. Completion evidence

A Checkout Figma patch is complete only when the canonical Checkout surfaces demonstrate the coupon/effective-price states above. A numeric copy tweak or unrelated layout cleanup does not prove `P001-promotions` is complete.
