# GRIP Vertical Capability Execution — Current Checkpoint

**Status:** Planning / Module patch activation is complete through `P003-business-solutions`; Figma realization remains task-scoped and must be proven through Task Provider.  
**Depends on:** `test/docs/srs/README.md`, `test/docs/srs/vertical-capability-sequencing.md`

## Current roadmap

```text
P001-promotions planning / CAP-06              ✅
P001-promotions Module patch graphs            ✅
P001-promotions Figma                          task = figma-p001-promotions

P002-membership planning / CAP-06              ✅
P002-membership Module patch graphs            ✅
P002-membership Figma                          task = figma-p002-membership

P003-business-solutions planning / CAP-06      ✅
P003-business-solutions Module patch graphs    ✅
P003-business-solutions Figma                  task = figma-p003-business-solutions

Product Integration / Prototype                task = figma-product-integration
```

Planning activation is not Figma execution evidence. The patch tasks must be realized/verified in roadmap order before Product Integration / Prototype is treated as ready.

## Current Module state checkpoint

Direct product-patch ownership is Module-local.

### P001-promotions

Direct nodes:

```text
Catalog
Checkout
Content
Order
```

### P002-membership

Direct nodes:

```text
Account
Checkout
Order
```

Modules without P002 nodes retain their latest earlier state at the P002 checkpoint.

### P003-business-solutions

Direct nodes:

```text
Account
Catalog
Content
Checkout
Order
```

At the final registered product checkpoint, every configured Module resolves to its latest state at or before `P003-business-solutions`.

Examples:

```text
Catalog
BASE → P001-promotions → P003-business-solutions

Checkout
BASE → P001-promotions → P002-membership → P003-business-solutions

Account
BASE → P002-membership → P003-business-solutions

Engagement / Aftersales
→ retain latest earlier state where no direct roadmap patch node exists
```

## Figma patch execution

Canonical patch execution starts only through Task Provider:

```bash
npm run task -- --task figma-p001-promotions
npm run task -- --task figma-p002-membership
npm run task -- --task figma-p003-business-solutions
```

Task Provider resolves for each patch:

```text
pipeline = figma
selected product patch
→ direct Module patch nodes
→ dependency closure
→ each Module state
→ PATCH / COMPATIBILITY
→ exact task inputs
```

The caller does not supply pipeline id, patch id, dependency graph, changed seed, Module docs, Figma target, or resolver arguments.

A compatibility Module that actually needs a direct change returns `DOC_GAP`; writer mutation is forbidden until the canonical Module graph is fixed.

## Product Integration / Prototype

After P001 → P002 → P003 Figma realization has been individually verified, run:

```bash
npm run task -- --task figma-product-integration
```

Task registry resolves:

```text
pipeline = figma-integration
checkpoint = P003-business-solutions
```

The integration resolver then resolves:

```text
full configured product scope
+
each Module's latest state at/before P003
+
Product Integration / Prototype stage plan
```

Internal stage DAG:

```text
D1 Flow Inventory
→ D2 Screen Integration
→ D3 Interaction Wiring
→ D4 State Coverage
  + D5 Cross-Module Integration
  + D6 Responsive Integration
→ D7 Prototype Validation
→ D8 Integration Handoff
```

This is not `P004` and does not alter Module patch history.

Integration is review-first:

```text
INTEGRATION_VERIFIED
→ PASS, zero mutation

INTEGRATION_GAP
→ bounded integration writer
→ fresh independent verification

INTEGRATION_DOC_GAP
→ STOP
→ writer forbidden
```

## Completion meaning

Current repository planning state:

```text
Promotions planning / Module activation          = complete
Membership planning / Module activation          = complete
Business Solutions planning / Module activation = complete
```

Figma realization state must be established from provider-generated execution evidence, not inferred from planning activation or an older generic dependency PASS.

Product Integration / Prototype is the next product-level execution boundary only after the preceding patch realizations are complete.
