# Test Plan: Admin Content Operations

## Files

- split `playwright/specs/admin/media-management.spec.ts` into module-aligned coverage
- target new specs for media, banners, articles, faqs
- extend public content specs for article/about/faq/banner reflection

## API Coverage

- media list/presign/register/delete
- banner CRUD/order/active state
- article CRUD/publish/unpublish/public fetch
- faq CRUD/toggle/reorder/public fetch
- about content persistence/public reflection
- validation and authorization failures

## UI Coverage

- admin media library flows
- banner management flows
- article editor/list flows
- faq management flows
- about content editor/gallery flows

## Gate Rules

- figma review must pass before UI contract is treated as final
- tests should verify backend-owned outcomes, not FE-invented business behavior
