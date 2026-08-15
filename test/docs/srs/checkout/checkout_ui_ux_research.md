# IKEA Checkout — UI/UX & Design Research

**Reference:** IKEA online shopping experience
**Research focus:** Checkout / Shopping Bag
**Purpose:** Understand how IKEA translates checkout business semantics into user interaction and visual hierarchy before adapting selected patterns into GRIP.

---

# 1. Research boundary

This document analyzes:

* shopping bag composition;
* checkout information architecture;
* information hierarchy;
* progressive disclosure;
* forms;
* decision presentation;
* order summary;
* hard/trust information;
* primary actions;
* responsive implications;
* visual language.

It does **not** treat IKEA's exact layouts as requirements for GRIP.

Research model:

```text
IKEA domain behavior
        ↓
How IKEA exposes that behavior to users
        ↓
Why that interaction model works
        ↓
Which principles survive GRIP's reduced scope
```

Current IKEA US Shopping Bag is a JavaScript application; the server-rendered document exposes only the surrounding site shell rather than its cart contents. This means detailed cart behavior cannot be safely reconstructed from static HTML alone.

For visual structure, this research therefore combines:

* current IKEA public behavior;
* current official IKEA checkout guidance/screenshots from other IKEA markets;
* historical IKEA checkout captures where useful;
* current IKEA accessibility policy.

Any historical evidence is explicitly treated as such rather than assumed to describe the current US implementation.

---

# 2. Primary UX characteristic

IKEA checkout is strongly **task-oriented rather than content-oriented**.

The normal IKEA site contains:

```text
navigation
search
categories
inspiration
services
promotions
account
```

Checkout intentionally collapses that complexity.

The user's attention shifts from:

> Explore the IKEA catalog

to:

> Complete this purchase.

The checkout experience therefore gives much greater visual priority to:

```text
current step
required information
current purchase
price
next action
```

than to normal storefront discovery.

### GRIP implication

Checkout should feel like a focused transaction environment.

Do not carry the full Catalog discovery experience into Checkout merely for consistency.

---

# 3. Shopping Bag as a staging surface

Official IKEA material presents Shopping Cart as a distinct stage before Checkout where users inspect their selected articles and adjust quantities.

The official IKEA Philippines example shows a deliberately simple cart:

```text
Shopping cart

[item]
quantity
product
price
subtotal

----------------

Total

[ Begin checkout ]
```

The cart is therefore not trying to repeat the Product Detail Page.

It provides only the information required to answer:

```text
Is this what I intend to buy?
How many?
How much?
Am I ready to continue?
```

### UX principle

**Transaction surfaces progressively reduce product information.**

The further the user moves from discovery toward commitment, the more information becomes:

```text
decision-relevant
rather than
discovery-relevant
```

### GRIP adaptation

The Checkout order review should not reproduce Catalog cards.

Use a dedicated **order line representation** optimized for:

* identity;
* variant;
* quantity;
* price;
* warranty/delivery facts where relevant.

---

# 4. Checkout uses semantic stages

Official IKEA Philippines checkout documentation exposes a clear three-part model:

```text
Your Details
    ↓
Services
    ↓
Payment
```

The corresponding official screenshot visually represents these as a progress indicator rather than exposing the complete purchase as one undifferentiated form.

Current IKEA US app guidance follows the same general semantic ordering:

```text
cart
→ checkout
→ delivery / pickup
→ personal information
→ payment
```

### UX principle

Checkout steps correspond to **meaningful decisions**, not arbitrary chunks of fields.

A step should answer one coherent question.

For IKEA:

```text
Who are you?
How do you want to receive it?
How will you pay?
```

---

# 5. GRIP should keep the principle, not IKEA's steps

GRIP deliberately removes IKEA's fulfillment engine.

Therefore GRIP should **not** blindly copy:

```text
Details
→ Services
→ Payment
```

because `Services` no longer exists as a customer decision.

GRIP semantics are:

```text
What am I ordering?
Who is buying / receiving it?
How will I pay?
Am I ready to place it?
```

A suitable UX model can therefore be derived as:

```text
Order review
      ↓
Buyer & delivery information
      ↓
Payment
      ↓
Review / Place order
```

