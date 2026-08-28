# GRIP Business Solutions — Admin UI/UX Extension Plan

**Status:** Final  
**Pipeline stage:** BUS-04 — Admin UI/UX Extension  
**Inputs:**  
- `02-grip-business-solutions-srs.md`  
- existing GRIP Account / Catalog / Checkout / Order Admin UX documents

## 1. Rule

Business Solutions extends existing GRIP administration with one task-oriented SME assistance workflow.

It is not a CRM, sales pipeline, project-management suite, or second Order Admin.

## 2. Primary operator job

> “Hiểu khách doanh nghiệp cần gì, tạo một phương án đủ tốt, gửi báo giá, rồi đưa khách sang mua hàng.”

The interface should optimize this job, not expose domain object inventory.

## 3. Entry / queue

Add one business-service destination to the existing Admin shell:

```text
Business Solutions
```

Primary list:

```text
Yêu cầu doanh nghiệp

[Tìm theo doanh nghiệp / mã yêu cầu]

Cần xử lý | Đang làm | Chờ khách | Hoàn tất

GRIP Studio
Setup văn phòng 12 người
Đang chuẩn bị phương án
Cập nhật 26/08
→
```

Do not default to a sales funnel with stages such as Lead / Qualified / Opportunity / Won.

## 4. Request detail

Recommended information hierarchy:

```text
← Yêu cầu doanh nghiệp

BS-1024 · GRIP Studio
Setup văn phòng 12 người

Việc cần làm tiếp theo
[Chuẩn bị phương án]

────────────────

Yêu cầu khách hàng
...

Thông tin doanh nghiệp
GRIP Studio · Hien (Owner)       → Membership

Trao đổi / tư vấn
...

Phương án hiện tại
...

Báo giá
...

Đơn hàng kết quả                 → Order Admin when placed
```

The next task should be obvious before historical detail.

## 5. Consultation

Keep consultation capture lightweight:

```text
Hình thức: Online / Offline / Async
Thời gian: ...
Ghi chú sau tư vấn: ...
```

Do not build calendar/resource scheduling here.

## 6. Build proposal

Operator should select from canonical Catalog, not retype product truth.

```text
[+ Thêm sản phẩm]
→ existing Catalog product picker/search
→ choose sellable selection
→ quantity
→ optional note
```

Proposal workspace:

```text
Phương án v2 — Draft

Bàn MITTZON           x12
Ghế ...                x12
Tủ ...                 x2

Ghi chú
...

[Lưu nháp]
[Chia sẻ với khách]
```

Do not expose internal Catalog entity terminology unless required for correct product selection.

## 7. Product state changes

If a Catalog selection becomes unavailable/unpublished before proposal share or purchase handoff, surface it where the operator works:

```text
Ghế ABC
Không còn bán
[Thay sản phẩm]
```

Do not silently substitute products.

## 8. Revision

When changes are requested:

```text
Proposal v1 — Shared
Customer requested change
→ Create v2 from v1
→ edit affected items/notes
→ Share v2
```

Keep older shared versions readable as history. No visual diff tool is required.

## 9. Quotation

Quotation creation should reuse the current proposal rather than ask the operator to enter lines again.

```text
Tạo báo giá từ Phương án v2

Hiệu lực đến
[date]

Sản phẩm               ...
Khuyến mãi              ...   // only from accepted Promotions behavior
Giao hàng dự kiến       ...   // only if known
Tổng                    ...

[Lưu nháp]
[Phát hành báo giá]
```

No unrestricted arbitrary price override field by default.

## 10. Quotation states

Use semantic actions rather than status dropdowns:

```text
Draft        → Phát hành
Issued       → Chờ khách
Accepted     → Tạo lượt mua / đưa sang Checkout
Expired      → Tạo báo giá mới if needed
Declined     → close or revise
```

Status should follow business events.

## 11. Accepted handoff

When customer accepts:

```text
[Đưa sang Checkout]
```

or an equivalent customer-facing continuation.

The operator must not manually create a placed Order inside Business Solutions.

The handoff should carry:

```text
BusinessContext
proposal/quotation references
selected Catalog items + quantities
```

Checkout performs final validation.

## 12. Membership navigation

Business/member information should be shown as context and linked to Membership Admin.

Do not edit Business roles from the Business Solutions request.

## 13. Order navigation

After placement:

```text
Đơn hàng #GRIP-1234      → Order Admin
```

Tracking, cancellation, status and post-purchase actions remain Order/Aftersales-owned.

## 14. Work status

Business Solutions can have a small request work status to help operators find what needs attention.

Recommended semantics:

```text
New
In Progress
Waiting for Customer
Completed
Closed
```

These are workflow projections, not a CRM opportunity pipeline.

Prefer actions/events that derive state where possible.

## 15. Operator language

Use:

```text
Yêu cầu
Tư vấn
Phương án
Báo giá
Khách cần chỉnh sửa
Chờ khách
Tiếp tục mua
```

Avoid:

```text
lead
opportunity
pipeline stage
MQL / SQL
deal probability
forecast
```

## 16. Empty state

```text
Yêu cầu doanh nghiệp

Chưa có yêu cầu nào.
Khi khách gửi yêu cầu tư vấn hoặc hỗ trợ đặt hàng, chúng sẽ xuất hiện ở đây.
```

No demo pipeline or fake dashboard metrics.

## 17. Narrow screens

- queue becomes stacked rows/cards;
- request detail keeps next action first;
- proposal line editing remains readable one item at a time;
- quotation summary remains concise;
- no compressed CRM table.

## 18. Explicit non-goals

Do not design:

```text
sales CRM
pipeline kanban
lead scoring
sales forecast
commission UI
task/project suite
staff chat
CAD/3D workspace
contract signing
credit underwriting
warehouse reservation
custom Order editor
```

## 19. Acceptance direction

A non-commerce-expert operator should be able to:

```text
open a request
→ understand the SME need
→ build a proposal from Catalog
→ issue a quotation
→ revise once needed
→ hand accepted intent to Checkout
→ navigate to resulting Order
```

with minimal navigation and without learning enterprise sales software.