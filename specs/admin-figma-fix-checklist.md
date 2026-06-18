# Admin Figma Fix Checklist

Checklist date: 2026-06-18

Purpose:

- chuyển kết quả review Figma thành checklist sửa cụ thể theo từng màn
- chỉ ra điều kiện tối thiểu để một màn từ `Weak` / `Partial` / `Missing` lên mức đủ adapt use case

Related audit:

- `specs/admin-figma-screen-audit.md`

Pass rule:

- một màn chỉ được coi là Figma-adapted khi checklist của chính màn đó được đáp ứng
- nếu thiếu item nào làm FE phải tự suy diễn workflow, màn đó vẫn fail gate
- box + text labels + một CTA không đủ để gọi là adapted

## `005` Store Settings

### `Admin / Store Settings` (`282:10564`)

Current verdict: `Strong`

Must add:

- [x] section `Discovery & Visibility`
- [x] section `Registry & Legacy Controls`
- [x] media picker surface cho `shopLogo`
- [x] structured editor cho `homepageBlocks[]`
- [x] structured editor cho `footerColumns[]`
- [x] structured editor cho `socialLinks`
- [x] structured editor cho floating support actions
- explicit validation/help/error states cho:
  - [x] invalid email
  - [x] duplicate homepage block
  - [x] negative `homepageNewsCount`
  - [x] enabled support action without valid target
- [x] grouped save boundaries theo section, không chỉ một CTA global
- [x] public reflection note cho từng nhóm setting có side effect rõ

Must prove in UI:

- admin biết đang sửa section nào
- admin biết save sẽ ảnh hưởng public surface nào
- FE không phải tự nghĩ structure từ heading trống

## `007` Content Ops

### `FAQ` frame

Current verdict: `Strong`

Implemented in dedicated frame for `/admin/faqs`:

- [x] FAQ list
- [x] create/edit form
- [x] active toggle
- [x] reorder surface
- [x] delete action
- [x] empty-state language
- [x] validation state
- [x] save boundary
- [x] public reflection note

Must prove in UI:

- FAQ là workflow riêng, không bị ngầm assume từ article/content screens

## `008` Catalog Ops

### `Admin / Products` (`281:9998`)

Current verdict: `Strong`

Must add:

- [x] visible filter/search controls
- row selection or explicit statement that bulk ops are out of scope
- [x] row-level actions with clear priority:
  - [x] edit
  - [x] toggle visibility
  - [x] delete
  - [x] open cards flow
- [x] empty state
- [x] loading/error state
- guard state for:
  - [x] missing image
  - [x] invalid price
  - [x] low stock
  - [x] missing category
- if reorder is in scope: dedicated reorder affordance and save semantics

Must prove in UI:

- operator can manage product list without FE inventing hidden workflow steps

### `Admin / Product Create`

Current verdict: `Strong`

Implemented:

- [x] dedicated create-state frame
- [x] create-specific pre-publish checks
- [x] clear separation from edit route
- [x] grouped route sections

### `Admin / Cards Workflow`

Current verdict: `Strong`

Implemented:

- [x] product-linked context
- [x] pull / map / conflict / publish flow
- [x] integrity checks
- [x] publish boundary

### `Admin / Categories` (`281:10268`)

Current verdict: `Strong`

Must add:

- [x] hierarchy/tree or explicit flat-order model
- [x] reorder affordance
- [x] edit/create panel with save boundary
- [x] visible empty-state behavior
- [x] validation state for duplicate slug
- [x] visibility toggle behavior
- banner-link dependency/error state if still in scope

Must prove in UI:

- category order/integrity workflow is visible instead of only named

### `Admin / Product Editor` (`281:10376`)

Current verdict: `Strong`

Implemented:

- [x] loaded edit-state with concrete field blocks
- [x] grouped save boundaries by data slice
- [x] route-safe not-found handling
- [x] media preview surface
- [x] publish blocker note tied to validation checks
- [x] cards sync / SEO remain inside edit scope instead of inventing FE publish logic

Must prove in UI:

- editor route shows real field/state/save workflow instead of only domain headings

## `009` Order Ops

### `Admin / Orders` (`281:10025`)

Current verdict: `Strong`

Must add:

- [x] visible filter/search controls
- [x] explicit row-to-detail handoff
- [x] allowed row-level actions with disabled/blocked states
- [x] empty queue state
- [x] loading/error state
- [x] clear distinction between read-only signals and mutating actions
- [x] if export remains in scope: export intent and filter scope visibility

Must prove in UI:

- operator can scan, filter, and move into detail without FE inventing list workflow

### `Admin / Refunds` (`281:10052`)

