# GRIP Engagement — UI/UX Research and Design Direction

**Status:** Final  
**Pipeline stage:** 03 — UI/UX research  
**Module:** Engagement  
**Surfaces:** Public Storefront + Admin Console  
**Inputs:**  
- `01-grip-engagement-ikea-research.md`  
- `02-grip-engagement-srs.md`

# 1. Purpose

This file translates Engagement research + SRS into UI/UX direction.

It must not:

- override SRS behavior;
- reconstruct IKEA UI from memory;
- move recommendation ownership into Engagement;
- expose private Saved Lists to Admin without a requirement.

```text
IKEA evidence
+ Engagement SRS
→ user jobs
→ IA
→ interaction model
→ screen/state inventory
→ Design System implications
```

# 2. UX thesis

Engagement solves two primary pre-purchase moments:

```text
"I like this, but I'm not buying yet."
→ Save

"I don't know whether this is actually good."
→ Reviews
```

After purchase:

```text
"I've used this and can help the next buyer."
→ Write review
```

The module should feel lightweight in the storefront.

It should not become a social network.

# 3. Public user jobs

1. Save a product without interrupting browsing.
2. Find saved products later.
3. Organize saved products by project/intent.
4. Share a list with someone.
5. Move an item out of Cart without losing it.
6. Judge product confidence quickly from review evidence.
7. Read deeper reviews when uncertain.
8. Review a product previously purchased.

These jobs drive the UI.

# 4. Public IA

Engagement is mostly contextual:

```text
Product card
→ Save

Product detail
→ Save
→ Rating summary
→ Reviews

Cart / Checkout
→ Save for later

Account
→ Saved Lists

Order / Purchase history
→ Write review
```

Dedicated destination:

```text
Đã lưu / Danh sách
```

There is no `Engagement Home`.

# 5. Save where interest happens

IKEA's useful pattern is that the save affordance lives directly on product surfaces.

Recommended GRIP pattern:

```text
product card
[image]                    ♡
name
price

product detail
...
♡ Lưu
```

Exact placement follows GRIP composition.

Invariant:

> Saving must not require leaving product discovery.

# 6. First-save friction

Do not make the user organize before saving.

Good:

```text
Tap Save
→ save to default list
→ lightweight confirmation
```

Then optionally:

```text
Đã lưu vào "Đã lưu"
[Đổi danh sách]
```

Bad:

```text
Save
→ modal
→ Create list
→ Name list
→ privacy settings
→ confirm
```

before the product is saved.

The default list exists to make first save cheap.

# 7. Saved-state feedback

Save control must expose state:

```text
♡  not saved
filled/selected equivalent  saved
```

Do not rely on color alone.

Accessible labels should change:

```text
Lưu sản phẩm
Bỏ khỏi danh sách đã lưu
```

Successful save should use small non-blocking feedback.

# 8. Signed-out save

If persistence requires Account:

```text
Save
→ contextual Sign in
→ return to same product
→ saved
```

Suggested copy:

```text
Đăng nhập để lưu sản phẩm
và xem lại ở lần truy cập sau.
```

Do not navigate to Account Overview after auth.

# 9. Saved Lists hub

IKEA's Lists model supports one place for multiple lists.

Recommended:

```text
Đã lưu

Đã lưu                    8 sản phẩm →
Phòng khách               5 sản phẩm →
Bàn làm việc              3 sản phẩm →

[+ Tạo danh sách]
```

If GRIP initially ships only one list, simplify to one Saved Products screen rather than showing fake IA.

# 10. Saved List detail

```text
← Đã lưu

Phòng khách
5 sản phẩm

[Chia sẻ]   [•••]

<Product Grid>
```

Use canonical Catalog Product Card primitives.

Do not create an Engagement-specific competing card system.

# 11. Saved product state

Saved item is intent, not frozen commerce state.

## Normal

```text
Product
current price
current availability
[Thêm vào giỏ]
```

## Unavailable

```text
Product
Hiện chưa thể mua
```

Keep it visible when possible so the user understands the state change.

Do not silently remove intent.

## Changed price

Show current Catalog price.

Do not introduce a “saved price” unless Catalog explicitly supports it.

# 12. Add to Cart from Saved

```text
[Thêm vào giỏ]
→ canonical Cart validation
→ success
```

The saved item remains saved unless user explicitly chooses a move behavior.

# 13. List management

Low-frequency actions belong behind secondary controls:

```text
•••
├── Đổi tên
├── Chia sẻ / Quản lý chia sẻ
└── Xóa danh sách
```