This is an adaptation of IKEA's semantic-stage principle, not a copy of its current checkout structure.

---

# 6. Progressive disclosure

IKEA does not ask the user to reason about every possible checkout concept simultaneously.

Instead:

```text
complete current decision
        ↓
unlock / expose next decision
```

Historical IKEA checkout captures show later sections collapsed while the active section is expanded. The current task receives the strongest hierarchy while completed information remains inspectable/editable.

### Why this matters

Checkout contains inherently different cognitive tasks:

```text
verify order
enter factual information
understand commercial facts
choose payment
commit transaction
```

Putting all of them at equal hierarchy increases scanning and validation burden.

### GRIP adaptation

GRIP can use either:

* true multi-step navigation;
* or one-page progressive sections.

The required principle is:

> There must be one obvious current task.

Not:

> Everything on the page must be equally editable and visually loud.

---

# 7. Completed information remains reviewable

Historical IKEA checkout UI collapses earlier stages into compact summaries with explicit edit affordances rather than removing them once completed.

This creates:

```text
completed
≠
gone
```

Instead:

```text
completed information
→ compressed summary
→ Edit
```

### UX benefit

Before payment the user can verify:

* delivery/contact information;
* selected service;
* payment context;

without moving through an opaque wizard.

### GRIP adaptation

For example:

```text
Buyer

Minh Vũ
minh@example.com
090...
[Edit]
```

is preferable after completion to keeping five input fields permanently expanded.

---

# 8. Order summary is a parallel information track

One recurring IKEA checkout characteristic is separation between:

```text
Task area
and
Purchase summary
```

Historical desktop checkout captures show the active form/decision on the left and a persistent order summary on the right.

The order summary contains information such as:

```text
product
quantity
subtotal
delivery cost
total
```

without becoming the main interaction surface.

### UX principle

While providing buyer/payment information, the user should never lose the answer to:

> **What exactly am I paying for, and how much?**

### GRIP adaptation

Desktop should strongly consider:

```text
┌────────────────────────────┬───────────────────┐
│ Checkout task              │ Order summary     │
│                            │                   │
│ Buyer                      │ Items             │
│ Delivery address           │ Subtotal          │
│ Payment                    │ Shipping          │
│                            │ Total             │
│                            │                   │
│ [Place order]              │ Hard info         │
└────────────────────────────┴───────────────────┘
```

The summary does not have to be permanently sticky if geometry makes that inappropriate.

Its semantic visibility is more important than its exact CSS position.

---

# 9. Mobile should preserve hierarchy, not desktop geometry

The same two-column composition should not be compressed into a miniature desktop layout.

On narrow screens the likely semantic order becomes:

```text
Current task
    ↓
Relevant summary
    ↓
Primary action
```

The purchase summary can collapse into a compact expandable representation as long as:

* current total remains visible;
* item details remain reachable;
* no information required to understand the transaction disappears.

### GRIP rule

Responsive design should preserve:

```text
priority
relationships
decision order
```

rather than preserve absolute placement.

---

# 10. Selection controls look like decisions

Where IKEA requires a mutually exclusive service decision, the choices are presented as large bordered selection surfaces rather than hidden inside generic dropdowns. The official IKEA Philippines checkout screenshot shows Parcel Delivery, Truck Delivery and Click & Collect as individual selectable cards with the active option visibly outlined.

### UX principle

A consequential choice deserves visible comparison when:

* there are few options;
* option descriptions matter;
* the difference affects the purchase.

### GRIP adaptation

Current minimal GRIP has intentionally removed delivery-method selection.

Therefore this pattern is **not needed for Delivery**.

It may still be appropriate for Payment Method if GRIP supports a small number of methods:

```text
○ COD
○ Bank transfer
○ Card
```

or visual selection cards if each option requires supporting information.

Do not introduce selection-card UI merely because IKEA uses it elsewhere.

---

# 11. IKEA uses plain-language decision headings

IKEA's checkout language tends to frame major sections as customer questions/actions.

Examples visible in checkout references include patterns such as:

```text
How would you like your order delivered?
How would you like to pay?
```

This makes the hierarchy describe the **user's decision**, not the backend entity.

### Compare

