# Order — Membership Reconciliation

**Status:** Active additive reconciliation — Membership  
**Patch node:** `P002-membership`  
**Parent state:** `P001-promotions`

**Extends:**
- `02-grip-order-srs.md`
- `03-grip-order-public-ui-ux-research.md`
- `04-grip-order-admin-ui-ux-research.md`
- `05-promotions-reconciliation.md`

**Vertical input:**
- `../Membership/02-grip-membership-srs.md`
- `../Membership/03-grip-membership-public-ui-ux-extension.md`
- `../Membership/04-grip-membership-admin-ui-ux-extension.md`

## 1. Purpose

Apply Membership V1 to Order on top of the active Promotions state.

When a placed purchase used BusinessContext, Order preserves enough purchase-time business context to explain who the purchase was for without making Membership the owner of historical Order truth.

## 2. Purchase-time BusinessContext

A business-linked Order may preserve:

```text
business_ref
stable business identity snapshot where required for history/readability
acting account/member reference where useful
```

The exact persistence shape is an implementation concern; the product invariant is stable historical meaning.

Later Membership changes must never rewrite the placed Order:

```text
member removed later
role changed later
Business becomes inactive later
→ historical Order remains unchanged
```

## 3. Public Order reconciliation

Show business-purchase context only when it helps the customer understand the Order.

A compact projection is sufficient, for example:

```text
Mua cho
GRIP Studio
```

Do not duplicate Business member management, role editing or invitation flows inside Order.

Personal Orders remain visually unchanged when no BusinessContext was used.

## 4. Admin Order reconciliation

For business-linked Orders, Order Admin may expose useful business identity projection, filtering or navigation.

```text
business identity
acting buyer/member where operationally useful
→ inspect placed purchase
→ navigate to owning Membership/Business context when needed
```

Order Admin must not edit Membership relationships or current Business roles.

## 5. Promotions state remains active

Preserve the full `P001-promotions` Order state:

```text
stable purchase-time promotion evidence
historical totals remain immutable after Promotion edits/expiry
current mutable promotion config is not Order truth
```

Business context and promotion evidence are independent purchase-time facts. Membership does not own discount semantics.

## 6. Ownership boundaries

```text
Membership
= current Business relationship / role truth

Checkout
= purchase completion + BusinessContext handoff

Order
= placed purchase + purchase-time business/promotion evidence
```

Historical Order access/visibility rules remain Order-owned.

## 7. Explicit non-changes

This Membership reconciliation does not add:

```text
Business member management inside Order
retroactive Order rewrites after membership changes
Business Solutions proposal/quotation provenance
purchase approval workflow
company credit
business billing/tax model
wholesale pricing
promotion-rule ownership
```

Business Solutions remains inactive until `P003-business-solutions`.

## 8. Patch execution steps

Task Provider resolves this file as the complete Order transition for `P002-membership`.

```text
1. Resolve existing canonical Order Public/Admin surfaces at P001-promotions.
2. Add/reconcile business-purchase context only for Orders created with BusinessContext.
3. Keep the projection compact and historical; do not expose current Membership management as Order state.
4. Add Admin business identity/filter/navigation only where it supports Order operations.
5. Preserve all P001 Promotions evidence/totals behavior unchanged.
6. Demonstrate that later membership/role/business-state changes do not rewrite the historical Order representation.
7. Verify resulting Order state; do not tune unrelated copy/layout/craft.
```

## 9. Desired state after `P002-membership`

```text
Order @ P002-membership

Public
- personal Orders remain unchanged
- business-linked Orders can identify the Business purchase context
- business context is purchase-time history, not live member-management UI

Admin
- business-linked Orders can project useful Business/acting-member identity
- filtering/navigation may use that context when operationally useful
- Membership relationships/roles remain read-only projections from Order

Historical invariants
- later member removal/role change does not rewrite past Orders
- later Business inactivity does not erase past business purchase context

Promotions preserved from P001
- stable purchase-time promotion evidence remains intact
- historical totals do not follow later Promotion changes

Not present yet
- Business Solutions proposal/quotation/PurchaseHandoff provenance
- purchase approval / company credit / wholesale pricing
```

## 10. Completion evidence

An Order Figma patch is complete only when canonical Order Public/Admin surfaces demonstrate stable purchase-time Business context where applicable while preserving P001 Promotions history and avoiding Membership-management duplication. Unrelated Order cleanup does not prove `P002-membership` is complete.
