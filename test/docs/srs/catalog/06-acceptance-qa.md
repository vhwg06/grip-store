# Public Catalog — Acceptance & QA

**Owner:** Public Catalog PASS / FAIL evidence  
**Required before this file:** `01-semantic-invariants.md` + the relevant surface owner file

This file is the verification contract. Do not claim PASS from one full-page screenshot.

---

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
- `Mới`, `Hot`, `Bán chạy` use merchandising-status semantics;
- Discount uses an actual pricing composition;
- Flash Sale appears only with an authoritative campaign state;
- consistent Add to cart alignment;
- one direct-add success state;
- one requires-options/unavailable state when applicable;
- Header Cart badge update after a successful add.

### Continuation + Recommendation

Verify:

- showing count;
- Show more;
- recommendation gives products + reason/evidence;
- recommendation is not category navigation.

---
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

### Add to Cart interaction

Provide evidence for:

```text
valid configured product
→ Add pending
→ Add success
→ Header Cart badge updates
→ Cart feedback exposes the exact selected configuration
```

Also show one blocked/recovery state:

```text
missing option
or
unavailable combination
or
purchase limit
or
error
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

### Product Information + Reviews

Show:

- one expanded disclosure;
- collapsed disclosures with previews;
- dedicated `Đánh giá của khách hàng` summary;
- average rating;
- star representation;
- review count;
- `Xem tất cả đánh giá` aligned as the review action.

The review summary must visibly match the accepted PDP composition and must not be reduced to a generic accordion row.

### Similar Products

Show comparable alternatives using:

```text
image
name
descriptor
starting price
```

---
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
- `Mới`, `Hot`, `Bán chạy`, Flash Sale, discount, reviews and variants are flattened into one generic badge system;
- `Hot` is silently treated as Best Seller, Flash Sale or low-stock urgency;
- Flash Sale is fabricated without an authoritative campaign/time/pricing state;
- a fake/resetting countdown creates artificial urgency;
- discount label exists without discount pricing semantics;
- Add to cart alignment varies arbitrarily across comparable product tiles;
- listing uses `Thêm vào giỏ` even though required options are unresolved;
- Add to cart has no pending/success/error feedback;
- successful Add does not update the shared Header Cart state;
- recommendation is a category list;
- recommendation gives no reason/evidence;
- PDP exposes technical Variant-resolution language;
- Finish / Size / Pack are treated as interchangeable generic fields without semantic controls;
- Pack is confused with Quantity;
- selected Pack is lost during Add to cart;
- different Variants/configurations of the same ProductModel are merged into one cart line;
- Cart line does not let the shopper verify the selected configuration;
- known `purchaseLimit` / `purchaseWarning` is hidden until a later step;
- fulfillment copy is vague when an action is required;
- Product Information mirrors database schema instead of shopper questions;
- collapsed information rows hide useful preview data without reason;
- `Đánh giá của khách hàng` is omitted when supported by the accepted PDP artifact/data;
- review summary is flattened into a generic accordion row;
- rating/review count is fabricated or visually disconnected from `Xem tất cả đánh giá`;
- Similar Products is confused with Recommendation or Category discovery.

---
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