Weak:

```text
Payment Information
```

Stronger when a choice is required:

```text
Bạn muốn thanh toán thế nào?
```

Weak:

```text
Customer Data
```

Stronger:

```text
Thông tin người mua
```

### GRIP adaptation

GRIP should use natural Vietnamese task language.

Avoid exposing implementation nouns such as:

```text
Billing Entity
Checkout Object
Payment Selection
Commercial Snapshot
```

to customers.

Those belong to the domain model, not the UI vocabulary.

---

# 12. Forms are visually subordinate to the task

IKEA historical checkout forms use a relatively restrained visual style:

* clear labels;
* rectangular input controls;
* little decoration;
* explicit required state;
* vertical reading order;
* substantial whitespace.

Historical billing-address captures also show form content grouped under a clear section hierarchy rather than placed into decorative cards for every field group.

### UX principle

The form exists to complete the purchase.

The design should not make the form itself the visual product.

### GRIP adaptation

Avoid:

```text
Card
  Card
    Input group
  Card
    Input group
```

unless a container communicates real semantic grouping.

Prefer:

```text
Thông tin người mua

Họ và tên
[input]

Email
[input]

Số điện thoại
[input]
```

with spacing and typography carrying most of the hierarchy.

---

# 13. One dominant primary action

Official and historical IKEA cart/checkout examples establish a strong directional CTA:

```text
Begin checkout
Next
Review & Pay
Pay ...
```

The primary transaction action gets the strongest button treatment.

Secondary actions such as editing completed information remain substantially quieter.

### GRIP adaptation

Each checkout state should have one dominant continuation action:

```text
Tiếp tục
```

or at final commitment:

```text
Đặt hàng
```

Do not create competition among:

```text
Save
Continue
Apply
View policy
Back
Place order
```

with equal visual weight.

---

# 14. Commitment becomes progressively more explicit

The CTA language changes as transaction certainty increases.

Conceptually:

```text
Begin checkout
→ Next
→ Review
→ Pay / Place
```

This establishes different commitment levels.

### GRIP adaptation

Do not label every step:

```text
Submit
```

Instead:

```text
Tiếp tục
```

for navigation and:

```text
Đặt hàng
```

for the actual irreversible business action.

The final action should visually and verbally signal that an Order will now be created.

---

# 15. Price stays close to commitment

IKEA repeatedly exposes order totals alongside the actions that advance or complete checkout. The official cart screenshot places total and Begin Checkout in the same decision region.

Historical checkout similarly displays the final order total alongside payment.

### UX principle

A customer should not have to remember a price from another screen before committing.

### GRIP invariant

At `Place order`:

```text
final total
```

must remain immediately understandable.

The CTA should not be separated from the commercial consequence of clicking it.

---

# 16. Hard information should appear in context

IKEA makes delivery timing available during checkout rather than forcing customers to discover all delivery information through a detached policy center. Current US documentation explicitly says earliest delivery estimates are exposed before the order is completed.

### GRIP adaptation

GRIP has deliberately reduced Delivery to hard information.

That makes contextual placement even more appropriate.

For example:

```text
Giao hàng
Dự kiến 3–5 ngày làm việc
```

should appear near:

* delivery address;
* or order summary;

rather than becoming an artificial `Delivery` checkout step.

Similarly:

```text
Bảo hành 24 tháng
```

belongs close to the affected product/order information.

---

# 17. Hard info should have two levels

Not every policy deserves full prose in the checkout surface.

Use:

```text
Level 1 — purchase fact
Bảo hành 24 tháng

Level 2 — policy detail
Xem chính sách bảo hành
```

This preserves IKEA's broader principle of keeping the purchase flow concise while making supporting customer-service information reachable.

Current IKEA US globally exposes warranties, return policy and customer-service information as dedicated support resources.

### GRIP implication

Do not paste several paragraphs of:

```text
shipping policy
warranty terms
return policy
```

directly into Checkout.

Expose the **decision-relevant fact first**.

Detailed policy remains secondary disclosure.

---

# 18. Avoid turning hard info into controls

This is especially important for GRIP.

IKEA's domain requires interactive delivery decisions.

GRIP does not.

Therefore:

```text
Giao hàng dự kiến: 3–5 ngày
```

must look informational.

It must not accidentally look like:

```text
[ 3–5 ngày ▾ ]
```

or:

```text
○ 3–5 ngày
```

because those controls imply a customer-selectable business decision that does not exist.

### GRIP design rule

**Visual affordance must match domain affordance.**

Informational facts look informational.

Choices look selectable.

Editable facts look editable.

---

# 19. Error placement

Checkout errors should attach to the decision or data that caused them.

Because IKEA checkout is structured around sequential semantic groups, the recovery path can remain localized rather than collapsing the whole transaction.

### GRIP adaptation

Examples:

```text
Email
[abc]
Email không hợp lệ
```

not:

```text
Có lỗi xảy ra.
```

at the top with no obvious cause.

Likewise final placement failure should preserve already valid:

```text
buyer information
delivery information
payment selection
```

whenever possible.

This requirement follows GRIP's own SRS; it is not claimed as a reverse-engineered IKEA backend guarantee.

---

# 20. Visual language

Across IKEA cart/checkout references, the visual system is intentionally restrained:

```text
white / very light background
black primary text
strong typographic hierarchy
IKEA blue for major primary action / selected state
thin neutral borders
little decorative elevation
generous whitespace
product imagery used functionally
```

The visual weight is created principally through:

```text
type scale
spacing
alignment
contrast
```

rather than through many different card surfaces.

### Research conclusion

IKEA checkout looks like a **transaction document**, not a dashboard.

---

# 21. Hierarchy before decoration

Typical hierarchy:

```text
Page / current decision
    ↓
Section title
    ↓
Critical supporting information
    ↓
Inputs / choice
    ↓
Secondary explanatory text
    ↓
Primary continuation
```

Containers are used where they communicate:

* selection;
* grouping;
* summary;

rather than to wrap every concept.

### GRIP adaptation

This aligns strongly with the visual direction already selected for GRIP:

* warm/off-white base;
* low cardization;
* strong typographic hierarchy;
* clear information grouping;
* restrained borders.

GRIP should preserve its own warm-neutral identity rather than copy IKEA's white/blue branding.

---

# 22. Density strategy

Checkout is neither extremely dense nor artificially spacious.

Related fields remain spatially close.

Separate decisions receive substantial vertical separation.

Conceptually:

```text
tight inside a semantic group
loose between semantic groups
```

This helps users perceive structure without needing heavy container chrome.

### GRIP implication

Spacing itself should establish:

```text
Buyer
Delivery
Payment
```

as separate responsibilities.

Do not compensate for poor spacing by putting every section inside a large card.

---

# 23. Product representation changes inside Checkout

Catalog product presentation answers:

```text
Why should I buy this?
```

Checkout product presentation answers:

```text
Is this the exact thing I'm buying?
```

Therefore Checkout needs significantly less merchandising content.

### GRIP order line should prioritize

```text
thumbnail
product name
variant
quantity
unit price
line total
relevant hard fact
```

Not:

```text
marketing description
rating
recommendation badge
large lifestyle image
merchandising copy
```

---

# 24. Trust is contextual, not ornamental

Historical IKEA checkout designs have surfaced trust-supporting information such as return terms and secure-payment cues near the purchase summary/payment region.

The important lesson is not to copy particular badges.

It is:

> Put reassurance close to the moment where the user needs reassurance.

### GRIP examples

Near products:

```text
Bảo hành 24 tháng
```

Near delivery:

```text
Dự kiến giao trong 3–5 ngày làm việc
```

Near payment:

```text
Thanh toán ...
```

Near final action:

```text
Tổng thanh toán ...
```

Do not create a generic row of five trust badges unrelated to the active decision.

---

# 25. Accessibility

IKEA US states that its web content is intended to follow WCAG 2.0 Level A and AA criteria.

For checkout research this reinforces several design requirements:

* visible keyboard focus;
* semantic field labels;
* errors not communicated only by color;
* sufficient text/control contrast;
* predictable focus movement;
* descriptive control names;
* meaningful heading hierarchy.

### GRIP adaptation

Accessibility must remain part of the checkout interaction model from the beginning rather than a visual QA patch.

