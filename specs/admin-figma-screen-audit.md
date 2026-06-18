# Admin Figma Screen Audit

Audit date: 2026-06-18

Purpose:

- review từng màn admin trong Figma bằng evidence thật
- đối chiếu trực tiếp với use case đã khóa trong `/specs/005` → `/specs/010`
- chỉ ra màn nào thật sự adapt workflow, màn nào mới dừng ở intent/overview

Review basis:

- Figma file: `GRIP-Website Design`
- Page reviewed: `Admin CMS - Media Workflows`
- Method: inspect live frame text/content, not infer from spec
- Screenshot exports: `/tmp/figma-audit/*.png`
- Figma evidence is used only to lock UI patterns/components/layout/state presentation.
- Business behavior, validation, permissions, and ownership still come from use cases, spec, and defined tests.

Page coverage proof:

- Figma file currently has 3 pages total:
  - `Design`
  - `Component`
  - `Admin CMS - Media Workflows`
- Only one page is admin-scoped in the current file: `Admin CMS - Media Workflows`
- This audit reviewed the active admin page, so the admin-screen review scope is complete for the current file state

Code route coverage proof:

- Actual admin code routes were checked from `src/app/admin/**`
- The current Figma audit covers the admin screens present on the only admin-scoped page in the Figma file
- That does **not** mean every real code route has a dedicated Figma screen

Follow-up fix checklist:

- `specs/admin-figma-fix-checklist.md`
- `specs/admin-figma-route-requirements.md`

Verdict scale:

- `Strong`: screenshot shows real operator controls, state surfaces, and save/action boundaries for the main workflow
- `Partial`: screen has some real workflow surfaces, but still leaves important route/state behavior implicit
- `Weak`: mostly directional/summary; boxes and labels name the concern but do not actually adapt the workflow
- `Missing`: no frame found for the scoped use case

## Screen Inventory

