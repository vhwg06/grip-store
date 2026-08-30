# Checkout — Business Solutions Reconciliation

**Status:** Active additive reconciliation — Business Solutions  
**Patch node:** `P003-business-solutions`  
**Parent state:** `P002-membership`

**Extends:**
- `checkout_srs.md`
- `checkout_ui_ux_research.md`
- `checkout-admin-ui-ux-research.md`
- `05-promotions-reconciliation.md`
- `06-membership-reconciliation.md`

**Vertical input:**
- `../BusinessSolutions/01-grip-business-solutions-reference-research.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`
- `../BusinessSolutions/03-grip-business-solutions-public-ui-ux-extension.md`
- `../BusinessSolutions/04-grip-business-solutions-admin-ui-ux-extension.md`
- `../BusinessSolutions/05-business-solutions-impact-map-and-review.md`

## 1. Source traceability

```text
BUS-01 → BUS-02 → BUS-03/BUS-04 → BUS-05 Checkout PATCH → this P003 transition
```

| P003 Checkout requirement | Immediate authority | Upstream trace |
| --- | --- | --- |
| Accept `PurchaseHandoff` from an accepted proposal/quotation as purchase intent | BUS-02 §§13-15; BUS-05 Checkout SRS PATCH | BUS-01 IKEA-BUS-04/05: assisted purchasing/quotation must continue into canonical purchase flow |
| Preserve explicit BusinessContext from Membership | BUS-02 §4; existing P002 Checkout state | BUS-01 assumes business-owned request context rather than replacing Membership |
| Show compact source provenance such as `Từ báo giá` without creating a new checkout | BUS-03 §11; BUS-05 Checkout UI/UX PATCH | BUS-01 rejects a second commerce stack |
| Revalidate product/commercial state before placement and explain changes | BUS-02 §§12-15; BUS-03 §12; BUS-05 Checkout PATCH | BUS-01 treats quotation as commercial intent, not guaranteed Order |
| Preserve normal buyer/delivery/payment/coupon/place-order decisions | BUS-02 §15; BUS-05 Checkout PATCH | BUS-01 assisted purchase hands off rather than bypassing checkout |
| No proposal editor, arbitrary price override, approval or credit workflow inside Checkout | BUS-02 §§12,21; BUS-03 §16; BUS-05 deferred | BUS-01 §7 explicitly excludes enterprise procurement/credit complexity |

Untraceable Checkout behavior is a planning gap and must not be invented in P003/Figma.

## 2. Purpose

Allow accepted Business Solutions intent to enter the canonical Checkout while preserving all existing Promotions + Membership behavior.

```text
accepted proposal/quotation
→ PurchaseHandoff
→ Checkout revalidation
→ payment/place order
```

Acceptance is not Order placement.

## 3. PurchaseHandoff integration

Checkout may receive:

```text
BusinessContext
proposal_ref
quotation_ref?
accepted Catalog selections + quantities
quoted commercial context where still valid
```

The purchase must still satisfy current Checkout rules.

## 4. Public Checkout reconciliation

When entered from Business Solutions, show compact context where useful:

```text
Mua cho: GRIP Studio
Từ báo giá: Q-2026-018
```

This is provenance, not a new checkout stage.

If current product/commercial values changed since quotation, require a clear review before placement. Do not silently preserve an invalid quoted total or silently replace products.

## 5. Existing P001/P002 state preserved

Preserve:

```text
P001 Promotions
- coupon apply/remove/revalidation
- automatic discounts/commercial summary

P002 Membership
- explicit active BusinessContext
- personal checkout remains default when no BusinessContext
- no Membership-management workflow in Checkout
```

P003 only adds accepted Business Solutions purchase intent/provenance and revalidation behavior.

## 6. Admin Checkout reconciliation

Checkout Admin remains purchase-flow observation/support. It may expose source proposal/quotation context when useful, but does not own proposal editing, quotation issuance or Business-member administration.

## 7. Explicit non-changes

Do not add:

```text
second business checkout
proposal/quotation editor
manual placed-order creation
manual arbitrary pricing
purchase approvals
company credit
inventory reservation
invoice workflow
Membership role editor
```

## 8. Patch execution steps

```text
1. Resolve Checkout surfaces at P002-membership.
2. Add accepted `PurchaseHandoff` as an entry source while retaining canonical Checkout stages.
3. Show Business + quotation/proposal provenance compactly when useful.
4. Revalidate current product/commercial state and expose meaningful changes before placement.
5. Preserve all P001 Promotions and P002 Membership behaviors.
6. Keep proposal/quotation authoring outside Checkout.
7. Verify P003 evidence only; do not tune unrelated Checkout craft.
```

## 9. Desired state after `P003-business-solutions`

```text
Checkout @ P003-business-solutions

Public
- accepted Business Solutions intent can precompose Checkout
- BusinessContext remains explicit
- source quotation/proposal can be identified compactly
- changed current values are reviewed before placement
- normal Checkout validation/payment/place-order remains authoritative

Admin
- source context may be observed
- proposal/quotation workflow remains Business Solutions-owned

Ownership
- Business Solutions owns accepted commercial intent
- Checkout owns final pre-placement validation/payment/place order
```

## 10. Completion evidence

P003 Checkout is complete only when canonical Checkout can receive Business Solutions intent, show provenance, revalidate changes, and still behave as normal Checkout without a parallel business purchase flow.