---

# 26. What GRIP should pick from IKEA

GRIP should adapt:

```text
1. Focused transaction environment

2. Cart/order representation separate from Catalog cards

3. Semantic stages instead of one undifferentiated mega-form

4. Progressive disclosure

5. Completed-section summary + edit behavior

6. Parallel order summary

7. One dominant primary action

8. Total visible near commitment

9. Natural task-oriented language

10. Minimal form chrome

11. Hard information presented contextually

12. Detail-on-demand for policies

13. Strong distinction between:
    information
    editable data
    choices

14. Responsive hierarchy rather than responsive geometry

15. Accessibility built into field/state design
```

---

# 27. What GRIP should NOT pick

Do not import:

```text
IKEA delivery method selection
IKEA pickup flow
postal-code fulfillment resolution
delivery slots
assembly services
IKEA Family
rewards
gift cards
IKEA-specific payment complexity
fulfillment eligibility
warehouse availability
shipment logic
```

These belong to IKEA's larger domain and are outside current GRIP scope.

Also do not copy:

```text
IKEA blue
IKEA typography
IKEA branding
exact page geometry
exact step count
exact component composition
```

The goal is behavioral/design learning, not visual cloning.

---

# 28. Derived GRIP Checkout UX model

Based on IKEA research **and the agreed GRIP domain reduction**, the UX model should start from:

```text
Checkout

01 — Review purchase
│
├── Items
├── Quantity
├── Price
└── Relevant item hard info
        ↓

02 — Buyer & delivery information
│
├── Buyer
├── Recipient
├── Address
└── Delivery estimate
        ↓

03 — Payment
│
├── Payment method
└── Relevant payment information
        ↓

04 — Review & place order
│
├── Order summary
├── Buyer / recipient summary
├── Payment summary
├── Warranty / shipping / return hard info
└── Place order
```

These are **UX responsibilities**.

They are not yet mandatory page boundaries.

---

# 29. Desktop design hypothesis

Initial layout hypothesis:

```text
┌───────────────────────────────────────────────────────┐
│ Checkout                                              │
├────────────────────────────────┬──────────────────────┤
│                                │                      │
│ Current task                   │ Your order           │
│                                │                      │
│ Buyer information              │ Product              │
│ ...                            │ Qty × price          │
│                                │                      │
│ Delivery information           │ Subtotal             │
│ ...                            │ Shipping             │
│                                │ Total                │
│ Payment                        │                      │
│ ...                            │ Delivery 3–5 days    │
│                                │ Warranty ...         │
│                                │                      │
│ [ Continue / Place order ]     │                      │
│                                │                      │
└────────────────────────────────┴──────────────────────┘
```

This is a hypothesis to prototype and test, not an SRS requirement.

---

# 30. Mobile design hypothesis

```text
Checkout

[ Step / current responsibility ]

Current task
...

────────────

Order summary
3 items                     ₫...
[View details]

Delivery
3–5 working days

────────────

[ Continue ]
```

At final commitment:

```text
Review order

Items
Buyer
Delivery
Payment
Policies

Total                       ₫...

[ Place order ]
```

The final total and final action must remain visually connected.

---

# 31. Admin research boundary

No public evidence examined in this research establishes IKEA's internal administrative checkout/order-management UI.

Therefore:

```text
IKEA public checkout research
        ✕
must not be treated as evidence
for IKEA admin UX
```

GRIP Admin shall instead derive from:

```text
Checkout SRS
+
operator goals
+
Order read model
+
future Warehouse / Invoice / Payment projections
```

This distinction prevents fabricated IKEA behavior from entering the design source of truth.

---

# 32. Research-to-design trace

Canonical trace for GRIP Checkout is now:

```text
IKEA Checkout domain research
        ↓
IKEA Checkout UI/UX & design research
        ↓
GRIP scope reduction
        ↓
GRIP Checkout SRS
        ↓
GRIP UX responsibilities
        ↓
Information architecture
        ↓
Interaction model
        ↓
Design System requirements
        ↓
Public + Admin screens/states
        ↓
Prototype
        ↓
UX / behavior gate
```

IKEA remains research evidence.

The GRIP Checkout SRS remains the product authority.
