# GRIP Business Solutions — Reference Research

**Status:** Final research input  
**Pipeline stage:** BUS-01 — Reference Research  
**Primary reference:** IKEA for Business  
**Research date:** 2026-08-28

## 1. Purpose

This document studies how IKEA connects business needs, consultation/planning, quotations and assisted purchasing.

IKEA is the main reference. GRIP will select only the parts that fit Vietnamese SMEs.

```text
reference fact
→ product / UX lesson
→ candidate GRIP value
```

## 2. IKEA — business assistance and planning

### IKEA-BUS-01 — IKEA separates order assistance from space planning

IKEA for Business offers appointments with Business Specialists online or in store. Current services explicitly include:

```text
business order assistance
planning a space for business
```

The first helps with placing large orders; the second helps create a business-space plan using IKEA products/services/solutions.

**Lesson:** a business request can begin either from a known purchase need or from a problem/space that still needs a solution.

**Source:**  
https://www.ikea.com/us/en/ikea-business/services/

### IKEA-BUS-02 — Planning starts from needs and produces a concrete solution

IKEA business planning appointments can provide recommendations for office layout/storage, help select products/accessories, and create a plan, product list and price estimates.

**Lesson:** consultation should converge on a purchasable product solution, not remain generic messaging/chat.

**Source:**  
https://www.ikea.com/us/en/customer-service/services/planning-consultation/

### IKEA-BUS-03 — Interior design uses budget, function and company needs

IKEA describes business interior design as a series of consultations resulting in a personalized package including product recommendations, price estimates and design plans tailored to budget, functions and needs.

**Lesson:** requirements and budget are first-class inputs; proposal/product selection and price estimate are useful outputs.

**Sources:**  
https://www.ikea.com/us/en/ikea-business/services/  
https://www.ikea.com/us/en/ikea-business/office-furnishings/

### IKEA-BUS-04 — Business Specialists also support purchasing

IKEA Business pages state that specialists help with product questions, orders and solutions. IKEA's business shopping guidance says specialists can place an order on the customer's behalf and register it to the Business Network membership.

**Lesson:** assisted purchasing is a continuation of the business solution journey; it should hand off into the canonical purchase flow rather than creating a second Order domain.

**Sources:**  
https://www.ikea.com/us/en/ikea-business/network/  
https://www.ikea.com/us/en/customer-service/knowledge/articles/df995a69-3071-490f-9e0a-e0d5d004a367.html

### IKEA-BUS-05 — Automated quotations are an explicit business benefit

IKEA Business Network advertises automated quotations intended to speed funding approvals.

**Lesson:** quotation is a useful commercial artifact inside business purchasing, but it does not need to become its own top-level module.

**Source:**  
https://www.ikea.com/us/en/ikea-business/network/

### IKEA-BUS-06 — IKEA supports small as well as large businesses

IKEA for Business states that its specialists support both small and large businesses and can assist remotely or in store.

**Lesson:** the flow should not assume enterprise procurement teams.

**Source:**  
https://www.ikea.com/us/en/ikea-business/contact-us/

## 3. Vietnamese SME fit

GRIP should optimize for an owner/employee who may not know ecommerce or procurement terminology.

Useful SME jobs:

```text
"Tôi cần setup văn phòng nhỏ"
"Tôi có danh sách đồ cần mua nhưng cần người hỗ trợ"
"Cho tôi một phương án + giá để duyệt"
"Tôi đồng ý rồi, giúp tôi mua"
```

This argues for one simple business-solution workflow rather than separate CRM, project-management, quotation and procurement applications.

## 4. Local commerce comparator — avoid importing wholesale complexity

Vietnamese commerce platforms can expose separate wholesale/discount policy tooling. Haravan Wholesale, for example, supports quantity-dependent wholesale price policies.

That is a different problem from consultation/proposal/quotation.

GRIP Business Solutions must not silently become a wholesale pricing engine.

**Source:**  
https://help.haravan.com/docs/apps/whole-sales/ung-dung-wholesale-ban-si/

## 5. What GRIP should take now

Candidate flow:

```text
Business Request
→ Consultation
→ Proposed Solution
→ Revision when needed
→ Quotation
→ Accept
→ Checkout
→ Order
```

Minimum useful concepts:

```text
BusinessRequest
Requirement
Consultation
SolutionProposal
ProposalItem (Catalog refs)
Quotation
Revision
Acceptance / handoff
```

## 6. Two entry modes

The reference supports two useful entry modes:

```text
A. "I need help deciding"
   → planning / solution

B. "I know roughly what I need"
   → order assistance / quotation
```

GRIP can expose both through one Business Solutions capability rather than two modules.

## 7. What GRIP should not take now

Do not adopt by default:

```text
CRM lead pipeline
sales opportunity scoring
sales commissions
complex project management
room-planner / 3D editor
CAD/floorplan engine
installation orchestration
warehouse reservation
business credit
Net-30 financing
purchase approval chain
supplier RFQ
multi-vendor procurement
contract lifecycle
wholesale price lists
```

## 8. Product direction

For GRIP, the value is:

```text
SME has a need
→ GRIP turns it into a concrete product proposal
→ customer can understand price and revisions
→ accepted solution flows into existing Checkout/Order
```

Business Solutions should reduce buying uncertainty and coordination, not create a second commerce stack.