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
| A-UX | A/design | UX synthesis owner | completed | A-AGG | UX model, IA, actor goals and separate design/behavior traces re-synthesized from applicable semantics and product intent; Gherkin remains parallel evidence. |
| B-001 | B | Foundation | completed | A-UX | Retirement audit retained; previous UI/DS is now explicitly non-canonical pending rebuild. |
| B-002 | B | Foundation | completed | B-001 | Light warm-neutral foundation board created and visually inspected under the new design-trace model. |
| B-003 | B | Foundation | completed | B-002 | Foundation tokens, typography, spacing and responsive composition recorded; product patterns remain excluded. |
| B-004 | B | Foundation | completed | B-003 | Shell, responsive orientation and generic navigation primitives validated on the foundation board; product flows consume them. |
| B-005 | B | Foundation | completed | B-004 | Primary/secondary controls, fields and visible focus foundation specimens validated. |
| B-006 | B | Foundation | completed | B-005 | Generic data-row, selection and status primitives added and validated; no domain workflow is encoded. |
| B-007 | B | Foundation | completed | B-006 | Explicit non-promotion gate recorded: Catalog/commerce/engagement patterns remain product-local until repeated evidence exists. |
| B-008 | B | Foundation | completed | B-007 | Explicit non-promotion gate recorded: overlay/recovery/readiness patterns remain out of the foundation board until proven. |
| B-009 | B | Foundation | completed | B-005 | Accessibility foundation note and visible-focus/readability states recorded; no standalone scenario coverage is claimed. |
| C-001 | C | Public auth owner | in_progress | B-002..B-006, B-009, A-001, A-UX | Desktop/mobile behavior-preserved Auth slice built and wired; semantic source gap and final validation remain open. |
| C-002 | C | Public browse owner | in_progress | B-002..B-006, B-009, A-002, A-UX | Browse home/catalog/detail desktop and representative mobile frames rebuilt and wired; semantic-gap correlation and final product validation remain open. |
| C-003 | C | Public checkout/product-flow owner | in_progress | B-002..B-006, B-009, A-003..A-004, A-UX | Desktop/mobile behavior-preserved Checkout slice built and wired; order/payment/persistence semantic gaps remain explicit. |
| C-004 | C | Public content/engagement owner | in_progress | B-002..B-006, B-009, A-005..A-006, A-UX | Content and Engagement representative flows built and wired, including review accepted-after-reload evidence; semantic source gaps remain explicit. |
| C-005 | C | Admin catalog owner | completed | B-009, A-007..A-008, A-UX | Catalog list/editor/category desktop/mobile frames built from current Catalog model; structural verification complete, selected screenshot exports timed out. |
| C-006 | C | Admin content/settings owner | completed | B-009, A-009, A-UX | Admin Content desktop/mobile media, banners, articles, FAQs and About frames built; settings validation frame built; export/interactive review limitations recorded. |
| C-007 | C | Admin operations owner | completed | B-009, A-010, A-UX | Orders/refunds/reviews operations viewport frames, terminal states, shared shell and action reactions; visual evidence partial due export timeouts. |
| C-008 | C | Admin reviews owner | completed | B-009, A-011, A-UX | Review moderation is represented in Operations owner’s bounded artifact; no duplicate review owner spawned. |
| C-009 | C | Admin customer/account owner | completed | B-009, A-012, A-UX | Customer summary, linked user blocked state, and admin profile identity/security representative frames built; structural verification complete. |
| C-010 | C | Admin notifications/payments owner | completed | B-009, A-013, A-UX | Collection readiness warning and notification readiness error representative frames built; structural verification complete. |
| C-EXT | C/B | Foundation + requesting owner | in_progress | C-001..C-010 | Generic foundation reuse is audited; no speculative Catalog/commerce/engagement pattern is promoted. Final promotion decision follows product validation. |
| D-001 | D | Integration | in_progress | C-001..C-004, C-EXT, A-AGG | Public global handoff and cross-module prototype wiring is captured; final integration closure waits on product validation and promotion gate. |
| D-002 | D | Integration | in_progress | D-001 | Cross-module reversible paths and representative reload/terminal states are wired; runtime fresh-read proof and unresolved semantic-source gaps still block closure. |
| E-001 | E | Product/UX QA | in_progress | D-002 | Foundation and representative Public visual evidence captured; final interactive review and selected export limitations remain open. |
| E-001-GEO | E | Product/UX QA | in_progress | D-002 | Recursive local node/property audit now covers 34 new Public frames with zero child overflow; full sibling-overlap interpretation and final visual review remain open. |
| E-002 | E | Contract/traceability QA | in_progress | D-002 | Separate design/behavior traces and current frame evidence are recorded; semantic gaps and final scenario validation remain open. |
| E-003 | E | Orchestrator | pending | E-001, E-001-GEO, E-002 | Persistent evidence, divergence record and final execution closure decision after visual export and interactive review gates pass. |

## Per-task contract

Every task must record input sources, permitted cognitive boundary, owner, dependencies, expected output, verification evidence, completion condition and any plan divergence. Handoffs contain conclusions, contracts, dependencies and verification only; raw reads, retries and intermediate reasoning remain local.

## Visual tone acceptance

The foundation and representative-screen tasks must apply the visual tone migration guide in the plan. The dominant impression must be light/neutral first, warm second. A beige/brown or clay-monochromatic result fails the visual gate. Public and admin artifacts must consume shared semantic tokens rather than recoloring individual components with arbitrary values.

## Escalation rules

- Insufficient or contradictory handoff: return to the original owner; do not reread raw source downstream.
- Reusable DS gap: request Foundation extension; never create a local reusable duplicate.
- Integration mismatch: return to the owning module/Foundation; Integration only reconnects after correction.
