# GRIP Account — IKEA Research

**Status:** Final  
**Pipeline stage:** 01 — External research  
**Module:** Account  
**Surfaces covered:** Public Account + admin-adjacent account management evidence  
**Research date:** 2026-08-15

---

## 1. Purpose

This file records verified IKEA behavior that can inform the GRIP Account module.

It is not a GRIP specification and it is not a screen blueprint.

Research trace:

```text
verified IKEA evidence
→ observed behavior
→ UX/product implication
→ candidate value for GRIP
```

Rules:

- Do not infer IKEA behavior that is not supported by a cited public source.
- Separate consumer IKEA Family behavior from IKEA Business Network behavior.
- Do not call IKEA Business Network an internal IKEA admin console.
- A feature appearing in this research does not automatically enter GRIP scope.
- GRIP feasibility and semantic ownership are decided in `02-grip-account-srs.md`.

---

# 2. Research market boundary

## Primary evidence

Use IKEA United States where public evidence is available.

## Secondary evidence

Use IKEA United Kingdom only where it exposes account/checkout details that the US public documentation does not state explicitly.

This is cross-market product evidence, not proof that every IKEA market behaves identically.

## Admin limitation

No public evidence was found for IKEA's internal employee/backoffice customer-account administration interface.

IKEA Business Network is used only as customer-facing multi-user/account-management evidence.

---

# 3. What IKEA makes the account useful for

The important finding is that IKEA does not limit Account to:

```text
identity
+ password
+ profile form
```

The account is a continuity layer around shopping and post-purchase tasks.

Verified capabilities include:

```text
Account
├── personal/contact information
├── address information
├── previous purchases / orders
├── digital receipts / purchase history
├── favourites / shopping lists
├── account/security management
└── in some markets, saved payment methods
```

This is the strongest reference for GRIP:

> Account should earn its place by saving the user time across repeated shopping tasks.

---

# 4. Personal and delivery information

## E1 — Personal account information

### Observed — IKEA US

IKEA US states that a signed-in Family member can update personal details including:

- name;
- address;
- contact information;
- marketing preferences.

### Product implication

Address/contact data is persistent account information, not only temporary checkout input.

### GRIP value candidate

GRIP Account should own reusable customer profile and delivery-contact information that can be consumed by Checkout.

### Source

IKEA US — How can I change the personal information in my IKEA Family profile?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/f63de5b5-b3e5-45c0-9fg3-beeffeg142gb.html

---

## E2 — Profile data participates in checkout

### Observed — IKEA UK

An IKEA UK support article for a phone-number validation problem says that, while a user is in checkout, an IKEA Family member can resolve the problem by going to their profile and removing/re-adding contact numbers stored for the **delivery and billing addresses**.

This is strong evidence that account-level address/contact records participate in checkout data.

### What this proves

```text
profile
contains delivery/billing address contact data
        ↓
checkout consumes that data
```

### What this does not prove

The article does not itself document the exact UI or exact consumer auto-fill algorithm.

Therefore do not claim an exact personal-account prefill interaction from this source alone.

### Source

IKEA UK — The website says my phone number is invalid. What should I do?  
https://www.ikea.com/gb/en/customer-service/knowledge/articles/5e9d5bdf-7b0f-4087-9e27-1434g3643005.html

---

## E3 — Explicit pre-filled checkout information exists in IKEA's account model

### Observed — IKEA US / UK Business Network

IKEA's Business Network online-shopping instructions state that, on the checkout Details step, company/contact information may already be **pre-filled**, and the buyer should verify the delivery and billing addresses before continuing.

### Product implication

IKEA explicitly uses persisted account information to reduce repeated data entry at checkout in an account-based purchasing flow.

### GRIP value candidate

The pattern is directly useful:

```text
saved account delivery information
→ prefill checkout
→ user verifies or changes it
```

This is evidence for the pattern, not a claim that IKEA Family consumer checkout has the exact same UI.

### Sources

IKEA US — How can I shop at IKEA as a business customer?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/df995a69-3071-490f-9e0a-e0d5d004a367.html

