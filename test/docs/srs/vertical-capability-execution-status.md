# GRIP Vertical Capability Execution — Status

**Status:** Capability definitions prepared; canonical reconciliation activates sequentially by roadmap  
**Depends on:** `README.md`, `vertical-capability-sequencing.md`

## 1. Capability source planning

The source planning artifacts for the current vertical queue are prepared:

```text
Promotions          ✅ research / SRS / Public UIUX / Admin UIUX / impact map
Membership          ✅ research / SRS / Public UIUX / Admin UIUX / impact map
Business Solutions  ✅ research / SRS / Public UIUX / Admin UIUX / impact map
```

Prepared source planning does **not** mean all three capabilities are already active in existing Module reconciliation or Figma inputs.

## 2. Canonical activation checkpoint

Roadmap activation is sequential:

```text
8. Promotions          ✅ active reconciliation
9. Membership          ⏭ next activation
10. Business Solutions ⏳ queued after Membership
```

Current canonical Module/Figma inputs represent the product through the Promotions activation point only.

## 3. Active Promotions reconciliation

Active Module inputs:

```text
Catalog
└── catalog/07-promotions-reconciliation.md

Checkout
└── checkout/05-promotions-reconciliation.md

Account
└── no Promotions patch required

Engagement
└── Engagement/04-promotions-audit.md          // NO PATCH REQUIRED

Content
└── Content/04-promotions-reconciliation.md

Order
└── Order/05-promotions-reconciliation.md

Aftersales
└── Aftersales/05-promotions-audit.md          // NO DIRECT PATCH REQUIRED
```

`figma-pipeline-dependencies.json` exposes these active Promotions reconciliation/audit documents plus the baseline Module docs.

## 4. Membership source plan — not yet activated

Membership remains defined by:

```text
Membership/
├── 01-grip-membership-reference-research.md
├── 02-grip-membership-srs.md
├── 03-grip-membership-public-ui-ux-extension.md
├── 04-grip-membership-admin-ui-ux-extension.md
└── 05-membership-impact-map-and-review.md
```

At MEM-06, Membership must receive capability-specific reconciliation on top of already-active Promotions.

Expected affected existing Modules from the accepted impact map include:

```text
Account
Checkout
Order
```

Other Modules receive only an explicit audit/reconciliation artifact if the Membership impact requires one.

Membership reconciliation docs are added to `figma-pipeline-dependencies.json` only when MEM-06 is activated.

## 5. Business Solutions source plan — not yet activated

Business Solutions remains defined by:

```text
BusinessSolutions/
├── 01-grip-business-solutions-reference-research.md
├── 02-grip-business-solutions-srs.md
├── 03-grip-business-solutions-public-ui-ux-extension.md
├── 04-grip-business-solutions-admin-ui-ux-extension.md
└── 05-business-solutions-impact-map-and-review.md
```

At BUS-06, Business Solutions is reconciled on top of already-active Promotions + Membership.

Its accepted impact map currently identifies affected existing journeys across:

```text
Account
Catalog
Content
Checkout
Order
```

Business Solutions reconciliation docs are not active Module/Figma inputs before BUS-06.

## 6. Sequencing invariant

```text
source capability docs may exist ahead
≠ future capability is active
```

Do not combine several future roadmap capabilities into one cumulative Module reconciliation file merely to edit the Module once.

Each capability owns its CAP-06 patch/reconciliation step and advances the canonical product state one roadmap step.

See `vertical-capability-sequencing.md`.

## 7. Final consistency pass

After Promotions, Membership, and Business Solutions have each completed their own CAP-06/CAP-07 activation, run one final product-wide consistency review across the accumulated result.

That final pass is verification, not a reason to defer or combine the individual capability reconciliation stages.

## 8. Planning / Figma boundary

This file describes planning activation state.

Figma execution is performed by the canonical dependency pipeline using the active Module inputs in `figma-pipeline-dependencies.json`. Figma artifacts do not override planning authority.
