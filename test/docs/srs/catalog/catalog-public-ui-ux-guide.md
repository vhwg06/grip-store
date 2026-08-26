# GRIP Public Catalog — UI/UX Guide

**Status:** Canonical public-design execution guide  
**Scope:** Public Catalog Browse/List + Product Detail + shared public retail shell  
**Companion research:** `test/docs/srs/catalog/grip-public-catalog-ikea-ux-research.md`  
**Semantic authority:** `test/docs/srs/catalog/srs_001_product.md` + accepted cross-domain contracts

---

## 1. Purpose

This file is the execution guide for Public Catalog UI/UX.

It is intentionally shorter and stricter than the research artifact.

Research explains:

```text
why
evidence
reference observations
```

This guide defines:

```text
what must exist
how it behaves
what must not happen
how PASS / FAIL is decided
```

Primary optimization target:

```text
reduce decision latency
```

Every visible element must do at least one of the following:

- answer a shopper question;
- enable an action;
- communicate state;
- reduce uncertainty;
- improve recognition;
- improve comparison.

Visual polish alone is never proof that the UX is correct.

---

# Part A — Non-violable semantics

## 2. Listing identity

A Public Catalog listing item represents a `ProductModel`.

Do not flatten every Variant into a separate product card unless the Product SRS explicitly requires it.

```text
Browse
→ ProductModel identity

PDP
→ choose ProductModel configuration

Cart
→ preserve exact selected sellable configuration
```

---

## 3. Canonical product configuration

For the current GRIP Catalog model, the PDP must support these configuration dimensions when they exist:

```text
Hoàn thiện / Finish
Kích thước / Size
Quy cách / Pack
```

Example:

```text
Hoàn thiện
Gỗ sáng | Gỗ tối | Óc chó

Kích thước
Nhỏ | Lớn

Quy cách / Pack
Bộ 2 chiếc | Bộ 4 chiếc | Bộ 6 chiếc
```

These are product configuration dimensions.

They are not purchase quantity.

---

## 4. Pack is not quantity

This rule is non-violable.

```text
Bộ 4 chiếc
```

means:

```text
selected sellable product configuration = one pack containing 4 pieces
```

while:

```text
Quantity = 2
```

means:

```text
buy two of the selected sellable packs
```

Therefore:

```text
Bộ 4 chiếc × Quantity 2
= 2 sellable packs
= 8 physical pieces
```

Never flatten this into:

```text
Quantity = 8
```

Pack and quantity must remain independently visible and independently preserved.

---

## 5. Configuration consequences

Changing any Variant Dimension may change:

```text
resolved Variant
SKU / product code
price
media
availability
fulfillment consequence
technical values
```

The UI must communicate the consequences naturally in their normal locations.

Do not expose technical resolution mechanics such as:

```text
Resolved Variant
Canonical Combination
Sale-ready Variant
```

Shopper-facing model:

```text
I changed my choice
→ the product now reflects that choice
```

---

## 6. Listing vs PDP responsibility

Listing signals choice.

PDP performs choice.

```text
LISTING
→ 3 màu
→ 2 kích thước
→ Nhiều lựa chọn
→ More options

PDP
→ choose Gỗ sáng
→ choose Nhỏ
→ choose Bộ 4 chiếc
→ exact sellable configuration is reflected
```

Do not place a full configurator inside every listing tile.

---

## 7. Cart preservation

When Catalog hands a configured item to Cart, the selected configuration must remain intact.

Example cart-line meaning:

```text
Đèn bàn mộc
Gỗ sáng · Nhỏ · Bộ 4 chiếc
Quantity 2
```

Do not lose or merge configuration dimensions during Add to cart.

The visual Cart interaction belongs to the Cart contract, but Catalog must provide the exact selected configuration.

---

# Part B — Shared Public Shell

## 8. Canonical page grid

Use one desktop grid across all public screens.

Starting calibration for 1440px desktop:

```text
page max width: ~1280–1320px
minimum outer gutter: ~32–48px
```

The following must align to the same major guides:

- header inner content;
- breadcrumb;
- page title;
- category rail;
- merchandising bridge;
- results controls;
- filter + product grid;
- PDP gallery + purchase panel;
- supporting information;
- recommendation / similar-product sections.