Do not place multiple equal-weight buttons on every list row.

# 14. Sharing

Lists are private by default.

Before sharing:

```text
Chia sẻ danh sách

Danh sách này hiện chỉ mình bạn xem được.

[Tạo liên kết chia sẻ]
```

After sharing:

```text
Đã bật chia sẻ

[Copy link]
[Tắt chia sẻ]
```

Explain recipient semantics clearly:

```text
Người có liên kết có thể xem danh sách.
Họ không thể thay đổi danh sách của bạn.
```

# 15. Shared-list recipient

Recipient UI should focus on the products:

```text
Danh sách "Phòng khách"

product
product
product
```

Recipient can:

- open Product Detail;
- Add to Cart;
- save/copy into their own list when authenticated.

Do not expose owner management controls.

# 16. Save for later in Cart / Checkout

Recommended hierarchy:

```text
Cart item
quantity
Remove
Lưu để mua sau
```

Save for later is secondary to purchase completion.

On success:

```text
Đã chuyển vào Đã lưu
[Xem danh sách]
```

If save fails:

- keep the cart line;
- show recoverable error;
- never remove first and attempt save second.

# 17. Reviews as decision evidence

Current IKEA US Product Detail demonstrates two levels:

```text
near primary information:
average rating + count

later:
review section
sample reviews
Show all reviews
```

GRIP should preserve this split:

```text
summary signal
≠
deep review reading
```

# 18. Product-header rating summary

Recommended compact form:

```text
★★★★☆  4,2 · 128 đánh giá
```

Requirements:

- average and count are both accessible;
- tapping/clicking goes to review content;
- stars do not need attention-badge styling;
- no `0.0 ★` for products without reviews.

No reviews:

```text
Chưa có đánh giá
```

or omit the summary if Product Detail hierarchy calls for it.

# 19. Product-card rating

Only use rating on listing cards if it helps product comparison.

If used:

```text
4,7 ★ (54)
```

Treat it as metadata.

It must not visually compete with:

- name;
- price;
- critical availability;
- meaningful sale signal.

Do not make it another badge.

# 20. Review section

Recommended:

```text
Đánh giá của khách hàng

4,6 / 5
★★★★★
128 đánh giá

[Viết đánh giá]   // only when valid

────────────────

5 ★
Title
Review body
Đã mua hàng
Display name · date

────────────────

...

[Xem tất cả đánh giá]
```

If volume is low, do not create a separate full-reviews destination unnecessarily.

# 21. Verified-purchase marker

Use:

```text
Đã mua hàng
```

as quiet credibility metadata.

It is not a promotional status.

Avoid strong badge colors.

# 22. Review-writing entry points

Recommended:

```text
Product Detail
```

and especially:

```text
Order / Purchase History
→ Đánh giá sản phẩm
```

Order-originated review makes eligibility obvious.

If user is ineligible, do not expose a fake active flow.

# 23. Review form

Keep reviewed product identity visible.

```text
[thumbnail] Product name / variant

Đánh giá sản phẩm

Bạn đánh giá sản phẩm này thế nào?
☆ ☆ ☆ ☆ ☆

Tiêu đề             // only if supported
[____________]

Chia sẻ trải nghiệm của bạn
[____________________________]

[Đăng đánh giá]
```

No image/video upload in current scope.

# 24. Review guidance

Keep guidance short:

```text
Hãy tập trung vào trải nghiệm với sản phẩm.
Không chia sẻ email, số điện thoại hoặc thông tin cá nhân.
```

If the user wants help with:

- delivery;
- payment;
- account;
- safety incident;

route to the appropriate owning flow.

Review UI is not Customer Support.

# 25. Submission confirmation

Because review enters moderation:

```text
Cảm ơn bạn đã chia sẻ.

Đánh giá đang được kiểm duyệt trước khi hiển thị.
```

Do not visually publish it immediately.

# 26. Review reading hierarchy

Each review should prioritize:

```text
rating
title
body
```

then secondary metadata:

```text
verified purchase
author
date
```

Avoid giant bordered cards and badge soup.

# 27. Review sorting/filtering

Current SRS does not require enterprise filtering.

Start simple.

Add star filters/sort only when review volume makes them useful.

Do not copy mature review-platform complexity without need.

# 28. Recommendation ownership in Product Detail

Figma must preserve semantic ownership even if sections are adjacent.

Bad:

```text
Engagement
└── Recommended products
```

Good:

```text
Catalog / Product Detail
├── Engagement — Rating/Reviews slot
├── Catalog — Related products
└── Catalog — Recommendation slot
```

Engagement provides feedback signals; Catalog owns discovery composition.

# 29. Account integration

Account can show:

```text
Đã lưu
8 sản phẩm / 3 danh sách
[Xem]
```

This is a projection/navigation entry.

Click enters Engagement-owned Saved Lists.

No duplicate Saved implementation inside Account.

# 30. Admin UX thesis

The core Admin job is:

> Review customer feedback that needs a publication decision.

Therefore:

```text
Engagement Admin
≠ analytics dashboard first
≠ customer browser
≠ Catalog editor
```

It is primarily a moderation queue.

# 31. Admin research boundary

IKEA publicly documents review moderation behavior but not its internal moderation console.

Do not draw “IKEA Admin”.

Yotpo is an explicitly labeled review-management comparator: its current official docs describe a review moderation surface with pending/published/rejected/hidden-style states and manual approve/reject/hide behavior.

# 32. Recommended Admin IA

```text
Engagement — Admin

Reviews
├── Pending
├── Published
├── Rejected
└── Hidden
```

These should generally be tabs/filters inside one management surface rather than four unrelated pages.

# 33. Moderation queue

Default:

```text
Đánh giá

[Đang chờ 12] [Đã đăng] [Đã từ chối] [Đã ẩn]

[Tìm theo sản phẩm...]

Rating ▾
Ngày gửi ▾

────────────────────────
★☆☆☆☆
Product name
"Không như mong đợi..."
Đã mua hàng
12 phút trước
[Xem]
────────────────────────
```

Pending reviews needing action come first.

Do not create a special “negative reviews” bucket that biases moderation.

# 34. Queue density

Useful fields:

- rating;
- title/short excerpt;
- product;
- verified-purchase marker;
- submitted time;
- moderation state.

Avoid by default:

- full customer profile;
- full Order;
- internal IDs;
- giant product thumbnails;
- many policy badges.

# 35. Review moderation detail

```text
← Reviews

1 ★
Review title
Full customer-authored body

Đã mua hàng
Customer reference
Submitted: ...

────────────────

Sản phẩm
[thumbnail] Product name
[Xem sản phẩm]

Purchase evidence
Order #...
[Xem đơn]   // if authorized

────────────────

Moderation
[Approve]
[Reject]
```

Published state:

```text
[Hide review]
```

# 36. Approve

For clearly compliant review:

```text
[Approve]
```

can succeed directly with clear success feedback.

No unnecessary confirmation for a normal reversible publication decision unless domain rules require it.

# 37. Reject

Rejection needs a reason.

Example:

```text
Từ chối đánh giá

Lý do
○ Chứa thông tin cá nhân
○ Không liên quan sản phẩm
○ Nội dung vi phạm
○ Spam / quảng cáo
○ Other supported reason

[Hủy]
[Từ chối]
```

Never offer:

```text
Negative review
Low rating
```

as moderation reasons.

# 38. Hide published review

Hiding published customer evidence is more consequential.

Require:

- reason;
- explicit action;
- backend-confirmed success.

Do not use a generic `OK` dialog.

# 39. Admin must not edit customer reviews

No controls for:

```text
Edit customer text
Change rating
Rewrite title
```

Moderators decide publication state; they do not become review authors.

# 40. Negative review handling

A one-star review is not inherently an error state.

Do not style it with destructive red merely because rating is low.

Danger styling is reserved for:

- actual policy violation;
- destructive moderation action;
- safety escalation if separately defined.

# 41. Cross-domain Admin context

Review detail can link to:

```text
Catalog Product
Order
Account
```

but should not embed those full admin experiences.

Show just enough evidence for moderation.

# 42. Saved Lists Admin privacy

Current scope intentionally has no general Saved Lists Admin dashboard.

Reason:

- Saved Lists are private customer intent;
- no routine operational job requires browsing them;
- exposing data merely because it exists increases privacy and cognitive cost.

Future support/compliance access requires explicit new permission/use case.

# 43. Mobile Saved Lists

Prefer:

```text
←
Phòng khách
5 sản phẩm
[Share]
```

then canonical mobile product grid/list.

List management can use overflow.

Do not compress desktop side navigation into mobile.

# 44. Desktop Saved Lists

Use space for product browsing.

A list sidebar is justified only when list volume makes switching useful.

Do not manufacture a dashboard.

# 45. Mobile Reviews

