# Public Catalog — Browse / List UI/UX

**Owner:** Browse / Category Listing composition and behavior  
**Required before this file:** `01-semantic-invariants.md`  
**Related:** `04-merchandising-cart-interactions.md`, `05-design-system-contracts.md`, `06-acceptance-qa.md`

This file owns Browse layout and product-finding UX. Merchandising/campaign semantics and Add-to-cart state machines are referenced from file 04 rather than duplicated here.

---

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
---

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

---

## Cross-file interaction references

For product attention/campaign treatment, apply:

```text
04-merchandising-cart-interactions.md
→ Merchandising, campaign and pricing states
```

For product-tile Add to cart, apply:

```text
04-merchandising-cart-interactions.md
→ Listing Add to Cart UX
```

Do not recreate those rules locally.
