# Membership — Impact Map & Review

**Pipeline stages:** MEM-05 / MEM-06 / MEM-07

## 1. Purpose

This file maps the accepted Membership capability onto the existing GRIP product before any implementation work.

Statuses:

```text
PATCH
NO PATCH REQUIRED
DEFER
```

`PATCH` means the existing GRIP planning artifact needs an additive clarification/extension. It does not mean ownership migration or implementation work.

## 2. Existing docs inspected

Primary baseline:

```text
Account/02-grip-account-srs.md
Account/03-grip-account-ui-ux-research.md
Checkout/checkout_srs.md
Checkout/checkout_ui_ux_research.md
Order/02-grip-order-srs.md
Order/03-grip-order-public-ui-ux-research.md
Order/04-grip-order-admin-ui-ux-research.md
Promotions/02-grip-promotions-srs.md
Promotions/03-grip-promotions-public-ui-ux-extension.md
Promotions/04-grip-promotions-admin-ui-ux-extension.md
```

## 3. Impact decisions

### Account SRS — PATCH

Reason:

Account currently defines persistent individual customer identity/profile. Membership adds Business relationships without changing Account authentication/profile ownership.

Required additive clarification:

```text
Account
= person

Membership
= Account ↔ Business relationship
```

No business role should become an Account role.

### Account Public/Admin UI/UX — PATCH

Reason:

Existing Account UI/UX is the base surface for Membership.

Required extension:

```text
Account overview → Business entry
Customer detail → Business membership projection
```

No separate business portal/admin app by default.

### Checkout SRS — PATCH

Reason:

Checkout can now receive an explicit BusinessContext for a business purchase.

Required addition:

```text
Account identity
+ Membership business context
→ Checkout purchase context
```

Membership does not change cart/payment ownership.

### Checkout UI/UX — PATCH

When business context is used, show a compact explicit `Mua cho <Business>` summary. Do not create a separate business checkout.

### Order SRS — PATCH

Reason:

A business purchase needs stable purchase-time business context.

Required addition:

```text
business_ref / business identity snapshot where applicable
acting account/member reference where useful
```

Later membership changes never rewrite the historical Order.

### Order Public UI/UX — PATCH

Show business-purchase context only when it helps the user understand the Order. Do not duplicate Membership management.

### Order Admin UI/UX — PATCH

Allow business identity projection/filter/navigation when operationally useful. Business member management remains Membership-owned.

### Promotions SRS/UI — NO PATCH REQUIRED

The Promotions SRS already establishes Membership as a future eligibility input while keeping pricing/promotion rules inside Promotions.

No additional change is required unless a specific member-only promotion is later accepted.

## 4. Deferred decisions

```text
company tax code / invoice fields
business billing profile
purchase approval
company credit
wholesale pricing
per-business promotion entitlement
```

These must be decided by Business Solutions / future purchasing requirements rather than smuggled into Membership.

## 5. Cross-capability review

### Identity

```text
Account owns individual identity
Membership owns business relationship
```

PASS.

### Roles

```text
Business Owner/Admin/Member
≠ GRIP internal Admin access
```

PASS.

### Commerce

```text
Membership provides BusinessContext
Checkout completes purchase
Order preserves purchase-time context
```

PASS.

### Promotions

```text
Membership may provide eligibility
Promotions owns discount semantics
```

PASS.

### UX

Public Membership extends Account. Admin Membership extends customer/business administration. No standalone UI universe is required.

PASS.

## 6. Patch execution note

Actual reconciliation should be applied after Business Solutions is defined so Account/Checkout/Order are edited once with the complete business vertical rather than repeatedly for intermediate assumptions.