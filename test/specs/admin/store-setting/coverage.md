# Store Setting Coverage

## Current Coverage

- legacy spec: `005-admin-store-settings`
- route: `/admin/settings`
- adapters/contracts: `getAdminDashboard()`, `/api/admin/store-settings`
- active UI scope: brand/contact, homepage composition, footer/social, floating support

## Gaps

- old settings docs still mention removed discovery, registry, theme, and About/banner ownership flows
- implementation must prune stale dashboard mappings that only existed for removed sections

## Priority

- entity: `P1`
- cleanup debt: `P2`
