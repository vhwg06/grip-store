# Admin Module Map

Mục tiêu của tài liệu này là khóa mapping admin theo module/domain, thay cho cách tách spec theo từng screen rời rạc.

Audit Figma theo từng màn được tổng hợp tại:

- `specs/admin-figma-screen-audit.md`
- `specs/admin-figma-fix-checklist.md`
- `specs/admin-figma-gate-status.md`
- `specs/admin-figma-route-requirements.md`

Workflow chuẩn cho mọi module:

`Phase 1: use cases -> spec -> figma adaptation review -> backend ownership review -> check current code -> define tests -> implementation tasks`

`Phase 2: implement from Phase 1 tasks -> pass all defined tests`

Quy tắc cứng:

- FE không sở hữu business/process/calculation logic.
- FE chỉ render state từ server, thu input, submit intent, và hiển thị loading/success/error.
- BE sở hữu validation, normalization, ordering, filtering/search semantics, derived values, state transitions, persistence, storefront reflection, permission, và integrity/concurrency rules.
- Phase 1 không xuất FE code hoặc BE code.
- Phase 2 chỉ được bắt đầu khi artifact Phase 1 của module đã chốt xong.
- Trong Phase 2, test được define từ Phase 1 là source of truth cho execution.
- Figma khóa UI patterns, components, layout/state presentation, và CTA hierarchy cho route trong scope.
- Spec, use cases, và tests khóa behavior; Figma không được dùng để định nghĩa business logic, validation rules, hay ownership.

## Rollout Order

1. `005-admin-store-settings`
2. `006-admin-reviews`
3. `009-admin-order-ops`
4. `008-admin-catalog-ops`
5. `007-admin-content-ops`
6. `010-admin-user-engagement-ops`

## Module Inventory

| Module | Figma gate | Admin routes / screens | Purpose | Primary use cases | Current code anchors | Likely backend owner | Likely endpoints | Target Playwright files | Phase 1 output |
|---|---|---|---|---|---|---|---|---|---|
| `005-admin-store-settings` | `PASS WITH GAPS` | `/admin/settings` | Quản trị storefront-facing configuration và legacy toggles | brand, contact, homepage composition, footer/social, floating support, discovery, registry | `src/app/admin/settings/page.tsx`, `src/adapters/api/admin.api.ts:getAdminDashboard`, `src/components/layout/*` | settings/config usecase + admin controller | `/v1/admin/store-settings`, `/v1/site-config` | `playwright/specs/admin/store-settings.spec.ts`, `playwright/specs/api/store-settings.api.spec.ts` | use cases, spec, contracts, figma-review, backend ownership review, current code audit, test-plan, implementation tasks |
| `006-admin-reviews` | `PASS WITH GAPS` | `/admin/reviews` | Kiểm duyệt review và phản ánh review public theo server state | queue moderation, bulk publish, featured ordering, attachment/context review | `src/app/admin/reviews/page.tsx`, `src/adapters/api/admin.api.ts:getAdminReviews`, public reviews hooks | reviews moderation usecase + catalog/public projection | `/v1/admin/reviews`, `/v1/catalog/products/:id/reviews` | `playwright/specs/admin/reviews-moderation.spec.ts`, `playwright/specs/api/reviews-moderation.api.spec.ts`, `playwright/specs/admin/figma-contract.spec.ts` | use cases, spec, contracts, figma-review, backend ownership review, current code audit, test-plan, implementation tasks |
| `007-admin-content-ops` | `PASS WITH GAPS` | `/admin/media`, `/admin/banners`, `/admin/articles`, `/admin/faqs`, about-us/content flows | CMS content operations và media reuse | media library, banner CRUD, article CRUD, about content, FAQ, shared media picker | `src/app/admin/media/page.tsx`, `src/app/admin/banners/page.tsx`, `src/app/admin/articles/page.tsx`, `src/app/admin/faqs/page.tsx` | content/media usecases + admin controller | `/v1/admin/media`, `/v1/admin/banners`, `/v1/admin/articles`, `/v1/admin/faqs`, public content endpoints | existing `playwright/specs/admin/media-management.spec.ts` to be decomposed, plus content/admin specs | use cases, spec, contracts, figma-review, backend ownership review, current code audit, test-plan, implementation tasks |
| `008-admin-catalog-ops` | `PASS WITH GAPS` | `/admin/products`, `/admin/product/new`, `/admin/product/edit/[id]`, `/admin/categories`, cards routes | Catalog editing và catalog publishing controls | product CRUD, categories, product content sync, media/content within catalog boundary, card sync if still catalog-owned | `src/app/admin/products/page.tsx`, `src/app/admin/product/**`, `src/app/admin/categories/page.tsx` | product/catalog usecases + cards/inventory usecases | `/v1/admin/products`, `/v1/admin/categories`, cards endpoints | `playwright/specs/admin/products.spec.ts` plus new catalog-op specs | use cases, spec, contracts, figma-review, backend ownership review, current code audit, test-plan, implementation tasks |
| `009-admin-order-ops` | `PASS WITH GAPS` | `/admin/orders`, `/admin/orders/[id]`, `/admin/refunds` | Order lifecycle và refund moderation | order list/detail, status transitions, refund approval/rejection, derived totals/status labels | `src/app/admin/orders/**`, `src/app/admin/refunds/page.tsx` | order/refund usecases + admin controller | `/v1/admin/orders`, `/v1/admin/refunds` | `playwright/specs/admin/orders.spec.ts` plus order-op API specs | use cases, spec, contracts, figma-review, backend ownership review, current code audit, test-plan, implementation tasks |
| `010-admin-user-engagement-ops` | `PASS WITH GAPS` | active: `/admin/users`, `/admin/messages`, `/admin/notifications`; parked from current Figma-reviewed active scope: `/admin/leads`, `/admin/announcement`, `/admin/collect`, `/admin/profile`, `/admin/data` | User moderation và communication controls | user moderation, broadcast/messages, notification config | `src/app/admin/users/page.tsx`, `messages/page.tsx`, `notifications/page.tsx`, `leads/page.tsx`, `announcement/page.tsx`, `collect/page.tsx`, `profile/page.tsx`, `data/page.tsx` | users/messages/notifications usecases | `/v1/admin/users`, `/v1/admin/messages`, `/v1/admin/notifications` | split user-engagement specs for users/messages/notifications, plus supporting API/integration coverage | use cases, spec, contracts, figma-review, backend ownership review, current code audit, test-plan, implementation tasks |

