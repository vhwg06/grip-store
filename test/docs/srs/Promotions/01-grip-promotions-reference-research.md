# GRIP Promotions — Reference Research

**Status:** Final research input  
**Pipeline stage:** PROMO-01 — Reference Research  
**Primary reference:** IKEA  
**Local-fit references:** Sapo, Haravan  
**Research date:** 2026-08-28

## 1. Purpose

This document records observable promotion behavior that can inform GRIP.

It is not the GRIP product model.

```text
reference fact
→ product / UX lesson
→ candidate GRIP value
```

IKEA remains the main reference for customer-facing commerce behavior. Sapo and Haravan are used to test whether the feature set fits common Vietnamese SME operating patterns.

## 2. IKEA — customer-facing promotion behavior

### IKEA-01 — Discount code / voucher is applied during shopping bag / checkout

IKEA US instructs a customer with a discount code or IKEA Family coupon to sign in, open the shopping bag / checkout, choose **Use a discount code**, enter the code, and then see the total cost update.

The support article also states that the input is available at the first checkout step and the customer can go back if they missed it.

**Lesson:** promotion entry should be contextual to the purchase, not hidden in Account or a separate promotions page.

**Source:**  
https://www.ikea.com/us/en/customer-service/knowledge/articles/48c424bf-6862-4885-gc76-0863403gd6b9.html

### IKEA-02 — Invalidity is explained by terms such as threshold and expiry

IKEA tells customers to check coupon terms including purchase threshold and expiration date. Expired coupons are not redeemable.

**Lesson:** an invalid code is not one generic error. The UI should state the actionable reason when GRIP knows it.

**Source:**  
https://www.ikea.com/us/en/customer-service/knowledge/articles/c9428d33-c060-4391-87g7-3b60dc5cg947.html

### IKEA-03 — Some codes are single-use and customer-specific

IKEA's birthday coupon is described as a unique online coupon code for the recipient and usable once.

**Lesson:** usage limits are a normal promotion concept, but GRIP does not need a personalization engine to support a simple total usage limit.

**Source:**  
https://www.ikea.com/us/en/customer-service/knowledge/articles/d5cfe544-6c7c-4225-g7f2-8705215d8c02.html

### IKEA-04 — Offer presentation shows effective price, regular price, saving and validity

IKEA's current Offers surfaces show patterns such as:

```text
IKEA Family price
$69
22% off, save $20
Regular price $89
Price valid Aug 3, 2026 - Sep 7, 2026 or while supply lasts
```

**Lesson:** the public UI should communicate the actual commercial relationship, not merely add a generic SALE badge.

**Source:**  
https://www.ikea.com/us/en/offers/

### IKEA-05 — Qualifying offers can apply automatically at checkout

Current IKEA Family terms include offers that apply automatically at checkout when purchase conditions are met. IKEA also documents restrictions on combination / stacking for particular offers.

**Lesson:** automatic discounts and coupon-entered discounts are distinct interaction modes. Their combination rules should be explicit rather than accidental.

**Source:**  
https://www.ikea.com/us/en/ikea-family/

## 3. Vietnamese SME references

### SME-01 — Sapo separates promotion programs from coupon codes

Sapo supports automatic promotional programs and separately supports coupon / discount-code flows.

Common discount values include:

```text
percentage
fixed amount
fixed promotional price
```

Automatic website promotions can target all products, selected categories, or selected products.

**Lesson:** a small merchant-friendly model benefits from two simple mental models:

```text
Giảm giá tự động
Mã khuyến mãi
```

rather than one abstract rule engine.

**Sources:**  
https://help.sapo.vn/thiet-lap-chuong-trinh-khuyen-mai-tren-website-sapo  
https://help.sapo.vn/tong-quan-ve-ma-giam-gia

### SME-02 — Minimum purchase conditions are common

Sapo supports conditions such as minimum order value, minimum promotional-product value, or minimum quantity.

Haravan likewise exposes minimum purchase value / quantity conditions.

**GRIP lesson:** V1 needs minimum order amount. Minimum quantity and advanced condition composition can wait until a real use case requires them.

**Sources:**  
https://help.sapo.vn/tao-ma-khuyen-mai-giam-gia-san-pham-tren-sapo-omniai  
https://help.haravan.com/docs/promotions/coupouns/huong-dan-tao-ma-khuyen-mai/

### SME-03 — Product/category applicability is a common operator need

Sapo can apply discounts to all products, selected products, or selected product categories. Haravan similarly supports product/group/variant targeting.

**GRIP lesson:** category and product scope are high-value and understandable enough for SME operators.

### SME-04 — Usage limits and validity are common

Sapo supports expiry/validity and usage limits. Haravan supports total usage limits, per-customer usage limits, and effective periods.

**GRIP lesson:** total usage limit and start/end validity belong in V1. Per-customer usage limits can be deferred until Account/Membership behavior proves the need.

### SME-05 — Shipping discounts are common

Haravan supports shipping discounts by fixed value or percentage. Sapo also exposes free-shipping rewards in its broader promotion/loyalty tooling.

**GRIP lesson:** a simple `free shipping` coupon has clear SME value. Complex geographic/shipping-rule targeting is not required for V1.

## 4. What GRIP should take now

The smallest useful GRIP model is:

```text
Promotions
├── Coupon / Voucher
│   ├── percentage off order
│   ├── fixed amount off order
│   └── free shipping
│
└── Automatic Product Discount
    ├── percentage off
    └── fixed amount off
```

Shared constraints:

```text
valid from / until
minimum order amount where relevant
total usage limit for code promotions
applies to all / products / categories
active / inactive
```

## 5. Deliberately not adopted now

The references support far more complexity than GRIP currently needs.

Do not adopt by default:

```text
Buy X Get Y
combo engine
loyalty points / reward redemption
customer segmentation
per-customer usage counters
branch/channel targeting
province-specific promotion rules
multi-coupon stacking matrix
promotion priority graph
arbitrary condition DSL
bulk coupon generation
flash-sale inventory reservation
campaign automation
```

These remain research evidence, not current GRIP scope.

## 6. Product direction

For GRIP's Vietnamese SME target, the key value is not promotion sophistication.

It is:

```text
merchant can create a useful offer in under a minute
+
shopper can understand and apply it without guessing
```

That principle should constrain both the SRS and the existing GRIP UI/UX extensions.