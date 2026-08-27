# GRIP Public Catalog — UI/UX Guide

**Status:** Canonical public-design execution entrypoint  
**Scope:** Public Catalog Browse/List + Product Detail + shared public retail shell  
**Companion research:** `test/docs/srs/catalog/grip-public-catalog-ikea-ux-research.md`  
**Semantic authority:** `test/docs/srs/catalog/srs_001_product.md` + accepted cross-domain contracts

---

## Purpose

This file is intentionally small.

It is a router for the Public Catalog UI/UX rules. Detailed rules live in focused owner files so an agent does not need to load the entire catalog UX corpus for every task.

Do not merge the files back into one giant execution guide.

Research explains:

```text
why
evidence
reference observations
```

The files below define:

```text
what must exist
how it behaves
what owns each rule
what must not happen
how PASS / FAIL is decided
```

Primary optimization target:

```text
reduce decision latency
```

Visual polish alone is never proof that the UX is correct.

---

## Authority order

When rules conflict, use this order:

```text
1. Product / commerce semantic authority
2. 01-semantic-invariants.md
3. Surface owner file: Browse or PDP
4. 04-merchandising-cart-interactions.md
5. 05-design-system-contracts.md
6. 06-acceptance-qa.md
7. Companion research / visual references
```

A reference site is never allowed to override GRIP product semantics.

---

## File map

### `public/01-semantic-invariants.md`

Owns non-violable Catalog semantics:

```text
ProductModel listing identity
Variant configuration
Finish
Size
Pack
Pack != Quantity
configuration consequences
listing vs PDP responsibility
Cart preservation
```

**Every Public Catalog task must read this file.**

### `public/02-browse-list-ui-ux.md`

Owns Browse / Category Listing UX:

```text
shared public shell geometry
Header layout
dynamic category context
horizontal category rail
large merchandising bridge
results toolbar
sticky vertical filter
multi-row product grid
product tile anatomy/rhythm
results continuation
decision-support recommendation
```

### `public/03-product-detail-ui-ux.md`

Owns PDP UX:

```text
gallery
purchase decision panel
Finish / Size / Pack controls
configuration consequence
fulfillment
quantity
product information
reviews
similar products
```

Add-to-cart interaction details are owned by file 04.

### `public/04-merchandising-cart-interactions.md`

Owns attention states and commerce interaction behavior:

```text
New
Hot
Best seller
Discount
Flash Sale
low stock / urgency
social proof vs variant metadata
listing Add to Cart
PDP Add to Cart
Cart badge / drawer feedback
cart-line identity
purchase limits
```

### `public/05-design-system-contracts.md`

Owns reusable public UI contracts:

```text
Lucide icon system
canonical components
visual craft rules
alignment
state completeness
accessibility
responsive recomposition
```

### `public/06-acceptance-qa.md`

Owns:

```text
Browse walkthrough
PDP walkthrough
semantic gates
required screenshot evidence
hard rejects
final PASS criteria
```

---

## Required reading by task

### Browse / listing task

Read:

```text
catalog-public-ui-ux-guide.md
public/01-semantic-invariants.md
public/02-browse-list-ui-ux.md
public/04-merchandising-cart-interactions.md
public/05-design-system-contracts.md
public/06-acceptance-qa.md
```

PDP file is optional unless the Browse change affects product-detail navigation/configuration.

### Product Detail task

Read:

```text
catalog-public-ui-ux-guide.md
public/01-semantic-invariants.md
public/03-product-detail-ui-ux.md
public/04-merchandising-cart-interactions.md
public/05-design-system-contracts.md
public/06-acceptance-qa.md
```

Browse file is optional unless the task changes shared shell or cross-surface behavior.

### Merchandising / pricing / promotional task

Read:

```text
catalog-public-ui-ux-guide.md
public/01-semantic-invariants.md
public/04-merchandising-cart-interactions.md
public/05-design-system-contracts.md
public/06-acceptance-qa.md
```

Then read the relevant surface owner file.

### Design System task

Read:

```text
catalog-public-ui-ux-guide.md
public/01-semantic-invariants.md
public/05-design-system-contracts.md
public/06-acceptance-qa.md
```

Read Browse/PDP owner files only for the component contracts being changed.

---

## Non-duplication rule

Each detailed rule has exactly one owner file.

Other files may reference the rule but should not restate the full rule.

Examples:

```text
Pack != Quantity
→ owner: 01-semantic-invariants.md

Flash Sale authority
→ owner: 04-merchandising-cart-interactions.md

Category rail geometry
→ owner: 02-browse-list-ui-ux.md

PDP review anatomy
→ owner: 03-product-detail-ui-ux.md

Lucide icon contract
→ owner: 05-design-system-contracts.md

Screenshot PASS gates
→ owner: 06-acceptance-qa.md
```

If two files begin to contain competing versions of the same rule, fix the ownership instead of adding another clarification paragraph.

---

## Canonical public flow

### Browse

```text
Global Header
→ Dynamic Category Context
→ Visual Category Rail
→ Large Merchandising Bridge
→ Result Count + Sort
→ Sticky Filter + Multi-row Products
→ Results Continuation
→ Decision-support Recommendation
```

### Product Detail

```text
Global Header
→ Breadcrumb
→ Gallery + Purchase Decision Panel
→ Finish / Size / Pack
→ Fulfillment
→ Quantity
→ Add to Cart
→ Product Information
→ Reviews
→ Similar Products
```

### Non-violable commerce distinction

```text
Pack != Quantity
```

Example:

```text
Bộ 4 chiếc × Quantity 2
= 2 sellable packs
= 8 physical pieces
```

---

## Completion rule

Public Catalog is complete only when the shopper can:

```text
understand
→ narrow
→ compare
→ configure
→ verify
→ choose
→ purchase
```

without having to infer domain mechanics.
