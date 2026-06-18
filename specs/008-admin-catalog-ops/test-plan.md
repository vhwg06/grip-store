# Test Plan: Admin Catalog Operations

## Files

- `playwright/specs/admin/products.spec.ts`
- `playwright/specs/api/admin.api.spec.ts` split or narrowed for catalog coverage
- additional catalog/card/category specs as needed

## API Coverage

- products CRUD
- categories CRUD
- cards import/pull/config
- validation and auth failures
- persistence and derived outputs

## UI Coverage

- products list
- products list filter scope, row actions, and loading/empty/error handling
- create/edit product
- media uploader integration in product editor
- toggle/reorder/delete
- categories admin including reorder-save and duplicate-slug block states
- cards route flows

## Gate Rules

- tests should assert backend-driven outcomes for stock/visibility/order semantics
- figma review must pass before UI contract is considered stable
