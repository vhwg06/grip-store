# GRIP Promotions — Admin UI/UX Extension Plan

**Status:** Final  
**Pipeline stage:** PROMO-04 — Admin UI/UX Extension  
**Inputs:**  
- `02-grip-promotions-srs.md`  
- `../catalog/catalog-admin-ui-ux-research.md`

## 1. Rule

Promotions extends the existing Catalog Admin experience.

It must not become a separate admin application merely because it has a separate SRS.

```text
existing Catalog Admin
+ promotion jobs
→ next Catalog Admin
```

## 2. Operator mental model

Use merchant language:

```text
Khuyến mãi
Mã khuyến mãi
Giảm giá tự động
Giá trị giảm
Áp dụng cho
Đơn tối thiểu
Thời gian áp dụng
Giới hạn sử dụng
```

Avoid exposing abstract rule-engine terms.

## 3. Navigation extension

Within the existing Admin information architecture, add one commerce destination:

```text
Catalog / Commerce
├── Products
├── Categories
└── Khuyến mãi
```

Exact global-navigation placement follows the existing GRIP Admin shell. Do not create a second app shell.

## 4. Promotions list

Primary operator job:

> “Tôi đang có những ưu đãi nào, cái nào đang chạy, và tôi sửa cái nào?”

Recommended list:

```text
Khuyến mãi                                      [+ Tạo khuyến mãi]

[Tìm theo tên hoặc mã]

Tất cả | Đang áp dụng | Sắp tới | Đã hết hạn | Đã tắt

Tên / Mã             Loại             Giá trị       Trạng thái
SUMMER10              Mã giảm giá      -10%          Đang áp dụng
Ghế văn phòng         Tự động           -100.000đ     Sắp tới
```

Keep columns small. Do not expose every condition in the table.

## 5. Create entry point

Use a simple first decision:

```text
Tạo khuyến mãi

[ Mã khuyến mãi ]
Khách nhập mã khi mua hàng

[ Giảm giá tự động ]
Tự áp dụng khi sản phẩm đủ điều kiện
```

This is easier than beginning with one long form containing a `kind` dropdown and unrelated fields.

## 6. Create Coupon

Recommended form order follows merchant reasoning:

```text
Mã khuyến mãi

Tên nội bộ
[________________]

Mã
[ SUMMER10 ] [Tạo mã]

Giảm
(•) Phần trăm
( ) Số tiền
( ) Miễn phí vận chuyển

Giá trị
[ 10 ] %

Áp dụng cho
(•) Tất cả sản phẩm
( ) Sản phẩm
( ) Danh mục

Đơn tối thiểu
[ Không yêu cầu ▾ ]

Thời gian
Bắt đầu [....]
Kết thúc [....] optional

Giới hạn sử dụng
[ Không giới hạn ▾ ]

[Hủy] [Lưu]
```

Progressive disclosure should hide fields irrelevant to the chosen discount type.

## 7. Create Automatic Product Discount

Keep it shorter:

```text
Tên chương trình

Giảm
% / số tiền

Áp dụng cho
Tất cả / Sản phẩm / Danh mục

Thời gian
Bắt đầu / Kết thúc

[Hủy] [Lưu]
```

No coupon-code field and no customer redemption controls.

## 8. Product / category picker

Reuse existing Catalog selection patterns rather than invent a Promotions-specific product browser.

The picker should support:

```text
search by product name
selected product summary
category selection
remove selection
```

Do not force SKU-level targeting in V1 unless the SRS is explicitly extended.

## 9. Read-first detail

After creation, prefer a readable summary rather than reopening a large editable form by default.

```text
SUMMER10                     Đang áp dụng

Giảm                         10%
Áp dụng                      Tất cả sản phẩm
Đơn tối thiểu                500.000đ
Thời gian                    01/09 → 30/09
Đã sử dụng                   24 / 100

[Chỉnh sửa]
[Tắt khuyến mãi]
```

Derived statuses such as `Sắp tới` / `Đã hết hạn` are displayed, not manually selected.

## 10. Safe actions

State-changing actions should explain consequence.

Example:

```text
Tắt mã SUMMER10?

Khách hàng sẽ không thể áp dụng mã này cho lượt mua mới.
Các đơn hàng đã đặt không thay đổi.

[Hủy] [Tắt]
```

Do not use a generic status dropdown to bypass business meaning.

## 11. Editing active promotions

The UI must avoid silent commercial surprises.

Safe metadata such as internal name may be editable directly.

Changes to value, scope, or validity on an active Promotion should require clear consequence messaging.

If the business later decides some fields are immutable after first redemption, that rule belongs in SRS and this UI must reflect it. Do not invent such invariants in UI alone.

## 12. Usage information

V1 only needs operationally useful summary:

```text
24 / 100 lượt đã dùng
```

Do not add analytics dashboards, conversion funnels, campaign attribution, or customer-level redemption reports.

## 13. Empty state

```text
Khuyến mãi

Chưa có khuyến mãi nào.
Tạo mã giảm giá hoặc giảm giá tự động đầu tiên.

[+ Tạo khuyến mãi]
```

No tutorial carousel is required.

## 14. Mobile / narrow Admin

If Admin is usable on narrow screens:

- list becomes readable rows/cards rather than compressed 7-column table;
- creation form stays one column;
- product/category picker may open as a focused sheet/page;
- primary Save remains easy to reach.

## 15. Explicit non-goals

Do not design:

```text
rule-builder canvas
customer segmentation editor
stacking matrix
campaign workflow
approval pipeline
promotion analytics suite
coupon batch generator
branch/channel matrix
loyalty reward configuration
```

## 16. Acceptance direction

A novice SME operator should be able to:

```text
open Khuyến mãi
→ choose code or automatic discount
→ fill a short form
→ understand where/when it applies
→ save
→ later see whether it is active/expired
→ disable it safely
```

without needing to understand ecommerce promotion-engine terminology.