Current verdict: `Strong`

Must add:

- [x] evidence/history panel for refund request
- [x] explicit approve/reject confirmation boundary
- [x] admin note input with save/process relation made clear
- [x] point reclaim semantics visible as backend-owned effect
- [x] validation/error state for missing evidence or rejected action
- [x] empty queue state
- [x] loading/error state

Must prove in UI:

- refund decision flow is traceable and not just a summary card with action names

### `Admin / Order Detail` (`281:10349`)

Current verdict: `Strong`

Implemented:

- [x] blocked mutation state
- [x] note box with save boundary
- [x] timeline and note split
- [x] fallback/missing-state language
- [x] detail mutation surface separated from read context

## `010` User Engagement Ops

### `Admin / Users` (`281:10079`)

Current verdict: `Strong`

Must add:

- [x] search/filter controls
- [x] detail/context panel or inline expansion
- [x] explicit points adjustment flow
- [x] explicit block/unblock confirmation flow
- [x] empty state
- [x] loading/error state
- [x] visible audit/risk note area if mutation is high-risk

Must prove in UI:

- user moderation is a workflow, not just a KPI board with action labels

### `Admin / Messages` (`281:10133`)

Current verdict: `Strong`

Must add:

- [x] target-segment chooser with clear audience scope
- [x] delivery timing state: draft / scheduled / sent
- [x] preview state before send
- [x] send confirmation boundary
- [x] error state for invalid audience/content
- [x] history/inbox distinction if both stay in scope

Must prove in UI:

- send semantics are visible and not left for FE to invent

### `Admin / Data Management` (`281:10214`)

Current verdict: `Strong`

Must add:

- [x] irreversible-action confirmation state
- [x] dry-run vs real-run distinction
- [x] job progress / queued / completed / failed states
- [x] rollback or no-rollback note tied to each operation
- [x] conflict preview surface
- [x] permission/risk boundary more explicit than generic alert text

Must prove in UI:

- risky data actions cannot be mistaken for normal clicks

### `Admin / Leads` (`281:10295`)

Current verdict: `Strong`

Must add:

- [x] owner assignment state
- [x] status progression model
- [x] detail/note surface
- [x] conversion / resolved / junk outcomes
- [x] empty state
- [x] loading/error state

Must prove in UI:

- lead handling is visible as lifecycle work, not just a queue summary

### `Admin / Notifications` (`281:10160`)

Current verdict: `Strong`

Implemented:

- [x] per-channel config field surface
- [x] per-channel test-send CTA
- [x] failed-test / auth failure note
- [x] edit-state guidance for retry policy / quiet hours / fallback

Must prove in UI:

- channel configuration is editable and testable on-screen, not only described

### `Admin / Announcement` (`281:10187`)

Current verdict: `Strong`

Implemented:

- [x] headline/composer field surface
- [x] queue split for live / scheduled / archived
- [x] preview CTA
- [x] publish blocker tied to schedule and dismiss validity

Must prove in UI:

- announcement flow is operable from the screen, not only described by labels

### `Admin / Collect` (`281:10241`)

Current verdict: `Strong`

Implemented:

- [x] grouped payment/account/QR field surface
- [x] validation blocker for invalid bank code or missing QR asset
- [x] checkout preview tie-in before save

Must prove in UI:

- payment-collect editing is a real form flow rather than a grouped summary

### `Admin / Profile` (`281:10322`)

Current verdict: `Strong`

Implemented:

- [x] editable identity field surface
- [x] security action CTA
- [x] session-review note kept beside recent access

Must prove in UI:

- profile/security changes are actionable on-screen, not only listed

## Optional Tightening For Already-Strong Screens

These screens are not shell-level, but they still have worthwhile follow-ups before being treated as fully adapted:

- `Admin / Reviews`: show selection mechanics, featured ordering affordance, failed-action state
- `Admin / Product Editor`: show actual editable controls, tab-specific validation, and route-state handling
- `Admin / Order Detail`: show blocked/disabled mutation states and note/timeline interaction more explicitly
- `Notifications`: add deeper per-channel validation density and post-test success feedback
- `Announcement`: add denser composer/schedule controls and lifecycle audit context
- `Collect`: add fuller editable field density and payment-source switching detail
- `Profile`: add richer security/session control density and revoke feedback

## Overall Rule

Không dùng Figma hiện tại làm bằng chứng rằng mọi admin workflow đã adapt.

Cho tới khi checklist trên được giải quyết:

- `spec.md` và test plan vẫn phải là source of truth cho behavior
- FE không được tự bù workflow gaps bằng business/process logic
