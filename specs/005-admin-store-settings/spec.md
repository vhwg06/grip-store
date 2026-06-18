# Feature Specification: Admin Store Settings

**Feature Branch**: `005-admin-store-settings`
**Created**: 2026-06-17
**Updated**: 2026-06-18
**Status**: Phase 1 source of truth

## Module Intent

Module này chuẩn hóa `Admin / Store Settings` thành spec theo domain, không còn là màn key-value lỏng. Đây là module storefront settings duy nhất cho admin.

Phase split bắt buộc:

- **Phase 1**: chốt use case, spec, figma adaptation review, backend ownership review, current code audit, test definition, task breakdown
- **Phase 2**: triển khai theo tasks của Phase 1, chỉ được bắt đầu khi test đã define xong và được xem là source of truth cho execution

## Actors

- `Admin / Owner`: quản lý cấu hình storefront
- `Visitor / Customer`: nhận kết quả phản ánh từ public site
- `QA / Developer`: dùng spec này để viết test và triển khai

## Route / Screen Inventory

| Route / screen | Purpose | Current state |
|---|---|---|
| `/admin/settings` | Surface quản trị settings cho storefront và legacy controls | đang đọc `settingsMap` từ dashboard, save theo key rời rạc |
| Public header/footer/sticky/floating/homepage surfaces | phản ánh cấu hình public | đang đọc từ nhiều read model khác nhau |

## In Scope

- Brand identity: `shopName`, `shopDescription`, `shopLogo`, `themeColor`
- Contact surface: `stickyBarAddress`, `stickyBarHotline`, `contactEmail`
- Homepage composition: `homepageBlocks[]`, `homepageNewsCount`
- Footer & social: `footerColumns[]`, `footerCopyright`, `socialLinks`
- Floating support actions: `zalo`, `messenger`, `hotline`, `scrollToTop`
- Discovery & visibility: `noIndexEnabled`
- Legacy operational controls còn hiển thị trên page:
  - `checkinEnabled`
  - `checkinReward`
  - `wishlistEnabled`
  - `refundReclaimCards`
  - `registryOptIn`
  - `registryHideNav`

## Out of Scope

- Banner CRUD
- Article CRUD
- Product content/media
- FAQ CRUD
- Notification channel setup
- App code changes trong Phase 1

## Route-Level Use Cases

### Use Case 1: Brand & Contact

Admin cập nhật brand, logo, và contact fields theo grouped save boundaries, sau đó public surfaces phản ánh đúng sau reload.

Acceptance:

1. Admin thấy section `Brand Identity` và `Contact`.
2. Save thành công cập nhật header/footer/sticky bar.
3. Dữ liệu lỗi bị chặn bằng validation rõ ràng.

### Use Case 2: Homepage Composition

Admin đổi block order, enablement, và `homepageNewsCount` bằng structured group thay vì raw text settings.

Acceptance:

1. Homepage blocks hiển thị như structured list, không phải raw textarea.
2. `homepageNewsCount = 0` ẩn section Latest News.
3. Duplicate block key hoặc count âm bị reject.

### Use Case 3: Footer, Social, Floating Support

Admin quản lý footer/social/actions theo cấu trúc nested với target validity và grouped save semantics rõ ràng.

Acceptance:

1. Footer dùng structured columns/links.
2. Social links và floating actions phản ánh đúng target và enablement.
3. Action bật nhưng target invalid bị reject từ backend.

### Use Case 4: Discovery & Visibility

Admin bật/tắt `noIndexEnabled`, `wishlistEnabled`, `checkinEnabled`, `refundReclaimCards`, và chỉnh `checkinReward`.

Acceptance:

1. Public meta/state phản ánh từ server.
2. Reward và feature gating không do FE tự tính.

### Use Case 5: Registry & Legacy Controls

Admin xem trạng thái registry và thao tác các controls legacy còn lại.

Acceptance:

1. Registry được hiển thị như section riêng.
2. Rule khóa `registryHideNav` khi đã join phải do backend áp dụng.

## Current Code Audit

### Current FE admin surface

- `src/app/admin/settings/page.tsx` đang lấy `settingsMap` từ `getAdminDashboard()`.
- Page flatten nhiều key sang props đơn lẻ.
- Save hiện tại phụ thuộc các endpoint `PATCH /api/admin/settings/:key`.
- `shopLogo` vẫn là URL input, chưa có Media Picker.
- `social_links`, `homepage_blocks`, `shop_footer` còn mang tính raw string/blob.

