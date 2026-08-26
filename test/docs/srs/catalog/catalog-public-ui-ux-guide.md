# GRIP Public Catalog — UI/UX Guide

**Status:** Canonical public-design execution guide
**Scope:** Public Catalog browse/list + Product Detail + shared public retail shell
**Companion research:** `test/docs/srs/catalog/grip-public-catalog-ikea-ux-research.md`
**Semantic authority:** `test/docs/srs/catalog/srs_001_product.md` + accepted cross-domain contracts

## 1. Purpose

This guide turns the Public Catalog research and accepted PoC decisions into concrete design rules.

The goal is **not** to make the frontend merely look polished. The goal is to make the public shopping flow easy to understand and easy to complete.

```text
business semantics
→ shopper goal
→ task / interaction model
→ information architecture
→ visual hierarchy
→ UI composition
→ implementation
```

Visual quality is necessary, but it is not the acceptance criterion by itself.

Primary optimization target:

```text
reduce decision latency
```

Every visible element should do at least one of the following:

- answer a shopper question;
- enable an action;
- communicate state;
- reduce uncertainty;
- improve recognition or comparison.

If it does none of these, remove or demote it.

---

## 2. Authority and responsibility boundaries

Public Catalog must preserve Catalog semantics underneath while exposing a shopper mental model above.

```text
ProductModel
→ choices / Variant Dimensions
→ resolved sellable Variant
→ shopper-facing product experience
```

Do not expose internal/domain vocabulary such as:

```text
ProductModel
Resolved Variant
Canonical Combination
Sale-ready Variant
```

External commerce capabilities may enrich Catalog only when an authoritative contract exists.

Examples:

```text
Cart
Account
Saved items
Checkout / fulfillment
Reviews / engagement
Recommendations
```

Do not fabricate behavior or data merely to imitate a reference product.

---

## 3. Reference model

IKEA is a **usability and retail-structure reference**, not a pixel authority.

Borrow:

- product-first hierarchy;
- practical retail shell;
- visual category recognition;
- persistent refinement;
- strong product comparison;
- semantic merchandising states;
- image-led contextual bridge modules;
- decision-support information near purchase actions;
- progressive disclosure on PDP;
- clear continuation after results.

Do not copy:

- IKEA branding;
- IKEA typography;
- exact colors;
- exact dimensions;
- IKEA-specific commerce programs;
- unsupported delivery/review/recommendation semantics.

Reference pages used during calibration:

- https://www.ikea.com/us/en/new/new-products/
- https://www.ikea.com/us/en/cat/desks-computer-desks-20649/

---

## 4. Canonical public flow model

### Browse / category page

```text
Global Header
→ Breadcrumb / category context
→ Dynamic title + short supporting copy
→ Visual category rail
→ Large merchandising bridge
→ Result count + sort
→ Sticky filter rail + multi-row product grid
→ Results continuation
→ Decision-support recommendations
```

### Product Detail

```text
Global Header
→ Breadcrumb
→ Product gallery + purchase decision rail
→ product information / progressive disclosure
→ reviews when supported
→ accessories / related products when supported
→ further recommendation / continuation
```

### Responsibility distinction

```text
Homepage / discovery
→ discovery-first

Category / listing
→ product-finding-first

Product detail
→ decision / purchase-first
```

Do not give these screens the same information priority merely because they share a Design System.

---

# Part A — Shared Public Shell

## 5. Global page grid

Use one canonical desktop grid for the entire public page.

Starting calibration for 1440px desktop:

```text
page max width: ~1280–1320px
minimum outer gutter: ~32–48px
```

The following must snap to the same major page guides:

- header inner content;
- breadcrumb;
- title;
- category rail;
- merchandising bridge;
- results toolbar;
- filter + product area;
- recommendations.

Never allow the header and body to use unrelated left/right alignment systems.

Preferred spacing scale:

```text
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
```

Avoid arbitrary drag-by-eye gaps unless there is a documented optical reason.

---

## 6. Global header

The canonical header begins at `y=0`.

Do not reserve an empty top strip.

