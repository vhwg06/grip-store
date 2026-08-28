# GRIP Promotions — Business / Domain SRS

**Status:** Final  
**Pipeline stage:** PROMO-02 — GRIP SRS / Business-Domain Decision  
**Research input:** `01-grip-promotions-reference-research.md`

## 1. Purpose

Promotions extends the existing GRIP commerce model with simple merchant-controlled discounts suitable for Vietnamese SMEs.

It is a vertical capability over the existing Catalog / Checkout / Order journey.

```text
Catalog
+ Promotions
→ Checkout
→ Order
```

Promotions is not a general pricing engine, campaign automation platform, loyalty program, or CRM segmentation system.

## 2. Product principle

The operator should be able to answer only a few questions:

```text
What kind of discount?
How much?
Where does it apply?
When is it valid?
Is there a minimum order?
How many times can the code be used?
```

Anything that requires a generic rule builder is outside V1.

## 3. Current capability scope

```text
Promotions
├── Coupon
│   ├── PercentageOffOrder
│   ├── FixedAmountOffOrder
│   └── FreeShipping
│
└── AutomaticProductDiscount
    ├── PercentageOff
    └── FixedAmountOff
```

Shared configuration:

```text
name
active state
valid_from?
valid_until?
minimum_order_amount?
applicability
```

Coupon additionally supports:

```text
code
total_usage_limit?
```

## 4. Placement inside existing GRIP

Promotions is part of the Catalog/commerce capability family.

It does not require a new standalone customer application.

```text
Catalog Admin
└── Promotions management

Public Catalog
└── promotional price / offer projection

Checkout
└── apply / remove coupon and calculate effect

Order
└── preserve purchase-time promotion result
```

## 5. Core concepts

### Promotion

A Promotion is merchant-authored commercial configuration that can change the effective amount a customer pays when its conditions are satisfied.

A Promotion has:

```text
id
name
kind
status
validity
minimum_order_amount?
applicability
```

### Coupon

A Coupon is a Promotion that requires an explicit customer-entered code.

```text
Coupon
├── code
├── effect
├── total_usage_limit?
└── usage_count projection
```

The customer-visible identity is the code. Internal IDs must not be required in public UX.

### Automatic Product Discount

An Automatic Product Discount applies without code entry when the current product selection matches its configured applicability and validity.

It changes the effective promotional price projection but does not rewrite the Variant's regular/base selling price.

### Promotion Effect

V1 effects:

```text
PercentageOffOrder(percent)
FixedAmountOffOrder(amount)
FreeShipping
PercentageOffProduct(percent)
FixedAmountOffProduct(amount)
```

Effects must never make the payable merchandise amount negative.

### Applicability

V1 applicability is deliberately small:

```text
AllProducts
SelectedProducts[]
SelectedCategories[]
```

For order-level coupon discounts, applicability determines which merchandise contributes to eligibility/effect where relevant.

No arbitrary boolean rule composition exists in V1.

## 6. Lifecycle

Merchant-facing lifecycle:

```text
Draft / Inactive
→ Active
→ Inactive
```

Effective applicability is additionally derived from time:

```text
Active + before valid_from  → Scheduled
Active + in valid window    → Effective
Active + after valid_until  → Expired
```

`Scheduled`, `Effective`, and `Expired` are derived business states. The operator should not manually set them.

## 7. Coupon code rules

- Code is required for Coupon.
- Code comparison is case-insensitive after normalization.
- Leading/trailing whitespace is ignored.
- A normalized code must be unique among non-deleted Coupon records.
- A disabled, not-yet-valid, expired, usage-exhausted, or condition-failing code is not applicable.
- The checkout must return an actionable business reason where possible.

Canonical customer-facing reason classes:

```text
INVALID_CODE
NOT_STARTED
EXPIRED
MINIMUM_NOT_MET
NOT_APPLICABLE
USAGE_LIMIT_REACHED
```

Do not expose internal rule identifiers.

## 8. Minimum order amount

`minimum_order_amount` is optional.

When present, the current merchandise subtotal eligible for the promotion must meet the threshold before the promotion can apply.

V1 does not introduce minimum quantity rules.

## 9. Usage limit

Coupon may define a total usage limit.

```text
no limit
or
maximum total successful redemptions
```

