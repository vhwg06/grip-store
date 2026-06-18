# Admin Figma Route Requirements

Status date: 2026-06-18

Purpose:

- nối thẳng từ route code thật sang frame Figma cần có
- xóa vùng xám giữa “có màn cùng domain” và “đã có màn đúng route/workflow”

Inputs:

- `src/app/admin/**`
- `specs/admin-figma-screen-audit.md`
- `specs/admin-figma-fix-checklist.md`

Rule:

- nếu route trong code có workflow riêng, Figma phải có frame riêng hoặc phải có bằng chứng rất rõ rằng route đó được cover đầy đủ trong một frame khác
- một frame domain-level không tự động coi là đủ cho create/edit/detail routes nếu save boundary, empty state, loading state, or route-specific behavior khác nhau
- Figma route requirements chỉ khóa UI contract.
- Use cases, spec, và defined tests mới khóa behavior, validation, permissions, và ownership.

## Route Matrix

| Code route | Current code behavior | Current Figma coverage | Requirement |
|---|---|---|---|
| `/admin` | redirect sang `/admin/settings` | no dedicated frame required | không cần frame dashboard riêng nếu redirect behavior giữ nguyên |
| `/admin/settings` | settings workflow riêng | covered by `Admin / Store Settings` | giữ frame và verify section/group/media-pick/validation semantics không regress |
| `/admin/reviews` | moderation queue riêng | covered by `Admin / Reviews` | giữ frame, bổ sung gap chi tiết |
| `/admin/media` | media library riêng | covered by `Admin / Media Management` | giữ frame |
| `/admin/banners` | banner CRUD riêng | covered by `Admin / Banner Management` | giữ frame |
| `/admin/articles` | article management list/editor | covered by `Admin / Article Management` | giữ frame |
| `/admin/article/new` | create route dùng `ArticleForm` | covered by `Admin / Article Create` | giữ frame create-state và verify draft/publish boundary |
| `/admin/article/edit/[id]` | edit route load article rồi dùng `ArticleForm article={...}` | covered by `Admin / Article Edit` | giữ frame edit-state và verify loading/not-found/save-state evidence |
| `/admin/faqs` | FAQ CRUD route riêng | covered by `Admin / FAQ Management` | giữ frame FAQ và verify route-level save/reorder/validation semantics |
| `/admin/product/new` | create route dùng `ProductForm` | covered by `Admin / Product Create` | giữ frame create-product và verify create-state/loading semantics |
| `/admin/product/edit/[id]` | edit route load product rồi render `ProductForm product={...}` | covered by `Admin / Product Editor` | giữ frame và verify edit-state/loading/not-found/grouped-save semantics không regress |
| `/admin/products` | products list route riêng | covered by `Admin / Products` | giữ frame và verify list/filter/row-action/list-state semantics không regress |
| `/admin/categories` | category workflow riêng | covered by `Admin / Categories` | giữ frame và verify tree/reorder/save/validation semantics không regress |
| `/admin/cards/[id]` | cards workflow riêng qua `CardsContent` | covered by `Admin / Cards Workflow` | giữ frame cards workflow và verify import/conflict/publish states |
| `/admin/orders` | orders list route riêng | covered by `Admin / Orders` | giữ frame và verify queue/detail/export/list-state semantics không regress |
| `/admin/orders/[id]` | order detail route riêng | covered by `Admin / Order Detail` | giữ frame |
| `/admin/refunds` | refund workflow riêng | covered by `Admin / Refunds` | giữ frame refund workflow |
| `/admin/users` | user moderation route riêng | covered by `Admin / Users` | giữ frame và verify moderation/detail/risk-state semantics không regress |
| `/admin/messages` | message compose/history route riêng | covered by `Admin / Messages` | giữ frame và verify audience/preview/confirm semantics không regress |
| `/admin/notifications` | notification config route riêng | covered by `Admin / Notifications` | giữ frame và verify channel edit/test/failure semantics không regress |
| `/admin/announcement` | announcement route riêng | frame exists but not in current `010` active Figma-reviewed scope | parked khỏi active scope hiện tại; không dùng làm gate evidence cho package Phase 1 này |
| `/admin/collect` | collect/payment config route riêng | frame exists but not in current `010` active Figma-reviewed scope | parked khỏi active scope hiện tại; không dùng làm gate evidence cho package Phase 1 này |
| `/admin/profile` | profile/security route riêng | frame exists but not in current `010` active Figma-reviewed scope | parked khỏi active scope hiện tại; không dùng làm gate evidence cho package Phase 1 này |
| `/admin/data` | data tools route riêng | frame exists but not in current `010` active Figma-reviewed scope | parked khỏi active scope hiện tại; không dùng làm gate evidence cho package Phase 1 này |
| `/admin/leads` | lead route riêng | frame exists but not in current `010` active Figma-reviewed scope | parked khỏi active scope hiện tại; không dùng làm gate evidence cho package Phase 1 này |

## Frames Recently Added

- `Admin / FAQ Management`
- `Admin / Product Create`
- `Admin / Cards Workflow`

## Frames That Must Be Split Or Strengthened

- `Admin / Article Management`
  - keep management/list/editor frame for domain overview
- `Admin / Article Create`
  - keep dedicated create-state evidence
- `Admin / Article Edit`
  - keep dedicated edit/loading/not-found/save-state evidence
- `Admin / Product Editor`
  - keep current edit frame
  - separate create-state frame now exists; keep edit-only semantics clear
- `Admin / Orders`
  - keep queue rows, blocked actions, export scope, and list-state surfaces explicit

## Why This Matters

Without this route-level check, a broad admin frame can hide real gaps:

- create vs edit
- detail vs list
- route-specific loading/not-found
- route-specific save boundaries
- route-specific destructive actions

That is exactly how a Figma file can look “covered enough” at domain level while still failing the real use cases in code.
