# Account — Vertical Capability Reconciliation

**Status:** Final additive reconciliation  
**Extends:**
- `02-grip-account-srs.md`
- `03-grip-account-ui-ux-research.md`

**New vertical inputs:**
- `../Membership/02-grip-membership-srs.md`
- `../Membership/03-grip-membership-public-ui-ux-extension.md`
- `../Membership/04-grip-membership-admin-ui-ux-extension.md`
- `../BusinessSolutions/02-grip-business-solutions-srs.md`
- `../BusinessSolutions/03-grip-business-solutions-public-ui-ux-extension.md`
- `../BusinessSolutions/04-grip-business-solutions-admin-ui-ux-extension.md`

## 1. Purpose

Account remains the persistent individual customer identity and continuity layer.

Membership and Business Solutions extend what a signed-in person can do; they do not replace Account.

## 2. Domain reconciliation

Canonical distinction:

```text
Account
= person

Membership
= Account ↔ Business relationship

Business Solutions
= business-specific request / proposal / quotation workflow
```

Account continues to own:

```text
authentication
personal profile
saved delivery information
security
personal continuity entry points
```

Account does not own:

```text
Business roles
Business membership lifecycle
Business request/proposal/quotation state
business purchase commercial rules
```

## 3. Public Account reconciliation

Existing Account Overview remains the customer continuity hub.

Extend its IA only with capability entry points that exist for the user:

```text
Tài khoản của tôi
├── Đơn hàng
├── Thông tin giao hàng
├── Đã lưu
├── Thông tin cá nhân
├── Doanh nghiệp                 // when Membership exists
│   ├── business profile
│   ├── members
│   └── Yêu cầu & báo giá       // when Business Solutions exists
└── Đăng nhập & bảo mật
```

Do not create a separate Account replacement for business customers.

## 4. Membership projection

Account may show:

```text
GRIP Studio · Chủ sở hữu
ABC Office · Thành viên
```

This is a projection/navigation entry.

Business role changes and invitations are Membership-owned.

## 5. Business Solutions projection

Within the relevant Business context, Account may expose:

```text
Yêu cầu & báo giá
→ Business Solutions list/detail
```

Do not duplicate proposal/quotation state inside Account Overview beyond concise resume/status information.

## 6. Contextual sign-in rule remains

Existing Account UX already requires contextual sign-in to return to the originating task.

This applies to:

```text
Membership invitation acceptance
Business Solutions request
Checkout business context
```

Never:

```text
origin task
→ sign in
→ Account home
→ user must rediscover task
```

## 7. Admin Account reconciliation

Existing customer search/detail remains the base.

Customer detail can add a Business projection:

```text
Doanh nghiệp
GRIP Studio · Chủ sở hữu       → Membership Admin
ABC Office · Thành viên        → Membership Admin
```

Do not mix:

```text
GRIP Admin access role
with
Business Owner/Admin/Member role
```

They remain separate identity/access concepts.

## 8. Related commerce navigation

Account/Admin can navigate to related owning capabilities:

```text
Order                    → Order
Business membership      → Membership
Business requests/quotes → Business Solutions
```

Account does not mutate those records.

## 9. Promotions relationship

No direct Account patch is required for base Promotions V1.

If a later promotion becomes member/business-specific, Account may surface the resulting customer-visible benefit only through the relevant owning capability.

Do not create a coupon wallet or rewards center in Account for current scope.

## 10. Explicit non-changes

This reconciliation does not add:

```text
enterprise IAM
custom roles
company billing data
business credit
purchase approval
loyalty wallet
separate business login system
```

## 11. Result

Account grows vertically from:

```text
personal shopping continuity
```

to:

```text
personal shopping continuity
+ access to business context
+ resume business-assistance journeys
```

while preserving the existing individual identity model.