Preferred spacing scale:

```text
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
```

Do not build unrelated alignment systems for Header and body.

---

## 9. Global header

The Public Header begins at:

```text
y = 0
```

Do not leave an empty warm strip above it.

If a future service/announcement bar exists:

```text
GlobalShell
├── AnnouncementBar [optional]
└── Header
```

When absent:

```text
AnnouncementBar height = 0
```

### Canonical header anatomy

```text
GRIP
Primary Navigation
Search
Saved
Account
Cart
```

Starting desktop geometry:

```text
header height: ~64–72px
logo → first nav: ~32px
nav gap: ~24–32px
search height: ~40–44px
search width: ~300–420px
utility hit target: at least ~40×40px
```

Layout model:

```text
logo           intrinsic
primary nav    intrinsic
search         flexible + bounded
utilities      intrinsic
```

Do not force Search to the exact physical center by manual positioning.

The Header must feel optically balanced.

Use a subtle bottom divider between global navigation and page content.

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

## 11. Cart utility states

Design System must include:

```text
Cart / Empty
Cart / Has Items
```

Empty:

```text
cart icon
```

Has items:

```text
same cart icon
+ count badge
```

The count badge must not move the icon or disturb Header alignment.

Example:

```text
Cart count = 3
→ cart icon + badge "3"
```

---

# Part C — Browse / Category Listing

## 12. Primary shopper task

The category/listing screen exists to help the shopper:

```text
recognize context
→ narrow
→ filter
→ compare
→ choose
```

It is product-finding-first.

Do not turn it into a Homepage.

---

## 13. Canonical Browse flow

Required desktop flow:

```text
Global Header
→ Breadcrumb / Category Context
→ Dynamic H1 + short supporting copy
→ Visual Category Rail
→ Large Merchandising Bridge
→ Result Count + Sort
→ Sticky Filter Rail + Multi-row Product Grid
→ Results Continuation
→ Decision-support Recommendation
```

Do not reorder these without an explicit UX reason.

---

## 14. Dynamic category context

H1 and supporting copy must reflect the current category.

Example:

```text
Sản phẩm / Đèn bàn

Đèn bàn
Ánh sáng dịu cho góc đọc và bàn làm việc.
```

Do not leave:

```text
H1 = Đèn
```

after the shopper has narrowed to:

```text
Đèn bàn
```

Avoid redundant copy such as:

```text
Đèn
42 sản phẩm · Đèn
```

If H1 already provides category context:

```text
42 sản phẩm
```

is enough.

---

## 15. Visual category rail

The category rail is a narrowing control.

Hard rules:

- exactly one horizontal row on desktop;
- constrained to page width;
- horizontal overflow when needed;
- never wrap into a second row;
- image is the primary recognition cue;
- label confirms the meaning.

Examples:

```text
Đèn bàn
→ image unmistakably shows a table lamp

Đèn sàn
→ image unmistakably shows a floor lamp

Đèn treo
→ image unmistakably shows a pendant lamp
```

Do not reuse nearly identical crops for semantically different categories.

Starting geometry:

```text
tile width: ~150–190px
image height: ~84–112px
image → label gap: ~8–10px
```

If the image still reads as a thin thumbnail strip, it is too small.

Rail arrows:

```text
~40×40px interactive target
vertically aligned to the rail
left disabled/hidden at start
right disabled/hidden at end
```

Active category must have an obvious structural state.

Do not rely on text color alone.

---

## 16. Merchandising bridge

The merchandising bridge belongs between:

```text
Category Rail
and
Result Controls
```

Required:

```text
Category Rail
↓
Large Merchandising Bridge
↓
Result Count + Sort
↓
Inventory
```

Purpose:

```text
category semantics
→ useful context / use case
→ inventory
```

It should answer:

```text
"How can this category fit my situation?"
```

This is not a thin promotional strip.

Starting composition:

```text
Section heading
1–2 lines supporting copy

[ LARGE LIFESTYLE SCENE ] [ LARGE LIFESTYLE SCENE ]
Use-case CTA                Use-case CTA
```