Only successful placed purchases consume usage.

A failed payment / abandoned checkout must not permanently consume the coupon.

Per-account / per-member usage limits are deferred until Account/Membership requirements justify them.

## 10. Stacking

V1 deliberately avoids a stacking matrix.

Rules:

```text
one Coupon code can be active in one Checkout
```

Automatic Product Discounts may already affect eligible product prices.

The Coupon is then evaluated against the resulting checkout commercial state.

No operator-configurable combination graph exists in V1.

If a future business case requires different precedence/combination semantics, it must be added as an explicit product decision rather than inferred from reference systems.

## 11. Catalog relationship

Catalog remains authoritative for ProductModel / Variant identity and regular selling price.

Promotions extends Catalog commerce presentation with an effective promotion projection.

Required invariant:

```text
regular Variant price
≠ promotional effective price
```

Changing or expiring a Promotion must not rewrite the Variant's base price history.

Public product surfaces may receive:

```text
regular_price
promotional_price?
saving_amount?
discount_percent?
promotion_valid_until?
```

only when an effective Promotion supports those values.

## 12. Checkout relationship

Checkout owns the active purchase intent and commercial summary.

Checkout may:

```text
accept coupon code
validate current applicability
apply/remove coupon
recalculate totals
show promotion effect
```

Checkout does not author or manage Promotions.

Changes to cart lines, quantities, or other relevant purchase context must re-evaluate the applied Coupon.

If the code becomes invalid after a cart change, Checkout must remove or invalidate the effect and explain why.

## 13. Order relationship

Order preserves the final purchase-time commercial truth.

For each placed Order, preserve enough evidence to explain the final amount, including when applicable:

```text
promotion name/reference
coupon code snapshot where appropriate
promotion effect type
discount amount
affected order/product allocation needed for refund explanation
```

Order does not re-evaluate current Promotion configuration after placement.

Required invariant:

```text
Promotion edited/expired later
≠ historical Order total changes
```

## 14. Membership relationship

Membership is not required for base Promotions V1.

The model must allow a future eligibility input such as:

```text
member / business-member context
```

but current Promotions must not invent Membership rules before the Membership SRS exists.

No loyalty points or member reward wallet belongs here.

## 15. Content relationship

Content may reference or editorially explain an active promotion/campaign, but it does not own discount values, validity, applicability, or coupon redemption rules.

## 16. Admin use cases

```text
View promotions
Create coupon
Create automatic product discount
Edit inactive/safe configuration
Activate
Deactivate
Inspect derived status
Inspect usage count for coupon
```

No bulk campaign automation is required.

## 17. Public use cases

```text
See effective promotional product price
See regular price + saving when useful
Enter coupon in purchase journey
Apply coupon
See successful discount
See actionable rejection reason
Remove coupon
See recalculated total
```

## 18. Explicit exclusions

```text
loyalty points
reward wallet
Buy X Get Y
combos
free gifts
customer segments
personalized pricing
per-customer usage limits
multi-code checkout
stacking configuration matrix
promotion priority engine
branch/channel targeting
province/geographic targeting
quantity-tier discounts
wholesale price lists
flash-sale stock reservation
campaign messaging automation
coupon batch generation
approval workflow
```

## 19. Core invariants

### PRO-I01
Regular Catalog price and promotional effective price are distinct business values.

### PRO-I02
A Coupon affects a Checkout only after successful validation against current purchase context.

### PRO-I03
At most one Coupon code is active in one Checkout in V1.

### PRO-I04
Expired, inactive, not-yet-valid, usage-exhausted, or condition-failing Promotions cannot create a discount.

### PRO-I05
A Promotion effect cannot make a payable merchandise amount negative.

### PRO-I06
Only successfully placed purchases consume Coupon usage.

### PRO-I07
Placed Orders retain purchase-time promotion evidence and never follow later Promotion edits.

### PRO-I08
Promotion management extends existing Catalog Admin rather than creating a separate admin application.

## 20. Final product position

GRIP Promotions V1 is intentionally small:

```text
simple offer creation
→ clear public price communication
→ simple coupon application
→ stable purchase-time history
```

The system should be easier for an SME operator to understand than the broader reference products, while preserving the high-value behavior they demonstrate.