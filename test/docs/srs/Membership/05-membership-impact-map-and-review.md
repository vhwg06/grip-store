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

## 2. Pipeline trace authority

Membership activation must trace the existing canonical pipeline rather than treating earlier `Final` artifacts as skipped work.

```text
MEM-01 Reference Research
→ MEM-02 Membership SRS
→ MEM-03 Public UI/UX Extension
→ MEM-04 Admin UI/UX Extension
→ MEM-05 impact decisions in this file
→ MEM-06 exact Module patch transitions
→ MEM-07 provenance + cross-capability review
```

Read `../pipeline-traceability-contract.md` before deriving MEM-06.

Research is evidence/input, not direct patch authority. A MEM-06 behavior must trace through an accepted GRIP SRS/UI/UX or this impact map before becoming an executable Module requirement.

Existing source artifacts may be reused without rewriting them, but they must be consumed and their decisions traced.

## 3. Existing docs inspected

Membership pipeline authority:

```text
Membership/01-grip-membership-reference-research.md
Membership/02-grip-membership-srs.md
Membership/03-grip-membership-public-ui-ux-extension.md
Membership/04-grip-membership-admin-ui-ux-extension.md
```

Primary existing GRIP baseline:

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

## 4. Impact decisions

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

Trace:

```text
MEM-01 IKEA individual-profile/company-account distinction
→ MEM-02 Account relationship + role separation
→ Account PATCH
```

### Account Public/Admin UI/UX — PATCH

Reason:

Existing Account UI/UX is the base surface for Membership.

Required extension:

```text
Account overview → Business entry
Customer detail → Business membership projection
```

No separate business portal/admin app by default.

Trace:

```text
MEM-02 Membership public/operator use cases
→ MEM-03 Account-based Public extension
→ MEM-04 customer/business Admin extension
→ Account Public/Admin PATCH
```

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

Trace:

```text
MEM-01 explicit business identity during purchase
→ MEM-02 Checkout relationship
→ Checkout SRS PATCH
```

### Checkout UI/UX — PATCH

When business context is used, show a compact explicit `Mua cho <Business>` summary. Do not create a separate business checkout.

Trace:

```text
MEM-02 explicit BusinessContext
→ MEM-03 business purchase context
→ Checkout UI/UX PATCH
```

### Order SRS — PATCH

Reason:

A business purchase needs stable purchase-time business context.

Required addition:

```text
business_ref / business identity snapshot where applicable
acting account/member reference where useful
```

Later membership changes never rewrite the historical Order.

Trace:

```text
MEM-01 business-linked purchase-history evidence
→ MEM-02 Order relationship + historical invariant
→ Order SRS PATCH
```

### Order Public UI/UX — PATCH

Show business-purchase context only when it helps the user understand the Order. Do not duplicate Membership management.

Trace:

```text
MEM-02 historical business context
→ MEM-03 compact business purchase projection
→ Order Public PATCH
```

### Order Admin UI/UX — PATCH

Allow business identity projection/filter/navigation when operationally useful. Business member management remains Membership-owned.

Trace:

```text
MEM-02 operator + Order ownership boundary
→ MEM-04 Business detail / Order navigation
→ Order Admin PATCH
```

### Promotions SRS/UI — NO PATCH REQUIRED

The Promotions SRS already establishes Membership as a future eligibility input while keeping pricing/promotion rules inside Promotions.

No additional change is required unless a specific member-only promotion is later accepted.

Trace:

```text
MEM-01 membership benefits/context ≠ pricing engine
→ MEM-02 Promotions relationship
→ Promotions NO PATCH REQUIRED
```

## 5. Deferred decisions

```text
company tax code / invoice fields
business billing profile
purchase approval
company credit
wholesale pricing
per-business promotion entitlement
```

These must be decided by Business Solutions / future purchasing requirements rather than smuggled into Membership.

MEM-06 must preserve these `DEFER` decisions as explicit non-changes.

## 6. Cross-capability review

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

## 7. Patch execution note

MEM-06 must reconcile **Membership only**, on top of the already-active product state through Promotions.

Do not wait for Business Solutions and do not import Business Solutions request/proposal/quotation behavior into Membership reconciliation.

Required activation sequence when Membership becomes the current roadmap capability:

```text
existing Module states through P001-promotions
→ trace MEM-01 through MEM-04 as canonical existing inputs
→ MEM-05 impact decisions in this file
→ MEM-06 add P002-membership nodes to affected Module graphs
   - Account
   - Checkout
   - Order
   - any additional Module only when this impact map proves PATCH
→ every P002 task documents requirement provenance back to this impact map and upstream authority
→ each P002 Module node defines parent + self-contained patch task + resulting desired state
→ MEM-07 verifies provenance + consistency through the Membership roadmap point
→ execute Task Provider task figma-p002-membership
```

The Figma dependency graph remains scope-only and must not receive Membership docs or patch intent.

Existing `P001-promotions` Module nodes remain unchanged. Business Solutions source artifacts remain inactive until BUS-06.

Task Provider task `figma-p002-membership` is reserved now but must fail closed until at least one canonical `P002-membership` Module node is activated.

See `../vertical-capability-sequencing.md`.
