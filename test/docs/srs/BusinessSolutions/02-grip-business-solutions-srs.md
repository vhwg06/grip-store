# GRIP Business Solutions — Business / Domain SRS

**Status:** Final  
**Pipeline stage:** BUS-02 — GRIP SRS / Business-Domain Decision  
**Research input:** `01-grip-business-solutions-reference-research.md`

## 1. Purpose

Business Solutions extends GRIP for SME customers who need help turning a business need into a purchasable product solution.

It combines the previously considered ideas of:

```text
Business Purchasing
+
Planning & Consultation
```

into one vertical capability.

Core journey:

```text
Business need
→ consultation / assistance
→ proposed solution
→ quotation
→ accepted commercial intent
→ Checkout
→ Order
```

Business Solutions does not create a second Catalog, Checkout, Order or CRM.

## 2. Entry modes

V1 supports two entry modes under one capability.

### Planning help

Customer knows the problem/space but not the final product list.

```text
"Help me furnish a small office"
```

### Order assistance

Customer roughly knows what they need and wants help validating/completing a business purchase.

```text
"I need 20 desks and 20 chairs and a quotation"
```

Both converge on the same proposal/quotation/purchase handoff model.

## 3. Current scope

```text
BusinessSolutions
├── BusinessRequest
├── Requirement
├── Consultation
├── SolutionProposal
├── ProposalItem
├── Revision
├── Quotation
├── Acceptance
└── PurchaseHandoff
```

## 4. Membership relationship

Business Solutions requires an active BusinessContext for a business-owned request.

Membership provides:

```text
which Business?
which Account is acting?
what Membership role?
```

Business Solutions does not own company/member administration.

If GRIP later allows non-member inquiry intake, that must be a separate explicit decision. Current canonical business flow assumes active Membership.

## 5. BusinessRequest

A BusinessRequest captures the business problem before a final solution exists.

Minimum fields:

```text
id
business_ref
created_by_account_ref
request_type
summary
requirements
budget_note?
preferred_contact_or_appointment_context?
status
created_at
updated_at
```

V1 request types:

```text
PlanningHelp
OrderAssistance
```

Do not create a generic CRM lead object.

## 6. Requirement

Requirements are customer/business needs relevant to the solution.

Examples:

```text
space / use case
approximate dimensions or measurements
quantity / capacity need
style / functional preferences
budget
notes
```

Requirements are not Catalog attributes and must not be forced into ProductModel schema.

No arbitrary questionnaire builder is required in V1.

## 7. Consultation

Consultation records a business-assistance interaction tied to the Request.

Conceptually:

```text
Consultation
├── scheduled_at?
├── channel: Online | Offline | Async
├── operator_ref?
├── notes
└── outcome
```

Scheduling complexity is deliberately small. Calendar/resource-management systems are outside scope.

## 8. SolutionProposal

A SolutionProposal is the current proposed answer to the BusinessRequest.

```text
SolutionProposal
├── request_ref
├── version
├── summary
├── ProposalItem[]
├── notes
├── commercial_summary
└── status
```

Proposal lifecycle:

```text
Draft
→ Shared
→ Accepted
or
→ Superseded by revision
or
→ Declined
```

A Proposal is not an Order.

## 9. ProposalItem

ProposalItem references current Catalog selections.

```text
catalog_selection_ref
quantity
optional operator/customer note
```

Catalog remains authoritative for current product identity and current sellability.

A proposal may preserve a display snapshot sufficient to explain what was proposed at that version, but it must not become a second Catalog master record.

## 10. Revision

When the customer requests changes, create a new proposal version rather than mutating the previously shared commercial understanding invisibly.

```text
Proposal v1 Shared
→ customer requests changes
→ Proposal v2 Draft
→ Shared
```

V1 does not require visual diff tooling.

## 11. Quotation

Quotation is the commercial view of a Proposal intended for customer review/approval.

Minimum:

```text
quotation_ref
proposal_ref
business_ref
line summary
prices at quote time
promotion/discount result if intentionally included
subtotal
delivery/service estimate when supported
final quoted amount
valid_until?
status
```

Quotation states:

