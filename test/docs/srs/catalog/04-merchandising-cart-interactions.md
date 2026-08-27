# Public Catalog — Merchandising & Cart Interactions

**Owner:** Attention states, promotion semantics and Add-to-cart interaction behavior  
**Required before this file:** `01-semantic-invariants.md`

This file separates merchandising, pricing, campaign, availability and cart-interaction semantics. Do not flatten these concepts into one generic badge or button treatment.

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
---

## 21. Merchandising, campaign and pricing states

Do not model every attention signal as a generic colored pill.

The current Catalog projection already exposes distinct signals:

```text
isNew
isHot
isBestSeller
compareAtPrice
discountPercent
rating
reviewCount
stock
sold
purchaseLimit
purchaseWarning
```

Map them by semantics, not by one visual component.

### 21.1 New

Authority:

```text
isNew = true
```

Shopper meaning:

```text
recently introduced product
```

Recommended treatment:

```text
Mới
```

Use a compact merchandising status slot.

It may be accent text or a small status label.

Do not make it look like a price promotion.

### 21.2 Hot / Trending

Authority:

```text
isHot = true
```

Shopper meaning must be defined by GRIP merchandising rules.

Possible copy:

```text
Hot
Đang được quan tâm
Nổi bật
```

Choose one canonical shopper-facing label.

Do not silently reinterpret `isHot` as:

```text
Best seller
Flash sale
Low stock
```

These are different semantics.

### 21.3 Best seller

Authority:

```text
isBestSeller = true
```

Shopper meaning:

```text
strong sales / merchandising evidence
```

Canonical treatment:

```text
Bán chạy
```

This is merchandising status, not review metadata and not discount state.

### 21.4 Discount / Sale

Authority may come from:

```text
compareAtPrice
discountPercent
```

Discount is primarily a pricing state.

Canonical anatomy:

```text
Giá ưu đãi
990.000đ

1.290.000đ      [regular price / strike-through]
-23%            [when discountPercent is authoritative]
```

A compact sale marker may accompany the pricing block:

```text
-23%
```

but the marker never replaces the pricing composition.

Reject:

```text
[Giảm giá]
1.290.000đ
```

when no actual sale price / regular-price relationship is visible.

### 21.5 Flash Sale

`Flash Sale` is not the same semantic as `discountPercent`.

It represents:

```text
time-bounded promotional campaign
+
promotional pricing
```

Only render `Flash sale` when an authoritative promotion/campaign contract provides the state.

Required data:

```text
promotion active
promotion price
start/end time when time-boxed
```

If a countdown is displayed:

```text
it must use the real authoritative end time
it must never reset on refresh
it must never be decorative/fake urgency
```

Possible anatomy:

```text
FLASH SALE
Còn 01:42:18

990.000đ
1.290.000đ
```

The current Catalog product projection must not fabricate Flash Sale from:

```text
isHot
isBestSeller
discountPercent
```

alone.

### 21.6 Limited / Exclusive

Only render when explicit GRIP semantics exist.

Do not invent these states to make the grid look richer.

### 21.7 Low stock / urgency

Low stock is availability/commerce information.

It is not merchandising status.

Possible state when the authoritative stock model supports it:

```text
Sắp hết hàng
```

Do not turn stock state into fake promotional urgency.

### 21.8 Social proof

Authority:

```text
rating
reviewCount
```

Anatomy:

```text
4.8 ★ · 126 đánh giá
```

This is decision-support metadata.

It is not a tag.

### 21.9 Variant signal

Examples:

```text
3 màu
2 kích thước
2 quy cách
Nhiều lựa chọn
```

This is configuration metadata.

It is not a tag.

### 21.10 Status placement and composition

Reserve a consistent merchandising-status slot per product tile.

Do not arbitrarily overlay some labels on images and place others above the name.

Canonical tile ordering:

```text
Primary Merchandising Status [optional]
Product Image
Product Identity
Pricing State
Social Proof / Variant Signal
Purchase Action
```

Avoid tag soup.

Default visual rule:

```text
max 1 primary merchandising status
+
1 independent pricing/campaign treatment when applicable
```

Examples:

```text
Bán chạy
+ discount pricing
```

or:

```text
Mới
+ normal pricing
```

or:

```text
Hot
+ Flash Sale campaign
```

Do not flatten:

```text
Mới
Hot
Bán chạy
Giảm giá
Flash sale
```

into five same-style pills on one product.

The UI hierarchy must reflect the semantics of each signal, not an arbitrary “strong / medium / weak” badge scale.

---
---

## 22A. Listing Add to Cart UX

`Thêm vào giỏ` on a product tile is a commerce interaction, not decoration.

The listing must first decide whether direct add is valid.

### Direct-add eligibility

Use:

```text
Thêm vào giỏ
```

only when the tile represents a sellable configuration that can be added without asking the shopper for another required choice.

If required configuration remains unresolved:

```text
Chọn tùy chọn
```

or:

```text
Xem sản phẩm
```

must replace direct Add to cart.

Do not add an arbitrary/default Variant if the shopper still needs to choose:

```text
Finish
Size
Pack
```

### Canonical listing action geometry

Within comparable product tiles:

```text
same action slot
same alignment
same height
same icon/text treatment
same baseline behavior
```

Recommended desktop pattern:

```text
[ ShoppingCart icon ] Thêm vào giỏ
```

or a canonical compact text button if the GRIP Design System chooses that model.

Do not mix icon-only, centered, left-aligned and variable-width treatments inside one result row.

### Listing Add to Cart states

Design and verify:

```text
Default
Hover / Focus
Pending
Success
Requires Options
Unavailable
Error
```

#### Default

```text
Thêm vào giỏ
```

#### Pending

Prevent double submission.

Example:

```text
Đang thêm…
```

or a loading indicator inside the same button geometry.

Do not move surrounding content while loading.

#### Success

Give immediate confirmation without navigating the shopper away from Browse.

Required system consequences:

```text
button/inline success feedback
+
Header Cart count updates
+
canonical Cart feedback becomes available
```

Possible temporary action feedback:

```text
✓ Đã thêm
```

Then return to the canonical Add action state.

#### Requires Options

If the ProductModel cannot be sold safely from the listing without configuration:

```text
Chọn tùy chọn
```

This action opens/navigates to the PDP decision surface.

Do not pretend it is an Add-to-cart action.

#### Unavailable

Example:

```text
Hết hàng
```

or another authoritative unavailable state.

Do not show an enabled Add action.

#### Error

Keep the shopper in context.

Example:

```text
Không thể thêm
Thử lại
```

Do not increment Cart count on failure.

### Repeated add

Repeated Add to cart must operate on the exact same sellable configuration.

If the same exact configuration already exists in Cart:

```text
increase its purchase quantity
```

If a different Variant / Finish / Size / Pack is selected:

```text
create or update a distinct cart-line identity
```

Never merge distinct configurations just because they share the same ProductModel id.

### Cart feedback after listing Add

Use one canonical Cart pattern across Public UI.

The repository already has a global Cart Drawer pattern.

The intended experience is:

```text
Add succeeds
→ Header Cart badge updates immediately
→ shopper gets clear confirmation
→ Cart Drawer / cart utility exposes the added item
→ shopper may continue browsing or inspect Cart
```

Do not introduce a one-off product-tile modal or unrelated local mini-cart.


---
---

## 39. Add to Cart — PDP interaction contract

PDP Add to cart is the completion point of the product-decision surface.

It operates on:

```text
current exact sellable configuration
×
current purchase quantity
```

Example:

```text
Finish = Gỗ sáng
Size = Nhỏ
Pack = Bộ 4 chiếc
Quantity = 2
```

Cart meaning:

```text
2 × [Gỗ sáng · Nhỏ · Bộ 4 chiếc]
```

### 39.1 Pre-add gate

Before Add is enabled, verify:

```text
required Finish resolved
required Size resolved
required Pack resolved
Variant exists
Variant is sale-ready
availability allows purchase
quantity is valid
```

If a required choice is missing, the UI must explain which group needs attention.

Do not use a mysteriously disabled primary button with no reason.

### 39.2 Canonical PDP action layout

Quantity and Add belong to one purchase-action region:

```text
Số lượng
[ −  1  + ]   [ Thêm vào giỏ ]
```

The Add action is the dominant action in this region.

Do not make option selectors visually compete with the purchase CTA.

### 39.3 PDP Add states

Design and verify:

```text
Default
Pending
Success
Missing Selection
Unavailable Combination
Out of Stock
Purchase Limit
Error
```

#### Default

```text
Thêm vào giỏ
```

#### Pending

Prevent duplicate submissions.

Maintain button geometry.

Example:

```text
Đang thêm…
```

#### Success

Success must be observable in the shared public shell.

Required consequence:

```text
Header Cart count updates immediately
```

Canonical feedback flow:

```text
Add
→ success
→ cart badge updates
→ Cart Drawer / canonical cart confirmation exposes the new cart line
```

Do not automatically navigate the shopper to the Cart page.

The shopper must retain control:

```text
continue shopping
or
view cart
```

#### Missing Selection

Example:

```text
Chọn Quy cách trước khi thêm vào giỏ
```

Focus/scroll to the first unresolved required option when useful.

#### Unavailable Combination

Example:

```text
Tùy chọn này hiện không thể mua
```

Offer a clear recovery path through available options.

#### Out of Stock

Do not keep Add enabled.

#### Purchase Limit

The current Catalog projection exposes:

```text
purchaseLimit
purchaseWarning
```

When applicable, communicate the limit near Quantity/Add.

Example:

```text
Giới hạn 2 bộ mỗi đơn
```

or authoritative `purchaseWarning`.

Do not wait until checkout to reveal a known purchase constraint.

#### Error

If Add fails:

```text
preserve selected configuration
preserve quantity
do not increment Cart badge
show recoverable error feedback
allow retry
```

### 39.4 Cart-line identity

A cart line must be identified by the sellable configuration, not only by ProductModel.

At minimum preserve:

```text
ProductModel id
selected Variant id
Finish
Size
Pack
Unit / selling price
Purchase quantity
```

If the exact Variant is represented by:

```text
selectedVariantId
```

the Cart handoff must preserve it.

Hard reject:

```text
Gỗ sáng · Nhỏ · Bộ 2 chiếc
and
Gỗ tối · Lớn · Bộ 6 chiếc
```

being merged into one cart line only because they share the same ProductModel id.

### 39.5 Cart-line display

The Cart UI must let the shopper verify what was added.

Minimum visible anatomy:

```text
Product image
Product name
Selected configuration summary
Unit/selling price
Quantity
Line total
Remove
```

Example:

```text
Đèn bàn mộc
Gỗ sáng · Nhỏ · Bộ 4 chiếc
1.290.000đ
Quantity 2
```

Do not show only:

```text
Đèn bàn mộc
1.290.000đ
Quantity 2
```

when the exact configuration matters.

### 39.6 Global Cart feedback

Use the canonical Header Cart + Cart Drawer behavior.

Cart states:

```text
Empty
Has Items
```

Has-items Header state:

```text
ShoppingCart icon + totalQuantity badge
```

Cart Drawer has-items state must support:

```text
added item(s)
quantity editing
remove
subtotal
view cart / next commerce action
continue browsing via close
```

Do not create separate cart-feedback patterns for Browse and PDP.


---