Starting scene height:

```text
~220–320px
```

The section uses full content width.

Each scene must have:

- a clear use case;
- meaningful imagery;
- a clear action.

Do not use decorative lifestyle imagery with no semantic/action relationship.

After the bridge, transition clearly into utility mode:

```text
────────────────────────────────────
42 sản phẩm                 Sort ▾
────────────────────────────────────
Filter | Products
```

---

## 17. Results toolbar

Result count and Sort belong to one operational band.

```text
42 sản phẩm                         Giá thấp đến cao ▾
```

Do not let Sort float independently from result context.

Desktop with a sticky filter rail does not need duplicate full filter controls in the toolbar.

Mobile may collapse filtering/sorting into one control.

---

## 18. Desktop filter rail

Desktop uses a full vertical filter rail on the left.

Visual rule:

```text
naked on page surface
```

Do not use:

- tinted sidebar background;
- card shell;
- rounded sidebar panel;
- heavy vertical border.

Use:

- heading;
- labels;
- spacing;
- thin horizontal dividers;
- aligned chevrons.

Example:

```text
Bộ lọc

Danh mục                         ˅
──────────────────────────────────
Loại                             ˅
──────────────────────────────────
Màu sắc                          ˅
──────────────────────────────────
Chất liệu                        ˅
──────────────────────────────────
Giá                              ˅
──────────────────────────────────
Đánh giá                         ˅
──────────────────────────────────
Quy cách                         ˅
──────────────────────────────────
```

Do not add redundant helper headings such as:

```text
Lọc theo
```

unless they add meaning.

Starting geometry:

```text
filter width: ~220–260px
gap to grid: ~28–40px
facet row: ~44–52px
```

Desktop behavior:

```text
position: sticky
top: Header height + breathing space
```

Filter states must include:

```text
Collapsed
Expanded
Selected Option
Group with Selection Count
Clear Group
Clear All
Disabled/Unavailable
```

Selected state must not rely only on color.

---

## 19. Product grid

Products dominate the listing.

Desktop target:

```text
Sticky Filter
+
4 Product Columns when readable
+
Multiple Product Rows
```

Rule:

```text
comparison efficiency > column count
```

Do not box every product.

Reject:

```text
card background
card border
card shadow
large padded product shell
```

Products sit directly on the results canvas.

Use row/system boundaries when needed.

Example:

```text
product   product   product   product
─────────────────────────────────────
product   product   product   product
```

Product images must maintain:

- consistent aspect ratio;
- consistent subject scale;
- consistent top alignment;
- restrained radius.

---

## 20. Product tile anatomy

Canonical listing anatomy:

```text
Merchandising Status [optional]
Product Image
Product Name
Descriptor
Pricing State
Social Proof [optional]
Variant Signal [optional]
Compact Purchase Action [if supported]
```

The tile represents the ProductModel.

Do not force every tile to expose identical secondary metadata.

For each product ask:

```text
"What helps the shopper distinguish this product from the adjacent products?"
```

---

## 21. Merchandising and commerce semantics

Do not create one generic `ProductTag` and represent every concept as a differently colored pill.

The following are different semantic layers.

### Merchandising status

Examples:

```text
Mới
Bán chạy
```

These are product merchandising states.

### Pricing state

Discount is a pricing composition.

Example:

```text
Giá ưu đãi
990.000đ
1.290.000đ  [strike-through]
Tiết kiệm 300.000đ
```

Do not show:

```text
Giảm giá
```

without an actual discount pricing state.

### Social proof

```text
4.8 ★
126 đánh giá
```

This is metadata.

It is not a merchandising badge.

### Variant signal

```text
3 màu
2 kích thước
2 quy cách
Nhiều lựa chọn
```

This is configuration metadata.

It is not a badge.

### Availability

Availability is commerce state.

It is not a merchandising badge.

### Coexistence

A product may legitimately contain:

```text
Bán chạy
+ promotional pricing
+ reviews
+ multiple options
```

Do not force these into one exclusive tag slot.

---

## 22. Product tile rhythm

Within one product row, shopper scanning must remain stable even when metadata differs.

