# Account — Membership Reconciliation

**Status:** Active additive reconciliation — Membership  
**Patch node:** `P002-membership`  
**Parent state:** `BASE`

**Extends:**
- `02-grip-account-srs.md`
- `03-grip-account-ui-ux-research.md`

**Vertical input:**
- `../Membership/01-grip-membership-reference-research.md`
- `../Membership/02-grip-membership-srs.md`
- `../Membership/03-grip-membership-public-ui-ux-extension.md`
- `../Membership/04-grip-membership-admin-ui-ux-extension.md`
- `../Membership/05-membership-impact-map-and-review.md`

## 1. Source traceability

This patch is derived from the existing canonical Membership pipeline. Existing artifacts are inputs that must be traced; their `Final` status is not permission to skip them.

```text
MEM-01 reference research
→ MEM-02 accepted GRIP semantics
→ MEM-03/MEM-04 accepted Public/Admin UX
→ MEM-05 Account = PATCH
→ this P002 Account transition
```

Trace matrix:

| P002 Account requirement | Immediate authority | Upstream trace |
| --- | --- | --- |
| Keep Account as individual identity/profile/security authority; Business role is separate | MEM-02 §§1, 11, 17; MEM-05 Account SRS PATCH | MEM-01 IKEA-BN-01/02: individual profile and company membership/admin are distinct |
| Add `Doanh nghiệp` inside existing Account experience rather than a separate portal | MEM-03 §§1-5; MEM-05 Account Public/Admin UI/UX PATCH | MEM-01 minimum SME jobs + simpler-than-IKEA position |
| Expose Business profile, role, members, invitation lifecycle and role-sensitive actions | MEM-02 §§4-9, 16; MEM-03 §§3-10 | MEM-01 IKEA-BN-01/02/03: colleagues, admin distinction, responsible administrator invariant |
| Preserve exactly one Owner and explicit ownership transfer | MEM-02 §§6-7 and MEM-I02/MEM-I06; MEM-03 §9 | MEM-01 IKEA-BN-03 motivates visible privileged-user continuity; GRIP narrows it to exactly one Owner |
| Add Admin Business discovery/detail/projection without mixing GRIP Admin and Business roles | MEM-04 §§2-8; MEM-02 §17 | MEM-01 IKEA-BN-02 + SME simplicity; GRIP chooses a small operator workflow rather than enterprise IAM |
| Membership removal never deletes Account; inactive Business cannot be used for new purchase | MEM-02 §§9-11 and MEM-I03/MEM-I07 | MEM-01 separates personal identity from company membership and treats business identity as purchase context |
| Do not introduce enterprise IAM, wholesale pricing, billing/tax or Business Solutions workflow | MEM-02 §18; MEM-03 §14; MEM-04 §12; MEM-05 deferred decisions | MEM-01 §§3-7 explicitly rejects enterprise complexity and separates wholesale/billing concerns |

If any future Account requirement cannot be traced through this chain, it is a planning gap: return upstream and update the appropriate canonical artifact before changing this patch.

## 2. Purpose

Apply Membership V1 to the existing Account experience without moving authentication or personal-profile ownership out of Account.

Core boundary:

```text
Account
= individual identity + personal profile/security/saved delivery information

Membership
= Account ↔ Business relationship + business role/context
```

A Business role is never an Account role and GRIP internal Admin access is not Business Owner/Admin/Member access.

## 3. Public Account reconciliation

Extend the existing Account task hub with a `Doanh nghiệp` entry when Membership is available to the signed-in account.

The Membership projection must support:

```text
view business membership
view business profile
view own role
view members / pending invitations
invite colleague when Owner/Admin
change Member/Admin role when authorized
remove non-Owner member when authorized
transfer ownership through an explicit high-consequence flow
accept / reject invitation
```

For one Business, show a simple business summary. For multiple Businesses, use a contextual chooser rather than a permanent global switcher.

Member-only users see read-only membership context and must not receive member-management actions.

## 4. Business lifecycle and role invariants

The resulting Account/Membership surface must preserve:

```text
exactly one Owner per Business in V1
Owner transfer is explicit
previous Owner becomes Admin by default after transfer
Admin cannot remove/replace Owner
Member cannot manage other members
removing Membership never deletes the Account
inactive Business cannot be selected for new business purchases
```

Invitation acceptance links to the authenticated Account and must not manufacture a second personal Account when one already exists.

## 5. Admin Account reconciliation

Extend current customer/account administration with business discovery and Membership projection:

```text
Khách hàng
Doanh nghiệp
```

Business administration should allow an operator to:

```text
find a Business by useful human-facing identity
inspect Business profile/status
inspect Owner/Admin/Member relationships
inspect pending invitations
navigate from customer detail to Business context
navigate from Business detail to related commerce context when available
```

Do not combine Business roles with GRIP internal administrative permissions and do not expose an unrestricted raw-role editor.

## 6. Commerce boundary

Account only projects the Business relationships available to the current person.

```text
Membership BusinessContext
→ may be selected by supported commerce journeys

Account
→ does not own cart/totals/payment/order placement
```

Checkout owns purchase completion. Order owns historical purchase truth. Promotions owns discount semantics.

## 7. Explicit non-changes

This Membership reconciliation does not add:

```text
enterprise IAM / RBAC matrix
SSO / SCIM
org hierarchy / departments
purchase approval workflow
company credit
wholesale pricing
company tax / invoice model
Business Solutions request/proposal/quotation workflow
promotion-rule authoring
mandatory global Business switcher
```

Business Solutions remains inactive until `P003-business-solutions`.

## 8. Patch execution steps

Task Provider resolves this file as the complete Account transition for `P002-membership`.

```text
1. Resolve the existing canonical Account Public/Admin surface set.
2. Add/reconcile the Business entry and business-summary/detail states inside Account.
3. Cover role-sensitive member/invitation management without creating enterprise IAM UI.
4. Cover explicit ownership transfer and safe member removal consequences.
5. Add Admin business discovery/detail and Account → Business projections while preserving internal-admin/business-role separation.
6. Preserve Account ownership of personal identity/profile/security/saved delivery information.
7. Verify resulting Account state; do not tune unrelated copy/layout/craft.
```

## 9. Desired state after `P002-membership`

```text
Account @ P002-membership

Public
- existing personal Account navigation remains the base
- `Doanh nghiệp` appears when Membership context is available
- one Business renders as a compact summary; multiple Businesses use contextual choice
- Business detail exposes role, members and invitations
- Owner/Admin management actions are permission-sensitive
- Member view is read-only
- ownership transfer is distinct from routine role change
- removing Membership never deletes personal Account truth

Admin
- customer/account administration gains Business discovery and Membership projections
- Business detail exposes owner/member/invitation context
- internal GRIP Admin permissions remain separate from Business roles
- commerce links are projections/navigation only

Boundaries
- Account still owns authentication and personal profile truth
- Membership owns business relationship/role/context
- Checkout/Order/Promotions ownership does not move into Account

Not present yet
- Business Solutions request/proposal/quotation behavior
- enterprise IAM / custom permissions
```

## 10. Completion evidence

An Account Figma patch is complete only when the canonical Account Public/Admin surfaces visibly demonstrate the Membership state above, including role-sensitive business/member behavior and the identity-boundary separation. Unrelated Account cleanup does not prove `P002-membership` is complete.
