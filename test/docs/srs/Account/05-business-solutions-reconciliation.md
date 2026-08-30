# Account — Business Solutions Reconciliation

**Status:** Active additive reconciliation — Business Solutions  
**Patch node:** `P003-business-solutions`  
**Parent state:** `P002-membership`

**Extends:**
- `02-grip-account-srs.md`
- `03-grip-account-ui-ux-research.md`
- `04-membership-reconciliation.md`

**Vertical input:**
- `../BusinessSolutions/01-grip-business-solutions-reference-research.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`
- `../BusinessSolutions/03-grip-business-solutions-public-ui-ux-extension.md`
- `../BusinessSolutions/04-grip-business-solutions-admin-ui-ux-extension.md`
- `../BusinessSolutions/05-business-solutions-impact-map-and-review.md`

## 1. Source traceability

```text
BUS-01 reference research
→ BUS-02 accepted GRIP semantics
→ BUS-03/BUS-04 accepted Public/Admin UX
→ BUS-05 Account = PATCH
→ this P003 Account transition
```

| P003 Account requirement | Immediate authority | Upstream trace |
| --- | --- | --- |
| Add `Yêu cầu & báo giá` inside existing Business/Account continuity context | BUS-03 §6; BUS-05 Account PATCH | BUS-01 §§2,5,8: business assistance should continue into one coherent purchase journey |
| Account only projects/list/navigates Business Solutions state | BUS-02 §§17,19; BUS-05 Account PATCH | BUS-01 rejects a second portal/commerce stack |
| Preserve Membership ownership of Business/member roles and context | BUS-02 §4; BUS-05 Membership NO PATCH | BUS-01 assumes business assistance works with business identity rather than replacing it |
| Keep Business Solutions request/proposal/quotation workflow out of Account ownership | BUS-02 §§3,18; BUS-03 §§6-7 | BUS-01 models a distinct customer-specific assistance workflow |
| Avoid CRM, procurement-suite and duplicate Order/Checkout surfaces | BUS-02 §21; BUS-03 §16 | BUS-01 §§3,7 explicitly rejects enterprise procurement complexity |

Untraceable Account behavior is a planning gap and must not be invented in this patch or Figma.

## 2. Purpose

Extend the existing Account + Membership continuity hub with Business Solutions navigation and projections.

```text
Account = person / continuity hub
Membership = Business relationship/context
Business Solutions = customer-specific request/proposal/quotation workflow
```

## 3. Public Account reconciliation

Inside the existing `Doanh nghiệp` experience, add a compact Business Solutions entry:

```text
Doanh nghiệp
├── Thành viên
├── Đơn hàng
└── Yêu cầu & báo giá
```

`Yêu cầu & báo giá` may show current requests with customer-facing status and direct navigation to the Business Solutions request detail.

Account must not duplicate proposal editing, quotation workflow, Checkout or Order history.

## 4. Admin Account reconciliation

Customer/Business administration may expose navigation/projection to related Business Solutions requests when useful for support.

Business member/role management remains Membership-owned. Request/proposal/quotation actions remain Business Solutions-owned.

## 5. P002 state preserved

Preserve all Membership behavior from `P002-membership`:

```text
Doanh nghiệp entry and business detail
Owner/Admin/Member semantics
invitation/member management
BusinessContext
GRIP Admin ≠ Business role
```

P003 adds assistance continuity; it does not replace Membership.

## 6. Explicit non-changes

Do not add:

```text
proposal editor inside Account
quotation authoring inside Account
CRM pipeline
business role changes owned by Business Solutions
custom business Checkout
second Order history
credit / approval / invoice / wholesale tooling
```

## 7. Patch execution steps

```text
1. Resolve Account Public/Admin surfaces at P002-membership.
2. Add `Yêu cầu & báo giá` to the existing Business context where applicable.
3. Provide compact request/proposal/quotation status projections and navigation only.
4. Preserve Membership role/member/business-management behavior unchanged.
5. Keep Business Solutions workflow actions in the owning Business Solutions surfaces.
6. Verify the resulting Account state; do not tune unrelated Account craft.
```

## 8. Desired state after `P003-business-solutions`

```text
Account @ P003-business-solutions

Public
- existing Account + Membership experience remains the base
- Business context can expose `Yêu cầu & báo giá`
- customer can find active Business Solutions work without entering a separate portal
- request/proposal/quotation details navigate to owning Business Solutions surfaces

Admin
- Business/customer context may link to related Business Solutions work
- Membership management remains Membership-owned

Ownership
- Account owns continuity/navigation
- Membership owns Business/member context
- Business Solutions owns request/proposal/quotation lifecycle
```

## 9. Completion evidence

The Account P003 Figma patch is complete only when Business Solutions continuity is visible inside the canonical Account/Business context without duplicating Membership or Business Solutions workflows.