Starting rhythm:

```text
status slot
image
12–16px
name
4px
descriptor
6–8px
price
4–8px
secondary metadata
10–12px
purchase action
```

Use consistent layout slots/minimum content regions where needed.

### Add to cart alignment

`Thêm vào giỏ` uses one canonical alignment model.

Reject a row where:

```text
Tile A → Add to cart left
Tile B → Add to cart looks centered
Tile C → button geometry changes
Tile D → action sits at a different visual baseline
```

All purchase actions in a comparable row must align intentionally.

---

## 23. Results continuation

Show explicit browsing progress.

Desktop:

```text
Đang hiển thị 8 / 42 sản phẩm                    Xem thêm
```

Count and action belong to one band.

`Xem thêm` must read as an action, not an annotation.

---

## 24. Recommendation semantics

Recommendation is decision support.

It is not another category list.

Use it when the shopper already wants to buy within the current category but is unsure which product to choose.

Primary question:

```text
"Which product should I choose?"
```

Possible recommendation intents:

```text
Phù hợp góc đọc
Giá tốt nhất
Được chọn nhiều nhất
Phù hợp không gian nhỏ
Lựa chọn cao cấp
```

Each recommendation item must include:

```text
reason / intent
product
price
evidence
```

Example:

```text
Phù hợp góc đọc

Đèn đọc tối giản
990.000đ

Ánh sáng tập trung
Chân đế nhỏ gọn
```

Example:

```text
Được chọn nhiều nhất

Đèn bàn mộc
1.290.000đ

4.8 ★ · 126 đánh giá
```

Reject:

```text
Đèn bàn
Đèn sàn
Đèn treo
```

That is category discovery, not recommendation.

Only render recommendation when an authoritative recommendation/curation source exists.

---

# Part D — Product Detail

## 25. PDP primary task

The PDP exists to help the shopper answer:

```text
What is this?
What does it look like?
How much is it?
Which configuration do I want?
Can I get it?
How many of that configuration do I want?
Can I buy it?
What product information remains?
What comparable alternatives exist?
```

Canonical decision sequence:

```text
Product Identity
→ Product Media
→ Price / Social Proof
→ Configuration
→ Configuration Consequences
→ Fulfillment
→ Purchase Quantity
→ Add to Cart
→ Supporting Information
→ Comparable Alternatives
```

---

## 26. Canonical PDP component inventory

The accepted PDP composition contains:

```text
Global Public Header
Breadcrumb

PDP Main
├── Product Gallery
│   ├── Thumbnail Rail
│   ├── Thumbnail / Default
│   ├── Thumbnail / Active
│   └── Main Product Media
│
└── Purchase Decision Panel
    ├── Product Identity
    ├── Short Descriptor
    ├── Price
    ├── Social Proof
    ├── Key Product Summary
    ├── Selection Consequence Helper
    ├── Variant Group / Finish
    ├── Variant Group / Size
    ├── Variant Group / Pack
    ├── Fulfillment Row / Delivery
    ├── Fulfillment Row / Store Pickup
    ├── Quantity Stepper
    ├── Add to Cart Action
    └── Policy / Return Note

Product Information Section
├── Product Detail / Expanded
├── Dimensions / Collapsed + Preview
├── Material & Care / Collapsed + Preview
├── Product Specifications / Collapsed + Preview
├── Safety & Notes / Collapsed + Preview
└── Reviews Summary

Similar Products Section
└── Similar Product Item
```

This is the current canonical component inventory.

Do not invent additional PDP modules merely to imitate another retailer.

New modules require Product SRS or an accepted cross-domain contract.

---

## 27. Product gallery behavior

Required structure:

```text
Thumbnail Rail
+
Dominant Main Product Media
```

Thumbnail states:

```text
Default
Active
```

The active thumbnail must be obvious without relying only on color.

Selecting a thumbnail updates the main media.

Gallery content may include:

- primary product image;
- alternate angle;
- lifestyle context;
- material/detail view;
- dimension/use image when available.

### Variant-dependent media

When configuration changes:

```text
Variant-specific media exists
→ update relevant media

else
→ retain ProductModel media
```

