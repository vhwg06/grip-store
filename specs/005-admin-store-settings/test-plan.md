# Test Plan: Admin Store Settings

## Intent

Phase 1 của module này phải khóa bộ test trước khi cho phép implement. Phase 2 chỉ dùng đúng bộ test này làm execution gate.

## Files

- `playwright/specs/admin/store-settings.spec.ts`
- `playwright/specs/api/store-settings.api.spec.ts`

## API Coverage

- read admin store settings payload
- section updates: brand, contact, homepage, footer, floating support, visibility, registry
- validation failures cho nested payloads
- unauthorized và forbidden paths
- persistence sau mutation
- public/storefront reflection từ cùng source of truth

## UI Coverage

- render đúng section structure
- grouped save boundaries
- brand/contact update flow
- homepage composition update flow
- footer/social/support update flow
- discovery/visibility update flow
- media picker handoff for `shopLogo`
- validation blockers for invalid email, duplicate blocks, negative homepage count, and invalid support target
- loading/success/error states
- public reflection assertions

## Gate Rules

- Không final hóa UI test khi figma review chưa pass route-level gate
- Không final hóa implementation task khi backend ownership chưa explicit
- Assertion nên ưu tiên server-driven outcomes, không verify FE-calculated business state

## Current Expected Status

Các test hiện có thể đang `fixme` hoặc đang đỏ. Điều đó chấp nhận được trong Phase 1. Chỉ Phase 2 mới có trách nhiệm làm xanh chúng.
