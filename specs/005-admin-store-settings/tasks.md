# Tasks: Admin Store Settings

**Input**: `specs/005-admin-store-settings/`
**Tests**: Required, run against production API wiring

## Phase 1: Spec Lock

- [x] T001 Chốt module intent, actors, route inventory, route-level use cases trong `spec.md`
- [x] T002 Chốt contract mục tiêu trong `contracts/store-settings-api.md`
- [x] T003 Chốt phase split và entry/exit criteria trong `plan.md`
- [x] T004 Audit current admin settings code, current public read models, và ghi gaps vào `spec.md`
- [x] T005 Review Figma adaptation và ghi kết quả vào `figma-review.md`
- [x] T006 Thêm `Backend Ownership` section vào `spec.md`
- [x] T007 Define API/UI acceptance coverage trong `test-plan.md`
- [x] T008 Tạo task buckets implementation không chứa code trong Phase 1

## Phase 2: Execution Backlog

### Contracts / API

- [ ] T101 Khóa structured admin/public store settings contract theo `contracts/store-settings-api.md`

### BE: business logic / contract / persistence

- [ ] T102 Implement structured store settings read model
- [ ] T103 Implement section-level write endpoints với validation và normalization
- [ ] T104 Implement server-owned registry, visibility, và homepage ordering semantics
- [ ] T105 Implement public storefront projection từ cùng source of truth

### FE: render / form wiring / API integration only

- [ ] T106 Refactor `/admin/settings` thành sectioned UI theo grouped save boundaries đã khóa lại sau Figma adapt
- [ ] T107 Thay raw editors bằng structured editors cho `homepageBlocks[]`, `footerColumns[]`, `socialLinks`, và floating support
- [ ] T108 Tích hợp Media Picker cho `shopLogo`
- [ ] T109 Wiring loading/success/error state và public reflection checks

### Playwright API

- [ ] T110 Unfixme và làm xanh `playwright/specs/api/store-settings.api.spec.ts`

### Playwright UI

- [ ] T111 Unfixme và làm xanh `playwright/specs/admin/store-settings.spec.ts`

### Figma parity / regression

- [ ] T112 Verify section selectors, grouped save boundaries, visibility/registry groups, và storefront reflection regressions

## Completion Rule

- Phase 2 của module này chỉ complete khi toàn bộ test đã define pass mà không sửa spec/test để chạy theo code.
