# Vertical Capability Sequencing Contract

**Status:** Canonical planning/execution rule  
**Roadmap:** Promotions → Membership → Business Solutions

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

The examples above describe the intended model; only nodes whose CAP-06 artifacts are currently activated may exist in the live Module graphs.

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
→ Task Provider Figma execution for that product patch
```

### Promotions

```text
P001-promotions
→ create Promotions-only Module patch nodes
→ current direct nodes: Catalog / Checkout / Content / Order
→ Task Provider resolves dependency closure
→ Figma executes resolved PATCH / COMPATIBILITY tasks
```

### Membership

When Membership reaches CAP-06:

```text
P002-membership
→ add Membership-only Module patch nodes on top of each Module's latest prior state
→ do not rewrite P001-promotions nodes
→ Task Provider resolves P002 from Module graphs
```

### Business Solutions

When Business Solutions reaches CAP-06:

```text
P003-business-solutions
→ add Business-Solutions-only Module patch nodes on top of each Module's latest prior state
→ preserve P001/P002 history
→ Task Provider resolves P003 from Module graphs
```

## 5. Dependency graph remains scope-only

`docs/srs/figma-pipeline-dependencies.json` owns only cross-Module Figma dependency scope:

```text
Module id
scope
dependsOn
```

It does not contain Module docs, current patch state, change reasons, desired state, or writer intent.

Task Provider derives direct patch Modules from Module graphs, then computes the union dependent closure.

## 6. Task Provider is the execution wrapper

Figma dependency work is invoked as:

```bash
npm run task -- --pipeline figma --patch P001-promotions
```

The agent/user does not specify graph path, changed seed, change docs, Module docs, or Figma targets.

Task Provider resolves:

```text
product patch
→ direct Module patch nodes
→ dependency closure
→ each Module's latest state
→ PATCH or COMPATIBILITY task
→ exact task inputs
```

The resulting package is handed to the Figma executor.

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

## 8. No future-capability leakage

Current patch nodes may reference already-active earlier state when compatibility requires it.

They must not materialize later roadmap behavior merely because future source SRS/UIUX files already exist.

At the Promotions checkpoint:

```text
P001 active
P002/P003 source planning may exist
→ P002/P003 Module nodes do not exist yet
→ Task Provider cannot resolve them as active Figma patch tasks
```

## 9. Current checkpoint

```text
P001-promotions          ✅ planning/module patch activation
P001-promotions Figma    🔄 requires execution under Task Provider contract
P002-membership          ⏭ next CAP-06 activation
P003-business-solutions  ⏳ after Membership
```

The earlier generic Figma dependency PASS is not evidence that `P001-promotions` completed because it was not executed from self-contained Module patch tasks.
