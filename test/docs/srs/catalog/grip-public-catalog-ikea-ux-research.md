# GRIP Public Catalog — IKEA UI/UX Research

**Status:** Research / calibration artifact
**Purpose:** Persistent reference for Public Catalog design + agent handoff
**Primary reference:** Current IKEA US public catalog / PDP flows
**Research date:** 2026-08-13

## 1. Research thesis

GRIP should not copy IKEA pixels. Use IKEA as the primary reference for **product-first flow, hierarchy, options, media and product-detail composition**, then express the result with GRIP Foundation.

```text
GRIP semantics
→ shopper mental model
→ IKEA-like product-first UX principles
→ GRIP visual Foundation
```

Target experience:

```text
discover
→ browse ProductModel
→ notice available choices
→ open detail
→ understand product visually
→ choose options
→ exact sellable configuration is reflected naturally
→ continue to next commerce action
```

## 2. Why IKEA fits GRIP

IKEA is useful because many products have:

- one stable product/family identity;
- multiple colors, materials, sizes or component choices;
- image-heavy decision making;
- measurements / technical information;
- listing-level `More options` signals;
- detail-level configuration choices.

This is closer to GRIP's model:

```text
ProductModel
→ Variant Dimensions
→ selected values
→ resolved sellable Variant
```

than a flat SKU catalog where every SKU is presented as a separate product.

## 3. IKEA browse / PLP observations

Current IKEA category pages typically establish:

```text
category context
→ optional category/editorial content
→ sort/filter
→ result count
→ product results
```

The important composition rule is:

> Controls support browsing; products remain the subject.

Product results use strong imagery and quick-to-scan identity/commercial information. Variation-heavy items expose `More options` rather than embedding a configurator in each card.

### GRIP mapping

```text
Browse
→ recognize
→ compare
→ discover
```

Do not let search/filter/sort chrome dominate product media or product identity.

## 4. Product card model

Reference hierarchy:

```text
large product media
↓
product identity
↓
price / selling information
↓
secondary product signals
↓
option availability
```

A GRIP listing card should represent a **ProductModel**, not individual Variants as separate products.

Possible card information when supported by the projection:

```text
Đèn bàn mộc
1.290.000đ
● ● ● +2
3 hoàn thiện · 2 kích thước
```

The purpose of the option signal is:

```text
"Product này có lựa chọn"
```

not:

```text
"Configure toàn bộ Variant ngay tại listing"
```

## 5. Option preview on listing

IKEA uses patterns such as:

```text
More options
4 sizes
5 colors
4 slatted bed base types
```

This creates a strong responsibility boundary:

```text
LISTING
→ signal choice

DETAIL
→ make choice
```

For GRIP, use swatch previews/counts only when the listing projection provides enough information. Do not fabricate rich option data merely to imitate IKEA.

## 6. IKEA PDP mental model

The strongest reusable IKEA idea is the split between:

```text
PRODUCT EXPERIENCE
+
DECISION / PURCHASE EXPERIENCE
```

Conceptual desktop composition:

```text
┌──────────────────────────────┬─────────────────────────────┐
│                              │ product identity            │
│                              │ price                       │
│      PRODUCT MEDIA           │ supporting product info     │
│                              │                             │
│      gallery / detail        │ option groups               │
│                              │                             │
│                              │ next action                 │
└──────────────────────────────┴─────────────────────────────┘
```

Supporting information follows below:

```text
product details
measurements
materials/care
included items
other supporting content
```

Core lesson:

```text
see
→ understand
→ choose
→ see consequence
→ act
```

not:

```text
domain fields
→ generic form controls
→ CTA
```

## 7. Media is part of product understanding

IKEA PDPs commonly give substantial space to:

- primary product image;
- alternate product views;
- lifestyle context;
- detail photography;
- dimension drawings.

GRIP should treat media as product information, not decoration.

```text
ProductModel gallery
+
Variant-dependent media
```

When configuration changes:

```text
Variant media available
→ use it
else
→ retain/fallback to ProductModel media
```

This transition should be invisible as an implementation mechanism.

Never show shopper copy like:

```text
Variant media active
Media fallback
```

## 8. Stable product identity across option changes

MALM is a useful reference because the user remains on one recognizable product while changing choices such as:

```text
color
size
slatted bed base
```

The UX mental model is:

```text
"Tôi đang chọn phiên bản của cùng sản phẩm"
```

not:

```text
"Tôi đang switching giữa các domain objects"
```

### GRIP translation

Underlying semantics:

```text
ProductModel
→ Default Variant
→ Variant Dimensions
→ ResolveVariant
```

Shopper-facing experience:

```text
Đèn bàn mộc
→ Hoàn thiện: Gỗ sáng
→ Kích thước: Nhỏ
→ media / price / technical info update naturally
```

Do not expose:

```text
ProductModel
Default Variant
Resolved Variant
Canonical Combination
Sale-ready Variant
```

## 9. Option controls must follow option semantics

