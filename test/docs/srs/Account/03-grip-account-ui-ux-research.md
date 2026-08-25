# GRIP Account — UI/UX Research and Design Direction

**Status:** Final  
**Pipeline stage:** 03 — UI/UX research  
**Module:** Account  
**Surfaces:** Public Storefront + Admin Console  
**Inputs:**  
- `01-grip-account-ikea-research.md`  
- `02-grip-account-srs.md`

---

# 1. Purpose

This file translates verified research + GRIP SRS into UI/UX direction.

It is not allowed to:

- reintroduce out-of-scope behavior;
- invent IKEA screens;
- override SRS ownership;
- turn every backend concept into a screen.

Design trace:

```text
IKEA evidence
+ GRIP SRS
→ user jobs
→ information hierarchy
→ interaction model
→ screen/state candidates
→ Design System requirements
```

---

# 2. Product UX thesis

Account should not feel like an authentication module.

It should feel like:

> **“GRIP remembers the stable things about me so I can shop and manage purchases faster next time.”**

Primary user value:

```text
remember me
→ remember my delivery information
→ show me my orders
→ bring me back to saved products
→ reduce repeated checkout work
```

Authentication is only the doorway.

---

# 3. Public user jobs

A normal customer enters Account to do one of these jobs:

1. “Xem đơn của tôi.”
2. “Theo dõi lại đơn gần đây.”
3. “Đổi / thêm thông tin giao hàng dùng cho lần sau.”
4. “Quay lại sản phẩm tôi đã lưu.”
5. “Sửa tên / số điện thoại / thông tin cá nhân.”
6. “Đổi thông tin đăng nhập / bảo mật.”
7. “Đăng nhập để checkout đỡ phải nhập lại.”

This task model should drive IA.

Do not begin from a backend entity list.

---

# 4. Recommended Public IA

```text
Tài khoản của tôi
├── Tổng quan
├── Đơn hàng
├── Thông tin giao hàng
├── Đã lưu              // if supported
├── Thông tin cá nhân
└── Đăng nhập & bảo mật
```

This is semantic IA.

Desktop may use side navigation if the number of destinations justifies it.

Mobile should usually use a simple list/stack rather than a permanently visible sidebar.

---

# 5. Storefront Account entry

## Signed out

Keep the entry recognizable and quiet:

```text
[Tài khoản]
```

or the canonical account icon with accessible label.

Selecting it opens Sign in.

## Signed in

The first-level account affordance can expose only high-frequency destinations:

```text
Tài khoản của tôi
Đơn hàng
Thông tin giao hàng
Đã lưu
Đăng xuất
```

Do not put destructive/security actions in the shell menu.

---

# 6. Sign-in UX

Current GRIP scope supports a conventional credential flow only.

No:

```text
one-time code
registration
registration verification
OTP state
```

should appear in Figma.

Recommended composition:

```text
Đăng nhập

Email
[________________]

Mật khẩu
[________________] [show]

[Đăng nhập]

[Quên mật khẩu]   // only if supported by the actual contract
```

Rules:

- one clear primary action;
- no promotional wall;
- no fake signup CTA if self-registration does not exist;
- inline field errors;
- credential failure shown without technical language;
- keyboard and autofill-friendly fields;
- password visibility control;
- contextual back behavior.

If password recovery is not implemented, omit the affordance rather than drawing a dead-end screen.

---

# 7. Contextual sign-in from Checkout

This is one of the highest-value account interactions.

The user is already shopping.

The UI should explain **why** signing in helps:

```text
Có tài khoản?

Đăng nhập để dùng thông tin giao hàng đã lưu
và xem đơn hàng trong tài khoản của bạn.

[Đăng nhập]
```

If Checkout does not require authentication, do not make the prompt look like a gate.

After success:

```text
Sign in
→ return to same Checkout
→ saved delivery data becomes available
```

Never:

```text
Checkout
→ Sign in
→ Account home
→ user must find Checkout again
```

---

# 8. Account Overview

## Goal

Answer:

> “Tôi có thể làm gì ở đây?”

before asking the user to edit anything.

Recommended hierarchy:

```text
Xin chào, <name>

Đơn hàng gần đây
#GRIP-1234
Đang giao
[Xem đơn]

Thông tin giao hàng
Nhà
<address summary>
[Mặc định]
[Quản lý]

Đã lưu
12 sản phẩm
[Xem sản phẩm đã lưu]

Thông tin cá nhân
Tên · email · số điện thoại
[Quản lý]
```

Only show modules/data that actually exist.

---

# 9. Avoid card-dashboard syndrome

Account has multiple utilities, but that does **not** mean every utility needs a floating card.

Use grouping based on reading/task hierarchy.

If content is simple, this is enough:

```text
Đơn hàng                    →
Thông tin giao hàng         →
Đã lưu                      →
Thông tin cá nhân           →
Đăng nhập & bảo mật         →
```

Use richer summary blocks only where the summary itself saves a meaningful click, such as a current delivery or recent order.

---

# 10. My Orders UX

Account should make order history easy to reach but should not redesign the Order module inside Account.

Recommended Account entry:

```text
Đơn hàng

#GRIP-1234
12/08/2026
Đang giao
1.850.000 ₫
[Xem chi tiết]

#GRIP-1180
02/08/2026
Đã giao
...
```

Selecting an item enters the canonical Order-owned experience.

If Order supports:

- tracking;
- cancellation;
- receipt;
- reschedule;
- refund;

those actions belong to the Order screen.

Account only provides discovery/resume.

---

# 11. Saved Delivery Information — key utility

This should be a first-class Account destination.

## 11.1 Why

Repeatedly typing:

- recipient;
- phone;
- address;

is pure checkout friction.

The account should turn that stable data into reusable context.

## 11.2 Recommended list

```text
Thông tin giao hàng

Mặc định

Nhà
Nguyễn Văn A · 09...
123 ...
[Chỉnh sửa]

────────────

Văn phòng
Nguyễn Văn A · 09...
456 ...
[Chỉnh sửa]

[+ Thêm thông tin giao hàng]
```

If the product supports only one saved delivery entry, simplify the screen rather than simulating an address book.

---

# 12. Add/Edit delivery information

Use a focused form.

```text
Thông tin người nhận
Họ tên
Số điện thoại

Địa chỉ
...

[Lưu]
```

Rules:

- use Vietnamese labels matching Checkout;
- reuse the same address-input semantics as Checkout;
- validate at field level;
- preserve input after recoverable errors;
- avoid unrelated Account settings in the form;
- do not show internal geographic IDs.

If the address model is hierarchical, the same canonical selectors/patterns should be shared with Checkout.

---

# 13. Default delivery information

If multiple saved entries exist, expose default clearly but quietly.

Good:

```text
Nhà
[Mặc định]
```

Actions:

```text
Đặt làm mặc định
Chỉnh sửa
Xóa
```

Do not use a strong attention color for a routine `Mặc định` state.

---

# 14. Account → Checkout prefill UX

## 14.1 Default case

Signed-in customer with a default entry:

```text
Thông tin giao hàng

Nhà                         Mặc định
Nguyễn Văn A
09...
123 ...

[Thay đổi]
```

The saved data is presented as a **summary first**, not a large pre-opened form.

This is a major friction reduction.

## 14.2 Change saved entry

```text
Chọn thông tin giao hàng

● Nhà — Mặc định
○ Văn phòng
○ Dùng thông tin khác
```

Selecting another saved entry updates the Checkout draft with a copy.

## 14.3 Use another address

If the user chooses a new address:

```text
Dùng thông tin khác
→ address form
```

If GRIP supports saving it:

```text
[ ] Lưu thông tin này vào tài khoản
```

must be explicit.

