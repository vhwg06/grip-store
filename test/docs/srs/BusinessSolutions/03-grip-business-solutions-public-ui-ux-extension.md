# GRIP Business Solutions — Public UI/UX Extension Plan

**Status:** Final  
**Pipeline stage:** BUS-03 — Public UI/UX Extension  
**Inputs:**  
- `02-grip-business-solutions-srs.md`  
- `../Account/03-grip-account-ui-ux-research.md`  
- `../Content/03-grip-content-ui-ux-research.md`  
- `../catalog/catalog-public-ui-ux-guide.md`  
- `../checkout/checkout_ui_ux_research.md`  
- `../Order/03-grip-order-public-ui-ux-research.md`

## 1. Rule

Business Solutions must extend the existing GRIP customer journey.

```text
Account / Membership
+ Content / Catalog discovery
+ Business Solutions workflow
+ Checkout / Order
→ one coherent SME journey
```

Do not create a disconnected "business portal" with duplicated product browsing, checkout, or order history.

## 2. Entry points

Business Solutions can be entered from places where the need naturally appears.

Examples:

```text
Account → Doanh nghiệp → Hỗ trợ mua hàng
Content/business guide → Cần tư vấn?
Business landing → Lên phương án cho doanh nghiệp
Catalog/PDP → Cần mua số lượng / cần tư vấn?  // only when useful
```

Do not place the CTA on every product by default.

## 3. First decision — what help is needed?

Keep the first step simple:

```text
Bạn cần GRIP hỗ trợ gì?

[ Lên phương án ]
Tôi cần tư vấn sản phẩm / không gian phù hợp

[ Hỗ trợ đặt hàng ]
Tôi đã biết tương đối mình cần mua gì
```

This maps to `PlanningHelp` and `OrderAssistance` without exposing domain labels.

## 4. Request intake

Use progressive disclosure, not one long procurement form.

Core fields:

```text
Bạn đang cần gì?
[short summary]

Không gian / mục đích sử dụng
[optional structured choice + notes]

Số lượng / quy mô
[notes]

Ngân sách dự kiến
[optional]

Kích thước / thông tin thêm
[optional]
```

Only ask for measurements/files when they are useful to the chosen request type.

## 5. Confirmation

After submit:

```text
Đã gửi yêu cầu

GRIP Studio
Setup văn phòng 12 người

Mã yêu cầu: BS-1024

[Xem yêu cầu]
```

Do not redirect the user to a generic Account home and make them hunt for the request.

## 6. Business Solutions list inside Account/Business context

Membership/Account remains the continuity hub.

```text
Doanh nghiệp
├── Thành viên
├── Đơn hàng
└── Yêu cầu & báo giá
```

List:

```text
Yêu cầu & báo giá

Setup văn phòng 12 người
Đang chuẩn bị phương án
Cập nhật 26/08
→

Bàn ghế phòng họp
Có báo giá mới
Cập nhật 20/08
→
```

Do not expose internal workflow jargon.

## 7. Request detail

The customer should understand:

```text
what I asked for
what happens next
latest proposal
latest quotation
what action is expected from me
```

Recommended hierarchy:

```text
← Yêu cầu & báo giá

Setup văn phòng 12 người
Đang chuẩn bị phương án

Yêu cầu của bạn
...

Trao đổi / lịch tư vấn
...

Phương án                     // when available
...

Báo giá                       // when available
...
```

Avoid a generic CRM activity timeline as the dominant UI.

## 8. Proposal presentation

Reuse Catalog product presentation patterns but adapt them for proposal review rather than discovery.

```text
Phương án đề xuất — v2

Bàn MITTZON
Variant / lựa chọn
Số lượng: 12
Giá tham khảo: ...

Ghế ...
Số lượng: 12
...

Ghi chú phương án
...
```

Proposal item cards should be compact. The user already has a curated solution; do not recreate a browse grid.

Product links can open canonical Catalog PDP when needed.

## 9. Revision request

Customer should not edit proposal lines as if editing a cart unless product behavior explicitly supports that.

Use explicit feedback:

```text
[Yêu cầu chỉnh sửa]
```

Then a focused input:

```text
Bạn muốn thay đổi gì?
[________________________________]

[Gửi yêu cầu]
```

If a richer structured change becomes common later, evolve from evidence.

## 10. Quotation presentation

Quotation should feel like a commercial document, not an Order.

```text
Báo giá Q-2026-018
Hiệu lực đến 05/09/2026

Sản phẩm                       18.500.000đ
Khuyến mãi                      -1.000.000đ
Phí giao hàng dự kiến              300.000đ
--------------------------------------------
Tổng dự kiến                    17.800.000đ

[Chấp nhận & tiếp tục mua]
[Yêu cầu chỉnh sửa]
```

Labels must reflect actual semantics. If delivery is only an estimate, say so.

## 11. Accept → Checkout handoff

This is the most important cross-surface transition.

```text
Accepted proposal/quotation
→ canonical GRIP Checkout
```

Checkout should receive a precomposed purchase intent and show:

```text
Mua cho: GRIP Studio
Nguồn: Báo giá Q-2026-018
```

where useful.

But the customer still experiences the normal Checkout decisions and validation.

Never:

```text
Business Solutions
→ custom business payment/order form
→ second order system
```

## 12. Checkout change / revalidation

If current product/commercial state changed since quotation:

```text
quotation accepted
→ Checkout revalidation
→ change detected
→ explain clearly before placement
```

Example:

```text
Giá của 1 sản phẩm đã thay đổi từ khi báo giá được tạo.
Xem thay đổi trước khi tiếp tục.
```

Do not silently alter the quoted total.

## 13. Order continuation

After successful order placement:

```text
Business Solutions detail
→ Đã tạo đơn #GRIP-1234
→ [Xem đơn hàng]
```

Canonical status/tracking/actions live in Order.

The Business Solutions request can show linkage, not a duplicate order tracker.

## 14. Content relationship

Content remains inspiration/guidance.

A relevant article can lead to a business request:

```text
Guide: setup văn phòng nhỏ
→ Cần GRIP hỗ trợ lên phương án?
```

Once a customer-specific request exists, Business Solutions owns that workflow.

## 15. Mobile

- request intake is one column;
- proposal items use compact stacked rows/cards;
- quotation total remains visible and readable;
- customer actions are obvious and not hidden behind dense desktop tables;
- handoff to Checkout preserves normal mobile Checkout behavior.

## 16. Explicit non-goals

Do not design:

```text
CRM dashboard
sales funnel
Kanban for customers
3D planner
CAD editor
real-time collaboration canvas
contract-signature center
business credit application
custom business checkout
separate business order history
```

## 17. Acceptance direction

A small business customer should be able to:

```text
start from existing GRIP
→ explain a need
→ understand the proposed products
→ request one revision if needed
→ understand a quotation
→ accept
→ finish purchase through normal Checkout
→ continue in normal Order
```

without feeling that they left GRIP and entered enterprise procurement software.