## Phase Rule

### Phase 1

- chốt đủ artifact product/behavior:
  - use cases
  - spec
  - backend ownership review
  - figma adaptation review
  - current code audit
- chốt đủ artifact test definition:
  - API tests
  - E2E tests
  - integration tests
  - UI / route workflow tests
  - nếu cần: Figma parity / visual contract assertions
- chốt đủ artifact implementation backlog:
  - FE tasks
  - BE tasks
  - DB migration tasks
  - contract / API tasks
  - test implementation tasks
  - nếu cần: seed / fixture / data repair tasks
- không sửa app code FE/BE
- tasks phải đủ cụ thể để implementer Phase 2 không phải tự suy luận scope hay ownership

### Phase 2

- chỉ lấy input đã khóa từ Phase 1 làm backlog thực thi:
  - spec
  - use cases
  - defined tests
  - FE tasks
  - BE tasks
  - DB migration tasks
  - contract tasks
- implement backend trước các phần business logic / contract / persistence
- implement frontend sau, chỉ trong phạm vi render, form wiring, API integration
- chỉ complete khi pass toàn bộ test đã define ở Phase 1

## Route Coverage Gaps

Current route-level Figma blockers have been cleared for modules `005` through `010`.

Residual work is now polish-level rather than missing-screen coverage:

- denser control/state detail on already-strong screens
- tighter parity between route-level Figma states and future Playwright assertions
- continued discipline that spec/tests remain authoritative over visual intent

See `specs/admin-figma-screen-audit.md` and `specs/admin-figma-gate-status.md` for the current route-level status.

## Decomposition Rule For `004`

`004-admin-media-management` không còn là active source of truth cho work mới.

- Storefront settings chuyển sang `005-admin-store-settings`
- Review moderation giữ ở `006-admin-reviews`
- Media, banners, articles, about-us content, FAQs chuyển sang `007-admin-content-ops`
- Product content/media nằm trong catalog editing chuyển sang `008-admin-catalog-ops`

`004` chỉ còn vai trò historical reference cho những use case chưa di trú xong.
