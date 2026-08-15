# GRIP — Checkout Admin UI/UX Research

**Status:** Final  
**Scope:** Admin surface of the Checkout module  
**Primary admin job:** Find and inspect placed orders  
**Design philosophy:** Simple surface over a richer domain  
**Research mode:** UI/UX reference research, not domain authority

---

## 1. Research objective

This research answers one question:

> How should a non-commerce expert inspect orders created by GRIP Checkout without being forced to learn e-commerce operations terminology?

The Checkout SRS remains the product authority.

This document does **not** define warehouse, invoice, payment-tracking, shipment, promotion, refund, or fulfillment workflows.

Those capabilities are intentionally outside the current module.

---

## 2. Current GRIP boundary

The Checkout module currently owns:

```text
Public
├── Review order
├── Buyer information
├── Delivery information
├── Payment information
├── Purchase hard information
└── Place order

Admin
├── Find orders
└── Inspect placed-order information
```

A placed Order is the stable boundary.

Future modules may consume the Order:

```text
Order
├── Warehouse          future
├── Invoice            future
├── Payment Tracking   future
└── Admin observation
```

The Admin surface must not invent those future workflows before they exist.

---

## 3. Admin mental model

The operator should not need to think in terms such as:

```text
fulfillment pipeline
payment lifecycle
reconciliation
allocation
invoice state
shipment state
commerce operations
```

The mental model should stay:

```text
Có đơn nào?
↓
Đơn nào của khách này?
↓
Trong đơn có gì?
↓
Khách nhập thông tin nào?
↓
Khách chọn cách thanh toán nào?
↓
Thông tin giao hàng / bảo hành lúc mua là gì?
```

Therefore the primary Admin pattern is:

> **Find → Read**

not:

> **Dashboard → workflow → manage statuses → perform operations**

---

## 4. Primary UI reference — Squarespace Orders

Squarespace is the strongest visual and interaction reference for the current GRIP scope because its order experience can be reduced to:

```text
Orders
↓
Search / filter
↓
Open order
↓
Read order detail
```

Useful patterns:

- order list as the primary entry;
- search by order/customer information;
- order detail centered on purchase facts;
- strong document/receipt-like hierarchy;
- secondary information separated from the main purchase record;
- relatively low visual chrome compared with operations-heavy commerce platforms.

Reference:
- Squarespace Help Center — Fulfilling orders
- Squarespace order management documentation

### What GRIP should take

- object-first navigation;
- search-first lookup;
- document-like order detail;
- sections separated by typography, whitespace, and dividers;
- minimal actions when the domain is observation-only.

### What GRIP should not take

Squarespace also supports fulfillment, tracking, refunds, and other order operations.

GRIP must not expose those until the corresponding domain capability exists.

---

## 5. Secondary reference — Shopify as an anti-complexity ceiling

Shopify order detail demonstrates how a mature commerce platform accumulates operational concerns:

```text
Order
├── Customer
├── Payment
├── Fulfillment
├── Returns
├── Timeline
├── Notes
├── Tags
├── Apps
└── more
```

This is useful as a **future complexity warning**, not as the current GRIP layout reference.

Reference:
- Shopify Help — Managing order details

### GRIP lesson

Future capabilities should be composed additively.

They must not cause the Checkout purchase record to become visually dominated by operational modules.

---

## 6. Secondary reference — Square as an operations anti-pattern for current scope

Square Order Manager is optimized around operational states and actions such as:

```text
New
In progress
Ready
Completed
```

That model is appropriate when fulfillment is part of the product.

It is **not** appropriate for current GRIP Checkout because Warehouse/Fulfillment is out of scope.

Reference:
- Square Support — Order Manager / pickup order workflows

### GRIP lesson

Do not invent status taxonomies merely because e-commerce admin software commonly has them.

---

# 7. Core design principle — Order detail is a document

The best metaphor for current Checkout Admin is:

> **A readable purchase record / receipt**

not:

> **An operations dashboard**

Preferred structure:

```text
#1042
Đặt lúc 16:32 · 15/08/2026

SẢN PHẨM
────────────────────────
...

NGƯỜI MUA
────────────────────────
...

GIAO HÀNG
────────────────────────
...

THANH TOÁN
────────────────────────
...

TỔNG ĐƠN
────────────────────────
...
```

Avoid:

```text
[Order Overview] [Customer] [Payment] [Delivery]
[Policy]         [Metadata] [Status]  [Actions]
```

where every concept becomes an equally weighted card.

---

# 8. Order list

## 8.1 Primary goal

The list helps an operator locate an order quickly.

It is not intended to summarize every downstream operational concern.

## 8.2 Recommended information

Each row should expose only high-signal identity:

```text
order id
created/placed time
buyer
item count
order total
minimal order status only if the domain actually owns one
```

Example:

```text
#1042
15/08/2026 · 16:32

Nguyễn Văn A
3 sản phẩm
12.900.000 ₫
```

## 8.3 Search

Search should be the strongest list utility.

Potential lookup keys, when supported by the read model:

```text
order id
buyer name
email
phone
```

Search placeholder:

```text
Tìm theo mã đơn, tên, email, SĐT...
```

## 8.4 Filters

Filters should be evidence-driven.

Do **not** prebuild:

```text
Payment
Warehouse
Invoice
Shipment
Fulfillment
Channel
```

until those dimensions actually exist.

---

# 9. Order detail information hierarchy

The order detail should prioritize information in the order an operator normally asks for it.

Recommended hierarchy:

```text
1. Order identity
2. Purchased items
3. Buyer
4. Delivery recipient/address
5. Payment method
6. Commercial summary
7. Purchase hard information
```