Do not expose fallback mechanics to the shopper.

---

## 28. Purchase Decision Panel

Required order:

```text
Product Name
Short Descriptor
Price
Social Proof
Key Product Summary
Selection Consequence Helper

Finish
Size
Pack

Delivery
Store Pickup

Quantity
Add to Cart

Policy / Return Note
```

Do not reorder this according to database field order.

The panel is a decision surface.

Every row must help the shopper decide or complete the purchase.

---

## 29. Product identity and commercial summary

Required shopper-facing information:

```text
Product Name
Short Descriptor
Price
Social Proof [when supported]
Key Product Summary
```

Example:

```text
Đèn bàn mộc
Ánh sáng dịu cho góc đọc và bàn làm việc.

1.290.000đ
4.8 ★ · 126 đánh giá

Đế gốm nhám · chụp vải lanh
```

The SKU/product code is secondary information.

Do not let it compete visually with product identity, price, choices or fulfillment.

---

## 30. Selection consequence helper

The PDP may expose one concise helper near configuration:

```text
Ảnh, giá và mã sản phẩm cập nhật theo lựa chọn.
```

Purpose:

```text
tell the shopper that choices have consequences
without exposing technical Variant resolution
```

Do not repeat this helper after every option group.

Do not expose implementation language.

---

## 31. Variant Group / Finish

Finish/color uses semantic visual controls.

Example:

```text
Hoàn thiện

● Gỗ sáng
● Gỗ tối
● Óc chó
```

Each option must communicate:

```text
label
visual sample when available
selected state
unavailable state when applicable
```

Selected state must remain understandable without color alone.

---

## 32. Variant Group / Size

Size uses compact labeled choices.

Example:

```text
Kích thước

[ Nhỏ ] [ Lớn ]
```

States:

```text
Default
Selected
Unavailable
Disabled
```

Do not use decorative large CTA styling for option buttons.

These are selection controls, not primary actions.

---

## 33. Variant Group / Pack

Pack is a first-class Product Variant Dimension.

Canonical example:

```text
Quy cách / Bộ

[ Bộ 2 chiếc ]
[ Bộ 4 chiếc ]
[ Bộ 6 chiếc ]
```

This component must exist independently from Quantity.

States:

```text
Default
Selected
Unavailable
Disabled
```

Changing Pack may update:

```text
Variant
SKU
price
media
availability
fulfillment
technical values
```

when supported by actual product data.

Non-violable example:

```text
Selected Pack = Bộ 4 chiếc
Quantity = 2
```

means:

```text
2 × Bộ 4 chiếc
```

not:

```text
Quantity = 8
```

---

## 34. Exact configuration consequence

The combined selections:

```text
Finish
+
Size
+
Pack
```

resolve the sellable configuration.

The shopper should experience:

```text
select option
→ product information updates in place
```

Possible consequences:

```text
image changes
price changes
SKU changes
availability changes
fulfillment changes
```

Do not show a technical “Resolved Variant” panel.

---

## 35. Invalid/unavailable configuration behavior

If a combination cannot be purchased:

```text
prevent it as early as the UI can know
```

Do not wait until Add to cart if the incompatibility is already known.

Possible states:

```text
Unavailable option
Disabled option
Current combination unavailable
Out of stock
```

The shopper must understand:

```text
what cannot be selected
and
what recovery action is available
```

---

## 36. Fulfillment Row / Delivery

Do not use vague passive copy when a shopper action is required.

Preferred structure when fulfillment authority exists:

```text
Giao hàng
Nhập địa chỉ để xem thời gian giao            >
```

This row communicates:

```text
question
+
action required to answer it
```

---

## 37. Fulfillment Row / Store Pickup

Preferred structure:

```text
Nhận tại cửa hàng
Chọn cửa hàng để kiểm tra tồn kho             >
```

Do not claim stock or pickup availability unless the authoritative fulfillment source supports it.

---

## 38. Quantity Stepper

Quantity is purchase quantity.

It is not Pack.

Canonical form:

```text
Số lượng

−  1  +
```

States:

```text
minimum
normal
maximum when applicable
disabled when product cannot be purchased
```

The stepper belongs near Add to cart.

