# Vertical Capability Sequencing Contract

**Status:** Canonical planning/execution rule  
**Roadmap:** Promotions → Membership → Business Solutions → Product Integration / Prototype

## 1. Purpose

GRIP vertical capabilities activate into the existing product **in roadmap order**.

Capability source artifacts may be prepared ahead, but preparation does not activate future behavior into current Module state.

```text
source planning
= research + SRS + Public/Admin extension + impact map

activation
= capability-specific Module patch nodes created at CAP-06
```

Source prepared ahead ≠ Module patch activated.

After all product patches are activated and individually realized in Figma, Product Integration / Prototype runs as a product-state checkpoint. It is not another business capability and does not create a synthetic product patch.

## 2. Product patch sequence

Current product patch registry:

```text
P001-promotions
↓
P002-membership
↓
P003-business-solutions
```

This sequence identifies product evolution events. It does not say every Module changes at every product patch.

Product Integration / Prototype sits **after** this registry:

```text
P003 current product state
↓
figma-product-integration
```

There is no `P004-integration`.

## 3. Module-local state graphs

Each Module owns its own state history:

```text
Catalog
BASE → P001-promotions → P003-business-solutions

Checkout
BASE → P001-promotions → P002-membership → P003-business-solutions

Account
BASE → P002-membership → P003-business-solutions
```

Only Modules proven affected by a capability receive that product patch node.

A Module patch node must define:

```text
patch id
parent Module state
authoritative patch task
resulting desired state
```

Do not use one cumulative reconciliation file whose meaning silently expands across several roadmap capabilities.

## 4. Sequential CAP-06 activation

For each capability:

```text
CAP-01 Research
→ CAP-02 GRIP SRS
→ CAP-03 Public UI/UX extension
→ CAP-04 Admin UI/UX extension
→ CAP-05 impact map
→ CAP-06 create/update exact Module patch nodes
→ CAP-07 review through current roadmap point
→ register/use Task Provider execution task for that product patch
```

### Promotions

```text
P001-promotions
→ Promotions-only Module patch nodes
→ direct nodes: Catalog / Checkout / Content / Order
→ Task Provider resolves dependency closure
→ Figma executes resolved PATCH / COMPATIBILITY tasks
```

Agent-facing execution task:

```text
figma-p001-promotions
```

### Membership

Membership CAP-06/07 is activated:

```text
P002-membership
→ Membership-only Module patch nodes on top of each Module's latest prior state
→ direct nodes: Account / Checkout / Order
→ P001 history preserved
```

Agent-facing execution task:

```text
figma-p002-membership
```

### Business Solutions

Business Solutions CAP-06/07 is activated:

```text
P003-business-solutions
→ Business-Solutions-only Module patch nodes on top of each Module's latest prior state
→ direct nodes: Account / Catalog / Content / Checkout / Order
→ P001/P002 history preserved
```

Agent-facing execution task:

```text
figma-p003-business-solutions
```

Planning activation does not prove Figma realization. Patch tasks must still complete in roadmap order.

## 5. Dependency graph remains scope-only

`docs/srs/figma-pipeline-dependencies.json` owns only cross-Module Figma dependency scope:

```text
Module id
scope
dependsOn
```

It does not contain Module docs, current patch state, change reasons, desired state, writer intent, or integration-stage instructions.

For patch execution, Task Provider derives direct patch Modules from Module graphs, then computes the union dependent closure.

For Product Integration / Prototype, Task Provider uses the same graph to require that the selected checkpoint resolves the full configured product scope before execution.

## 6. Task Provider is the agent wrapper

Figma work is invoked using only task ids.

Patch example:

```bash
npm run task -- --task figma-p001-promotions
```

Product integration:

```bash
npm run task -- --task figma-product-integration
```

`tools/task-provider/tasks.json` resolves caller intent into pipeline-owned routing.

Patch task:

```text
figma-p001-promotions
→ pipeline = figma
→ patch = P001-promotions
```

Integration task:

```text
figma-product-integration
→ pipeline = figma-integration
→ checkpoint = P003-business-solutions
```

The agent/user does not specify pipeline id, resolver, product patch/checkpoint id, graph path, changed seed, change docs, Module docs, Figma targets, or integration-stage order.

## 7. PATCH vs COMPATIBILITY

### PATCH

The Module contains the requested patch node.

The Figma task verifies/materializes that exact Module transition and resulting desired state.

### COMPATIBILITY

The Module is in dependency closure but contains no requested patch node.

The Figma task only verifies compatibility against the Module's latest earlier state.

If a direct change is actually required:

```text
DOC_GAP
→ stop
→ define the missing CAP-06 Module patch
→ resolve a fresh task
```

The Figma agent must never invent the missing patch.

These modes belong to **product patch execution**. Product Integration / Prototype instead consumes the already-resolved latest Module state at the selected checkpoint and must not manufacture patch authority.

## 8. No future-capability leakage

A patch task may materialize only its selected capability plus already-active ancestor state required for compatibility.

Historical rule:

```text
P001 execution
→ must not leak P002/P003 merely because their source docs exist

P002 execution
→ may rely on active P001 ancestor state
→ must not leak P003

P003 execution
→ may rely on active P001/P002 ancestor state
```

Product Integration / Prototype runs only at the selected final checkpoint and therefore receives each Module's state **at or before P003**. It may integrate that state but may not invent behavior beyond it.

## 9. Product Integration / Prototype sequencing

After the three patch tasks have been individually realized and verified, execute:

```bash
npm run task -- --task figma-product-integration
```

The provider resolves:

```text
checkpoint = P003-business-solutions
→ full configured Module scope
→ each Module's latest state at/before P003
→ Product Integration / Prototype internal stage DAG
```

Internal pipeline:

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

This phase is review-first and update/verify only. Missing planning authority is `INTEGRATION_DOC_GAP`; it must not be fixed by improvising behavior in Figma.

## 10. Current checkpoint

```text
P001-promotions planning/module activation          ✅
P002-membership planning/module activation          ✅
P003-business-solutions planning/module activation  ✅

P001/P002/P003 Figma realization
→ must be proven by their own Task Provider executions in roadmap order

Product Integration / Prototype
→ registered after P003 as task figma-product-integration
→ ready only when preceding Figma patch tasks are complete
```

Do not infer patch execution completion from old generic Figma dependency PASS evidence that was not produced from the provider-resolved patch task boundary.
