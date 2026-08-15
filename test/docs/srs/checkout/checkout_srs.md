# GRIP Checkout SRS — IKEA Behavioral Model

**Reference product:** IKEA US
**Reference date:** August 2026
**Type:** Behavioral/domain SRS
**Goal:** Reproduce the observable IKEA online purchasing domain, not its visual implementation.

---

# 1. Domain purpose

Checkout converts an existing customer purchase intent into a paid IKEA order by resolving:

```text
WHAT
    items + quantities

WHO
    customer / loyalty context

WHERE / HOW
    delivery or collection

WHEN
    delivery / collection scheduling where applicable

SERVICES
    eligible additional services such as assembly

COMMERCIAL TERMS
    prices + discounts + rewards + service costs

PAYMENT
    accepted tender(s)

↓
ORDER
```

The central domain problem is therefore not merely payment.

It is:

> Resolve a commercially valid and fulfillable purchase, then allow the customer to pay for it.

IKEA's current storefront exposes product price synchronously but evaluates `Delivery` and `Store` availability separately under **How to get it**, demonstrating that commercial product identity and fulfillment availability are separate concerns.

---

# 2. Domain boundary

## 2.1 Upstream: Catalog

Catalog supplies Checkout with sellable articles/variants and their commercial presentation.

Catalog behavior includes:

```text
discover product
select sellable article
inspect price
inspect initial availability context
add article to shopping bag
```

The current IKEA PDP exposes:

```text
Product
Price
Family price where applicable
Add to bag
How to get it
    Delivery
    Store
```

with delivery/store availability evaluated independently.

Checkout SHALL NOT own:

* product discovery;
* product taxonomy;
* product descriptions;
* product configuration semantics;
* recommendations;
* reviews.

---

# 3. Checkout scope

The IKEA-like Checkout domain consists of:

```text
Checkout
├── Shopping Bag
├── Customer Context
├── Loyalty & Benefits
├── Purchase Eligibility
├── Fulfillment
│   ├── Shipping / Delivery
│   └── Collection
├── Additional Services
│   └── Assembly
├── Commercial Calculation
├── Discounts / Rewards
├── Payment
└── Order Placement
```

Post-purchase tracking, rescheduling, cancellation, returns and claims belong to Order/Aftersales.

IKEA exposes those after placement through Track & Manage rather than through the checkout journey itself.

---

# 4. Shopping Bag

## 4.1 Shopping Bag

A Shopping Bag represents the set of articles the customer currently intends to purchase.

Conceptually:

```text
ShoppingBag
├── ShoppingBagLine[]
└── CommercialSummary
```

---

## 4.2 Shopping Bag Line

Each line identifies:

```text
article
selected product/variant context
quantity
effective merchandise price
```

The customer SHALL be able to remove or change quantities before placing the order.

---

## 4.3 Quantity constraints

A line is not automatically purchasable merely because the article exists.

IKEA applies product-level minimum order quantities to selected articles for delivery/pickup orders.

Therefore:

```text
ShoppingBagLine
    ↓
PurchaseEligibility
```

may constrain quantity.

Checkout SHALL reject a bag state that violates an effective purchase constraint.

---

# 5. Availability model

Availability SHALL NOT be modeled as one product-level boolean.

IKEA distinguishes multiple availability contexts.

For example, an article can exist at a physical store but still be unavailable for an online delivery because online delivery stock is sourced according to the customer's ZIP code and distribution-center context.

Similarly, an article can exist at a store but not be available through Click & Collect because IKEA limits daily service capacity and online allocatable quantity.

The domain therefore requires:

```text
Article
    +
Fulfillment Context
    ↓
Availability
```

rather than:

```text
Article.inStock
```

---

# 6. Availability dimensions

Observed IKEA behavior requires at least these separate concepts:

```text
Merchandise availability
Delivery eligibility
Collection eligibility
Collection capacity
Delivery/service capacity
Location eligibility
Date/slot availability
```

These states may differ for the same article.