| Frame | Node ID | Module | Route intent | Verdict | Why |
|---|---|---|---|---|---|
| `Admin / Store Settings` | `282:10564` | `005` | `/admin/settings` | `Strong` | đã có grouped save boundaries, logo media-pick intent, structured nested-setting cards, validation blocker note, và section-level storefront impact cues đủ cho route workflow |
| `Admin / Reviews` | `281:10106` | `006` | `/admin/reviews` | `Strong` | có queue thật, status, warning, verified state, action panel, context panel, bulk CTA |
| `Admin / Media Management` | `280:9648` | `007` | `/admin/media` | `Strong` | có upload, guard rails, search/filter, grid, selected asset inspector, usage protection |
| `Admin / Banner Management` | `281:9793` | `007` | `/admin/banners` | `Strong` | có target page, media pick, preview, empty rules, sort order, active state |
| `Admin / Article Management` | `281:9794` | `007` | `/admin/articles` | `Strong` | có list, draft/published state, slug, excerpt, editor, featured media pick, publish CTA |
| `Admin / Article Create` | `285:5744` | `007` | `/admin/article/new` | `Strong` | có create-state riêng, draft-first CTA, publish prerequisites, và route-level distinction khỏi edit |
| `Admin / Article Edit` | `285:5809` | `007` | `/admin/article/edit/[id]` | `Strong` | có loaded edit-state, save-update intent, loading/not-found language, và route-specific edit evidence |
| `Admin / Product Media & Content` | `281:9795` | `007` / `008` boundary | product content/media flow | `Strong` | content/media handoff rõ, có gallery order, preview rules, save boundary cho content |
| `Admin / About-Us Content` | `281:9796` | `007` | about content flow | `Strong` | có editor, gallery, reorder, empty-gallery rule, tách khỏi banner management |
| `Admin / Shared Media Picker Modal` | `281:9942` | `007` | shared picker infra | `Strong` | caller fields cụ thể, search, select, upload inline, delete guard |
| `Admin / FAQ Management` | `284:5537` | `007` | `/admin/faqs` | `Strong` | có list, search, active/draft split, edit panel, reorder/save affordance, validation note, public-state note |
| `Admin / Products` | `281:9998` | `008` | `/admin/products` | `Strong` | đã có search/filter row, row cards, concrete row CTAs, loading/empty/error states, guard signals, và cards-route handoff đủ cho route workflow |
| `Admin / Product Create` | `285:5602` | `008` | `/admin/product/new` | `Strong` | có create-state riêng, pre-publish checks, group boundaries, và route-level differentiation khỏi edit flow |
| `Admin / Product Editor` | `281:10376` | `008` | `/admin/product/edit/[id]` | `Strong` | đã có loaded edit-state, field blocks, media preview, blocked publish, route-safe fallback, và grouped save controls đủ cho route workflow |
| `Admin / Cards Workflow` | `285:5658` | `008` | `/admin/cards/[id]` | `Strong` | có product context, pull/map/conflict/publish steps, duplicate/integrity checks, và publish boundary rõ |
| `Admin / Categories` | `281:10268` | `008` | `/admin/categories` | `Strong` | đã có search/tree rows, move up/down controls, save boundary, duplicate-slug validation, empty state, và explicit reorder semantics |
| `Admin / Orders` | `281:10025` | `009` | `/admin/orders` | `Strong` | đã có search/filter row, row cards, concrete CTAs, blocked-action language, export scope, loading/empty/error states, và row-to-detail handoff đủ cho route workflow |
| `Admin / Refunds` | `281:10052` | `009` | `/admin/refunds` | `Strong` | đã có queue, evidence card, approve/reject controls, admin note boundary, reclaim semantics, và error-state language đủ cho decision workflow |
| `Admin / Order Detail` | `281:10349` | `009` | `/admin/orders/[id]` | `Strong` | đã có read context, blocked mutation state, note box, save action, timeline split, và fallback language đủ cho detail workflow |
| `Admin / Users` | `281:10079` | `010` | `/admin/users` | `Strong` | đã có search, row cards, adjust/detail CTAs, risk/error note, và loading state đủ cho moderation workflow |
| `Admin / Messages` | `281:10133` | `010` | `/admin/messages` | `Strong` | đã có audience field, title field, preview/confirm CTAs, scheduled state, history split, và invalid-send blocker |
| `Admin / Notifications` | `281:10160` | `010` | `/admin/notifications` | `Strong` | đã có channel config field, per-channel test CTA, failure note, và edit-state guidance đủ cho route workflow |
| `Admin / Announcement` | `281:10187` | `010` | `/admin/announcement` | `Strong` | đã có headline field, queue separation, preview CTA, schedule/publish blocker, và composer-route evidence |
| `Admin / Data Management` | `281:10214` | `010` | `/admin/data` | `Strong` | đã có dry-run/import CTAs, conflict blocker, rollback note, và irreversible-action boundaries đủ cho risky tool workflow |
| `Admin / Collect` | `281:10241` | `010` | `/admin/collect` | `Strong` | đã có grouped payment fields, validation blocker, preview tie-in, và save boundary cues đủ cho route workflow |
| `Admin / Leads` | `281:10295` | `010` | `/admin/leads` | `Strong` | đã có row card, assign/create-order CTAs, owner/status lifecycle note, và conversion handoff đủ cho lead workflow |
| `Admin / Profile` | `281:10322` | `010` | `/admin/profile` | `Strong` | đã có identity field, password CTA, session-review note, và security/read-context split đủ cho route workflow |

## Route Coverage Mismatches

The following routes exist in code but do not have dedicated Figma screens evidenced on the current admin Figma page:

| Code route | Current Figma coverage | Gap type |
|---|---|---|
| `/admin` | code redirects directly to `/admin/settings` | `No dedicated screen required` |
| `/admin/article/new` | covered by `Admin / Article Create` | `Covered` |
| `/admin/article/edit/[id]` | covered by `Admin / Article Edit` | `Covered` |
| `/admin/product/new` | covered by `Admin / Product Create` | `Covered` |
| `/admin/cards/[id]` | covered by `Admin / Cards Workflow` | `Covered` |