IKEA UK — How can I shop at IKEA as a business customer?  
https://www.ikea.com/gb/en/customer-service/knowledge/articles/b30d7f84-5e00-4c3a-bc6a-c043f4cd99a2.html

---

# 5. Orders and purchase history

## E4 — Signed-in users can access orders from Account

### Observed — IKEA US

IKEA states that an IKEA Family member can access orders from their IKEA account.

A non-member can instead use the Track & Manage order flow.

### Product implication

Account adds convenience over individual order lookup.

### GRIP value candidate

Account should surface a user's order history while Order remains the owning module.

```text
Account
→ My orders
→ Order-owned list/detail/status
```

### Sources

IKEA US — How do I sign in and use my IKEA Family account?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/1f332f8a-fc0a-4dd2-a11f-9b215390a3d0.html

IKEA US — Track and manage your order  
https://www.ikea.com/us/en/customer-service/track-manage-order/

---

## E5 — Purchase history includes useful post-purchase information

### Observed — IKEA US

IKEA's Track & Manage experience can expose:

- order status;
- item/order details;
- delivery information;
- estimated arrival;
- receipt-related information;
- rescheduling where supported.

IKEA Family purchase history also provides access to digital receipts.

### Product implication

“Orders” in Account should be a practical post-purchase entry point, not a decorative purchase archive.

### GRIP value candidate

GRIP Account can surface:

- recent orders;
- order status;
- links to canonical Order detail;
- receipts only if the Order module supports them;
- fulfillment tracking/actions only if the Order module supports them.

Account must not own these behaviors.

### Sources

IKEA US — How can I check the status of my order?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/912e6gbg-fd30-4760-8602-672301485691.html

IKEA US — Retrieving your receipts  
https://www.ikea.com/us/en/customer-service/knowledge/articles/6997001a-6a6a-4ee9-9fec-0a70de0468f9.html

---

# 6. Favourites / saved products

## E6 — Saved products persist across devices through the account

### Observed — IKEA UK

IKEA states that a user can add products to Favourites and sign in with an IKEA Family account to view them across devices.

### Product implication

Account provides continuity for user intent, not only completed purchases.

### GRIP value candidate

If GRIP has saved/favourite product behavior:

```text
Account
→ Saved products
```

is a useful account utility.

Ownership remains with Catalog/Engagement according to the GRIP domain contract.

### Source

IKEA UK — Manage IKEA Family account / related Favourite guidance  
https://www.ikea.com/gb/en/customer-service/knowledge/articles/513fb6db-0b54-471b-8a1f-9dd2ed30a7ff.html

---

# 7. Saved payment methods — reference only

## E7 — IKEA UK supports saved payment cards

### Observed — IKEA UK

IKEA UK says signed-in members can save a debit/credit card to the profile for quicker online checkout and manage it under Payment methods.

### Product implication

Account can become a home for reusable checkout accelerators beyond address data.

### GRIP decision

**Research reference only — not current SRS scope.**

Saved cards require payment-provider tokenization, security/compliance and explicit backend support.

Do not add saved payment methods to GRIP merely because IKEA has them.

### Sources

IKEA UK — How do I manage my IKEA Family account?  
https://www.ikea.com/gb/en/customer-service/knowledge/articles/513fb6db-0b54-471b-8a1f-9dd2ed30a7ff.html

IKEA UK — How do I save a payment card to my profile?  
https://www.ikea.com/gb/en/customer-service/knowledge/articles/7cd692d0-3cff-40d6-ac5a-c8fe96a3dfe7.html

---

# 8. Account as a central utility hub

## E8 — IKEA profile is broader than profile editing

### Observed

Across the verified IKEA sources, signed-in account/profile areas connect to:

- personal information;
- addresses/contact information;
- purchase history;
- orders;
- digital receipts;
- favourites;
- account/security settings;
- selected market-specific benefits and payment conveniences.

### Research conclusion

The useful mental model is:

```text
Account
= persistent personal shopping context
```

not:

```text
Account
= authentication settings
```

This is the main concept GRIP should take.

---

# 9. Account ↔ Checkout research conclusion