If an announcement/service bar exists in the future, it is an optional component:

```text
GlobalShell
├── AnnouncementBar [optional]
└── Header
```

When absent:

```text
AnnouncementBar height = 0
```

### Header structure

```text
GRIP
Primary navigation
Search
Saved
Account
Cart
```

The shell spans full viewport width; inner content aligns to the canonical page grid.

Starting desktop geometry:

```text
header height: ~64–72px
logo → first nav gap: ~32px
nav item gap: ~24–32px
utility hit area: at least 40×40px
```

Search is a primary retail utility, not a decorative pill.

Starting calibration:

```text
search width: ~300–420px
search height: ~40–44px
```

Use a clear search icon and readable placeholder.

### Header balance

Do not manually place Search at the exact physical center of the viewport.

Use a layout model:

```text
logo           intrinsic
primary nav    intrinsic
search         flexible, bounded
utilities      intrinsic
```

The left and right groups should feel optically balanced even if their pixel widths differ.

### Header boundary

Use a subtle bottom divider to separate global navigation from page content.

Avoid heavy filled surfaces around each header element.

---

## 7. Canonical icon system

The repository already uses `lucide-react`; use **Lucide** as the canonical open-source icon family for public UI.

Do not manually draw page-local icons and do not mix icon families.

Minimum canonical set:

```text
Search
Heart
User
ShoppingCart or ShoppingBag
ChevronDown / ChevronUp
ChevronLeft / ChevronRight
ArrowLeft / ArrowRight
Plus / Minus
X
SlidersHorizontal / Filter
Star
Check
Menu
```

Choose one cart metaphor (`ShoppingCart` or `ShoppingBag`) and use it everywhere.

Starting icon rules:

```text
16px  compact inline
20px  header / utility default
24px  emphasized utility only
minimum interactive target: 40×40px
```

Preserve one canonical stroke treatment.

### Header utility mapping

```text
Saved   → Heart
Account → User
Cart    → canonical cart icon
Search  → Search
```

Do not use ambiguous shapes such as a plain circle for Account or a line for Cart.

### Cart states

Design System must include:

```text
Cart / Empty
Cart / Has Items
```

When items exist:

```text
same cart icon
+ count badge
```

The badge must not shift the icon or header alignment.

---

# Part B — Browse / Category Listing

## 8. Primary shopper task

A listing page exists to help the shopper:

```text
recognize context
→ narrow
→ filter
→ compare
→ choose a product
```

Optimize for time-to-first-relevant-product.

Do not place unnecessary landing-page content between shopper intent and inventory.

---

## 9. Dynamic page context

Category context must update with the active category.

Example:

```text
Sản phẩm / Đèn bàn
Đèn bàn
Ánh sáng dịu cho góc đọc và bàn làm việc.
```

Do not leave the H1 at `Đèn` after the shopper has narrowed to `Đèn bàn`.

Spacing calibration:

```text
breadcrumb → H1: 8–12px
H1 → supporting copy: ~8px
supporting copy → categories: 24–40px
```

Avoid redundant copy such as:

```text
H1: Đèn
42 sản phẩm · Đèn
```

If context is already clear, use only the result count.

---

## 10. Visual category rail

The category rail is a **narrowing control**, not a mini gallery and not a wrapped card grid.

Hard rules:

- exactly one row on desktop;
- constrained by the canonical page width;
- horizontal scroll/overflow when categories exceed available width;
- never wrap into a second row;
- category image must communicate semantic identity before the label is read.

### Visual semantics

Examples:

```text
Đèn bàn
→ image clearly reads as a table lamp

Đèn sàn
→ image clearly reads as a floor lamp

Đèn treo
→ image clearly reads as a pendant lamp
```

Do not use nearly identical lifestyle crops for multiple categories.

### Geometry calibration

Starting point:

```text
tile width: ~150–190px
image height: ~84–112px
image → label gap: ~8–10px
```

The image must have enough space to be the primary recognition cue.

### Rail controls

Use canonical left/right arrow controls:

```text
~40×40px hit area
vertically centered to image rail
left arrow hidden/disabled at start
right arrow hidden/disabled at end
```

