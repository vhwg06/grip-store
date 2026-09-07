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

Modules without P002 nodes retain their latest earlier Module state at the P002 patch checkpoint.

### P003-business-solutions

Direct nodes:

```text
Account
Catalog
Content
Checkout
Order
```

Examples of Module state history:

```text
Catalog
BASE → P001-promotions → P003-business-solutions

Checkout
BASE → P001-promotions → P002-membership → P003-business-solutions

Account
BASE → P002-membership → P003-business-solutions

Engagement / Aftersales
→ retain BASE where no direct roadmap patch node exists
```

## Task Provider / workload model

All Figma execution enters through:

```bash
npm run task -- --task <task-id>
```

Internal execution is:

```text
task id
→ pipeline config
→ workload factory
→ workload = figma
→ resolver + policy
→ shared review/write/fresh-review lifecycle
```

There are no task-specific Figma runner programs for patch vs integration.

Patch tasks use:

```text
resolver = patch
policy = module-patch
```

Product Integration uses:

```text
resolver = checkpoint
policy = product-integration
```

A new product patch/checkpoint/policy should remain configuration/data unless its execution lifecycle is genuinely different enough to require a new workload implementation.

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
workload = figma
resolver = patch
policy = module-patch
selected product patch
→ direct Module patch nodes
→ dependency closure
→ each Module state
→ PATCH / COMPATIBILITY
→ exact task inputs
```

The caller does not supply workload/resolver/policy, patch id, dependency graph, changed seed, Module docs, Figma target, or harness arguments.

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

Pipeline config resolves:

```text
workload = figma
resolver = checkpoint
policy = product-integration
```

The checkpoint resolver then supplies:

```text
full configured product scope
+
each Module's cumulative canonical state through P003
+
Product Integration / Prototype stage plan
```

Cumulative state authority is:

```text
BASE stateDocs
+
all Module patch stateDocs with sequence <= P003
```

It does not promote historical patch task documents into new integration mutation authority.

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

Patch and integration policies share the same Figma workload lifecycle; only classification/mutation rules differ.

## Completion meaning

Current repository planning state:

```text
Promotions planning / Module activation          = complete
Membership planning / Module activation          = complete
Business Solutions planning / Module activation = complete
```

Figma realization state must be established from provider-generated execution evidence, not inferred from planning activation or an older generic dependency PASS.

Product Integration / Prototype is the next product-level execution boundary only after the preceding patch realizations are complete.
