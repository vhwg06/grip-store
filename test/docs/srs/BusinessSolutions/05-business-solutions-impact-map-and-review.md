# Business Solutions — Impact Map & Review

**Pipeline stage:** BUS-05 — Build Impact Map  
**Status:** Final traced impact decision

## 1. Purpose

Trace the accepted Business Solutions capability from existing canonical research/SRS/UI/UX into exact Module impact decisions before BUS-06 activation.

Existing artifacts are not skipped because they are already `Final`:

```text
BUS-01 Reference Research
→ BUS-02 GRIP SRS
→ BUS-03 Public UI/UX
→ BUS-04 Admin UI/UX
→ BUS-05 impact decision
→ BUS-06 Module patches
```

Research is evidence; accepted GRIP SRS/UI/UX is product authority; this impact map decides which existing Modules receive P003 nodes.

## 2. Existing source trace

### BUS-01 Reference Research

Primary reusable evidence:

```text
IKEA Business order assistance + planning
→ needs/requirements
→ concrete product proposal
→ quotation/commercial understanding
→ assisted purchase through normal commerce
```

The research explicitly rejects CRM/project-management/procurement-suite/wholesale complexity for GRIP V1.

### BUS-02 SRS

Accepted GRIP flow:

```text
BusinessRequest
→ Consultation
→ SolutionProposal / Revision
→ Quotation
→ Acceptance
→ PurchaseHandoff
→ Checkout
→ Order
```

Ownership remains distributed:

```text
Membership = Business/member context
Catalog = product truth
Promotions = promotion rules
Business Solutions = request/proposal/quotation intent
Checkout = final validation/payment/place order
Order = placed purchase truth
```

### BUS-03 Public UI/UX

Accepted customer continuity:

```text
Account/Business context
+ relevant Catalog/Content entry
→ request
→ proposal
→ quotation
→ normal Checkout
→ normal Order
```

No disconnected business portal, duplicate browse, custom business checkout or duplicate order history.

### BUS-04 Admin UI/UX

Accepted operator workflow:

```text
request queue
→ understand business need
→ build proposal from Catalog selections
→ share/revise
→ issue quotation
→ hand accepted intent to Checkout
→ navigate to resulting Order
```

No CRM funnel, arbitrary price override, custom Order editor or enterprise procurement suite.

## 3. Impact decisions

Statuses:

```text
PATCH
NO PATCH REQUIRED
DEFER
```

### Account — PATCH

Trace:

```text
BUS-02 §§17,19
+ BUS-03 §§2,6-7
→ Account/Business context is the continuity hub
→ `Yêu cầu & báo giá` projection/entry is required
```

Account only projects/navigates Business Solutions state. It does not own request/proposal/quotation lifecycle.

### Membership — NO PATCH REQUIRED

Trace:

```text
BUS-02 §4
+ existing P002 Membership state
→ BusinessContext already exists
→ Business Solutions consumes it
```

No P003 Membership node is required.

### Catalog SRS — NO PATCH REQUIRED

Catalog already owns ProductModel/Variant/SKU/current sellability/product truth. Business Solutions references Catalog selections and must not move requirements/proposal state into ProductModel.

### Catalog Public UI/UX — PATCH

Trace:

```text
BUS-03 §§2,8
→ contextual `Cần tư vấn?` / `Cần mua số lượng?` entry when useful
→ proposal items navigate to canonical PDP
```

No CTA on every product by default and no duplicate business Catalog.

### Catalog Admin UI/UX — PATCH

Trace:

```text
BUS-04 §§6-7
→ proposal builder reuses Catalog search/selection
→ unavailable selections are surfaced, never silently substituted
```

No Business Solutions fields belong in ProductModel/Variant editors.

### Content SRS/UI — PATCH

Trace:

```text
BUS-02 §18
+ BUS-03 §§2,14
→ relevant editorial/business guidance may hand off into Business Solutions
```

Content remains editorial/inspiration and never owns customer-specific request/proposal/quotation state.

### Checkout SRS/UI — PATCH

Trace:

```text
BUS-02 §§13-15
+ BUS-03 §§11-12
→ accepted proposal/quotation creates PurchaseHandoff
→ canonical Checkout receives intent
→ current product/commercial state is revalidated
→ change is explained before placement
```

Existing P001 Promotions and P002 Membership behavior remains active. No separate business checkout.

### Order SRS/Public/Admin UI — PATCH

Trace:

```text
BUS-02 §16
+ BUS-03 §13
+ BUS-04 §13
→ placed Order may preserve source Business/proposal/quotation provenance
→ Public/Admin may navigate to origin when useful
```

Order remains canonical placed-purchase truth and does not duplicate proposal/quotation lifecycle.

### Promotions — NO PATCH REQUIRED

Trace:

```text
BUS-02 §12
→ Promotions may contribute applicable commercial values
→ Business Solutions does not change promotion rule ownership
```

No P003 Promotions node is required.

### Engagement — NO PATCH REQUIRED

BUS-01..04 do not establish a direct Engagement-owned Business Solutions behavior. Dependency reachability is not mutation permission.

### Aftersales — NO PATCH REQUIRED

BUS-02/03 explicitly keep post-purchase tracking/returns/claims outside Business Solutions. Existing Order/Aftersales ownership remains unchanged.

## 4. Direct BUS-06 patch set

Only these Modules are proven `PATCH`:

```text
Account
Catalog
Content
Checkout
Order
```

Therefore BUS-06 may activate `P003-business-solutions` only in those Module graphs.

Latest prior parent states must be resolved per Module:

```text
Account   P002-membership
Catalog   P001-promotions
Content   P001-promotions
Checkout  P002-membership
Order     P002-membership
```

## 5. Deferred decisions

Remain explicitly deferred:

```text
company legal/tax/billing profile
invoice workflow
credit / payment terms
operator manual discount authority
purchase approvals
stock reservation for quotation
quotation PDF/export
signature workflow
appointment calendar integration
file upload / floorplan storage
```

These may not be invented by BUS-06 or Figma.

## 6. Cross-capability invariants

```text
Account = person / continuity
Membership = Business relationship/context
Catalog = product truth
Content = editorial guidance
Promotions = promotion rules
Business Solutions = need/proposal/quotation
Checkout = final purchase validation/payment
Order = placed purchase truth
```

Purchase boundary:

```text
Business Solutions Acceptance
→ PurchaseHandoff
→ Checkout
→ Order
```

A quotation is not an Order and does not reserve stock in V1.

## 7. BUS-06 activation rule

```text
existing Module states through P001 + P002
→ this traced BUS-05 decision
→ create exact P003 nodes for Account/Catalog/Content/Checkout/Order
→ each node uses latest prior Module state
→ each task doc contains source trace + desired state + explicit non-changes + completion evidence
→ BUS-07 independent review
→ figma-p003-business-solutions
```

The Figma dependency graph remains scope-only. Membership, Promotions, Engagement and Aftersales do not gain direct P003 mutation permission from dependency reachability.
