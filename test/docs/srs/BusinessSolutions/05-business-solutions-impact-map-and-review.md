# Business Solutions — Impact Map & Review

**Pipeline stages:** BUS-05 / BUS-06 / BUS-07

## 1. Purpose

Map the accepted Business Solutions capability onto existing GRIP planning artifacts before final reconciliation.

Statuses:

```text
PATCH
NO PATCH REQUIRED
DEFER
```

## 2. Existing docs inspected

Primary baseline:

```text
Account/02-grip-account-srs.md
Account/03-grip-account-ui-ux-research.md
Membership/02-grip-membership-srs.md
Membership/03-grip-membership-public-ui-ux-extension.md
Membership/04-grip-membership-admin-ui-ux-extension.md
catalog/srs_001_product.md
catalog/catalog-public-ui-ux-guide.md
catalog/catalog-admin-ui-ux-research.md
Content/02-grip-content-srs.md
Content/03-grip-content-ui-ux-research.md
checkout/checkout_srs.md
checkout/checkout_ui_ux_research.md
Order/02-grip-order-srs.md
Order/03-grip-order-public-ui-ux-research.md
Order/04-grip-order-admin-ui-ux-research.md
Promotions/02-grip-promotions-srs.md
```

## 3. Impact decisions

### Account — PATCH

Account remains the customer continuity hub.

Required additive extension:

```text
Account / Business context
→ Yêu cầu & báo giá entry point / projection
```

Account does not own request/proposal/quotation state.

### Membership — NO PATCH REQUIRED

Membership already defines active BusinessContext and explicitly assigns consultation/proposal/quotation workflow to Business Solutions.

### Catalog SRS — NO PATCH REQUIRED

Catalog continues to own ProductModel/Variant product truth.

Business Solutions references Catalog selections and must not move proposal requirements into ProductModel schema.

### Catalog Public UI/UX — PATCH

Potential entry points such as `Cần tư vấn?` or `Cần mua số lượng?` may be added only where contextually useful.

Proposal items link back to canonical PDP instead of duplicating Catalog UX.

### Catalog Admin UI/UX — PATCH

Business Solutions proposal builder reuses Catalog selection/search patterns. Product editing remains Catalog-owned.

No Business Solutions fields belong on ProductModel forms.

### Content SRS/UI — PATCH

Content remains editorial/inspiration.

Add an optional typed handoff/CTA from relevant business guidance to Business Solutions.

Do not turn Content articles into customer-specific requests.

### Checkout SRS — PATCH

Add accepted `PurchaseHandoff` as a valid source of purchase intent.

Checkout must revalidate product/commercial state before placement.

Business Solutions must not bypass normal buyer/delivery/payment decisions.

### Checkout UI/UX — PATCH

When entered from accepted business proposal/quotation, show compact provenance/context without creating a separate business checkout.

Example:

```text
Mua cho: GRIP Studio
Từ báo giá: Q-2026-018
```

If current values differ from quotation, show a reviewable change before final placement.

### Order SRS — PATCH

Allow optional business-solution provenance:

```text
business_ref
proposal_ref?
quotation_ref?
```

where useful for history/support.

Order remains canonical placed purchase truth.

### Order Public UI/UX — PATCH

Show source quotation/business context only when useful; do not duplicate proposal state or quotation workflow.

### Order Admin UI/UX — PATCH

Provide cross-navigation from Order to originating Business Solutions request/quotation where useful.

### Promotions — NO PATCH REQUIRED

Promotions may contribute effective commercial values used in a quotation, but Business Solutions does not change Promotions ownership or rule semantics.

## 4. Deferred decisions

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

These require explicit future decisions.

## 5. Cross-capability review

### Business identity

```text
Account → person
Membership → Business relationship/context
Business Solutions → need/proposal/quotation
```

PASS.

### Product truth

```text
Catalog owns products
Business Solutions references products
```

PASS.

### Commercial truth

```text
Promotions owns promotion rules
Business Solutions can quote resulting values
Checkout revalidates
Order snapshots final purchase
```

PASS.

### Purchase boundary

```text
Business Solutions acceptance
→ PurchaseHandoff
→ Checkout
→ Order
```

PASS.

### Post-purchase

Business Solutions links to Order after placement but does not absorb tracking/returns/claims.

PASS.

### UX

Business Solutions extends Account/Membership + Catalog/Content + Checkout/Order. It does not introduce duplicate browse, checkout or order-history universes.

PASS.

## 6. Patch execution note

BUS-06 reconciles **Business Solutions only**, on top of the already-active product state through Promotions + Membership.

Do not rewrite earlier Promotions/Membership reconciliation files into one cumulative vertical document. Add Business-Solutions-specific reconciliation artifacts only where this impact map says `PATCH`.

Required activation sequence:

```text
existing baseline + active Promotions + active Membership reconciliations
→ BUS-05 impact map
→ BUS-06 Business-Solutions-specific reconciliation in affected Modules
→ add those Business Solutions reconciliation docs to figma-pipeline-dependencies.json
→ BUS-07 review through the full current roadmap point
→ Figma dependency update
```

After BUS-07, a product-wide consistency pass may review the accumulated three capabilities together.

See `../vertical-capability-sequencing.md`.