- compact rating summary;
- single-column review list;
- dedicated page/sheet for writing review;
- avoid tiny modal on phone;
- preserve long review text during validation/network failure.

# 46. Desktop Reviews

Review writing can use a drawer/dialog if it preserves:

- product context;
- keyboard navigation;
- focus management;
- adequate writing width.

Do not copy old IKEA screenshot styling.

# 47. Empty states

## No saved items

```text
Bạn chưa lưu sản phẩm nào.

Khi thấy sản phẩm muốn xem lại, hãy chọn Lưu.

[Khám phá sản phẩm]
```

## Empty named list

```text
Danh sách này chưa có sản phẩm.
```

## No published reviews

```text
Chưa có đánh giá cho sản phẩm này.
```

If current user is eligible:

```text
Hãy là người đầu tiên chia sẻ trải nghiệm.
[Viết đánh giá]
```

## Admin pending empty

```text
Không có đánh giá nào đang chờ kiểm duyệt.
```

Keep Admin empty states operational.

# 48. Error states

## Save failed

```text
Chưa thể lưu sản phẩm.
Thử lại.
```

Stay in context.

## Shared list unavailable

Use neutral privacy-safe copy:

```text
Danh sách này không còn được chia sẻ.
```

## Review submission failed

Preserve the customer's written text.

Never erase a long review after a recoverable request failure.

# 49. Design System implications

Likely reusable patterns:

```text
Save toggle/button
Saved-state feedback
List selector
List navigation row
Share-state control
Shared-link panel
Product Card saved state
Rating summary
Star-rating input
Review item
Verified-purchase metadata
Review form
Moderation status
Moderation queue row
Moderation reason form
Confirmation dialog
Empty/error/loading state
```

Do not create a unique card for every Engagement concept.

# 50. Candidate Figma inventory

## Public — Saved

```text
Engagement / Saved Lists
├── Lists hub
├── Default list
├── Named list
├── Empty list
├── Create list
├── Rename list
├── Delete confirmation
├── Share — private
├── Share — enabled
└── Shared recipient view
```

## Contextual save states

```text
Catalog / Product Card — unsaved
Catalog / Product Card — saved
Catalog / Product Detail — unsaved
Catalog / Product Detail — saved
Cart/Checkout — save for later
```

These belong in owning flows with Engagement traceability rather than duplicated standalone screens.

## Public — Reviews

```text
Catalog / Product Detail
├── No reviews
├── Rating summary
├── Review list
└── Full reviews

Engagement / Write Review
├── Default
├── Validation error
├── Submitting
└── Pending confirmation
```

## Admin

```text
Engagement Admin / Reviews
├── Pending queue
├── Published
├── Rejected
├── Hidden
├── Review detail — pending
├── Reject reason
├── Review detail — published
└── Hide confirmation
```

# 51. UI/UX acceptance gates

## Saved Lists

- [ ] Save exists at point of product interest.
- [ ] First save does not require list setup.
- [ ] Saved state is not communicated by color alone.
- [ ] Account is an entry point, not data owner.
- [ ] Multiple-list power does not make simple save harder.
- [ ] Lists are private by default.
- [ ] Sharing clearly states read-only semantics.
- [ ] Recipient actions do not mutate source.
- [ ] Current Catalog price/availability is displayed.
- [ ] Unavailable items are represented honestly.
- [ ] Save-for-later failure does not lose Cart state.
- [ ] Mobile is independently composed.

## Reviews

- [ ] Rating summary appears near product decision info when reviews exist.
- [ ] Full reviews do not dominate Product Detail top.
- [ ] No-review state is not a zero-star rating.
- [ ] Verified marker is metadata, not promotion.
- [ ] Review form keeps product identity visible.
- [ ] Submission goes to pending.
- [ ] Review text survives recoverable errors.
- [ ] Non-product complaints route to owning flows.

## Admin

- [ ] Pending reviews are default focus.
- [ ] Low rating is not styled as policy violation.
- [ ] Reject/hide require valid reasons.
- [ ] Admin cannot edit customer-authored content.
- [ ] Product/Order/Account are projections/links.
- [ ] Private Saved Lists have no broad Admin browser.
- [ ] Moderation states are clear without badge overload.

# 52. Final design position

Public loop:

```text
Interest
→ Save
→ Purchase
→ Review
→ Trust for the next buyer
```

Admin loop:

```text
Submitted feedback
→ policy review
→ publish or reject
```

Recommendation remains outside this loop under Catalog/discovery ownership.
