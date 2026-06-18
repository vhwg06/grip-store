# Feature Specification: Admin Review Moderation

**Feature Branch**: `006-admin-reviews`
**Created**: 2026-06-17
**Updated**: 2026-06-18
**Status**: Phase 1 source of truth

## Module Intent

Module này chuẩn hóa `Admin / Reviews` thành review moderation workflow backend-owned. Review public chỉ phản ánh state do backend trả về.

Phase split bắt buộc:

- **Phase 1**: chốt use cases, figma review, backend ownership, current code audit, test definition, tasks
- **Phase 2**: triển khai dựa trên tasks Phase 1, với test là source of truth

## Actors

- `Admin / Moderator`: duyệt, ẩn, feature, bulk publish review
- `Visitor / Customer`: chỉ nhìn thấy review public đã được backend cho phép
- `QA / Developer`: dùng spec này để viết test và triển khai

## Route / Screen Inventory

| Route / screen | Purpose | Current state |
|---|---|---|
| `/admin/reviews` | review moderation queue | hiện là table phẳng, delete-only |
| product detail reviews surface | render reviews public | hiện chưa có moderation state filtering |

## In Scope

- review queue list
- statuses: `PENDING`, `APPROVED`, `HIDDEN`, `FEATURED`
- single actions: `Approve`, `Hide`, `Delete`, `Feature review`
- bulk action: `Publish selected`
- context detail panel: product, buyer, order, attachments
- stats cards: pending, featured, hidden, alert card

## Out of Scope

- customer-side review compose UI redesign
- AI moderation
- campaign/email automation for reviews
- app code changes trong Phase 1

## Route-Level Use Cases

### Use Case 1: Queue Moderation

Admin xem queue theo trạng thái và thao tác duyệt từng review.

Acceptance:

1. Page có stats cards và split layout rõ ràng.
2. Approve chuyển review sang `APPROVED` và public surface phản ánh đúng.
3. Hide chuyển review sang `HIDDEN` và public surface không còn hiển thị review đó.
4. Feature đưa review lên `FEATURED` và public ordering phản ánh đúng.

### Use Case 2: Bulk Publish

Admin chọn nhiều review pending và publish hàng loạt.

Acceptance:

1. Checkbox selection bật nút `Publish selected`.
2. Bulk publish cập nhật state từ backend.
3. Queue và public reflection cùng đổi theo server result.

### Use Case 3: Context & Attachments

Admin xem product/buyer/order/attachments trước khi duyệt.

Acceptance:

1. Chọn review cập nhật panel ngữ cảnh.
2. Attachments có thể preview.
3. `Verified purchase` là server-driven state, không do FE tự suy luận ngoài display.

## Current Code Audit

### Current FE admin surface

- `/admin/reviews` hiện render table phẳng.
- Hook hiện tại gọi `getAdminReviews()` không có filter/pagination/status semantics rõ.
- Action hiện hữu quan sát được chủ yếu là delete.
- Chưa có split layout, stats cards, selection model, attachments context, bulk publish.

### Current public reviews surface

- `GET /v1/catalog/products/:id/reviews` hiện chưa phản ánh moderation states trong spec mới.
- Public review ordering/visibility chưa được backend contract chốt theo `APPROVED`/`FEATURED`.

### Gaps discovered

- thiếu `status` semantics trong read/write contract
- thiếu moderation actions ngoài delete
- thiếu queue stats
- thiếu attachment/context model
- thiếu server-driven visibility/order rules cho public reviews

## Figma Adaptation Requirements

Figma của module này chỉ được xem là pass khi:

- có 4 stats cards: pending, featured, hidden, alert
- có split layout: queue trái, actions/context phải
- bulk action button hiện diện ở header
- queue item thể hiện rating, product, verified badge, warning flag khi cần
- context panel thể hiện product link, buyer, order, attachment count, preview area
- save/action/loading/error states được biểu diễn đủ để FE không phải tự bịa behavior

Artifact bắt buộc: `specs/006-admin-reviews/figma-review.md`

## API / Contract Expectations

Admin contract mục tiêu:

- `GET /v1/admin/reviews`
- `PUT /v1/admin/reviews/:id/approve`
- `PUT /v1/admin/reviews/:id/hide`
- `PUT /v1/admin/reviews/:id/feature`
- `POST /v1/admin/reviews/publish-selected`
- `DELETE /v1/admin/reviews/:id`

Public contract mục tiêu:

- `GET /v1/catalog/products/:id/reviews` chỉ trả review public hợp lệ theo backend state

## Backend Ownership

### Backend owns

- validation của transitions `PENDING/APPROVED/HIDDEN/FEATURED`
- review visibility rules trên storefront
- featured ordering semantics
- filtering/search/pagination semantics
- derived stats cards counts
- verified purchase truth
- flaggedReason detection/persistence nếu có
- attachment payload shape
- authorization
- integrity/concurrency khi bulk publish hoặc mutate state

### Frontend owns only

- render queue, stats, context
- selection UI
- submit moderation intent
- loading/success/error display
- route navigation
- presentation formatting

Nếu FE phải tự tính stats, decide visibility, derive feature ordering, hoặc tự enforce moderation rules để pass UI/test, đó là backend gap và không được xử lý ở FE.

## Test Definition

### API tests

Target: `playwright/specs/api/reviews-moderation.api.spec.ts`

Phải cover:

- fetch queue with stats
- moderation mutations
- validation failures
- 401/403
- persistence
- bulk publish
- public/storefront reflection

### UI tests

Target: `playwright/specs/admin/reviews-moderation.spec.ts`

Phải cover:

- split layout render
- stats cards render
- select review cập nhật context
- approve/hide/feature flows
- bulk publish flow
- loading/success/error handling

### Figma parity

Target selectors trong `playwright/specs/admin/figma-contract.spec.ts`

## Edge Cases

- review không có comment text vẫn phải render an toàn
- attachment lỗi không được làm vỡ moderation UI
- product/order đã xóa phải có fallback context an toàn
- duplicate/spam warning là thông tin từ backend, FE chỉ hiển thị

## Success Criteria

- Spec này là source of truth cho module `006`
- Figma review pass trước khi coi UI contract là final
- Backend ownership explicit trước khi tạo task implement
- Phase 1 output không chứa app code FE/BE
- Phase 2 chỉ complete khi toàn bộ test đã define pass