---

# 7. Customer context

Checkout commercial behavior may depend on customer identity.

Relevant contexts include:

```text
unidentified customer
identified IKEA Family customer
identified IKEA Business Network customer
```

IKEA Family identification can occur before shopping or during checkout. Benefits cannot generally be applied retroactively once the purchase has completed.

Therefore customer identification is part of transaction calculation, not merely account navigation.

---

# 8. IKEA Family context

When an IKEA Family member is successfully identified:

Checkout MAY apply:

* member merchandise pricing;
* member fulfillment pricing;
* eligible rewards;
* points/benefit association.

IKEA currently requires membership identification for member benefits and applies Family delivery pricing for eligible customers.

A previously completed transaction SHALL NOT be repriced because the customer identifies their membership afterwards.

---

# 9. Purchase eligibility

Before a fulfillment method can be purchased, IKEA evaluates eligibility.

Inputs currently evidenced include:

```text
articles
quantities
article availability
customer ZIP/location
order merchandise value
order size
order weight
fulfillment capacity
customer membership
```

IKEA states that shipping/delivery availability and pricing may depend on ZIP code, proximity to a store/distribution center, total order weight, order size and product availability.

Therefore fulfillment SHALL be calculated from the current purchase context rather than maintained as a static enum directly attached to a product.

---

# 10. Fulfillment

The primary fulfillment decision is:

```text
Fulfillment
├── Delivery
└── Collection
```

IKEA's current purchase instructions explicitly lead customers from checkout into a delivery-versus-collection decision.

---

# 11. Delivery

Delivery itself is not one service.

IKEA currently distinguishes small-order shipping from large-item delivery.

Conceptually:

```text
Delivery
├── Small Order / Parcel
└── Large Item Delivery
```

---

# 12. Small-order shipping

Small-order shipping eligibility and price may depend on:

* customer location;
* order weight;
* order size;
* product availability;
* qualifying merchandise subtotal.

IKEA currently imposes a merchandise-subtotal eligibility threshold for this service. The precise monetary threshold is commercial configuration rather than a permanent domain constant.

The customer SHALL see an estimated delivery date.

That date is an estimate and is not necessarily a guaranteed delivery appointment.

---

# 13. Large-item delivery

IKEA currently exposes several large-item service levels:

```text
Standard delivery
Scheduled Doorstep delivery
Scheduled In-Home delivery
Express In-Home delivery
```

Not every order qualifies for every service level.

Therefore:

```text
DeliveryOption
```

is an eligibility result, not a globally available option.

---

# 14. Delivery option

A delivery option SHALL carry sufficient information for the customer to decide between eligible options.

Observable IKEA properties include:

```text
service type
price
delivery timing / estimate
scheduling behavior
service placement level
eligibility
```

IKEA requires customers to refer to the options and prices generated in checkout because they vary according to purchase context.

---

# 15. Delivery address

Delivery requires a supported destination.

Address eligibility may constrain which service types can be offered; for example, IKEA excludes certain unsupported address types from online delivery.

Changing the relevant location input SHALL cause fulfillment eligibility and pricing to be recalculated.

---

# 16. Delivery schedule

Different delivery services have different scheduling semantics.

Examples currently evidenced by IKEA include:

```text
estimated delivery date
provider-selected delivery date
customer-selected delivery date
delivery time window
```

Standard large-item delivery may have the delivery date selected subsequently by the delivery provider, while scheduled services expose scheduling behavior during purchase.

These SHALL NOT be represented as one undifferentiated `deliveryDate` concept.

---

# 17. Delivery instructions

Certain delivery services require contextual delivery information.

For IKEA home delivery, this may include:

* address details;
* access restrictions;
* parking/access information;
* delivery instructions.

IKEA's current To-the-Door flow explicitly requests accurate delivery details and applicable access instructions before confirmation.

---

# 18. Collection

IKEA's collection domain consists of more than one location type.

Current US options include:

```text
Collect at IKEA
Pick-up point for larger orders
Third-party location for smaller orders
```

Collection may occur at:

* IKEA store;
* IKEA warehouse;
* Plan & Order Point;
* other IKEA-branded location;
* partner pickup point;
* third-party parcel pickup location.

---

# 19. Collection discovery

During checkout, the customer supplies location context such as ZIP code.

The system resolves participating collection locations available for the current purchase.

Therefore:

```text
CollectionLocation
```

is a result of fulfillment discovery rather than simply a global directory of IKEA stores.

---

# 20. Collection eligibility

Collection availability depends on:

```text
product availability
geographic location
service capacity
```

IKEA explicitly documents all three for Collect at IKEA.

Certain non-IKEA collection locations also have merchandise-value and package-size/weight restrictions.

---

# 21. Collection capacity

Collection has finite operational capacity.

IKEA limits how many orders and how much quantity can be allocated through Click & Collect during a period.

When capacity or allocatable stock is exhausted, collection may no longer be offered even though physical store stock exists.

Thus:

```text
PhysicalStock > 0
```

does not imply:

```text
CollectAvailable = true
```

---

# 22. Collection schedule

An eligible collection flow may require the customer to select:

```text
location
date
time window
```

IKEA's current branded-location pickup lets customers choose preferred location and date/time window.

Availability of that date/time is a service-capacity concern.

---

# 23. Alternate collector

Checkout may allow the purchasing customer to designate another adult to collect the order.

IKEA requires this alternate collector to be assigned during checkout; the alternate collector cannot simply be substituted after the order has been placed.

The resulting order therefore carries either:

```text
primary collector
```

or:

```text
primary collector
+
authorized alternate collector
```

for applicable collection flows.

---

# 24. Ready-for-pickup is not checkout completion

Payment and order placement do not imply that a pickup order is immediately collectable.

IKEA separately sends a **Ready for pickup** notification after preparation.

Therefore:

```text
Order Placed
≠
Ready For Pickup
```

`Ready For Pickup` belongs to the downstream fulfillment/order lifecycle.

---

# 25. Commercial calculation

Checkout calculates the transaction based on the current purchase state.

Relevant monetary components include:

```text
merchandise
product/member discounts
promotion / reward adjustment
fulfillment service
additional purchased service
applicable tax
payment credits / gift-card value
final payable amount
```

Commercial calculations can change after:

* customer identification;
* promotion application;
* reward application;
* fulfillment selection;
* service selection.

IKEA Family discounts and service pricing are explicitly context-sensitive.

---

# 26. Minimum merchandise subtotal

Some IKEA fulfillment methods require a minimum merchandise subtotal.

The qualifying merchandise amount is calculated after applicable discounts/credits/promotions and excludes categories such as taxes and service fees according to the relevant fulfillment policy.

Therefore the domain requires:

```text
FulfillmentEligibilityPolicy
```

that may evaluate the commercial basket.

The threshold itself SHALL remain policy/configuration rather than a universal Checkout constant.

---

# 27. Promotion and discount code

Checkout supports discount-like commercial instruments.

Observed IKEA online instruments include:

```text
coupon
discount code
reward code
```

Invalid or expired codes are rejected according to their own eligibility rules.

Applying a valid instrument SHALL modify the transaction calculation before payment.

---

# 28. IKEA Family reward

IKEA Family rewards are selected outside the basic cart calculation and redeemed during checkout using a reward code.

For online purchases, IKEA currently allows one reward code per transaction.

A reward therefore has:

```text
identity
eligibility
redemption state
commercial effect
```

and is not simply equivalent to an arbitrary price override.

---

# 29. Additional services

Checkout can sell eligible services together with merchandise.

The strongest currently evidenced example is:

```text
Taskrabbit Assembly
```

IKEA allows assembly to be selected and purchased during online checkout for eligible IKEA products.

---

# 30. Assembly eligibility

Assembly availability depends on purchase context including:

```text
eligible products
customer location / postal code
service availability
```