If GRIP does not implement this mutation, do not show the checkbox.

---

# 15. Critical copy-semantics UX

The UI must reflect the SRS boundary:

```text
Saved delivery info
≠ current checkout address
≠ historical order address
```

Therefore:

- editing a checkout address should not silently show “Đã cập nhật tài khoản”;
- editing Account should not alter an in-progress checkout unexpectedly;
- changing Account should never visually suggest that old Orders changed.

If a user is editing an existing saved address from Checkout, make the choice explicit:

```text
Dùng cho đơn này
```

versus, only if supported:

```text
Cập nhật thông tin đã lưu
```

Do not combine the two by default.

---

# 16. No saved delivery information

A signed-in account with no address should not feel broken.

Account:

```text
Thông tin giao hàng

Bạn chưa lưu thông tin giao hàng.

[Thêm thông tin]
```

Checkout:

```text
Thông tin giao hàng
<form>
```

No forced detour into Account is required.

---

# 17. Personal information UX

Personal information is stable and low-frequency.

Prefer read-first presentation:

```text
Thông tin cá nhân

Họ tên
Nguyễn Văn A
[Sửa]

Email
minh@example.com
[Sửa]

Số điện thoại
09...
[Sửa]
```

or one focused edit screen if the data contract is small.

Avoid rendering all values as inputs by default.

---

# 18. Saved Products UX

If saved/favourite products exist, Account should give a direct route:

```text
Đã lưu
→ canonical Saved Products experience
```

Account Overview may show:

```text
Đã lưu
12 sản phẩm
[Xem tất cả]
```

Do not duplicate product-grid behavior if the owning module already has a canonical saved-products surface.

---

# 19. Login & Security UX

Security should be a secondary destination.

Only render supported features.

Possible:

```text
Đăng nhập & bảo mật

Mật khẩu
Đã đặt
[Đổi mật khẩu]

────────────

Xóa / vô hiệu hóa tài khoản
...
```

Do not draw:

- OTP setup;
- email verification;
- registration verification;
- unsupported session management.

Dangerous actions are visually separated from routine profile settings.

---

# 20. Mobile Public behavior

Mobile should optimize for short task completion.

## Auth

- one column;
- no decorative split screen;
- visible back affordance;
- large tap targets;
- password-manager/autofill compatibility.

## Account Overview

Prefer:

```text
recent-order summary
delivery-info summary
navigation rows
```

not a 2-column shrunken dashboard.

## Delivery Information

Each saved entry can be a readable stacked row/card.

Edit action must remain easy to reach without tiny overflow controls.

## Checkout

Prefilled delivery summary should remain compact.

`Thay đổi` opens a sheet/page appropriate to the product's mobile navigation model.

---

# 21. Desktop Public behavior

Do not use available width to manufacture complexity.

Auth remains a compact form column.

For Account, a two-region layout becomes justified when the IA is large enough:

```text
Account nav
│
└── focused content
```

Do not add a sidebar solely because desktop exists.

---

# 22. Admin UX research boundary

There is still no public evidence for IKEA's internal backoffice.

Therefore Admin UI direction is derived from:

```text
GRIP SRS
+ IKEA Business Network role/invariant evidence
+ current e-commerce admin comparator
```

Shopify is used only as a labeled comparator for common operational patterns.

---

# 23. Admin comparator findings

## Shopify — customer lookup

Current Shopify Admin documentation says operators can search customers by:

- name;
- mailing address;
- email;
- phone.

Columns can be sorted/hidden/reordered.

### UX lesson

Customer administration should be **search-first**.

Source:  
https://help.shopify.com/en/manual/customers/customer-search

---

## Shopify — customer detail

Shopify exposes customer profiles for customer information and related operations.

### UX lesson

A customer detail should combine:

```text
identity
+ account-owned info
+ related commerce context
+ safe actions
```

without turning into a generic database viewer.

