# Public Catalog — Design System Contracts

**Owner:** Canonical reusable Public UI components and visual craft rules  
**Required before this file:** `01-semantic-invariants.md`

This file owns the reusable UI vocabulary. Surface files consume these components; they do not create page-local substitutes.

---

## 10. Canonical icon system

Use one open-source icon family across Public UI.

Canonical family:

```text
Lucide
```

Do not draw local icons manually.

Do not mix icon families.

Minimum canonical set:

```text
Search
Heart
User
ShoppingCart or ShoppingBag
ChevronDown
ChevronUp
ChevronLeft
ChevronRight
ArrowLeft
ArrowRight
Plus
Minus
X
Filter / SlidersHorizontal
Star
Check
Menu
```

Choose one cart metaphor and use it everywhere.

Starting sizes:

```text
16px compact inline
20px normal utility
24px emphasized utility
interactive target ≥ 40×40px
```

Header mapping:

```text
Saved   → Heart
Account → User
Cart    → canonical cart icon
Search  → Search
```

Reject ambiguous local substitutes such as:

```text
circle = account
line = cart
```

---
---

## 46. Surfaces and boundaries

Default grouping strategy:

```text
spacing
→ alignment
→ typography
→ thin divider
```

Only introduce a filled surface when semantics require a distinct region.

Reject the automatic pattern:

```text
group
→ beige background
→ rounded rectangle
→ padding
```

Merchandise and decision information must dominate UI chrome.

---
---

## 47. Alignment discipline

QA must verify:

- Header and body share major guides;
- Search and Header utilities are optically balanced;
- Category tiles share one baseline;
- Category image scale is sufficient;
- Bridge uses full intended width;
- Result count and Sort share a band;
- filter label and chevron align;
- product images share geometry;
- product names/prices scan consistently;
- Add to cart actions align intentionally;
- PDP thumbnail rail aligns with main media;
- Purchase Panel controls align to one content guide;
- Finish / Size / Pack groups use consistent spacing;
- Quantity and Add to cart align;
- Product Information rows align consistently;
- Similar Product items share consistent anatomy.

Do not approve based only on a full-page screenshot.

---
---

## 48. UI state completeness

A component is not complete if only its default state exists.

At minimum verify relevant states for:

```text
Header utilities
Cart
Category rail
Filter groups
Product merchandising state
Pricing state
PDP thumbnails
Finish options
Size options
Pack options
Fulfillment rows
Quantity stepper
Add to cart
Information disclosures
```

---
---

## 49. Accessibility baseline

At minimum:

- ~40×40px interactive target where practical;
- keyboard/focus state;
- icon-only controls have accessible labels;
- selected state is not color-only;
- unavailable/disabled state remains readable;
- rail arrows are keyboard reachable;
- meaningful imagery has implementation alt text;
- text/status contrast remains readable.

---

# Part F — Responsive Behavior
---

## 50. Desktop

Canonical desktop behavior:

```text
Public Header
Horizontal Category Rail
Large Merchandising Bridge
Sticky Vertical Filter
Multi-column Product Grid
Two-column PDP
Thumbnail Rail + Main Media
Purchase Decision Panel
```

---
---

## 51. Mobile / narrow viewport

Recompose rather than shrink desktop.

Browse:

```text
Mobile Header
Dynamic Category Context
Horizontal Category Rail
Merchandising Story/Scene
[Lọc & sắp xếp]
Responsive Product Grid
Results Continuation
Recommendation
```

PDP:

```text
Breadcrumb
Product Identity
Primary Media
Thumbnail/Media navigation
Price / Social Proof
Finish
Size
Pack
Fulfillment
Quantity
Add to cart
Product Information
Similar Products
```

Do not preserve a desktop filter sidebar on mobile.

Do not assume every desktop component simply stacks unchanged.

---

# Part G — Design System Deliverables
---

## 52. Canonical Public components

Public screens consume canonical Design System components.

Required shared components:

```text
Global Header / Desktop
Global Header / Mobile
Search

Icon
IconButton
IconButton / With Badge
Header Utility
Cart Utility / Empty
Cart Utility / Has Items

Horizontal Category Rail
Category Tile
Carousel Arrow

Section Divider
Merchandising Bridge

Result Toolbar
Sort Control

Filter Rail
Filter Group / Collapsed
Filter Group / Expanded
Filter Option

Product Tile

Merchandising Status / New
Merchandising Status / Hot
Merchandising Status / Best Seller
Promotion Marker / Discount
Promotion Campaign / Flash Sale
Pricing State / Normal
Pricing State / Discount
Social Proof
Variant Signal
Availability Signal

Add to Cart / Listing / Default
Add to Cart / Listing / Pending
Add to Cart / Listing / Success
Add to Cart / Listing / Requires Options
Add to Cart / Listing / Unavailable
Add to Cart / Listing / Error

Results Continuation
Recommendation Item / Reasoned
```

Required PDP components:

```text
PDP Gallery
PDP Thumbnail
PDP Thumbnail / Active
PDP Main Media

Purchase Decision Panel
Product Identity
Price
Social Proof
Key Product Summary
Selection Consequence Helper

Variant Group / Finish
Variant Group / Size
Variant Group / Pack

Fulfillment Row / Delivery
Fulfillment Row / Store Pickup

Quantity Stepper

Add to Cart / PDP / Default
Add to Cart / PDP / Pending
Add to Cart / PDP / Success
Add to Cart / PDP / Missing Selection
Add to Cart / PDP / Unavailable
Add to Cart / PDP / Purchase Limit
Add to Cart / PDP / Error

Cart Feedback / Header Badge
Cart Feedback / Drawer
Cart Line / Configured Product

Policy Note

Product Information Section
Information Disclosure / Expanded
Information Disclosure / Collapsed + Preview
Reviews Summary / Compact
Reviews Summary / Product Information
Reviews Action / View All

Similar Products Section
Similar Product Item
```

Do not create local substitutes when a canonical Design System component already exists.

---

# Part H — Acceptance Gates
