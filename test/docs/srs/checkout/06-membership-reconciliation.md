# Checkout — Membership Reconciliation

**Status:** Active additive reconciliation — Membership  
**Patch node:** `P002-membership`  
**Parent state:** `P001-promotions`

**Extends:**
- `checkout_srs.md`
- `checkout_ui_ux_research.md`
- `checkout-admin-ui-ux-research.md`
- `05-promotions-reconciliation.md`

**Vertical input:**
- `../Membership/02-grip-membership-srs.md`
- `../Membership/03-grip-membership-public-ui-ux-extension.md`
- `../Membership/04-grip-membership-admin-ui-ux-extension.md`

## 1. Purpose

Apply Membership V1 to Checkout on top of the active Promotions state.

Checkout may consume an explicit BusinessContext selected by the signed-in Account, but Checkout remains the purchase-completion capability.

```text
signed-in Account
+ active BusinessMember
+ optional selected BusinessContext
→ Checkout
```

Membership does not own cart, totals, payment, promotion rules or order placement.

## 2. BusinessContext integration

When the buyer chooses to purchase for a Business, Checkout receives a business context that identifies the Business and acting Account/member relationship.

The selected context must be valid for a new purchase. An inactive Business or unavailable Membership context cannot be used to place a new business purchase.

Do not silently infer a Business when the user has multiple available Businesses. The selected context must remain explicit when it changes the meaning of the purchase.

## 3. Public Checkout UI reconciliation

Show BusinessContext as a compact purchase-context summary, for example:

```text
Mua cho
GRIP Studio
[Thay đổi]
```

This is contextual purchase identity, not a delivery address, payment method or separate checkout stage.

Rules:

```text
no separate business checkout
no enterprise account switcher
no duplication of Membership management
no business role editor inside Checkout
```

If the user has no active BusinessContext, the existing personal checkout flow remains unchanged.

## 4. Promotions state remains active

Preserve the entire `P001-promotions` Checkout state:

```text
one active coupon
apply / remove / revalidate
coupon validation reasons
automatic product discount effects
commercial-summary discount effect
no standalone Promotions checkout stage
```

Membership may provide context that another capability can later use for eligibility, but Membership does not create prices, discounts, coupons or wholesale pricing.

## 5. Order placement handoff

When a successful purchase used BusinessContext, Checkout passes stable purchase-time business context to Order together with the normal placed-purchase result.

The downstream Order may preserve:

```text
Business identity reference/snapshot where applicable
acting Account/member reference where useful
```

Checkout does not own the historical record after placement.

## 6. Admin Checkout reconciliation

No Membership-management workflow is added to Checkout Admin.

```text
Business/member management → Membership / Account Admin
placed business purchase truth → Order Admin
Checkout Admin → purchase-flow observation only
```

## 7. Explicit non-changes

This Membership reconciliation does not add:

```text
Business Solutions PurchaseHandoff
proposal / quotation acceptance
purchase approval chains
company credit
business billing profile
tax/invoice model
wholesale pricing
member-only discount semantics
Membership role management inside Checkout
```

Business Solutions remains inactive until `P003-business-solutions`.

## 8. Patch execution steps

Task Provider resolves this file as the complete Checkout transition for `P002-membership`.

```text
1. Resolve the existing Checkout canonical Public/Admin surface set at P001-promotions.
2. Add/reconcile optional explicit BusinessContext in the purchase journey.
3. Keep BusinessContext visually distinct from buyer, delivery and payment information.
4. Preserve normal personal checkout when no BusinessContext is selected.
5. Preserve all existing P001 Promotions coupon/effective-price behavior unchanged.
6. Keep Membership management out of Checkout Admin.
7. Verify resulting Checkout state; do not tune unrelated copy/layout/craft.
```

## 9. Desired state after `P002-membership`

```text
Checkout @ P002-membership

Public
- personal Checkout remains the default journey
- an eligible buyer can explicitly use an active BusinessContext
- selected Business is visible as compact `Mua cho <Business>` context
- multiple Business contexts are never silently inferred
- invalid/inactive Business context cannot be used for a new purchase
- no separate business checkout or Membership-management stage exists

Promotions preserved from P001
- coupon apply/remove/revalidation states remain intact
- automatic discounts and commercial summary remain intact
- Membership itself introduces no pricing rule

Placement
- successful business purchase can hand stable purchase-time Business context to Order

Admin
- no Business/member management is introduced in Checkout Admin

Not present yet
- Business Solutions proposal/quotation/PurchaseHandoff behavior
- purchase approvals / company credit / wholesale pricing
```

## 10. Completion evidence

A Checkout Figma patch is complete only when the canonical Checkout surfaces demonstrate the optional explicit BusinessContext while preserving the existing Promotions journey and keeping Membership management outside Checkout. Generic checkout cleanup does not prove `P002-membership` is complete.
