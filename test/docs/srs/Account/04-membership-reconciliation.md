# Account — Membership Reconciliation

**Status:** Active additive reconciliation — Membership  
**Patch node:** `P002-membership`  
**Parent state:** `BASE`

**Extends:**
- `02-grip-account-srs.md`
- `03-grip-account-ui-ux-research.md`

**Vertical input:**
- `../Membership/02-grip-membership-srs.md`
- `../Membership/03-grip-membership-public-ui-ux-extension.md`
- `../Membership/04-grip-membership-admin-ui-ux-extension.md`

## 1. Purpose

Apply Membership V1 to the existing Account experience without moving authentication or personal-profile ownership out of Account.

Core boundary:

```text
Account
= individual identity + personal profile/security/saved delivery information

Membership
= Account ↔ Business relationship + business role/context
```

A Business role is never an Account role and GRIP internal Admin access is not Business Owner/Admin/Member access.

## 2. Public Account reconciliation

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

## 3. Business lifecycle and role invariants

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

## 4. Admin Account reconciliation

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

## 5. Commerce boundary

Account only projects the Business relationships available to the current person.

```text
Membership BusinessContext
→ may be selected by supported commerce journeys

Account
→ does not own cart/totals/payment/order placement
```

Checkout owns purchase completion. Order owns historical purchase truth. Promotions owns discount semantics.

## 6. Explicit non-changes

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

## 7. Patch execution steps

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

## 8. Desired state after `P002-membership`

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

## 9. Completion evidence

An Account Figma patch is complete only when the canonical Account Public/Admin surfaces visibly demonstrate the Membership state above, including role-sensitive business/member behavior and the identity-boundary separation. Unrelated Account cleanup does not prove `P002-membership` is complete.