### Active category

Provide a clear active state through structure such as underline/border/selection treatment.

Do not rely on text color alone.

---

## 11. Merchandising bridge between categories and inventory

The merchandising bridge belongs **between Category Rail and Results Controls**.

Required order:

```text
Category Rail
↓
Large Merchandising Bridge
↓
Result count / Sort
↓
Filter + Products
```

Do not move the primary bridge below the initial result list.

### Purpose

It connects:

```text
category semantics
→ usage context / solution
→ inventory
```

It should answer:

```text
"How might this category fit my situation?"
```

### Size and composition

This is not a thin promotional strip.

Use a full content-width, image-led section with real visual authority.

Starting calibration:

```text
section heading
1–2 line supporting copy
large lifestyle scene(s)
image height roughly 220–320px depending on composition
```

Example:

```text
Ánh sáng cho từng cách sống
Từ góc đọc đến không gian làm việc.

[ LARGE SCENE: GÓC ĐỌC ] [ LARGE SCENE: LÀM VIỆC ]
Góc đọc →                  Không gian làm việc →
```

Each scene must have a meaningful use-case and a clear action.

Do not use decorative lifestyle imagery with no semantic/action relationship.

### Boundary into inventory

After the bridge, switch decisively into utility mode:

```text
────────────────────────
42 sản phẩm        Sort ▾
────────────────────────
Filter | Product Grid
```

Above the boundary:

```text
context / inspiration
```

Below the boundary:

```text
filter / compare / buy
```

---

## 12. Results toolbar

The result count and sort control form one operational band.

```text
42 sản phẩm                         Giá thấp đến cao ▾
─────────────────────────────────────────────────────
```

Do not leave Sort floating independently from result context.

If a desktop sticky filter rail is present, do not duplicate full filtering controls in the toolbar.

Mobile may collapse filtering/sorting into a dedicated control.

---

## 13. Desktop filter rail

Use a full vertical filter rail on the left.

### Visual treatment

The filter rail is **naked on the page surface**.

Do not use:

- tinted sidebar background;
- card container;
- rounded panel shell;
- heavy vertical border.

Use:

- typography;
- spacing;
- thin horizontal dividers;
- clear alignment.

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

Do not include redundant labels such as `Lọc theo` unless they add actual meaning.

### Geometry calibration

```text
filter width: ~220–260px
gap to grid: ~28–40px
facet row: ~44–52px
```

### Sticky behavior

Desktop filter remains available while the shopper browses long result sets.

```text
position: sticky
top: canonical header height + breathing space
```

Do not overlap the header.

If the expanded rail becomes taller than the viewport, allow its inner content to scroll only when necessary.

### Filter states

Design and verify:

```text
Collapsed
Expanded
Selected option
Group with selection count
Clear group / Clear all
Disabled/unavailable option when applicable
```

Selected state must remain understandable without color alone.

---

## 14. Product grid

Products dominate the listing.

Desktop target:

```text
sticky filter rail
+
4 product columns when readability permits
+
multiple vertical rows
```

Do not force four columns if actual content becomes unreadable.

Rule:

```text
comparison efficiency > column count
```

### Do not box products

Avoid a generic card shell around every item:

```text
no card background
no card border
no card shadow
no large padded card surface
```

The product image and information hierarchy create the item.

Use row/system boundaries rather than card borders when separation is needed.

Example:

```text
product   product   product   product
─────────────────────────────────────
product   product   product   product
```

### Product media

Keep:

- consistent image ratio;
- consistent visual scale of the product subject;
- consistent top alignment;
- restrained radius if used.

Avoid one image being aggressively zoomed while the adjacent item appears tiny.

---

## 15. Product tile information model

A listing tile represents a ProductModel, not every Variant as a separate listing identity.

The tile should expose only the information needed for recognition and comparison.

Possible anatomy:

```text
merchandising status [optional]
image
product name
descriptor
price / pricing state
social proof [optional]
variant signal [optional]
compact purchase action [if supported]
```