Interpretation:

- `/admin` is not a real dashboard workflow in code today; it redirects to `/admin/settings`, so no separate frame is required.
- `NewArticlePage` and `EditArticlePage` are distinct code routes using `ArticleForm`, but the current Figma evidence is still one combined management/editor screen rather than route-specific create/edit screens.
- `NewProductPage` is a distinct code route using `ProductForm`, but no dedicated create-product screen was found in Figma.
- `CardsPage` is a distinct code route using `CardsContent`, but no dedicated cards workflow frame was found in Figma.

## Phase 1 Output Reminder

This audit is only one Phase 1 artifact.

It does not replace:

- use cases
- spec
- backend ownership review
- current code audit
- test definitions
- implementation tasks

Figma may lock UI contract for a route in scope, but it never locks business behavior.

## Screenshot Evidence

- [store-settings.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/store-settings.png)
- [store-settings-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/store-settings-updated.png)
- [reviews.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/reviews.png)
- [media-management.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/media-management.png)
- [banner-management.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/banner-management.png)
- [article-management.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/article-management.png)
- [article-create-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/article-create-added.png)
- [article-edit-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/article-edit-added.png)
- [product-media-content.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-media-content.png)
- [about-us-content.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/about-us-content.png)
- [shared-media-picker.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/shared-media-picker.png)
- [products.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/products.png)
- [products-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/products-updated.png)
- [product-editor.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-editor.png)
- [product-editor-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-editor-updated.png)
- [product-create-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-create-added.png)
- [cards-workflow-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/cards-workflow-added.png)
- [categories.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/categories.png)
- [categories-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/categories-updated.png)
- [orders.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/orders.png)
- [orders-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/orders-updated.png)
- [orders-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/orders-stronger.png)
- [refunds.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/refunds.png)
- [refunds-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/refunds-updated.png)
- [refunds-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/refunds-stronger.png)
- [order-detail.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/order-detail.png)
- [order-detail-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/order-detail-updated.png)
- [order-detail-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/order-detail-stronger.png)
- [users.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/users.png)
- [users-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/users-updated.png)
- [messages.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/messages.png)
- [messages-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/messages-updated.png)
- [notifications.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/notifications.png)
- [announcement.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/announcement.png)
- [data-management.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/data-management.png)
- [collect.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/collect.png)
- [leads.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/leads.png)
- [profile.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/profile.png)

## Visual Confirmation

Direct screenshot inspection reinforces the verdicts above:

- `Store Settings` is no longer skeletal:
  - grouped save boundaries are visible
  - logo/media-pick intent is explicit
  - nested settings are represented as structured cards
  - visibility/registry workflow is visible
- `Products` is no longer just a summary board:
  - visible search field and status chips
  - explicit product rows with CTAs
  - separate loading, empty-result, and inline error surfaces
  - clear cards-route handoff
- `Orders` is no longer just a summary board:
  - visible search field and status chips
  - explicit queue rows with concrete CTAs
  - disabled-action language on unpaid row
  - separate loading, empty-result, export-scope, and inline error surfaces
- `Users` no longer collapses into a text shell:
  - search plus row cards are visible
  - moderation actions are concrete
  - risk and error treatment are separated from the mutation controls
- `Messages`, `Notifications`, `Announcement`, `Data`, `Collect`, `Leads`, and `Profile` have moved beyond shell pattern:
  - compose or row actions are concrete
  - send/test/confirm/assign/import actions are explicit
  - validation and risk blockers are visible
  - route-specific review or preview surfaces are now present
- `Reviews` is the clear counterexample:
  - queue items rendered as real moderation cards
  - action buttons rendered with distinct priority
  - context area rendered as a real inspection panel
- `Media`, `Banner`, `About-Us`, `Shared Media Picker`, and `Product Media & Content` are the other clear counterexamples:
  - visible search/upload/select controls
  - real preview surfaces
  - actual save/choose/replace boundaries
  - route-specific workflow information rather than only named concerns
