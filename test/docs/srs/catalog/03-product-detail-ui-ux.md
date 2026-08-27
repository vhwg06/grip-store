# Public Catalog — Product Detail UI/UX

**Owner:** Product Detail composition and decision flow  
**Required before this file:** `01-semantic-invariants.md`  
**Related:** `04-merchandising-cart-interactions.md`, `05-design-system-contracts.md`, `06-acceptance-qa.md`

This file owns PDP layout, configuration controls, fulfillment, supporting information, reviews and similar products. Add-to-cart interaction state machines are owned by file 04.

---

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
---

## 37. Fulfillment Row / Store Pickup

Preferred structure:

```text
Nhận tại cửa hàng
Chọn cửa hàng để kiểm tra tồn kho             >
```

Do not claim stock or pickup availability unless the authoritative fulfillment source supports it.

---
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
---

## 44. Reviews — canonical PDP treatment

Reviews are a first-class decision-support element in the accepted PDP artifact.

They appear in two coordinated places when review data is supported:

```text
A. Compact Social Proof
→ near Price inside the Purchase Decision Panel

B. Reviews Summary Row
→ inside the Product Information Section
```

These are two views of the same review source, not two unrelated components.

### A. Compact Social Proof near price

Canonical anatomy:

```text
1.290.000đ

4.8 ★ · 126 đánh giá
```

Purpose:

```text
give confidence while the shopper is making the purchase decision
```

Rules:

- keep it visually subordinate to Price;
- make the review count actionable when a detailed review experience exists;
- clicking/tapping it should navigate or scroll to the authoritative review area;
- do not fabricate rating or review count;
- do not render empty stars merely for decoration.

### B. Reviews Summary inside Product Information

The accepted PDP places a dedicated review summary at the bottom of the Product Information surface.

Canonical desktop composition:

```text
Đánh giá của khách hàng                         Xem tất cả đánh giá >

4.8 ★★★★★ · 126 đánh giá
```

or equivalent visual composition using the canonical Star icon.

This is **not** another generic accordion row.

It is a decision-support summary with:

```text
section label
average rating
star representation
review count
action to inspect all reviews
```

Geometry rules:

- the summary aligns to the same content grid as the information disclosures;
- heading/rating stay on the left;
- `Xem tất cả đánh giá` aligns to the right of the same row/band on desktop;
- the review action must read as an action, not passive metadata;
- preserve enough whitespace to distinguish the review summary from the preceding disclosure rows;
- do not wrap the review summary into a decorative nested card.

Canonical example from the accepted artifact:

```text
Đánh giá của khách hàng
4.8 ★★★★★ · 126 đánh giá                       Xem tất cả đánh giá >
```

### Review states

Design and verify when applicable:

```text
Reviews / Available
Reviews / No Reviews Yet
Reviews / Loading
Reviews / Unavailable
```

No-reviews state must not fake social proof.

Example:

```text
Chưa có đánh giá
```

Do not show:

```text
0.0 ★★★★★
```

unless the review authority explicitly requires that representation.

### Review navigation

Both:

```text
compact social proof near Price
and
Xem tất cả đánh giá
```

must resolve to the same authoritative review experience.

If detailed reviews are outside the current Catalog scope, keep only the summary/action contract and do not invent a local review list.

---
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

---

## Add-to-cart interaction reference

The PDP owns the placement of Quantity + Add to cart inside the Purchase Decision Panel.

The state machine, success feedback, cart-line identity and shared Cart behavior are owned by:

```text
04-merchandising-cart-interactions.md
→ Add to Cart — PDP interaction contract
```

Do not duplicate or fork that contract here.
