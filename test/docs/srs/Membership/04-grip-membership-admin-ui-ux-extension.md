# GRIP Membership — Admin UI/UX Extension Plan

**Status:** Final  
**Pipeline stage:** MEM-04 — Admin UI/UX Extension  
**Inputs:**  
- `02-grip-membership-srs.md`  
- `../Account/03-grip-account-ui-ux-research.md`

## 1. Rule

Membership extends existing customer/account administration.

It does not turn GRIP Admin into an enterprise identity-management product.

## 2. Critical identity separation

The Admin UI must visibly preserve:

```text
GRIP internal Admin user
≠
Business Owner / Admin / Member
```

Do not place these roles in one shared permission editor.

## 3. Customer/Business discovery

Existing Account Admin is search-first for customers.

Membership adds a business-oriented entry without replacing that flow:

```text
Khách hàng
Doanh nghiệp
```

Business search should support at minimum:

```text
business name
member email / name when useful
```

Do not make internal IDs the primary search key.

## 4. Business list

Recommended small table:

```text
Doanh nghiệp

[Tìm doanh nghiệp]

Tên                 Chủ sở hữu        Thành viên       Trạng thái
GRIP Studio          Hien              3                Hoạt động
ABC Office           An                2                Hoạt động
```

No analytics columns.

## 5. Business detail

```text
← Doanh nghiệp

GRIP Studio                          Hoạt động

Thông tin doanh nghiệp
...

Thành viên
Hien          Chủ sở hữu
An            Quản trị viên
Minh          Thành viên

Lời mời đang chờ
...

Hoạt động liên quan
Đơn hàng doanh nghiệp             → Order Admin
Business Solutions                → when capability exists
```

Commerce rows are projections/navigation. Membership Admin must not mutate Orders.

## 6. Support actions

Admin support actions should be minimal and policy-led.

Possible actions only when explicitly allowed by SRS/product policy:

```text
inspect role
resend/cancel invitation
support deactivation/reactivation
correct membership relationship
```

Do not give the operator an unrestricted `Set any role` or `Edit raw membership` form.

## 7. Owner invariant

If an operator is allowed to support ownership recovery, the UX must preserve exactly one Owner and explain the consequence.

No action may leave a Business ownerless.

## 8. Account detail extension

On an existing customer detail, add a projection:

```text
Doanh nghiệp
GRIP Studio · Chủ sở hữu        →
ABC Office · Thành viên         →
```

This is navigation into Membership context.

Do not duplicate business-member editing inside the customer profile if Business detail already owns that task.

## 9. Order navigation

If business-linked Orders exist:

```text
Business detail
→ recent business orders projection
→ Order Admin
```

Order mutation remains Order-owned.

## 10. Promotions / Business Solutions navigation

When those capabilities exist:

- Membership may expose eligibility/context;
- Admin can navigate to the owning workflow;
- Membership detail must not become a catch-all SME dashboard.

## 11. Operator language

Prefer:

```text
Doanh nghiệp
Chủ sở hữu
Quản trị viên
Thành viên
Lời mời
```

Avoid:

```text
tenant
principal
RBAC binding
organization node
permission set
```

## 12. Explicit non-goals

Do not design:

```text
enterprise RBAC editor
custom permission builder
SSO/SCIM administration
org hierarchy
HR directory
employee lifecycle automation
purchase approval workflow
company credit management
```

## 13. Acceptance direction

A GRIP operator should be able to:

```text
find the right business
→ understand who owns/manages it
→ inspect members/invitations
→ navigate to related commerce context
```

without confusing business-member roles with internal GRIP administrative access.