---

## 39. Add to Cart Action

Add to cart operates on:

```text
current exact configuration
×
current purchase quantity
```

Example:

```text
Gỗ sáng
Nhỏ
Bộ 4 chiếc
Quantity 2
```

The Cart handoff must preserve all of them.

Add to cart states may include:

```text
Enabled
Disabled — missing required selection
Disabled — unavailable combination
Disabled — out of stock
```

Do not keep Add to cart enabled if the current configuration cannot be purchased.

Any post-add drawer/confirmation behavior follows the canonical Cart contract.

Do not create a PDP-local cart pattern.

---

## 40. Policy / Return Note

A short policy/reassurance note may appear near the purchase action when supported.

Example:

```text
Đổi trả theo chính sách GRIP
```

This note is secondary reassurance.

It must not visually compete with Add to cart.

---

## 41. Product Information Section

The accepted information structure is progressive disclosure.

Canonical groups:

```text
Chi tiết sản phẩm
Kích thước
Chất liệu & bảo quản
Thông số sản phẩm
An toàn & lưu ý
Đánh giá của khách hàng
```

Do not create a UI section for every domain field.

Group by shopper question.

---

## 42. Expanded information row

Example:

```text
Chi tiết sản phẩm                           ˄

Đèn bàn mộc tạo ánh sáng dịu cho góc đọc và bàn làm việc.
Đế gốm nhám kết hợp với chụp vải lanh để ánh sáng tỏa mềm hơn.
```

Expanded content should answer a concrete shopper question.

Do not expose raw data dumps.

---

## 43. Collapsed information row with preview

Collapsed rows should still expose useful preview information when available.

Example:

```text
Kích thước                                  ˅
Nhỏ hoặc lớn, chọn theo không gian đặt
```

Example:

```text
Chất liệu & bảo quản                        ˅
Đế gốm nhám · chụp vải lanh
```

Example:

```text
Thông số sản phẩm                           ˅
Mã sản phẩm DBM-S-ASH-2
```

Example:

```text
An toàn & lưu ý                             ˅
Sử dụng trong nhà · xem hướng dẫn
```

Do not reduce every collapsed disclosure to:

```text
title + chevron only
```

when a useful preview can reduce unnecessary expansion.

---

## 44. Reviews Summary

When reviews are supported:

```text
Đánh giá của khách hàng
4.8 ★ · 126 đánh giá

Xem tất cả đánh giá >
```

The summary provides decision support.

It is not decoration.

The review action may navigate or scroll to the authoritative review experience.

Do not invent review data.

---

## 45. Similar Products Section

Canonical intent:

```text
"What are comparable alternatives to this product?"
```

This section is not:

```text
Recommendation
Category Navigation
Accessories
Styling Inspiration
```

Canonical item anatomy:

```text
Image
Product Name
Short Descriptor
Starting Price
```

Example:

```text
Đèn sàn vải
Ánh sáng đứng cho góc đọc
Từ 1.890.000đ
```

The section helps the shopper compare alternatives.

Do not add a “reasoned recommendation” label unless the item is actually produced by recommendation/curation logic.

---

# Part E — Visual Craft Rules

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
Merchandising Status
Pricing State
Social Proof
Variant Signal
Add to Cart / Listing

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
Add to Cart Action
Policy Note

Product Information Section
Information Disclosure / Expanded
Information Disclosure / Collapsed + Preview
Reviews Summary

