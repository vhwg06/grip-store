# Test Plan: Admin Review Moderation

## Intent

Phase 1 của module này phải khóa bộ test moderation trước khi cho phép implement. Phase 2 chỉ dùng đúng bộ test này làm execution gate.

## Files

- `playwright/specs/admin/reviews-moderation.spec.ts`
- `playwright/specs/api/reviews-moderation.api.spec.ts`
- `playwright/specs/admin/figma-contract.spec.ts`

## API Coverage

- fetch queue với `reviews`, `stats`, pagination/filter semantics
- approve, hide, feature, delete, bulk publish
- validation failures cho bad ids / invalid transitions nếu có
- unauthorized và forbidden paths
- persistence sau mutation
- public/storefront reflection chỉ hiển thị review public hợp lệ

## UI Coverage

- render split layout
- render stats cards
- select review cập nhật context panel
- approve/hide/feature flows
- bulk publish flow
- loading/success/error states
- queue behavior không tự tính business rules ngoài server state

## Figma Gate

- Không final hóa UI test khi `figma-review.md` chưa pass
- Figma selectors phải phản ánh queue, actions, context, stats, bulk publish button

## Gate Rules

- Không final hóa implementation task khi backend ownership chưa explicit
- Assertions nên ưu tiên server-driven visibility/order/state, không verify FE-calculated moderation logic

## Current Expected Status

Các test hiện có thể đang đỏ. Điều đó chấp nhận được trong Phase 1. Chỉ Phase 2 mới có trách nhiệm làm xanh chúng.