Do not force every product into an identical metadata schema.

Ask for each item:

```text
"What helps the shopper distinguish this product from adjacent products?"
```

---

## 16. Merchandising state semantics

Do **not** build one generic Product Tag component and map all concepts to differently colored pills.

These are different semantic layers.

### Merchandising status

Examples:

```text
Mới
Bán chạy
Limited / exclusive [only if real GRIP semantics exist]
```

These belong near product identity/media and may use distinct treatments.

### Pricing state

Discount is not merely a badge.

A promotion is a pricing composition:

```text
sale price
regular price / strike-through
saving or percentage when supported
validity when supported
```

Do not show a `Giảm giá` label if the price block does not communicate an actual discount state.

### Social proof

```text
rating
review count
```

This is metadata, not a merchandising badge.

### Variant signal

```text
3 màu
2 kích thước
Nhiều lựa chọn
```

This is variant metadata, not a badge.

### Availability

Availability is commerce state, not merchandising status.

### Coexistence

A product may legitimately contain several layers at once:

```text
Bán chạy
+ promotional price
+ review rating
+ multiple options
```

Do not force them into one mutually exclusive tag slot.

---

## 17. Product tile vertical rhythm

Product content within a row must scan consistently even when metadata differs.

Starting rhythm:

```text
status area
image
12–16px
name
4px
descriptor
6–8px
price
4–8px
review / variant metadata
10–12px
purchase action
```

Use a consistent content layout/minimum slot strategy so purchase actions do not jump arbitrarily within the same row.

### Add to cart alignment

`Thêm vào giỏ` must use one canonical treatment.

Do not mix:

```text
left-aligned on one tile
visually centered on another
variable button geometry across tiles
```

Choose one interaction pattern and align it to the product content grid consistently.

The purchase action must remain subordinate to product identity and price.

---

## 18. Results continuation

After a result batch, show explicit browsing progress.

```text
Đang hiển thị 8 / 42 sản phẩm                    Xem thêm
```

Count and continuation action belong to one horizontal band on desktop.

`Xem thêm` must read as an action, not an annotation.

---

## 19. Recommendation semantics

Recommendation is **not another category list**.

Use recommendation when the shopper already wants to buy in the current space but is unsure which product to choose.

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

Each recommendation must show a product and the evidence/reason for the recommendation.

Example:

```text
Phù hợp góc đọc
Đèn đọc tối giản
990.000đ
Ánh sáng tập trung · chân đế nhỏ gọn
```

or:

```text
Được chọn nhiều nhất
Đèn bàn mộc
1.290.000đ
4.8 ★ · 126 đánh giá
```

Do not substitute:

```text
Đèn bàn
Đèn sàn
Đèn treo
```

That is category discovery, not recommendation.

Render recommendations only when there is an authoritative source for the recommendation or curation logic.

---

# Part C — Product Detail

## 20. PDP primary task

Product Detail exists to help the shopper answer:

```text
What is this?
What does it look like?
How much is it?
Which configuration do I want?
Can I get it?
How many do I want?
Can I buy it now?
What uncertainty remains?
```

Target decision sequence:

```text
product identity
→ media understanding
→ price / social proof
→ variant selection
→ fulfillment / availability
→ quantity
→ add to cart
→ reassurance / supporting information
```

Do not arrange the right rail according to arbitrary component order.

---

## 21. PDP desktop composition

Starting structure:

```text
Breadcrumb

┌──────────────────────────────┬─────────────────────────────┐
│ thumbnails + LARGE MEDIA     │ product identity            │
│                              │ descriptor                  │
│ product / lifestyle / detail │ price + review              │
│ views                        │ option groups               │
│                              │ fulfillment                 │
│                              │ quantity + Add to cart      │
└──────────────────────────────┴─────────────────────────────┘

Product information / accordions
Reviews
Accessories / related products
Recommendation / continuation
```

Media must have enough authority to support product understanding.

---

## 22. Product gallery

Use a practical retail gallery:

- dominant main image;
- thumbnail rail;
- alternate angle;
- lifestyle/context image;
- material/detail view;
- dimensions/use context when supported.