### Current public consumption

- Header đọc `CatalogSettings`.
- Sticky bar, footer, floating buttons đọc `SiteConfig`.
- Chưa có một read model hợp nhất cho storefront settings.

### Gaps discovered

- Chưa có structured contract cho `Store Settings`.
- Save boundary hiện tại là key-level, không phải section-level.
- FE hiện tại bị đẩy vào thế phải hiểu shape rời rạc và fallback behavior.
- Test hiện tại chưa cover validation, persistence, và storefront reflection đầy đủ.

## Figma Adaptation Requirements

Figma của module này chỉ được xem là pass khi:

- Có đủ sections: `Overview`, `Brand Identity`, `Homepage Composition`, `Footer & Social`, `Floating Support`, `Discovery & Visibility`, `Registry & Legacy Controls`
- Save boundary hiển thị rõ theo section group
- `shopLogo` là media selection surface, không phải plain URL textbox
- `homepageBlocks`, `footerColumns`, `socialLinks`, `floatingSupport` là structured editors
- Validation/help/error states có hiện diện rõ
- Figma không để FE phải tự suy diễn workflow chưa có trong use case

Artifact bắt buộc: `specs/005-admin-store-settings/figma-review.md`

## API / Contract Expectations

Admin contract mục tiêu:

- `GET /v1/admin/store-settings`
- `PUT /v1/admin/store-settings/brand`
- `PUT /v1/admin/store-settings/contact`
- `PUT /v1/admin/store-settings/homepage`
- `PUT /v1/admin/store-settings/footer`
- `PUT /v1/admin/store-settings/floating-support`
- `PUT /v1/admin/store-settings/visibility`
- `PUT /v1/admin/store-settings/registry`

Public contract mục tiêu:

- `GET /v1/site-config` hoặc equivalent public projection phải phản ánh cùng source of truth

## Backend Ownership

### Backend owns

- validation cho mọi nested payload
- normalization của key/value legacy sang structured config
- homepage block registry, uniqueness, ordering semantics
- social/floating target validation
- noindex/checkin/wishlist/refund/registry gating semantics
- registry state transitions và rule lock/unlock
- persistence shape
- public storefront reflection contract
- authorization và integrity

### Frontend owns only

- render sections
- local input state trước submit
- submit admin intent vào API
- loading/success/error display
- route navigation
- non-authoritative formatting

Nếu một flow yêu cầu FE tính block order semantics, action validity, hoặc registry business state, module này phải coi là backend gap chứ không được implement ở FE.

## Test Definition

### API tests

Target: `playwright/specs/api/store-settings.api.spec.ts`

Phải cover:

- current state fetch
- valid section mutations
- validation failures
- 401/403
- persistence
- public/storefront reflection
- server-driven derived state

### UI tests

Target: `playwright/specs/admin/store-settings.spec.ts`

Phải cover:

- render đúng section structure
- grouped save boundaries
- media picker surface for `shopLogo`
- submit brand/contact/homepage/footer/support/visibility flows
- loading/success/error handling
- public reflection assertions

### Figma parity

- selectors và section contract tương ứng với UI mới

## Edge Cases

- `shopLogo` rỗng dùng fallback public an toàn
- `stickyBarHotline` rỗng không render hotline cũ
- `footerColumns[]` rỗng dùng fallback/hidden behavior đã chốt từ backend
- `homepageBlocks[]` duplicate bị reject
- `homepageNewsCount < 0` bị reject
- `contactEmail` sai format bị reject
- floating action bật nhưng thiếu target bắt buộc bị reject

## Success Criteria

- Spec này là source of truth cho module `005`
- Figma review cho module này đã qua route-level blocker theo `figma-review.md`, nhưng residual polish gaps không thay đổi ownership hoặc test-first discipline
- Test/UI contract vẫn chỉ được coi là final khi Phase 2 implementation pass toàn bộ test đã define
- Backend ownership explicit trước khi tạo task implement
- Phase 1 output không chứa app code FE/BE
- Phase 2 chỉ bắt đầu khi tests đã define xong và được dùng làm source of truth cho execution
