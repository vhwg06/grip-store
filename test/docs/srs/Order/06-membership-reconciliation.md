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
- `../Membership/01-grip-membership-reference-research.md`
- `../Membership/02-grip-membership-srs.md`
- `../Membership/03-grip-membership-public-ui-ux-extension.md`
- `../Membership/04-grip-membership-admin-ui-ux-extension.md`
- `../Membership/05-membership-impact-map-and-review.md`

## 1. Source traceability

This patch is derived from the existing canonical Membership pipeline. Existing artifacts are inputs that must be traced; their `Final` status is not permission to skip them.

```text
MEM-01 reference research
→ MEM-02 accepted GRIP semantics
→ MEM-03/MEM-04 accepted Public/Admin UX
→ MEM-05 Order = PATCH
→ this P002 Order transition
```

Trace matrix:

| P002 Order requirement | Immediate authority | Upstream trace |
| --- | --- | --- |
| Preserve purchase-time Business context for business-linked Orders | MEM-02 §14; MEM-05 Order SRS PATCH | MEM-01 IKEA-BN-04/05: business-linked purchase history and explicit business purchase identity |
| Later membership/role/business-state changes never rewrite historical Orders | MEM-02 §§9-10,14 and MEM-I04; MEM-05 Order SRS PATCH | MEM-01 treats Membership as current relationship context while downstream purchase history remains distinct |
| Public Order may show compact `Mua cho <Business>` only when useful | MEM-03 §11; MEM-05 Order Public UI/UX PATCH | MEM-01 explicit business purchase context; SME simplicity favors compact projection rather than a new Order experience |
| Order Admin may project/filter/navigate by Business identity when operationally useful | MEM-04 §§5,8-9; MEM-05 Order Admin UI/UX PATCH | MEM-01 IKEA-BN-04: company-level purchase history is useful while Membership remains the relationship authority |
| Order must not become a Membership-management surface | MEM-02 §§14,17; MEM-04 §§5,9; MEM-05 Order PATCH | MEM-01 separates company/member administration from purchase records |
| Preserve P001 purchase-time Promotions evidence and totals | MEM-02 §12; MEM-05 Promotions NO PATCH REQUIRED; existing `05-promotions-reconciliation.md` | MEM-01 IKEA-BN-06 + local wholesale comparator: Membership eligibility/context does not own pricing semantics |
| Do not activate Business Solutions provenance, approval, credit, billing/tax or wholesale behavior | MEM-02 §§15,18; MEM-05 deferred decisions | MEM-01 §§3-7 explicitly defers enterprise/commercial concerns beyond Membership |

If any future Order requirement cannot be traced through this chain, it is a planning gap: return upstream and update the appropriate canonical artifact before changing this patch.

## 2. Purpose

Apply Membership V1 to Order on top of the active Promotions state.

When a placed purchase used BusinessContext, Order preserves enough purchase-time business context to explain who the purchase was for without making Membership the owner of historical Order truth.

## 3. Purchase-time BusinessContext

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

## 4. Public Order reconciliation

Show business-purchase context only when it helps the customer understand the Order.

A compact projection is sufficient, for example:

```text
Mua cho
GRIP Studio
```

Do not duplicate Business member management, role editing or invitation flows inside Order.

Personal Orders remain visually unchanged when no BusinessContext was used.

## 5. Admin Order reconciliation

For business-linked Orders, Order Admin may expose useful business identity projection, filtering or navigation.

```text
business identity
acting buyer/member where operationally useful
→ inspect placed purchase
→ navigate to owning Membership/Business context when needed
```

Order Admin must not edit Membership relationships or current Business roles.

## 6. Promotions state remains active

Preserve the full `P001-promotions` Order state:

```text
stable purchase-time promotion evidence
historical totals remain immutable after Promotion edits/expiry
current mutable promotion config is not Order truth
```

Business context and promotion evidence are independent purchase-time facts. Membership does not own discount semantics.

## 7. Ownership boundaries

```text
Membership
= current Business relationship / role truth

Checkout
= purchase completion + BusinessContext handoff

Order
= placed purchase + purchase-time business/promotion evidence
```

Historical Order access/visibility rules remain Order-owned.

## 8. Explicit non-changes

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

## 9. Patch execution steps

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

## 10. Desired state after `P002-membership`

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

## 11. Completion evidence

An Order Figma patch is complete only when canonical Order Public/Admin surfaces demonstrate stable purchase-time Business context where applicable while preserving P001 Promotions history and avoiding Membership-management duplication. Unrelated Order cleanup does not prove `P002-membership` is complete.