Do not render every Dimension as the same rectangle.

Use the semantic nature of the choice:

```text
Color / Finish with swatch
→ swatch + label

Material
→ material sample + label when visual metadata exists

Size
→ compact labeled choice

Boolean
→ natural binary control

Numeric dimension
→ formatted human-readable value
```

Each Dimension needs:

```text
human-readable label
current selection
available values
clear selected state
unavailable state when applicable
```

Selected state must remain understandable without color alone.

## 10. Variant resolution should disappear into the UI

GRIP requires exact Variant resolution, but the user does not need a technical result card.

Reject:

```text
┌────────────────────────────┐
│ Resolved Variant           │
│ SKU ...                    │
│ Exact sale-ready ...       │
└────────────────────────────┘
```

Prefer:

```text
option selection changes
→ price updates in place
→ media updates in place
→ SKU updates as secondary metadata if useful
→ technical values update in context
→ current commerce action uses the resolved configuration
```

The UI communicates the **result**, not the resolution operation.

## 11. Price belongs near the decision

IKEA keeps commercial information close to product identity and configuration.

GRIP should preserve the relationship:

```text
choice
↔ commercial consequence
```

If Variant selection changes selling amount, price should update in the normal price location instead of moving into a technical `Resolved Variant` panel.

## 12. Supporting information should be secondary

IKEA progressively exposes deeper information below the main product decision surface.

GRIP can derive shopper-oriented groups such as:

```text
Mô tả
Kích thước
Chất liệu & hoàn thiện
Thông số kỹ thuật
Thông tin bảo hành
```

only where supported by actual semantics/data.

Rules:

- do not show all data at equal weight;
- do not turn the PDP into a domain documentation sheet;
- stable ProductModel information and Variant-dependent information should be distinguishable through hierarchy rather than technical headings.

## 13. External commerce capability is compositional

IKEA PDPs contain additional capabilities such as add-to-bag, delivery, reviews and complementary items.

For GRIP, similar capabilities may come from other authoritative domains:

```text
Cart
Search
Content
Engagement
Checkout
```

They can enrich the product flow, but must not replace Catalog semantics.

```text
Catalog core
ProductModel
→ choices
→ Variant resolution
→ selling projection

+
external domain capability
→ next action
```

## 14. Product-first spatial composition

A major failure in the previous GRIP frames was:

```text
small content cluster
+
large unexplained empty viewport
```

Use whitespace to create:

```text
focus
hierarchy
media authority
scan path
editorial rhythm
```

not as unused canvas.

Primary subject rules:

```text
Browse → product grid dominates
Detail → media + decision surface dominate
```

## 15. Desktop detail calibration

Starting point, not a fixed template:

```text
┌─────────────────────────────────────────────────────────┐
│ breadcrumb / category context                           │
├───────────────────────────────┬─────────────────────────┤
│                               │ product name            │
│                               │ short description       │
│                               │ price                   │
│        LARGE MEDIA            │                         │
│                               │ finish                  │
│                               │ [semantic options]      │
│                               │ size                    │
│                               │ [semantic options]      │
│                               │                         │
│ thumbnails                    │ current action          │
├───────────────────────────────┴─────────────────────────┤
│ description / dimensions / material / technical info   │
└─────────────────────────────────────────────────────────┘
```

Useful starting balance:

```text
media ~55–65%
decision ~35–45%
```

Do not enforce the ratio when actual content needs a different balance.

## 16. Mobile detail calibration

Mobile is a recomposition of the same task, not a stacked desktop frame.

Likely priority:

```text
product identity
→ primary media
→ price/current selling information
→ Variant Dimensions
→ current action
→ supporting media
→ product information
```

Evaluate from the task:

```text
horizontal media gallery
swatch wrapping
option scrolling
sticky commerce action
collapsible supporting information
```

Do not adopt these automatically; use them only when they improve the actual flow.

## 17. Listing calibration

Starting structure:

```text
catalog context
category/refinement
result count / sort

PRODUCT GRID
┌────────────┐ ┌────────────┐ ┌────────────┐
│   IMAGE    │ │   IMAGE    │ │   IMAGE    │
│            │ │            │ │            │
├────────────┤ ├────────────┤ ├────────────┤
│ name       │ │ name       │ │ name       │
│ price      │ │ price      │ │ price      │
│ options    │ │ options    │ │ options    │
└────────────┘ └────────────┘ └────────────┘

pagination / continuation
```

Reject:

```text
tiny horizontal cards
generic toolbar visually dominating products
first row followed by huge dead viewport
option controls as dense as detail page
```

## 18. What GRIP should borrow from IKEA

```text
✓ product-first hierarchy
✓ large, useful product imagery
✓ variation signal on listing
✓ full choice on detail
✓ stable product identity across configuration
✓ semantic option presentation
✓ clear selected state
✓ consequences update in place
✓ progressive disclosure of technical information
✓ purposeful whitespace
✓ browse/detail responsibility separation
```

