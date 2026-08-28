# GRIP Membership — Public UI/UX Extension Plan

**Status:** Final  
**Pipeline stage:** MEM-03 — Public UI/UX Extension  
**Inputs:**  
- `02-grip-membership-srs.md`  
- `../Account/03-grip-account-ui-ux-research.md`

## 1. Rule

Membership extends the existing Account experience.

```text
existing Account UX
+ business membership semantics
→ next Account UX
```

Do not create a disconnected business portal by default.

## 2. Account overview extension

Existing Account already acts as a task hub.

Add Business only when the signed-in user has or can create/join a Business context.

Example:

```text
Tài khoản của tôi
├── Đơn hàng
├── Thông tin giao hàng
├── Đã lưu
├── Thông tin cá nhân
├── Doanh nghiệp        ← extension
└── Đăng nhập & bảo mật
```

If Membership is not available to the account, do not show dead navigation.

## 3. Business summary

For one active Business:

```text
Doanh nghiệp

GRIP Studio
Vai trò: Chủ sở hữu
3 thành viên

[Quản lý doanh nghiệp]
```

Do not show internal membership IDs.

## 4. Multiple businesses

Do not add a permanent global switcher unless the user actually belongs to multiple Businesses.

When multiple exist, a simple contextual chooser is enough:

```text
Doanh nghiệp của bạn

GRIP Studio          Chủ sở hữu   →
ABC Office           Thành viên   →
```

The selected business context should be visible when it affects a downstream purchase.

## 5. Business detail

Recommended hierarchy:

```text
← Doanh nghiệp

GRIP Studio
[Đang hoạt động]

Thông tin doanh nghiệp
Tên: GRIP Studio

Thành viên
Hien                 Chủ sở hữu
An                   Quản trị viên
Minh                 Thành viên

[+ Mời thành viên]
```

Only Owner/Admin sees management actions.

Member sees a read-only version.

## 6. Invite colleague

Keep the flow focused:

```text
Mời thành viên

Email
[________________]

Vai trò
(•) Thành viên
( ) Quản trị viên

[Gửi lời mời]
```

No permission matrix.

After success:

```text
Đã gửi lời mời đến an@example.com
```

Pending invitation should be visible in the member list with an obvious state.

## 7. Accept invitation

Invitation should explain the business relationship before acceptance:

```text
Bạn được mời tham gia
GRIP Studio

Vai trò: Thành viên

[Tham gia]
[Từ chối]
```

If sign-in is required, contextual sign-in must return to the invitation rather than Account Overview.

## 8. Role changes

Role changes should be consequence-led, not a generic dropdown hidden in a table.

Example:

```text
Đặt An làm Quản trị viên?

An sẽ có thể mời và quản lý thành viên của doanh nghiệp.

[Hủy] [Xác nhận]
```

Routine Member ↔ Admin changes can use a compact menu when consequences remain clear.

## 9. Ownership transfer

Treat this as a rare high-consequence action.

```text
Chuyển quyền sở hữu cho An?

An sẽ trở thành Chủ sở hữu.
Bạn sẽ trở thành Quản trị viên.

[Hủy]
[Chuyển quyền sở hữu]
```

Do not mix this action into normal role selection.

## 10. Remove member

```text
Xóa Minh khỏi GRIP Studio?

Minh sẽ không thể mua hàng hoặc truy cập GRIP dưới doanh nghiệp này nữa.
Tài khoản cá nhân và các đơn hàng đã có không bị xóa.

[Hủy] [Xóa thành viên]
```

This copy reflects the Account/Membership/Order boundary.

## 11. Business purchase context

When a supported Checkout/Business Solutions flow uses Business context, show it as a small explicit summary:

```text
Mua cho
GRIP Studio
[Thay đổi]
```

Do not make business context look like the customer's personal delivery address or payment method.

## 12. Promotions relationship

If a Promotion is available because of business membership, the UI should communicate the benefit where useful, but Membership does not need a coupon wallet.

Example:

```text
Giá dành cho thành viên doanh nghiệp
```

only when Promotions provides that semantic.

## 13. Mobile

- Account navigation remains a simple stacked list.
- Business members render as readable rows/cards.
- invite/edit flows stay one column.
- rare actions can live behind a clear overflow/menu, but Owner transfer must not be easy to trigger accidentally.

## 14. Explicit non-goals

Do not design:

```text
enterprise admin portal
permission matrix
org-chart UI
department management
SSO settings
SCIM settings
employee directory
purchase approval inbox
company credit dashboard
```

## 15. Acceptance direction

A business user should be able to:

```text
open existing Account
→ understand which Business they belong to
→ invite/manage a small team if authorized
→ see their role
→ enter business-aware shopping flows
```

without learning a second product navigation model.