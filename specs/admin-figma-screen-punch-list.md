# Admin Figma Screen Punch List

Status date: 2026-06-18

Purpose:

- biến review Figma thành backlog sửa trực tiếp theo từng frame
- chỉ rõ frame nào phải giữ, frame nào phải nâng, frame nào phải thêm mới
- dùng cho designer/product review mà không cần tự suy diễn từ nhiều spec khác nhau

Inputs:

- `specs/admin-figma-screen-audit.md`
- `specs/admin-figma-fix-checklist.md`
- `specs/admin-figma-route-requirements.md`
- screenshot exports trong `/tmp/figma-audit/`

Rule:

- một frame chỉ được nâng lên `Strong` khi screenshot cho thấy control thật, state thật, save/action boundary thật
- box + text labels + một CTA không đủ
- nếu route code có behavior riêng, frame phải chứng minh behavior đó thay vì chỉ nêu domain concern

## Priority Order

1. `Admin / Store Settings`
2. `Admin / FAQ Management` (new)
3. `Admin / Products`
4. `Admin / Categories`
5. `Admin / Orders`
6. `Admin / Refunds`
7. `Admin / Users`
8. `Admin / Messages`
9. `Admin / Data Management`
10. `Admin / Leads`
11. `Admin / Product Editor`
12. `Admin / Order Detail`
13. `Admin / Notifications`
14. `Admin / Announcement`
15. `Admin / Collect`
16. `Admin / Profile`
17. `Admin / Product Create` (new)
18. `Admin / Cards Workflow` (new)
19. article create/edit route evidence

## Screen-by-Screen Punch List

### `Admin / Store Settings` (`282:10564`)

Current verdict: `Strong`

Implemented:

- section `Discovery & Visibility`
- section `Registry & Legacy Controls`
- `shopLogo` picker control
- structured editor for `homepageBlocks[]`
- structured editor for `footerColumns[]`
- structured editor for `socialLinks`
- structured editor for floating support actions
- visible per-section save boundary
- validation state for invalid email
- validation state for duplicate homepage block
- validation state for negative `homepageNewsCount`
- validation state for enabled support action without target
- public reflection hint per section

Must prove before upgrading verdict:

- admin can tell which section is dirty
- admin can tell what public surface each save affects
- FE does not need to invent missing config structure

### `Admin / FAQ Management` (new frame required)

Current verdict: `Missing`

Must add as a dedicated frame:

- FAQ list
- create/edit form
- active toggle
- reorder surface
- delete action
- empty state
- validation state
- save boundary
- public reflection hint

Must prove before upgrading verdict:

- FAQ is a standalone workflow, not a hidden subcase of article/content screens

### `Admin / Products` (`281:9998`)

Current verdict: `Strong`

Implemented:

- visible filter/search row
- actual row/list UI with concrete row cards
- explicit row-level actions:
  - edit
  - toggle visibility
  - delete
  - open cards flow
- empty state
- loading state
- error state
- warning indicators for missing image / invalid price / low stock / missing category

Must prove before upgrading verdict:

- operator can work directly from the list without inventing hidden row workflow

### `Admin / Categories` (`281:10268`)

Current verdict: `Strong`

Implemented:

- hierarchy/tree model
- reorder affordance
- create/edit panel
- save boundary
- empty-state behavior
- duplicate slug validation
- visibility toggle state
- reorder-save note for tree persistence

Must prove before upgrading verdict:

- category ordering and integrity workflow are visible, not only named

### `Admin / Orders` (`281:10025`)

Current verdict: `Strong`

Implemented:

- filter/search controls
- list rows with clear row-to-detail handoff
- visible row-level actions
- disabled/blocked state for invalid actions
- empty queue state
- loading state
- error state
- export scope visibility
- clear visual split between read-only signals and mutating actions

Must prove before upgrading verdict:

- operator can scan, filter, and enter detail without FE inventing the list workflow

### `Admin / Refunds` (`281:10052`)

Current verdict: `Strong`

Implemented:

- evidence/history panel
- explicit approve/reject confirmation boundary
- admin note input tied to process/save outcome
- point reclaim effect shown as backend-owned consequence
- empty queue state
- loading state
- error state
- validation state for missing evidence or invalid processing

Must prove before upgrading verdict:

- refund decision flow is traceable and not just a decision label list

### `Admin / Users` (`281:10079`)

Current verdict: `Strong`

Implemented:

- search/filter row
- detail handoff and points-adjustment CTA
- block/unblock confirmation and audit-risk note
- empty state
- loading state
- error state

Must prove before upgrading verdict:

- user moderation reads like workflow, not KPI board

### `Admin / Messages` (`281:10133`)

Current verdict: `Strong`

Implemented:

- target-segment chooser
- draft / scheduled / sent state treatment
- preview-before-send state
- send confirmation boundary
- invalid audience/content error state
- history/inbox distinction

Must prove before upgrading verdict:

- send semantics are visible enough that FE does not invent delivery workflow

### `Admin / Data Management` (`281:10214`)

Current verdict: `Strong`

Implemented:

- irreversible confirmation state
- dry-run vs real-run split
- queued / running / completed / failed job states
- rollback note per operation
- conflict preview surface
- stronger permission/risk boundary

Must prove before upgrading verdict:

- risky operations cannot be mistaken for ordinary clicks

### `Admin / Leads` (`281:10295`)

Current verdict: `Strong`

Implemented:

- owner assignment state
- status progression model
- detail/note surface
- conversion / resolved / junk outcomes
- empty state
- loading state
- error state

Must prove before upgrading verdict:

- lead handling is visible as lifecycle work, not queue summary

### `Admin / Product Editor` (`281:10376`)

Current verdict: `Strong`

Implemented:

- actual editable field blocks
- route-specific not-found state
- grouped save boundary by section
- media preview surface
- publish blocker tied to validation checks
- cards-sync and SEO state held inside edit scope

Must prove before upgrading verdict:

- route `/admin/product/edit/[id]` is represented as an editable screen, not only an annotated summary

### `Admin / Order Detail` (`281:10349`)

Current verdict: `Strong`

Implemented:

- clearer separation between read-only data and mutations
- note editor / timeline interaction state
- disabled/blocked invalid transitions
- route-safe fallback handling

Must prove before upgrading verdict:

- route `/admin/orders/[id]` works as a detail workflow, not only a detail summary

### `Admin / Notifications` (`281:10160`)

Current verdict: `Strong`

Implemented:

- actual config inputs per channel
- actual failed-state treatment on the affected channel
- test-send feedback state
- clear save boundary for channel-level vs global changes

Must prove before upgrading verdict:

- channel configuration is editable and testable on-screen, not only described

### `Admin / Announcement` (`281:10187`)

Current verdict: `Strong`

Implemented:

- real message composer inputs
- schedule controls
- live/draft/archive state treatment
- publish/pause validation and confirmation states

Must prove before upgrading verdict:

- announcement flow is operable from the screen, not only described by labels

### `Admin / Collect` (`281:10241`)

Current verdict: `Strong`

Implemented:

- actual editable payment fields
- QR/media attachment flow
- validation state for bank code / account / missing assets
- explicit relation between edited fields and preview/result

Must prove before upgrading verdict:

- payment-collect editing is a real form flow rather than a grouped summary

### `Admin / Profile` (`281:10322`)

Current verdict: `Strong`

Implemented:

- editable identity controls
- session revoke / trusted-device controls
- 2FA setup/update state
- recent-access interaction or risk handling

Must prove before upgrading verdict:

- profile/security changes are actionable on-screen, not only listed

### `Admin / Product Create` (new frame required)

Current verdict: `Missing`

Must add as a dedicated frame if create flow differs from edit:

- create-state fields
- initial empty-state behavior
- validation state before first save
- save/create CTA
- route-specific not-found is not needed, but first-load state is

Must prove before upgrading verdict:

- route `/admin/product/new` has first-create behavior covered directly in Figma

### `Admin / Cards Workflow` (new frame required)

Current verdict: `Missing`

Must add as a dedicated frame:

- cards list or sync surface
- import/pull action
- product-linked context
- loading/sync state
- error/retry state
- save/apply boundary if config exists

Must prove before upgrading verdict:

- route `/admin/cards/[id]` is covered as a real workflow, not implied by product editor text

### `Admin / Article Management` route coverage

Current verdict: domain frame `Strong`, route coverage `Partial`

Keep:

- current list + edit split
- publish/draft treatment

Must strengthen for route proof:

- create-state evidence for `/admin/article/new`
- edit-state evidence for `/admin/article/edit/[id]`
- loading/not-found/save-state evidence when editing

Must prove before upgrading verdict:

- article create/edit routes are covered directly, not only implied by one combined frame

## Done Definition

A screen is ready to move from `Weak` or `Partial` to `Strong` only when:

- the route workflow is visible
- the important state transitions are visible
- save/confirm/error boundaries are visible
- the screen no longer forces FE to invent workflow behavior

Until then:

- spec and tests remain source of truth
- FE must not backfill business/process logic to compensate for thin Figma