## 19. What GRIP should NOT copy

```text
✗ IKEA header/navigation
✗ IKEA typography
✗ IKEA colors
✗ exact card geometry
✗ exact grid dimensions
✗ exact PDP breakpoints
✗ IKEA Family
✗ delivery/store UI without GRIP authority
✗ reviews without Engagement authority
✗ Complete with without applicable semantics
✗ recommendation behavior without authority
```

GRIP Foundation remains the visual authority.

## 20. GRIP semantic translation

Domain view:

```text
ProductModel
├── gallery
├── fixed attributes
├── Variant Dimensions
├── Default Variant
└── Variants
```

Shopper view:

```text
Product
├── media/story
├── stable information
├── available choices
├── current configuration
└── current selling information
```

Rule:

> Preserve domain semantics underneath; expose the shopper mental model above.

## 21. Browse gate

A Browse composition passes only if:

- [ ] ProductModel is the listing identity.
- [ ] Product results have dominant visual authority.
- [ ] Media supports recognition/comparison.
- [ ] Price/current selling info is easy to scan when available.
- [ ] Options are hinted when data supports them.
- [ ] Full configuration is not forced into cards.
- [ ] Refinement controls remain supporting UI.
- [ ] Empty space is intentional.
- [ ] Mobile is recomposed for browsing.

## 22. Detail gate

A Product Detail composition passes only if:

- [ ] Product identity is immediately understandable.
- [ ] Media is part of product understanding.
- [ ] Initial state already feels like a complete selected configuration.
- [ ] Variant Dimensions read as natural shopper choices.
- [ ] Option controls reflect semantic type.
- [ ] Selected values are obvious.
- [ ] Compatible/unavailable choices are represented when required.
- [ ] Configuration consequences update naturally in place.
- [ ] No shopper-facing domain vocabulary such as `ProductModel` or `Resolved Variant`.
- [ ] Stable and configuration-dependent information have clear hierarchy.
- [ ] External commerce action operates on the current configuration.
- [ ] Technical information does not dominate the decision surface.
- [ ] Mobile preserves goal and semantic priority.

## 23. Agent handoff requirements

Persist the research-to-design trace:

```text
IKEA observation
→ GRIP semantic served
→ UX decision
→ low-fi alternatives
→ selected composition + rationale
→ rejected alternatives + rationale
→ final Figma artifact
→ QA evidence
```

A new agent must be able to answer without chat history:

```text
Why does this composition exist?
Which IKEA principle informed it?
Which GRIP semantic does it serve?
What was intentionally not copied?
```

## 24. Primary reference pages

### IKEA Chairs category
Use for PLP hierarchy, sort/filter relationship, result density and `More options`.

https://www.ikea.com/us/en/cat/chairs-700676/

### IKEA Fabric armchairs
Use for variation-heavy listing cards and `More options` behavior.

https://www.ikea.com/us/en/cat/fabric-armchairs-10687/

### IKEA MALM Bed frame
**Primary GRIP PDP reference.** Use for large media, stable identity, color/size/component options, price proximity and supporting details.

https://www.ikea.com/us/en/p/malm-bed-frame-white-luroey-s89069779/

### IKEA MALM series/results
Use for option counts such as multiple sizes/colors/base types in browse context.

https://www.ikea.com/us/en/p/malm-bed-frame-black-brown-10249496/

### IKEA POÄNG
Use for furniture storytelling, material/cover variants and product-family browsing.

https://www.ikea.com/us/en/p/poaeng-armchair-black-brown-hillared-dark-blue-s29306547/

### IKEA SEGERÖN
Use for media gallery, color choice, series context and complementary presentation.

https://www.ikea.com/us/en/p/segeroen-armchair-outdoor-white-beige-50510810/

## 25. Evidence notes from current IKEA pages

Verified in current IKEA pages used for this research:

```text
Chairs PLP
→ Sort and Filter
→ result count
→ product results
→ More options on variant-heavy items

MALM PDP
→ large media set
→ Choose color
→ Choose size
→ choose slatted bed base
→ price close to configuration
→ Product details / Measurements / What's included

MALM series/results
→ option counts such as multiple sizes/colors/base types

POÄNG / SEGERÖN PDPs
→ image-rich product presentation
→ color/material variants
→ series/context relationships
```

Treat these as **reference evidence**, not GRIP requirements.

## 26. Final calibration principle

Desired shopper feeling:

```text
I am browsing products.
I can see which products have choices.
I open one product.
I understand it visually.
I choose the version that fits me.
The product naturally reflects my choice.
I continue.
```

Not:

```text
I am inspecting a ProductModel.
I selected Variant Dimensions.
The system resolved a sale-ready Variant.
```

And not:

```text
A generic storefront template has been filled with GRIP data.
```

Final direction:

```text
GRIP business semantics
→ natural furniture-shopping mental model
→ IKEA-like product-first flow and composition
→ GRIP Foundation
```
