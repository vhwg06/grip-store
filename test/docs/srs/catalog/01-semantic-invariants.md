# Public Catalog — Semantic Invariants

**Owner:** Public Catalog non-violable semantics  
**Required for:** every Browse, PDP, merchandising, cart-handoff and Design System task

This file owns product/configuration meaning. Surface UI files must not redefine these rules.

---

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