The customer selects which eligible IKEA products require assembly.

Therefore assembly SHALL be associated with eligible purchase lines, not merely with the entire cart as an unqualified boolean.

---

# 31. Assembly commercial model

For online IKEA checkout, assembly has its own calculated service price.

The service can be paid together with the associated IKEA purchase through checkout.

The transaction can therefore contain:

```text
Merchandise
+
Fulfillment service
+
Assembly service
```

---

# 32. Assembly scheduling

For the IKEA checkout-integrated Taskrabbit flow, the customer may select separate dates for:

```text
product delivery
assembly
```

These are different service commitments and SHALL remain separate concepts.

---

# 33. Third-party service consent

Some Checkout services are fulfilled by external providers.

IKEA currently uses external delivery companies, parcel carriers and Taskrabbit.

Selecting applicable services can require customer information to be shared with the provider for service fulfillment.

Where the service requires explicit third-party terms/consent, Checkout SHALL collect the required acceptance before purchase.

---

# 34. Customer information

Checkout requires sufficient customer/contact information to support:

```text
transaction confirmation
delivery
collection
provider communication
order lookup
```

IKEA non-member orders can later be retrieved using an order number together with the email address or phone number used for the purchase.

Thus contact information is part of the resulting order identity even when no loyalty account is involved.

---

# 35. Payment

Payment is performed only after the order context and fulfillment decision have been established.

IKEA's documented online flow is:

```text
Cart
→ Continue to checkout
→ Delivery or Collect
→ delivery/address details where applicable
→ Payment
→ Pay / order
```

---

# 36. Payment method

The available online payment instruments are channel/context dependent rather than one hard-coded method.

Current IKEA US documentation includes combinations of:

* major payment cards;
* IKEA/value cards;
* PayPal;
* Afterpay;
* gift/refund cards;
* supported digital payment methods depending on channel.

Therefore the domain should expose:

```text
AvailablePaymentMethod[]
```

for the active checkout.

It should not encode one universal static list into business semantics.

---

# 37. Gift and refund cards

IKEA gift/refund cards behave as monetary tender.

For online checkout:

* multiple cards can be applied;
* IKEA currently limits online application to four cards;
* available value is consumed toward the purchase;
* if card balance is insufficient, another payment method can pay the remainder.

Therefore payment may conceptually consist of:

```text
AppliedStoredValue[]
+
RemainingPayment
```

rather than exactly one tender.

---

# 38. Payment failure

If an online payment attempt fails, IKEA allows the customer to correct the payment details or choose another available payment method.

The checkout is therefore not considered successfully completed merely because payment was attempted.

---

# 39. Terms acceptance

Before final payment, IKEA may require acceptance of applicable terms and conditions.

The documented online gift-card flow, for example, requires accepting the terms before selecting **Pay**.

Additional service terms may also apply for delivery, collection or assembly.

---

# 40. Product and price revalidation

Product availability and pricing are not guaranteed indefinitely.

IKEA explicitly states that product availability and prices may change and that availability of a displayed product is not guaranteed.

Checkout therefore SHALL evaluate the purchase using current effective:

```text
availability
price
quantity eligibility
commercial benefits
fulfillment options
```

rather than treating an earlier Catalog observation as immutable transaction state.

This requirement does **not** imply any particular backend reservation algorithm.

---

# 41. Checkout result

Successful completion results in an IKEA order associated with:

```text
purchased lines
customer/contact context
commercial values
selected fulfillment
selected fulfillment location/address
selected scheduling information
purchased additional services
payment result
```

After placement, order management becomes the responsibility of the Order/Aftersales lifecycle.

IKEA exposes placed orders separately through Track & Manage.

---

# 42. Order mutability boundary

IKEA treats order placement as a strong boundary.

Current IKEA guidance states that paid/placed orders generally cannot have products swapped or freely modified; changes frequently require cancellation and replacement instead.

The delivery address similarly cannot simply be edited after an online order has entered processing; IKEA instructs customers to cancel and replace the order when an address change is required.