The exact visual order may change through UX testing, but all sections should remain subordinate to one clear document hierarchy.

---

# 10. Purchased items

Each order line should optimize recognition, not merchandising.

Show:

```text
thumbnail
product name snapshot
variant snapshot
quantity
unit price
line total
```

Avoid:

```text
rating
recommendation badges
marketing copy
catalog merchandising state
```

The admin is inspecting a purchase fact, not browsing the Catalog.

---

# 11. Buyer information

Show the buyer data that was part of the order:

```text
name
email
phone
```

Buyer information should not be merged visually with delivery recipient information when the domain distinguishes them.

This preserves future compatibility with:

```text
Buyer
Delivery Recipient
Billing Party   future
```

---

# 12. Delivery information

Current Checkout only has:

```text
recipient
delivery address
delivery hard information
```

Example:

```text
Giao hàng

Nguyễn Văn A
090...
12 Nguyễn ...

Dự kiến giao: 3–5 ngày làm việc
```

Important:

> `3–5 ngày` is purchase-time hard information, not a shipment state.

Do not render it as:

```text
Delivery status: 3–5 days
```

or as a trackable fulfillment object.

---

# 13. Payment information

Current Checkout owns only purchase-time payment information, for example:

```text
Phương thức thanh toán
Thanh toán khi nhận hàng
```

Do not fabricate:

```text
Paid
Settled
Reconciled
Refunded
Failed async
```

until Payment Tracking exists.

---

# 14. Commercial summary

Use a conventional receipt-style summary:

```text
Tạm tính
Vận chuyển
────────────────
Tổng
```

The total should have the strongest visual weight in the section.

Avoid turning every monetary field into a KPI tile.

---

# 15. Purchase hard information

Hard information may include:

```text
delivery estimate
warranty
shipping policy fact
return policy fact
```

The admin should see the snapshot that applied to the placed order when relevant.

Use concise facts first.

Example:

```text
Bảo hành
24 tháng
```

Detailed policy content can remain secondary.

---

# 16. Actions

Current Admin Checkout is observation-first.

Therefore actions should be extremely limited.

Do not create generic action menus such as:

```text
Fulfill
Refund
Cancel
Print invoice
Allocate warehouse
Mark paid
```

without domain support.

If there is no valid current business action, the order detail may legitimately be read-only.

---

# 17. Visual language

Checkout Admin should follow GRIP's broader visual philosophy:

```text
warm / off-white base
strong typography
low cardization
restrained borders
clear dividers
generous whitespace between sections
compact spacing inside related data
```

The target visual character is:

> **calm document**

not:

> **enterprise dashboard**

---

# 18. Responsive behavior

Desktop may use a readable content column with a secondary summary region when necessary.

Mobile/tablet should preserve:

```text
order identity
section hierarchy
commercial total
readability
```

Do not preserve desktop multi-column geometry if it harms scanning.

---

# 19. Future module composition

Future modules should be added only when installed/implemented.

Example:

```text
Order #1042

Purchase facts
──────────────
Checkout-owned information

Warehouse        future
─────────
allocation / shipment data

Invoice          future
───────
invoice information

Payment          future
───────
payment tracking
```

Rules:

1. Do not reserve empty cards for future modules.
2. Do not make Checkout own downstream state.
3. Keep the purchase record visually stable.
4. Add operational sections only when the module exists.
5. Do not redefine existing Checkout fields merely to accommodate future modules.

---

# 20. Anti-patterns

Do not:

- create an Order dashboard full of cards;
- invent status workflows;
- copy Shopify's mature operations surface;
- copy Square's fulfillment state machine;
- prebuild Warehouse/Invoice/Payment filters;
- expose technical concepts such as `commercial snapshot`;
- turn hard delivery information into a delivery identifier/state;
- require operators to understand commerce lifecycle terminology;
- create empty placeholders for future modules.

---

# 21. GRIP-derived interaction model

```text
Đơn hàng
│
├── Search
├── Minimal list
│
└── Order detail
    ├── Order identity
    ├── Purchased items
    ├── Buyer
    ├── Delivery
    ├── Payment method
    ├── Commercial summary
    └── Purchase hard information
```

This is an IA responsibility map.

It does not require one page/card/component per branch.

---

# 22. Design gate

Checkout Admin is successful when a non-commerce operator can answer these questions without training:

```text
Đơn nào của khách này?
Khách mua gì?
Khách nhập thông tin nào?
Giao cho ai và tới đâu?
Khách chọn phương thức thanh toán nào?
Tổng đơn bao nhiêu?
Thông tin giao hàng/bảo hành lúc mua là gì?
```

The design fails if the operator must first understand:

```text
fulfillment
allocation
settlement
reconciliation
commerce pipeline
```

when those concepts are not part of the current GRIP domain.

---

# 23. Research conclusion

The strongest direction for GRIP Checkout Admin is:

```text
Object-first
Order

Primary behavior
Find → Read

Visual metaphor
Receipt / document

Complexity model
Progressive module composition

Default posture
Read-only unless a real business action exists
```

Squarespace provides the closest current visual/interaction reference.

Shopify and Square are more useful as evidence of complexity GRIP should **not** introduce at the current scope.

---

# 24. Sources used

- Squarespace Help Center — Fulfilling orders  
  https://support.squarespace.com/hc/en-us/articles/206540697-Fulfilling-orders

- Shopify Help Center — Managing order details  
  https://help.shopify.com/en/manual/fulfillment/managing-orders/managing-order-details

- Square Support — Order / pickup management  
  https://squareup.com/help/us/en/
