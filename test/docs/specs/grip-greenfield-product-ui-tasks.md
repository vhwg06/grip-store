# GRIP — Executable Task Breakdown

Plan reference: [`grip-greenfield-product-ui-plan.md`](./grip-greenfield-product-ui-plan.md)

Status values: `pending`, `in_progress`, `blocked`, `completed`.

## Task order

| ID | Wave | Owner / cognitive boundary | Status | Depends on | Expected output |
|---|---|---|---|---|---|
| P-001 | Planning | Orchestrator | completed | — | Canonical approved plan persisted. |
| P-002 | Planning | Orchestrator | completed | P-001 | Dependency-ordered task breakdown and handoff contract persisted. |
| A-001 | A | Public auth | completed | P-002 | Compact auth handoff in `handoffs/public-auth.md`. |
| A-002 | A | Public browse | completed | P-002 | Compact browse handoff in `handoffs/public-browse.md`. |
| A-003 | A | Public checkout | completed | P-002 | Compact checkout handoff in `handoffs/public-checkout.md`. |
| A-004 | A | Public product-flow | completed | P-002 | Covered by public browse/catalog handoff; ownership reconciled in A-AGG. |
| A-005 | A | Public content | completed | P-002 | Compact public-content handoff in `handoffs/public-content.md`; approved discovery sources and behavior were reconciled. |
| A-006 | A | Public engagement | completed | P-002 | Compact engagement handoff in `handoffs/public-engagement.md`. |
| A-007 | A | Current Catalog domain | completed | P-002 | Dedicated Catalog handoff in `handoffs/catalog-domain.md`; ProductModel/Variant/Master Data and operational boundaries are explicit. |
| A-008 | A | Admin catalog/product | completed | P-002 | Admin catalog/product handoff. |
| A-009 | A | Admin content/store settings | completed | P-002 | Admin content/settings handoff. |
| A-010 | A | Admin orders/refunds | completed | P-002 | Operations, order and refund decision handoffs. |
| A-011 | A | Admin reviews | completed | P-002 | Review moderation handoff. |
| A-012 | A | Admin customer/user/profile | completed | P-002 | Customer, user and profile handoff. |
| A-013 | A | Admin notifications/payments | completed | P-002 | Notification handoff and account-context payment coverage. |
| A-014 | A | Inventory/reference | completed | P-002 | Inventory/stock boundary remains an explicit dependency; no canonical UI without browser/visual contract. |
| A-AGG | A | Orchestrator | completed | A-001..A-014 | Aggregated behavior/domain inventory persisted with Catalog and public-content baselines; unresolved contracts remain explicitly listed. |
| A-UX | A/design | UX synthesis owner | completed | A-AGG | UX model, task-flow synthesis, terminology and provisional IA in `ux-synthesis.md`; `.agents/designer.md` applied. |
| B-001 | B | Foundation | completed | A-UX | Retirement audit recorded; old UI/DS remains audit-only. |
| B-002 | B | Foundation | completed | B-001 | New light warm-neutral visual foundations from the migration guide in Figma. |
| B-003 | B | Foundation | completed | B-002 | Tokens, typography, spacing, grids and breakpoints in Figma. |
| B-004 | B | Foundation | completed | B-003 | Public/Admin shell contracts in Figma. |
| B-005 | B | Foundation | completed | B-004 | Controls, forms and interaction states; canonical components created. |
| B-006 | B | Foundation | completed | B-005 | Data-display, table, selection and bulk-action patterns documented. |
| B-007 | B | Foundation | completed | B-006 | Catalog, commerce and engagement patterns documented. |
| B-008 | B | Foundation | completed | B-007 | Overlay, feedback, status, recovery and readiness patterns documented. |
| B-009 | B | Foundation | completed | B-008 | Accessibility/state coverage and screenshot evidence recorded; B-GATE passed for known requirements. |
| C-001 | C | Public auth owner | completed | B-009, A-001, A-UX | Applicable desktop/mobile auth screens and intra-module prototype; structural/reaction verification recorded, selected exports timed out. |
| C-002 | C | Public browse owner | completed | B-009, A-002, A-UX | Applicable desktop/mobile browse/catalog screens and intra-module prototype; owner handoff verified geometry, copy and reactions. |
| C-003 | C | Public checkout/product-flow owner | completed | B-009, A-003..A-004, A-UX | Cart/checkout/result desktop/mobile screens and reversible quantity/remove/recovery paths; structural/reaction verification complete, selected exports timed out. |
| C-004 | C | Public content/engagement owner | completed | B-009, A-005..A-006, A-UX | 40 canonical desktop/mobile Engagement + Content frames in section `521:1052`; wishlist/review/notification/contact/article/About flows, auth-gated review state and pagination reactions recorded in `handoffs/public-engagement-content-figma.md`; selected final screenshot exports timed out and are explicitly not claimed as visual passes. |
| C-005 | C | Admin catalog owner | completed | B-009, A-007..A-008, A-UX | Catalog list/editor/category desktop/mobile frames built from current Catalog model; structural verification complete, selected screenshot exports timed out. |
| C-006 | C | Admin content/settings owner | completed | B-009, A-009, A-UX | Admin Content desktop/mobile media, banners, articles, FAQs and About frames built; settings validation frame built; export/interactive review limitations recorded. |
| C-007 | C | Admin operations owner | completed | B-009, A-010, A-UX | Orders/refunds/reviews operations viewport frames, terminal states, shared shell and action reactions; visual evidence partial due export timeouts. |
| C-008 | C | Admin reviews owner | completed | B-009, A-011, A-UX | Review moderation is represented in Operations owner’s bounded artifact; no duplicate review owner spawned. |
| C-009 | C | Admin customer/account owner | completed | B-009, A-012, A-UX | Customer summary, linked user blocked state, and admin profile identity/security representative frames built; structural verification complete. |
| C-010 | C | Admin notifications/payments owner | completed | B-009, A-013, A-UX | Collection readiness warning and notification readiness error representative frames built; structural verification complete. |
| C-EXT | C/B | Foundation + requesting owner | completed | C-001..C-010 | Final Design System coverage review found canonical coverage for shells, controls/forms, result navigation, Catalog/Variant, cart/checkout, queue/evidence, decisions, content/media and state/accessibility needs; no local reusable duplicate was added. Live audit confirms zero retired accent consumers and canonical style binding across all three sections. |
| D-001 | D | Integration | in_progress | C-EXT, A-AGG | Global navigation and cross-module prototype wiring only; core cross-module paths wired. Nested Admin mobile-to-terminal destinations remain connector-limited and are recorded explicitly in `figma-qa-evidence.md`. |
| D-002 | D | Integration | in_progress | D-001 | Cross-module reversible, reload/fresh-read and terminal paths; core reachable paths wired, interactive review pending. |
| E-001 | E | Product/UX QA | in_progress | D-002 | Representative visual evidence exists; remaining exports/interactive review are explicitly pending. Geometry evidence is recorded separately. |
| E-001-GEO | E | Product/UX QA | completed | D-002 | Recursive pairwise sibling-intersection, max-row-height, row-gap, containment and canonical module/use-case/viewport hierarchy audit completed for Public, Admin and Design System trees; all three current recursive audits report zero overflow and zero layout overlap. Admin coordinate-space probe and local-position correction are recorded in `figma-geometry-audit.md`. Admin ownership map and explicit Desktop + Mobile/Desktop only/Mobile only wrapper naming were rechecked after the latest hierarchy cleanup. |
| E-002 | E | Contract/traceability QA | in_progress | D-002 | Persistent coverage matrix and behavior/design trace separation recorded; exhaustive interactive evidence pending. |
| E-003 | E | Orchestrator | pending | E-001, E-001-GEO, E-002 | Persistent evidence, divergence record and final execution closure decision after visual export and interactive review gates pass. |

## Per-task contract

Every task must record input sources, permitted cognitive boundary, owner, dependencies, expected output, verification evidence, completion condition and any plan divergence. Handoffs contain conclusions, contracts, dependencies and verification only; raw reads, retries and intermediate reasoning remain local.

## Visual tone acceptance

The foundation and representative-screen tasks must apply the visual tone migration guide in the plan. The dominant impression must be light/neutral first, warm second. A beige/brown or clay-monochromatic result fails the visual gate. Public and admin artifacts must consume shared semantic tokens rather than recoloring individual components with arbitrary values.

## Escalation rules

- Insufficient or contradictory handoff: return to the original owner; do not reread raw source downstream.
- Reusable DS gap: request Foundation extension; never create a local reusable duplicate.
- Integration mismatch: return to the owning module/Foundation; Integration only reconnects after correction.
