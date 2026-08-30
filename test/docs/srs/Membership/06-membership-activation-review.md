# Membership — P002 Activation Review

**Status:** CAP-06/CAP-07 complete for Membership planning  
**Product patch:** `P002-membership`

**Authority:**
- `02-grip-membership-srs.md`
- `03-grip-membership-public-ui-ux-extension.md`
- `04-grip-membership-admin-ui-ux-extension.md`
- `05-membership-impact-map-and-review.md`

## 1. Activation result

The Membership impact map identified direct changes in exactly these existing Modules:

```text
Account
Checkout
Order
```

Canonical Module patch nodes are activated as:

```text
Account
BASE
→ P002-membership

Checkout
BASE
→ P001-promotions
→ P002-membership

Order
BASE
→ P001-promotions
→ P002-membership
```

The parent chain follows each Module's latest prior active state rather than forcing every Module through every product patch.

## 2. Direct patch tasks

```text
Account
→ docs/srs/Account/04-membership-reconciliation.md

Checkout
→ docs/srs/checkout/06-membership-reconciliation.md

Order
→ docs/srs/Order/06-membership-reconciliation.md
```

Each task document defines the Membership-only transition, resulting desired state, preserved ownership/invariants, explicit non-changes and completion evidence.

## 3. No-patch decisions preserved

No `P002-membership` node is introduced for Modules not proven by the Membership impact map to require a direct change.

In particular:

```text
Promotions
→ NO PATCH REQUIRED
→ Membership may provide future eligibility context
→ Promotions still owns pricing/discount semantics
```

Other Modules reached by the Figma dependency closure remain compatibility-only unless execution proves a real direct Membership change. Such a discovery must return `DOC_GAP`; it is not mutation permission.

## 4. Cross-capability review

### Account / Membership

```text
Account = person / authentication / personal profile
Membership = Account ↔ Business relationship / role / BusinessContext
```

PASS.

### Checkout

```text
Membership supplies optional active BusinessContext
Checkout owns purchase completion
```

BusinessContext is explicit and compact; no separate business checkout is introduced.

PASS.

### Order

```text
Order preserves purchase-time Business context
later membership/role/business-status changes do not rewrite historical Orders
```

PASS.

### Promotions

The existing `P001-promotions` state remains active in Checkout and Order. Membership introduces no coupon, discount, wholesale-price or promotion-rule ownership.

PASS.

### Business Solutions

No request/proposal/quotation/PurchaseHandoff semantics are activated by P002. Those remain deferred to `P003-business-solutions`.

PASS.

## 5. Figma execution readiness

After these Module graph changes are present, Task Provider can resolve:

```bash
npm run task -- --task figma-p002-membership
```

Task Provider must derive the direct patch roots from the Module graphs rather than from caller arguments.

Expected direct patch roots:

```text
Account
Checkout
Order
```

Dependency-reachable Modules without a P002 node must be emitted as `COMPATIBILITY` and remain read-only.

## 6. Completion meaning

```text
Membership source planning      ✅
MEM-05 impact decision          ✅
MEM-06 Module patch activation  ✅
MEM-07 cross-capability review  ✅
P002 Figma execution            ⏭ next via Task Provider
```

This review does not claim that Figma Membership materialization is complete; that requires a successful `figma-p002-membership` execution with task-scoped evidence.