Thumbnails must read as images, not as abstract color blocks.

When selection changes:

```text
variant media available
→ update appropriate media
else
→ keep/fallback to ProductModel media
```

Do not expose this fallback mechanism as shopper copy.

---

## 23. Variant configuration

Variant controls must follow option semantics.

Examples:

```text
Finish / color
→ swatch + label

Size
→ compact labeled choice

Pack / quy cách
→ compact labeled choice
```

The shopper must always know:

- which value is selected;
- which values are unavailable;
- whether selection changes media;
- whether selection changes price;
- whether selection changes SKU/product code;
- whether selection changes availability.

Do not wait until Add to cart to report an invalid combination if the UI can prevent it earlier.

### Product configuration vs quantity

A pack/format is not quantity.

Example:

```text
Bộ 4 chiếc = selected product configuration
Quantity 2 = buy two packs
```

The UI must expose both when required.

---

## 24. Fulfillment / availability

Avoid vague status copy such as:

```text
Còn hàng · Sẵn sàng giao
Nhận tại cửa hàng
```

Prefer actionable fulfillment rows when the authoritative domain supports them:

```text
Giao hàng
Nhập địa chỉ để xem thời gian giao        >

Nhận tại cửa hàng
Chọn cửa hàng để kiểm tra tồn kho         >
```

The UI should tell the shopper both the question and the action required to answer it.

Purchase action state must respect configuration and availability.

---

## 25. Quantity and purchase action

Quantity is a purchase action, not a product dimension.

Use a clear stepper near Add to cart when supported:

```text
−  1  +      Thêm vào giỏ
```

States must include, where applicable:

```text
missing required selection
invalid combination
available
unavailable
out of stock
```

Do not keep Add to cart enabled when the current state cannot be purchased.

---

## 26. PDP supporting information

Use progressive disclosure based on shopper questions, not database schema.

Possible groups:

```text
Chi tiết sản phẩm
Kích thước
Chất liệu & bảo quản
Thông số sản phẩm
An toàn & lưu ý
```

Merge weak/redundant groups rather than exposing one UI section for every domain field group.

A shopper should be able to answer quickly:

```text
Will it fit?
What is it made from?
How do I care for it?
What should I know before use?
```

---

## 27. Reviews, accessories, related products

When supported by authoritative domains:

### Reviews

- expose rating summary near price;
- review link should navigate/scroll to detailed reviews;
- reviews are decision support, not decoration.

### Accessories / buy-with

Answer:

```text
"What is useful to buy with this product?"
```

### Related products

Answer:

```text
"What are comparable alternatives?"
```

### Styling / inspiration

Answer:

```text
"What could I pair visually with this?"
```

Do not merge these different intents into one generic carousel merely because they can all contain products.

---

# Part D — Visual Craft and System Rules

## 28. Surfaces and boundaries

Default grouping strategy:

```text
spacing
→ alignment
→ typography
→ thin divider
```

Only add a filled container when the semantics genuinely require a separate surface.

Avoid the automatic pattern:

```text
group
→ beige background
→ radius
→ padding
```

The merchandise should dominate; UI chrome should remain quiet.

Warm-neutral GRIP identity remains, but do not use the warm fill for every interaction.

---

## 29. Alignment and baseline discipline

QA must inspect geometry, not only semantic hierarchy.

Verify:

- header and body share major guides;
- category tiles align consistently;
- toolbar count and sort share baseline;
- filter labels/chevrons align;
- product images share ratios and top alignment;
- names/prices/actions have consistent rhythm;
- `Thêm vào giỏ` has one alignment model;
- recommendation items share a clear decision-support structure.

Do not accept a full-page screenshot as proof if individual rows contain visible drift.

---

## 30. Accessibility baseline

At minimum:

- interactive hit target ~40×40px where practical;
- keyboard/focus states for controls;
- selected state is not color-only;
- icon-only controls have accessible labels;
- carousel/rail controls are keyboard reachable;
- text/price/status contrast is sufficient;
- disabled/unavailable states remain legible;
- meaningful images have useful alternative text in implementation.

