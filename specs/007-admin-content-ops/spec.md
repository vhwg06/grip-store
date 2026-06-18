# Feature Specification: Admin Content Operations

**Feature Branch**: `007-admin-content-ops`
**Created**: 2026-06-18
**Status**: Phase 1 source of truth

## Module Intent

Module này gom toàn bộ content/media workflows không thuộc storefront settings hay catalog core:

- media library
- banners
- articles
- about-us content
- FAQs
- shared media picker

Phase split bắt buộc:

- **Phase 1**: chốt use cases, figma review, backend ownership, current code audit, test definition, tasks
- **Phase 2**: implement theo tasks Phase 1, với test là source of truth

## Actors

- `Admin / Content Operator`
- `Visitor / Customer`
- `QA / Developer`

## Route / Screen Inventory

| Route / screen | Purpose | Current state |
|---|---|---|
| `/admin/media` | media library + shared asset reuse | page riêng đã tồn tại |
| `/admin/banners` | banner management | page và component đã tồn tại |
| `/admin/articles` | article list/admin CRUD | page đã tồn tại |
| `/admin/article/new` | article create | route đã tồn tại |
| `/admin/article/edit/[id]` | article edit | route đã tồn tại |
| `/admin/faqs` | FAQ CRUD | page đã tồn tại |
| about-us / content inside settings or dedicated content flow | about content + gallery | chưa tách rõ module boundary trong spec hiện tại |

## In Scope

- media library CRUD, copy URL, picker reuse
- banners CRUD và ordering
- article CRUD + publish/unpublish
- about-us content + gallery
- FAQ CRUD
- shared media selection surface cho content forms

## Out of Scope

- storefront settings thuộc `005`
- review moderation thuộc `006`
- product/category core CRUD thuộc `008`
- user/order/refund flows
- app code changes trong Phase 1

## Route-Level Use Cases

### Use Case 1: Media Library Reuse

Admin upload, browse, copy, select, và delete media assets với usage protection.

### Use Case 2: Banner Management

Admin quản lý banner theo page target, ordering, active state, và public reflection.

### Use Case 3: Article Operations

Admin tạo/sửa/xóa/publish article, chọn featured image từ media library, và public news pages phản ánh đúng.

### Use Case 4: About-Us Content

Admin cập nhật rich content và gallery của about-us page từ cùng media system.

### Use Case 5: FAQ Operations

Admin tạo/sửa/xóa/toggle/reorder FAQs phản ánh ra contact/public surfaces.

## Current Code Audit

### Current FE surface

- `/admin/media`, `/admin/banners`, `/admin/articles`, `/admin/faqs` đã có pages riêng.
- `MediaLibrary` và media upload flow đã tồn tại ở mức nào đó.
- `useAdminArticles`, `useAdminBanners`, `useAdminFAQs`, `useAdminMedia` hooks đã tồn tại.
- `playwright/specs/admin/media-management.spec.ts` đang gộp lẫn media + banners + article-related expectations.

### Current contract visibility

- `src/adapters/api/media.api.ts` đã có media list/presign/register/delete flows.
- `src/adapters/api/admin.api.ts` đã có admin articles/banners/faqs reads và mutations liên quan.
- Public content adapters hiện còn phân tán ở `articles.api.ts`, `faq.api.ts`, `banners.api.ts`.

### Gaps discovered

- boundary giữa content-ops và settings/catalog còn bị trộn từ spec `004`
- chưa có module-level spec riêng cho articles/banners/media/about/faqs
- test hiện tại chưa tách theo subdomain, khó dùng làm source of truth cho implementation
- shared media picker contract chưa được module hóa rõ

## Figma Adaptation Requirements

Figma cho module này phải được review theo `gpt-taste` protocol nhưng vẫn giữ visual language admin hiện hữu:

- hierarchy rõ giữa media hub, banner ops, article ops, FAQ ops
- forms và tables không cramped; spacing đủ để scan nhanh
- no cheap meta-labels kiểu `SECTION 01`
- CTA primary/secondary rõ, không lẫn save/delete/publish
- media previews, picker surfaces, and content editors phải có save boundaries rõ
- article editor/about editor phải có clear publish state and validation/error representations

Artifact bắt buộc: `specs/007-admin-content-ops/figma-review.md`

## API / Contract Expectations

- `/v1/admin/media`
- `/v1/admin/media/presign`
- `/v1/admin/media/register`
- `/v1/admin/media/:id`
- `/v1/admin/banners`
- `/v1/admin/articles`
- `/v1/admin/faqs`
- public content endpoints for banners/articles/faqs/about projection

## Backend Ownership

### Backend owns

- media validation, MIME/size acceptance, usage protection
- banner ordering semantics
- article publish/unpublish state transitions
- slug normalization/uniqueness
- FAQ ordering and active-state projection
- about-us persistence shape and public projection
- asset reference integrity
- authorization and concurrency/integrity checks

### Frontend owns only

- render library/forms/tables/editors
- local input state before submit
- submit content intent
- loading/success/error states
- route navigation
- non-authoritative preview formatting

## Test Definition

### API tests

- media CRUD and failure cases
- banners CRUD, ordering, activation
- article CRUD, publish/unpublish, public reflection
- faq CRUD, toggle, ordering
- about content persistence and public reflection
- authorization/validation failures

### UI tests

- media library upload/copy/select/delete flows
- banners admin flows
- articles admin flows
- faqs admin flows
- public content reflections

### Figma parity

- selectors and screen structure for major content/admin routes

## Edge Cases

- media delete blocked when asset in use
- article draft inaccessible publicly
- empty banner sets require page-specific fallback behavior
- about gallery empty state hides gallery section
- faq inactive items excluded from public projection

## Success Criteria

- `004` content scope is fully represented here for future work
- Figma review for this module now includes a dedicated FAQ route frame; remaining gaps are no longer route-missing blockers
- UI contract is materially stronger after FAQ adaptation plus dedicated article create/edit route frames; remaining gaps are validation/detail depth rather than missing route coverage
- Backend ownership explicit before tasks are considered implementation-ready
- Phase 1 output contains no FE/BE implementation code
- Phase 2 chỉ được bắt đầu từ tasks đã chốt ở Phase 1
- Phase 2 chỉ complete khi toàn bộ test đã define pass