The strongest evidence chain is:

```text
IKEA account stores address/contact information
        ↓
IKEA support references profile delivery/billing address data
while diagnosing checkout
        ↓
IKEA Business online checkout explicitly supports
pre-filled account information
        ↓
persistent account data is used to reduce checkout repetition
```

Therefore a sound GRIP direction is:

```text
signed-in user
+ saved delivery info
        ↓
checkout pre-fills from account
        ↓
user verifies / changes current checkout
```

Important design/domain inference:

> Prefill should be treated as reuse of account data, not shared mutable ownership.

GRIP SRS decides the exact copy/update semantics.

---

# 10. Account ↔ Order research conclusion

IKEA makes Account a convenient way to get back to previous purchases.

Recommended GRIP model:

```text
Account owns
- identity/profile
- reusable personal delivery information

Order owns
- orders
- item snapshots
- order status
- fulfillment state
- order actions

Account surfaces
- recent orders
- order history entry point
- links/projections
```

This keeps Account useful without turning it into a second Order module.

---

# 11. IKEA Business Network — admin-adjacent evidence

## E9 — Multi-user accounts distinguish administrative access

### Observed

IKEA Business Network supports colleagues and administrative rights.

An Admin can add colleagues and assign administrative access.

### Product implication

Operational/account access is understandable when role/access management is explicit rather than hidden in a generic profile form.

### GRIP use

This can inform GRIP's **Admin Access** mental model, but it is not evidence of IKEA's internal admin console.

### Source

IKEA US — IKEA Business Network FAQ  
https://www.ikea.com/us/en/ikea-business/network/faqs-pube4d75840/

---

## E10 — Critical access invariants are user-visible

### Observed

IKEA Business Network documents special handling when the only Admin wants to remove their profile: another Admin must be assigned or the company-account consequence changes.

### Product implication

A privileged-user invariant should be made understandable before the user attempts an invalid/destructive action.

### GRIP use

If GRIP has privileged admin-account invariants, the UI should explain and block invalid state transitions before mutation.

### Source

IKEA US — IKEA Business Network FAQ  
https://www.ikea.com/us/en/ikea-business/network/faqs-pube4d75840/

---

# 12. IKEA patterns GRIP should take

## Take now

1. Account is a **shopping continuity utility**, not only auth/profile.
2. Account stores reusable personal/contact/address information.
3. Persisted account data can reduce checkout data-entry repetition.
4. Signed-in users should have an easy route to previous orders.
5. Account can surface saved products across sessions/devices when that behavior exists.
6. Account should centralize stable personal shopping context.
7. Related domain data should be surfaced without stealing ownership.
8. Privileged access management needs clear role/state semantics.

---

# 13. IKEA patterns not adopted in current GRIP scope

These are deliberately excluded from the current GRIP Account SRS:

```text
One-time-code sign-in
Public self-registration
Registration verification
Email/OTP verification flow
Saved payment cards
IKEA Family rewards / loyalty mechanics
Marketing-preference complexity
IKEA Business membership mechanics
```

Reasons vary:

- current implementation feasibility;
- not required by GRIP behavior;
- separate domain ownership;
- extra payment/security/compliance scope.

Do not reintroduce these during UI design without an SRS change.

---

# 14. Research-derived GRIP candidate account utilities

After filtering IKEA behavior against current GRIP direction:

```text
My Account
├── Overview
├── My orders
├── Saved delivery information
├── Saved products       // only if behavior exists
├── Personal information
└── Login & security
```

Potential future utility:

```text
Saved payment methods
```

but only after payment-domain support exists.

---

# 15. Final research position

IKEA's most reusable Account pattern for GRIP is not visual styling.

It is:

```text
remember stable information
→ reuse it at the next useful moment
→ let the customer resume shopping/post-purchase tasks quickly
```

For GRIP, the highest-value realization of that pattern is:

```text
Account owns reusable delivery information
→ Checkout can prefill it
→ Account surfaces Order history
→ Account surfaces other user-owned shopping continuity
```

The next pipeline artifact defines the exact GRIP behavior and ownership boundaries.