Therefore:

```text
Before Place Order
    = checkout composition

After Place Order
    = order lifecycle
```

---

# 43. Split fulfillment after purchase

An IKEA order may subsequently result in multiple deliveries because merchandise may originate from different stocking locations.

Evidence confirms the downstream split behavior.

Current public evidence does **not** establish that the customer explicitly constructs those shipment groups during Checkout.

Therefore this SRS SHALL NOT invent a user-owned `ShipmentGroup` editing feature.

Splitting belongs to downstream fulfillment unless later implementation evidence demonstrates otherwise.

---

# 44. Core domain concepts

The behavioral model can therefore be represented conceptually as:

```text
ShoppingBag
├── ShoppingBagLine[]
│   ├── Article
│   ├── Quantity
│   └── PurchaseEligibility
│
└── Checkout
    ├── CustomerContext
    │   ├── Contact
    │   ├── IKEA Family
    │   └── IKEA Business Network
    │
    ├── CommercialContext
    │   ├── EffectivePrices
    │   ├── Discounts
    │   ├── Reward
    │   └── CommercialSummary
    │
    ├── FulfillmentSelection
    │   ├── Delivery
    │   │   ├── SmallOrderShipping
    │   │   └── LargeItemDelivery
    │   │
    │   └── Collection
    │       ├── IKEA Location
    │       ├── Pick-up Point
    │       └── Third-party Location
    │
    ├── Schedule
    │
    ├── AdditionalService[]
    │   └── Assembly
    │
    ├── Payment
    │   ├── StoredValue
    │   └── PaymentMethod
    │
    └── OrderPlacement
```

This is a **conceptual domain representation of observable IKEA behavior**, not a claim about IKEA's internal class/database structure.

---

# 45. Domain invariants evidenced by IKEA

## C-I01 — Purchase must satisfy merchandise eligibility

A line subject to an effective quantity/purchase restriction cannot be purchased in a state that violates it.

## C-I02 — Catalog stock does not guarantee fulfillment

Store availability must not automatically imply delivery or Click & Collect eligibility.

## C-I03 — Fulfillment options are context-dependent

The available fulfillment methods must be derived from the purchase/location context.

## C-I04 — Fulfillment price is context-dependent

Checkout must use the price associated with the currently resolved fulfillment option rather than one global shipping fee.

## C-I05 — Collection requires service capacity

Physical merchandise stock alone does not guarantee Click & Collect availability.

## C-I06 — Alternate collector must be known before placement

For applicable IKEA collection orders, an alternate collector cannot simply be substituted after order placement.

## C-I07 — Order placed is not ready for collection

The customer must wait for a separate readiness confirmation.

## C-I08 — Membership benefits require timely identification

Benefits cannot be assumed after an unidentified purchase has completed.

## C-I09 — Reward redemption is eligibility-bound

An IKEA Family reward cannot be treated as an arbitrary discount; it follows reward eligibility/redemption rules.

## C-I10 — Additional services have independent eligibility

Assembly availability depends on eligible merchandise and service location.

## C-I11 — Delivery schedule semantics depend on service type

Estimated, provider-selected and customer-selected dates are not interchangeable.

## C-I12 — Failed payment is not completed checkout

The customer may retry or select an alternative tender after payment failure.

## C-I13 — Placed order crosses the Checkout boundary

Post-placement modifications are governed by the Order/Aftersales lifecycle rather than editable checkout state.

---

# 46. Canonical use cases

The observable domain yields the following use-case inventory.