```text
Draft
→ Issued
→ Accepted
or
→ Expired
or
→ Declined
```

Quotation is not a placed Order and does not reserve stock in V1.

## 12. Pricing relationship

Catalog provides regular/current product price context.

Promotions may provide an applicable promotion when intentionally used.

Business Solutions can present quoted commercial values but does not own a wholesale price-list engine or arbitrary manual price override system.

If an operator-specific discount is ever required, it must become an explicit business rule rather than a free-form editable number hidden in Admin.

## 13. Acceptance

Customer acceptance means:

> “I accept this proposed solution/quotation and want to proceed to purchase.”

Acceptance does not itself create an Order.

It creates a `PurchaseHandoff` into Checkout.

## 14. PurchaseHandoff

PurchaseHandoff carries accepted business purchase intent into canonical Checkout.

Conceptually:

```text
business_ref
proposal_ref
quotation_ref?
accepted Catalog selections + quantities
quoted commercial context where still valid
```

Checkout revalidates the purchase under its own rules before placement.

Required invariant:

```text
Accepted quotation
≠ guaranteed successful Order placement
```

because current product/commercial constraints can change.

## 15. Checkout relationship

Checkout remains authoritative for:

```text
active purchase composition
buyer/delivery information
current commercial validation
coupon application
payment
place order
```

Business Solutions may pre-populate purchase intent from an accepted proposal/quotation.

Checkout must not become a second proposal editor.

## 16. Order relationship

Successful placement produces the canonical Order.

Order may preserve provenance such as:

```text
business_ref
proposal_ref?
quotation_ref?
```

when useful for history/support.

Business Solutions does not manage fulfillment or post-purchase lifecycle.

## 17. Account relationship

Account continues to own individual identity/profile/reusable personal information.

Business Solutions references the acting Account through Membership context.

## 18. Content relationship

Content may provide inspiration/guidance that leads to Business Solutions.

Business Solutions owns the active business request/proposal/quotation workflow.

Required distinction:

```text
Content
= inspiration / editorial guidance

Business Solutions
= customer-specific need → proposal
```

## 19. Public use cases

```text
Start a business request
Choose Planning Help or Order Assistance
Describe requirement
Provide useful measurements/notes
Request / view consultation
View proposal
Request revision
View quotation
Accept / decline
Proceed to Checkout
View existing Business Solutions requests
```

## 20. Admin/operator use cases

```text
View incoming requests
Open request detail
Understand business/member context
Record consultation context
Build proposal from Catalog products
Set quantities
Share proposal
Create/issue quotation
Create revision
Record decline/acceptance outcome
Handoff accepted solution to Checkout
```

Admin workflow must stay task-oriented rather than CRM-oriented.

## 21. Explicit exclusions

```text
CRM opportunity pipeline
lead scoring
sales commission
3D room planner
CAD/floorplan editor
project management suite
task assignment engine
staff chat
business credit
Net 30/60 financing
purchase approval chains
supplier RFQ
multi-vendor procurement
contract management
inventory reservation
warehouse fulfillment
installation orchestration
wholesale pricing engine
manual arbitrary order creation
post-order mutation
```

## 22. Core invariants

### BUS-I01
A BusinessRequest belongs to a Business context and is created by an acting Account/member.

### BUS-I02
A Proposal references Catalog products but does not own Catalog truth.

### BUS-I03
A newly shared revision must not silently rewrite a previously shared Proposal version.

### BUS-I04
A Quotation is commercial intent, not an Order and not inventory reservation.

### BUS-I05
Acceptance creates purchase handoff, not Order placement.

### BUS-I06
Checkout remains authoritative for final pre-placement validation/payment.

### BUS-I07
Order remains authoritative after successful placement.

### BUS-I08
Membership owns Business/member identity and roles.

### BUS-I09
Business Solutions does not become CRM or a wholesale pricing engine.

## 23. Final product position

Business Solutions should feel like one coherent SME service:

```text
Tell us what you need
→ get a concrete product solution
→ revise if needed
→ understand the price
→ buy through normal GRIP checkout
```

The complexity stays behind the workflow rather than being exposed as enterprise procurement software.