- `Products`, `Categories`, and `Product Editor` have now also crossed the route-level threshold:
  - list rows and list-state handling are explicit
  - category reorder/save semantics are visible
  - editor fields, grouped saves, and blocked publish cues are no longer only narrative text
- `Article Create` and `Article Edit` now also count as route-specific evidence:
  - create-state is separated from loaded edit-state
  - route-safe loading/not-found/save behavior is now named in-frame
- `Categories`, `Refunds`, and `Order Detail` have moved beyond pure shell summaries:
  - search/filter intent is visible
  - decision/order/note semantics are more explicit
  - they still need more concrete control-level panels before being called `Strong`

This matters because some text-node scans can sound richer than the actual layout. The screenshots confirm that several screens are still mostly conceptual shells rather than adapted operator workflows.

## Per-Screen Notes

### `005` Store Settings

- Figma đã qua route-blocker level cho `/admin/settings`.
- Nó đã chứng minh grouped save boundaries, media-pick intent, nested-setting groups, và validation blockers ở cùng một route surface.
- FE vẫn không được tự bịa business behavior; spec/test vẫn là nguồn sự thật cho normalization và public reflection.

### `006` Reviews

- Đây là màn đáng tin nhất trong cả bộ admin.
- Có evidence đủ để nói Figma đã hiểu moderation job flow.

Still missing:

- featured ordering interaction
- selection mechanics chi tiết
- failed-action states

### `007` Content Ops

Màn mạnh:

- `Media Management`
- `Banner Management`
- `Article Management`
- `About-Us Content`
- `Shared Media Picker`

Boundary note:

- `Product Media & Content` tốt cho content slice, nhưng không thay thế catalog editor.

Hard gap cũ đã được gỡ:

- `FAQ` hiện đã có frame riêng và không còn là route `Missing`

### `008` Catalog Ops

Màn mạnh:

- `Products`
- `Product Create`
- `Product Editor`
- `Categories`
- `Cards Workflow`
- `Product Media & Content`

Main read:

- module này đã qua blocker level ở mọi route chính
- residual gap còn lại là polish/density, không còn là thiếu route workflow proof

### `009` Order Ops

Màn mạnh:

- `Orders`
- `Refunds`
- `Order Detail`

Main read:

- module này đã qua mức blocker ở route level
- residual gap còn lại là density/polish của operator surface, không còn là thiếu workflow proof

### `010` User Engagement Ops

Màn mạnh:

- `Users`
- `Messages`
- `Notifications`
- `Announcement`
- `Data Management`
- `Collect`
- `Leads`
- `Profile`

Main read:

- module này đã qua blocker level ở mọi route chính
- residual gap còn lại là polish/density, không còn là thiếu route workflow proof

## Overall Conclusion

Nếu nói “đống Figma này đã adapt use case admin tốt” thì không đúng.

Thực tế gần hơn là:

- chỉ một nhóm nhỏ đã adapt tốt thật: `Reviews`, `Media`, `Banners`, `Articles`, `Product Media & Content`, `About-Us`, `Shared Media Picker`
- một số màn có direction đúng nhưng vẫn mới ở mức nửa đường: residual polish vẫn còn ở `Store Settings`, `Products`, `Product Editor`, `Categories`, `Users`, `Messages`, `Notifications`, `Announcement`, `Collect`, `Profile`, `Data`, `Leads`
- một số màn đã qua blocker level nhưng vẫn còn residual polish gaps: `Orders`, `Refunds`, `Order Detail`
- hard gap về route coverage đã giảm rõ; `FAQ` không còn là màn thiếu

Implication for Phase 1:

- spec/tests phải tiếp tục là source of truth cho các màn `Weak`/`Partial`
- không được dùng Figma làm lý do để FE tự phát minh workflow
- module chỉ nên coi là fully Figma-adapted khi tất cả route-level screens trong scope đạt ít nhất `Strong`
- [faqs-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/faqs-added.png)