Source:  
https://help.shopify.com/en/manual/customers/manage-customers

---

## Shopify — admin users and roles

Shopify separates administrative users from customers and manages admin roles/permissions under Users.

### UX lesson

GRIP should keep:

```text
Customers
```

separate from:

```text
Admin access
```

Sources:

https://help.shopify.com/en/manual/your-account/users  
https://help.shopify.com/en/manual/your-account/users/manage-users

---

# 24. Recommended Admin IA

```text
Account — Admin
├── Khách hàng
│   ├── Danh sách
│   └── Chi tiết khách hàng
│
└── Quyền truy cập Admin
    ├── Danh sách tài khoản Admin
    └── Chi tiết / quyền truy cập
```

Only add dedicated Audit or Roles destinations if the actual feature volume requires them.

---

# 25. Admin — Customer list

Primary operator job:

> “Tìm đúng khách hàng.”

Recommended:

```text
Khách hàng

[Tìm theo tên, email hoặc số điện thoại]

Trạng thái ▾      // only if useful

Tên
Liên hệ
Trạng thái tài khoản
Đơn gần nhất      // projection if valuable
```

Rules:

- no internal ID as the dominant column;
- no ecommerce jargon;
- no default table with every customer attribute;
- no badge for every field;
- rare actions do not occupy each row;
- row opens customer detail.

---

# 26. Admin — Customer detail

Recommended information hierarchy:

```text
← Khách hàng

Nguyễn Văn A
minh@example.com
09...
[Active]

────────────────

Thông tin cá nhân
...

Thông tin giao hàng
Nhà — Mặc định
...
[Quản lý nếu có quyền]

────────────────

Đơn hàng gần đây
#GRIP-1234   Đang giao      →
#GRIP-1180   Đã giao        →
[Xem tất cả]

────────────────

Account actions
...

Danger zone
...
```

Order rows are projections.

Clicking an order enters Order Admin.

---

# 27. Admin — Editing delivery information

Only show this if the operator is authorized and the SRS/backend supports it.

UX must make scope clear:

> This updates the customer's saved Account information for future reuse.

It does **not** modify the delivery address of an existing Order.

This distinction should be visible near the action if confusion is likely.

Example:

```text
Thông tin này được dùng cho các lần mua sau.
Đơn hàng đã tạo sẽ không thay đổi.
```

---

# 28. Admin — Account state action

State-changing actions should be consequence-led.

Bad:

```text
Disable?
Cancel | OK
```

Better:

```text
Vô hiệu hóa tài khoản?

Khách hàng sẽ không thể đăng nhập.
Các đơn hàng đã tạo vẫn được giữ nguyên.

[Hủy]
[Vô hiệu hóa]
```

Exact consequence text must come from SRS/domain behavior.

---

# 29. Admin — Admin Access

Keep admin principals separate from customer accounts.

Recommended list:

```text
Quyền truy cập Admin

Tên
Email / principal
Vai trò
Trạng thái
```

Detail:

```text
Admin identity
Current access
Role / permissions
Access actions
```

No public registration/verification flow should leak into this area.

If provisioning exists, use only the supported provisioning contract.

---

# 30. Admin last-privileged-user state

If the backend has this invariant, design it before implementation QA.

Example:

```text
Không thể gỡ quyền quản trị

Đây là tài khoản quản trị cuối cùng có quyền này.
Hãy cấp quyền cho một tài khoản khác trước.
```

This is better than permitting the action then showing a generic API error.

---

# 31. Admin language rule

Operators should not need identity/ecommerce expertise.

Prefer:

```text
Thông tin giao hàng
```

not:

```text
Fulfillment identity attributes
```

Prefer:

```text
Không thể đăng nhập
```

when that is the relevant consequence.

Expose technical identifiers only for support/debug scenarios where they add value.

---

# 32. Empty/loading/error states

## Public examples

Account no orders:

```text
Bạn chưa có đơn hàng nào.
[Tiếp tục mua sắm]
```

No saved delivery info:

```text
Bạn chưa lưu thông tin giao hàng.
[Thêm thông tin]
```

## Admin no result

```text
Không tìm thấy khách hàng phù hợp.
Kiểm tra lại tên, email hoặc số điện thoại.
```

Avoid empty-state marketing inside operational Admin tools.

---

# 33. Design System implications

Promote reusable interaction patterns, not module-named decoration.

Likely canonical needs:

```text
Credential form
Password field
Account navigation
Navigation row
Entity identity header
Read-first field/value row
Address/delivery summary
Saved-entry selector
Default-state marker
Form field / validation
Search toolbar
Entity table
Status badge
Related-entity projection list
Confirmation dialog
Danger zone
Empty state
Error feedback
Loading state
```

Do not create generic `AccountCard` for every section.

---

# 34. Candidate Figma screen/state inventory

Only canonicalize a state if it expresses real behavior.

## Public — Authentication

```text
Account / Sign in
├── Default
├── Invalid credentials
├── Submitting
└── Success → return to origin
```

No OTP, registration or verification frames.

## Public — My Account

```text
Account / Overview
Account / Personal Information
Account / Edit Personal Information
Account / Saved Delivery Information
├── List
├── Empty
├── Add
├── Edit
└── Delete confirmation
Account / Login & Security
```

## Public — related utilities

```text
Account / My Orders
→ consume/navigate to Order

Account / Saved Products
→ consume/navigate to owning module
```

## Checkout integration

```text
Checkout / Signed out account prompt
Checkout / Saved delivery prefilled
Checkout / Choose saved delivery info
Checkout / Enter another delivery info
Checkout / Return after sign-in
```

## Admin — Customers

```text
Account Admin / Customer List
├── Default
├── Searching
├── No results
└── Error

Account Admin / Customer Detail
├── Overview
├── Edit Account-owned info
├── Manage saved delivery info
├── Account state confirmation
└── Mutation error
```

## Admin — Access

```text
Account Admin / Admin Access List
Account Admin / Admin Access Detail
Account Admin / Provision access      // only if supported
Account Admin / Change access
Account Admin / Last-admin blocked
```

---

# 35. Design acceptance gates

## Public

- [ ] No OTP UI exists.
- [ ] No public registration UI exists.
- [ ] No registration-verification UI exists.
- [ ] Account is task-oriented, not profile-form-first.
- [ ] Orders are easy to reach.
- [ ] Saved delivery information is a first-class utility.
- [ ] Checkout can clearly reuse saved delivery information.
- [ ] Prefilled data is shown as reviewable current checkout data.
- [ ] Editing checkout does not imply Account was silently changed.
- [ ] Editing Account does not imply historical Orders changed.
- [ ] Saved products remain owned by their canonical module.
- [ ] Mobile is independently composed rather than compressed desktop.
- [ ] Empty/error/loading states exist for real behavioral states.

## Admin

- [ ] Customer lookup is search-first.
- [ ] Human identifiers are used before internal IDs.
- [ ] Customer and Admin identities are separate surfaces.
- [ ] Saved delivery data is clearly Account-owned.
- [ ] Order data is projection/link only.
- [ ] Account-state actions explain consequences.
- [ ] Sensitive mutations wait for backend-confirmed success.
- [ ] Invalid privileged-access transitions are explained before/at action.
- [ ] Admin UI uses plain operational language.

---

# 36. Final UI/UX position

The Account experience should optimize this loop:

```text
first purchase
→ customer provides stable personal/delivery data
→ Account remembers reusable context
→ later purchase
→ Checkout reuses it
→ Account gives fast access to orders and saved intent
```

That is the core utility.

For public users:

> **less re-entry, faster return to shopping and orders.**

For administrators:

> **find the customer quickly, understand Account-owned state, and act safely without stealing ownership from Order/Checkout.**