---

## 31. Responsive behavior

### Desktop

```text
horizontal category rail
sticky vertical filter
multi-column product grid
2-column PDP
```

### Mobile / narrow viewport

Recompose rather than shrink desktop.

Likely model:

```text
header/mobile navigation
horizontal category rail
large merchandising scene or horizontal story module
[Lọc & sắp xếp]
responsive product grid
stacked PDP media → purchase decision
```

The vertical filter rail must not remain as a narrow desktop sidebar on mobile.

Do not assume every desktop component stacks unchanged.

---

# Part E — Design System Deliverables

## 32. Canonical components required

Public screens should consume canonical Design System components/patterns.

Required set:

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
Quantity Stepper
Add to Cart Action
Results Continuation
Recommendation Item / Reasoned
PDP Gallery
PDP Option Group
Fulfillment Row
Product Information Accordion
```

Do not create page-local visual variants when a canonical component exists.

---

# Part F — Acceptance and QA

## 33. Browse acceptance walkthrough

A shopper landing on the listing must quickly answer:

```text
Where am I?
Which category/subcategory fits me?
How many products are available?
How do I filter?
How do I sort?
How do products differ?
How do I continue to more results?
If I am unsure, which product should I choose and why?
```

Fail the design if these require unnecessary hunting.

---

## 34. PDP acceptance walkthrough

A shopper on Product Detail must quickly answer:

```text
What is this?
What does it look like?
What is the price?
What do other buyers think? [if supported]
Which configuration is selected?
Which configurations are available?
Can I receive/pick it up? [if supported]
How many am I buying?
Where do I buy it?
Where are dimensions/materials/care details?
What should I buy with it / what alternatives exist? [if supported]
```

Configuration changes must update consequences in-place without exposing resolution mechanics.

---

## 35. Required visual evidence before PASS

Do not claim completion from one full-page screenshot.

For Browse, capture at minimum:

1. **Header crop**
   - grid alignment;
   - search;
   - Saved / Account / Cart icons;
   - cart badge state.

2. **Category → Bridge → Results crop**
   - single-row category rail;
   - large merchandising bridge;
   - result toolbar;
   - first result row.

3. **Filter + first two product rows crop**
   - sticky/naked filter geometry;
   - multi-row grid;
   - product image consistency;
   - merchandising/pricing states;
   - Add to cart alignment.

4. **Results continuation + Recommendation crop**
   - showing count;
   - Show more;
   - recommendation answers `Which one should I choose?`, not category navigation.

For PDP, capture at minimum:

1. gallery + purchase rail;
2. variant / fulfillment / quantity states;
3. supporting information;
4. reviews/accessories/related continuation when applicable.

---

## 36. Hard reject conditions

Reject the Public Catalog design if any of these occur:

- visual polish is used as proof of UX correctness;
- empty top strip remains above the header without content;
- header/body use unrelated page guides;
- manual/local icons are mixed with the canonical icon family;
- category rail wraps to multiple rows;
- category images are too small/ambiguous to aid recognition;
- merchandising bridge is a thin decorative strip or placed after the primary result list;
- desktop filter is enclosed in a decorative background panel;
- product cards become boxed application cards;
- `Mới`, `Bán chạy`, discount, review and variants are flattened into one generic badge type;
- a discount label exists without a corresponding pricing state;
- Add to cart alignment varies arbitrarily across product tiles;
- recommendation is implemented as another category list;
- recommendation has no reason/evidence for why a product is suggested;
- PDP exposes technical variant-resolution terminology;
- pack/format is confused with purchase quantity;
- fulfillment status is vague when an actionable check is required;
- supporting information mirrors domain schema rather than shopper questions.

---

## 37. Final principle

The Public Catalog should feel like a retail system that helps the shopper make a decision, not a design-system demo.

```text
products provide the subject
context helps recognition
controls help narrowing
information helps comparison
recommendations help indecision
purchase UI helps completion
```

The design passes when the shopper can understand, narrow, compare, choose and act with minimal unnecessary interpretation.
