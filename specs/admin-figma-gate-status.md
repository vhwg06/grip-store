# Admin Figma Gate Status

Status date: 2026-06-18

Purpose:

- chốt module nào đã pass Figma adaptation gate
- chốt module nào vẫn bị block bởi route-level screens chưa adapt đủ use case

Authoritative inputs:

- `specs/admin-figma-screen-audit.md`
- `specs/admin-figma-fix-checklist.md`
- module-local `figma-review.md`

Gate rule:

- module chỉ được coi là `Figma Gate: PASS` khi mọi route-level screen trong scope đạt ít nhất `Strong`
- nếu còn `Weak`, `Partial`, hoặc `Missing`, module vẫn `BLOCKED`
- gate này chỉ quyết định mức độ sẵn sàng của UI spec trong Phase 1; nó không tự động cho phép bỏ qua test gate ở Phase 2
- gate này không thay thế use cases, spec, backend ownership review, current code audit, hay defined tests
- Figma gate chỉ khóa UI patterns/components/state presentation cho route đang ở active scope

## Module Status

| Module | Gate status | Blocking screens | Reason |
|---|---|---|---|
| `005-admin-store-settings` | `PASS WITH GAPS` | none blocking | `/admin/settings` đã có grouped save boundaries, media-pick intent, structured nested-setting groups, và validation blockers; gap còn lại là polish/density |
| `006-admin-reviews` | `PASS WITH GAPS` | none blocking | route chính `/admin/reviews` đạt `Strong`; vẫn còn gap chi tiết nhưng không làm mất workflow chính |
| `007-admin-content-ops` | `PASS WITH GAPS` | none blocking | FAQ route đã có frame riêng; article create/edit hiện cũng có route-specific frames, còn lại là detail gaps không làm mất route coverage |
| `008-admin-catalog-ops` | `PASS WITH GAPS` | none blocking | products, categories, product editor, product create, và cards workflow đều đã có route-level workflow evidence; gap còn lại là polish/density |
| `009-admin-order-ops` | `PASS WITH GAPS` | none blocking | orders, refunds, và order detail đều đã có route-level workflow evidence; gap còn lại là polish/density chứ không còn blocker use-case |
| `010-admin-user-engagement-ops` | `PASS WITH GAPS` | none blocking in current active scope | active Figma-reviewed scope hiện chỉ tính `users`, `messages`, `notifications`; các route `announcement`, `data`, `collect`, `leads`, `profile` đã bị bỏ khỏi active scope hiện tại và không được tính vào gate này |

## Implications

- Không gọi `005`, `007`, `008`, `009`, `010` là fully Figma-adapted.
- `005` đã qua route-blocker level sau khi settings frame có media picker, structured nested groups, và validation blockers rõ hơn.
- `007` đã qua route-blocker level nhưng vẫn còn residual detail gaps trước khi gọi là polished/full-pass.
- `008` đã qua route-blocker level sau khi products list, categories, và product editor có row/tree/editor state surfaces rõ hơn.
- `009` đã qua route-blocker level sau khi orders list có queue controls, blocked actions, và list-state surfaces rõ hơn.
- `010` hiện chỉ được coi là qua route-blocker level cho active scope `users`, `messages`, `notifications`.
- Các route `announcement`, `data`, `collect`, `leads`, và `profile` không được dùng làm bằng chứng Figma gate trong package Phase 1 active hiện tại của `010`.
- Các module `BLOCKED` vẫn có thể tiếp tục spec/contracts/tests, nhưng không được dùng Figma hiện tại làm bằng chứng rằng workflow UI đã được adapt.
- `005`, `006`, `007`, `008`, `009`, và `010` hiện có thể nói là đã qua gate ở mức route coverage, nhưng vẫn có residual gaps ngoài blocker level.

## Release Discipline

- Không final hóa UI parity claims cho module `BLOCKED`
- Không để task wording hoặc spec wording ngụ ý module đã sẵn sàng chỉ vì đã có frame
- Không dùng Figma pass/gap để thay thế test gate của Phase 2
- Nếu route nào được sửa trong Figma, phải cập nhật lại:
  - `admin-figma-screen-audit.md`
  - `admin-figma-fix-checklist.md`
  - module-local `figma-review.md`
