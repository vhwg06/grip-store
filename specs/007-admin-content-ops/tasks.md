# Tasks: Admin Content Operations

**Input**: `specs/007-admin-content-ops/`
**Tests**: Required, run against production API wiring

## Phase 1: Spec Lock

- [x] T001 Chốt module boundary thay cho content scope cũ của `004`
- [x] T002 Chốt route inventory, use cases, current code audit trong `spec.md`
- [x] T003 Chốt figma review gate với `gpt-taste` protocol trong `figma-review.md`
- [x] T004 Chốt backend ownership trong `spec.md`
- [x] T005 Define API/UI/public reflection coverage trong `test-plan.md`
- [x] T006 Tạo task buckets implementation cho media, banners, articles, about, faqs

## Phase 2: Execution Backlog

### Contracts / API

- [ ] T101 Khóa content/media contract cho media, banners, articles, faqs, about projection

### BE: business logic / contract / persistence

- [ ] T102 Implement media usage protection, presign/register/delete/list flows
- [ ] T103 Implement banner ordering/activation/public projection semantics
- [ ] T104 Implement article CRUD + publish lifecycle + public projection
- [ ] T105 Implement FAQ CRUD + active/order semantics
- [ ] T106 Implement about-us content/gallery persistence and public projection

### FE: render / form wiring / API integration only

- [ ] T107 Refine media library and picker integration surfaces
- [ ] T108 Wire banners/articles/faqs/about forms to backend-owned contracts, including FAQ reorder/active flows and article route-state differences
- [ ] T109 Render validation/loading/error/publish states without owning business rules

### Playwright API

- [ ] T110 Split and make green content/admin API tests

### Playwright UI

- [ ] T111 Split and make green admin content UI tests, including dedicated article create/edit route assertions

### Figma parity / regression

- [ ] T112 Verify premium admin hierarchy, FAQ route parity, content editor clarity, and public reflection regressions

## Completion Rule

- Phase 2 chỉ được bắt đầu sau khi artifact Phase 1 đã khóa xong.
- Phase 2 chỉ complete khi toàn bộ test đã define pass mà không sửa spec/test để chạy theo code.