```text
Checkout
│
├── Manage Shopping Bag
│   ├── Review Items
│   ├── Change Quantity
│   ├── Remove Item
│   └── Resolve Purchase Constraint
│
├── Establish Customer Context
│   ├── Provide Contact Information
│   ├── Identify IKEA Family Membership
│   └── Identify Business Membership where applicable
│
├── Apply Commercial Benefit
│   ├── Apply Discount / Coupon
│   └── Redeem IKEA Family Reward
│
├── Resolve Fulfillment
│   │
│   ├── Delivery
│   │   ├── Resolve Delivery Eligibility
│   │   ├── Enter Delivery Destination
│   │   ├── Choose Delivery Service
│   │   ├── Select Date / Schedule where supported
│   │   └── Provide Delivery Instructions where required
│   │
│   └── Collection
│       ├── Resolve Collection Eligibility
│       ├── Find Collection Locations
│       ├── Choose Collection Location
│       ├── Choose Date / Time
│       └── Designate Alternate Collector
│
├── Add Optional Service
│   └── Assembly
│       ├── Resolve Eligible Items
│       ├── Resolve Service Availability
│       ├── Select Items for Assembly
│       ├── Accept Service Terms
│       └── Select Assembly Schedule
│
├── Review Commercial Summary
│
├── Pay
│   ├── Apply Gift / Refund Card
│   ├── Choose Remaining Payment Method
│   ├── Accept Required Terms
│   ├── Submit Payment
│   └── Recover Payment Failure
│
└── Place Order
```

These are domain/use-case boundaries.

They do **not** prescribe one screen per use case.

---

# 47. Primary behavioral flow

```text
Shopping Bag
    ↓
Resolve purchase eligibility
    ↓
Establish / update customer context
    ↓
Apply eligible commercial benefits
    ↓
Resolve location-dependent fulfillment
    ↓
Choose Delivery or Collection
    ↓
Configure selected fulfillment
    ↓
Optionally configure eligible services
    ↓
Review effective transaction
    ↓
Choose / apply payment tender
    ↓
Accept applicable terms
    ↓
Pay / Place Order
    ↓
Order
```

---

# 48. Important recalculation relationships

The following changes can alter downstream decisions:

```text
ShoppingBag mutation
    → availability
    → fulfillment eligibility
    → service eligibility
    → commercial summary

Customer location change
    → fulfillment options
    → fulfillment price
    → dates / capacity
    → service availability

Customer identity change
    → member prices
    → member benefits
    → rewards
    → fulfillment price

Promotion / reward change
    → merchandise subtotal
    → fulfillment eligibility
    → final payable amount

Fulfillment choice change
    → service cost
    → schedule
    → customer-information requirements
    → final payable amount

Assembly selection
    → service price
    → service schedule
    → consent requirements
    → final payable amount
```

These dependencies follow IKEA's published relationships between purchase context, membership, service availability, fulfillment and pricing.

---

# 49. What is deliberately NOT specified

The following are not included because current observable evidence does not establish them as IKEA Checkout domain contracts:

```text
inventory reservation algorithm
database schema
checkout aggregate boundaries
payment authorization/capture internals
idempotency implementation
warehouse allocation algorithm
shipment optimizer
internal delivery-provider selection algorithm
internal tax engine
internal fraud state machine
exact API contracts
exact service boundaries
```

Likewise, this SRS does not assume that IKEA's internal implementation contains classes/entities named:

```text
CheckoutSession
FulfillmentOption
PaymentIntent
ShipmentGroup
```

Those would be implementation abstractions that require additional evidence.

This specification describes **observable domain semantics only**.

---

# 50. UX handoff contract

The future UX phase must preserve these user-visible semantics:

```text
Customer can understand:
- what they are buying;
- whether those items can actually be purchased;
- which ways IKEA can get those items to them;
- why some methods are unavailable;
- where collection/delivery will happen;
- when applicable service will happen;
- how customer identity affects benefits;
- what discounts/rewards have been applied;
- which additional services have been selected;
- the effective transaction cost;
- how the purchase will be paid;
- when the purchase becomes an order.
```

However, this SRS intentionally specifies **no**:

```text
screen count
checkout stepper
accordion structure
desktop layout
mobile layout
sticky summary
modal
drawer
card design
navigation hierarchy
```

Those must be derived by UX from the domain above rather than copied blindly from IKEA's current visual composition.
