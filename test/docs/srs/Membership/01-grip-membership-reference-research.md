# GRIP Membership — Reference Research

**Status:** Final research input  
**Pipeline stage:** MEM-01 — Reference Research  
**Primary reference:** IKEA Business Network  
**Local-fit context:** Vietnamese SME operating simplicity  
**Research date:** 2026-08-28

## 1. Purpose

This document studies how a business-oriented membership can sit on top of an existing individual Account model.

IKEA is the main behavioral reference. It is not the GRIP product model.

```text
reference fact
→ product / UX lesson
→ candidate GRIP value
```

## 2. IKEA Business Network — observable account model

### IKEA-BN-01 — One company account can contain multiple colleagues

IKEA Business Network supports a centralized company account. Admin users can invite colleagues to the company account and each colleague has their own profile/card.

**Lesson:** business identity and individual identity are different concepts.

```text
individual profile
→ belongs to
company account
```

**Sources:**  
https://www.ikea.com/us/en/ikea-business/network/faqs-pube4d75840/  
https://www.ikea.com/us/en/customer-service/knowledge/articles/76c75edd-c442-406f-g731-1476dcd8d076.html

### IKEA-BN-02 — Admin and normal member capabilities are different

IKEA documents that non-admin users can use benefits and manage their own personal profile. Admin users can additionally manage company-level details, see company-wide purchase history, invite colleagues, assign admin rights, and delete the company account.

**Lesson:** company administration should be explicit, but the role model can remain small.

**Source:**  
https://www.ikea.com/us/en/customer-service/knowledge/articles/171gegb4-3b1g-4g31-85g3-eebe804d8egd.html

### IKEA-BN-03 — Company must keep an administrator

IKEA Business Network terms state that the company must always have at least one administrative user. If the only Admin intends to leave, another Admin should be assigned.

**Lesson:** privileged-user invariants should be business-visible and prevented before destructive actions.

**Sources:**  
https://www.ikea.com/us/en/customer-service/ikea-for-business-terms-and-conditions-pub79e6fb50/  
https://www.ikea.com/us/en/ikea-business/network/faqs-pube4d75840/

### IKEA-BN-04 — Company purchase history can be centralized

IKEA Admin users can see past transactions/receipts for purchases made by colleagues on the company account. IKEA also describes purchase history as a Business Network benefit.

**Lesson:** Membership can establish the business identity used by downstream purchases, while Order remains the owner of purchase records.

**Sources:**  
https://www.ikea.com/us/en/ikea-business/network/  
https://www.ikea.com/us/en/customer-service/knowledge/articles/6997001a-6a6a-4ee9-9fec-0a70de0468f9.html

### IKEA-BN-05 — Business identity must be present during purchase

IKEA explains that an online business purchase is registered to the business when the customer is logged into the Business Network account. An IKEA Business Specialist can also register the purchase when ordering on the customer's behalf.

**Lesson:** Membership is not merely a profile badge. It provides business purchase context that Checkout/Order may consume.

**Source:**  
https://www.ikea.com/us/en/customer-service/knowledge/articles/df995a69-3071-490f-9e0a-e0d5d004a367.html

### IKEA-BN-06 — Business benefits are separate from individual profile management

IKEA Business Network exposes business-specific benefits such as member discounts, discounted delivery, purchase history, quotations and specialist support.

**Lesson:** Membership should expose eligibility/context, not absorb the implementation of every benefit.

**Source:**  
https://www.ikea.com/us/en/ikea-business/network/

## 3. Vietnamese SME fit

GRIP primarily targets SMEs, so feature selection should favor a small team model over enterprise identity administration.

The useful SME jobs are:

```text
represent my business
invite one or a few colleagues
know who can manage the business account
buy under the business identity
see business-related purchasing context
```

Avoid bringing in enterprise concepts such as departments, nested organizations, SCIM, SSO, custom role builders, approval chains or complex permission matrices unless later evidence requires them.

## 4. Local commerce comparator — wholesale pricing should remain separate

Haravan's Wholesale application solves wholesale pricing with quantity/discount policies and can display retail and wholesale prices in parallel.

That is useful evidence that **business membership and wholesale pricing are separable concerns**.

GRIP Membership should not silently become a wholesale price-list engine.

**Source:**  
https://help.haravan.com/docs/apps/whole-sales/ung-dung-wholesale-ban-si/

## 5. What GRIP should take now

Candidate minimum:

```text
Business Membership
├── Business profile
├── Owner
├── Admin
├── Member
├── Invitation
├── Member lifecycle
└── Business purchase context
```

High-value rules:

```text
Account remains individual identity
Business is shared company identity
an Account joins a Business through Membership
company always has a responsible owner/admin
business purchase context is explicit
```

## 6. What GRIP should not take now

Do not adopt merely because a larger system can support it:

```text
departments
cost centers
custom roles
permission-builder UI
SSO / SCIM
enterprise directory sync
multi-stage access approval
company credit
wholesale price lists
loyalty point wallet
complex organization hierarchy
purchase approval chains
```

## 7. Billing/company-data boundary

Stable company/billing information matters for SME commerce, but Membership should not pre-empt Business Solutions / purchasing requirements.

Current research only supports:

```text
Business identity
+ company profile
```

Detailed invoice/billing fields should be added only when the Business Solutions / Checkout purchasing flow establishes the actual requirement.

## 8. Final research position

The strongest reusable IKEA pattern is:

```text
one company identity
+ several individual people
+ a tiny role model
+ company-visible purchase context
```

For GRIP, the target should remain simpler than IKEA where possible:

```text
Account
= person

Membership
= person's relationship to an SME/business
```

This is enough to unlock business-aware purchasing without turning Account into enterprise IAM.