Similar Products Section
Similar Product Item
```

Do not create local substitutes when a canonical Design System component already exists.

---

# Part H — Acceptance Gates

## 53. Browse walkthrough

A shopper landing on Browse must quickly answer:

```text
Where am I?
Which category fits me?
How many products exist?
How do I filter?
How do I sort?
How do products differ?
How do I continue browsing?
If I am unsure, which product should I choose and why?
```

Fail if these require unnecessary hunting.

---

## 54. PDP walkthrough

A shopper on PDP must quickly answer:

```text
What is this?
What does it look like?
What is the price?
Which Finish is selected?
Which Size is selected?
Which Pack is selected?
Which options are unavailable?
Does changing my choice change the product?
Can I receive it?
Can I pick it up?
How many selected packs am I buying?
Where do I add it to cart?
Where are dimensions/material/care/safety details?
What comparable products exist?
```

The shopper must be able to distinguish:

```text
Pack
from
Quantity
```

without interpretation.

---

## 55. Configuration gate

PASS only if:

- Finish selection is explicit;
- Size selection is explicit;
- Pack selection is explicit;
- Quantity is a separate control;
- selected configuration is visually obvious;
- unavailable configuration states exist when required;
- configuration consequences update in place;
- Add to cart operates on the exact selected configuration;
- Cart handoff preserves Finish + Size + Pack + Quantity.

Hard reject:

```text
Bộ 4 chiếc
treated as
Quantity 4
```

---

## 56. Browse visual evidence

Do not use one full-page screenshot as the only proof.

Required Browse crops:

### Header

Verify:

- starts at y=0;
- no empty strip;
- shared grid;
- Search;
- Lucide Saved/Account/Cart icons;
- Cart badge state.

### Category → Bridge → Inventory

Verify:

- one-row category rail;
- category images large enough for recognition;
- large bridge;
- bridge actions;
- result toolbar;
- first product row.

### Filter + two product rows

Verify:

- filter has no background panel;
- filter is sticky in behavior/prototype;
- multi-row product grid;
- correct merchandising/pricing semantics;
- consistent Add to cart alignment.

### Continuation + Recommendation

Verify:

- showing count;
- Show more;
- recommendation gives products + reason/evidence;
- recommendation is not category navigation.

---

## 57. PDP visual evidence

Required PDP crops:

### Gallery + Purchase Decision Panel

Must visibly include:

```text
thumbnail rail
main media
product identity
price
social proof
Finish
Size
Pack
Delivery
Store Pickup
Quantity
Add to cart
Policy note
```

### Configuration states

Provide evidence for:

```text
Finish selected
Size selected
Pack selected
Unavailable option if applicable
Configuration consequence
```

### Pack vs Quantity

Provide one explicit state showing:

```text
Bộ 4 chiếc
Quantity 2
```

and verify that the system treats this as:

```text
2 packs
```

not:

```text
8 quantity units
```

### Product Information

Show:

- one expanded disclosure;
- collapsed disclosures with previews;
- review summary when supported.

### Similar Products

Show comparable alternatives using:

```text
image
name
descriptor
starting price
```

---

## 58. Hard reject conditions

Reject Public Catalog if any of the following occur:

- visual polish is used as proof of UX correctness;
- Header has an unexplained empty top strip;
- Header/body use unrelated grids;
- local/manual icons replace canonical icons;
- category rail wraps into multiple rows;
- category images are too small to aid recognition;
- merchandising bridge becomes a thin banner;
- merchandising bridge is placed after primary inventory;
- desktop filter uses a decorative background panel;
- product tiles become boxed app cards;
- `Mới`, `Bán chạy`, discount, reviews and variants are flattened into one generic badge system;
- discount label exists without discount pricing semantics;
- Add to cart alignment varies arbitrarily across comparable product tiles;
- recommendation is a category list;
- recommendation gives no reason/evidence;
- PDP exposes technical Variant-resolution language;
- Finish / Size / Pack are treated as interchangeable generic fields without semantic controls;
- Pack is confused with Quantity;
- selected Pack is lost during Add to cart;
- fulfillment copy is vague when an action is required;
- Product Information mirrors database schema instead of shopper questions;
- collapsed information rows hide useful preview data without reason;
- Similar Products is confused with Recommendation or Category discovery.

---

## 59. Final rule

Public Catalog is not complete when it merely looks polished.

It is complete when:

```text
Browse
→ shopper can recognize, narrow, filter, compare and choose

PDP
→ shopper can understand, configure and purchase the exact product

Cart handoff
→ exact configuration is preserved
```

The canonical GRIP product decision model is:

```text
ProductModel
→ Finish
→ Size
→ Pack
→ Fulfillment
→ Quantity
→ Add to Cart
```

with the non-violable distinction:

```text
Pack != Quantity
```

The design passes when the shopper can understand and act without having to infer domain mechanics.
