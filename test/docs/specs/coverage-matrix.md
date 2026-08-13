# GRIP scenario / flow coverage matrix

This matrix is the persistent behavior trace index. It deliberately stays separate from the design trace (`ux-synthesis.md` and the Design System coverage page).

| Behavior scope | Canonical Figma flow/state | Prototype/evidence | Status |
|---|---|---|---|
| Public auth: login, validation, invalid credentials | `Public Storefront / Auth / Authenticate shopper / Login / {default, validation, invalid credentials}` | Auth owner state-frame reactions; `figma-qa-evidence.md` | covered structurally |
| Public auth: signup, duplicate email, success | `Public Storefront / Auth / Register account / Signup / {default, validation, duplicate email, success}` | Auth owner state-frame reactions; `figma-qa-evidence.md` | covered structurally |
| Public auth: OAuth/session/logout | `Public Storefront / Auth / {OAuth, Session}` | Auth owner reactions; `figma-qa-evidence.md` | covered structurally |
| Public browse/catalog | `Public / Browse / {Home, Catalog, Product detail}` | Browse owner reactions; `figma-qa-evidence.md` | covered structurally |
| Public browse empty/unavailable | `Public / Browse / Catalog / Results / Empty`; `Public / Browse / Product detail / Unavailable` | Browse owner handoff | covered structurally |
| Public cart/checkout | `Public / Checkout / {Cart, Checkout, Success}` | Checkout owner quantity/remove/checkout/result paths | covered structurally |
| Public wishlist/reviews | `Public / Engagement / {Wishlist, Reviews}` | Engagement owner reactions and loaded/empty/success/reload states | covered structurally |
| Public content/contact | `Public / Content / {About, Articles, Contact}` | Content owner frames/reactions; mobile article Page 2 “Tiếp” repaired to reachable Page 2 frame | covered structurally |
| Admin orders | `Admin / Operations / Orders / Queue + Detail` | Order action → terminal/reload path | covered structurally |
| Admin refunds | `Admin / Operations / Refunds / Decision / {Pending, Historical / Read-only}` | Approve/reject → read-only path | covered structurally |
| Admin reviews | `Admin / Operations / Reviews / Moderation / {Pending, Hidden / Terminal}` | Approve/hide/feature → terminal path | covered structurally |
| Admin Catalog | `Admin / Catalog / {Product Model, Categories}` | Structural frames; extension/reaction review pending | covered structurally |
| Admin Content | `Admin / Content / {Media, Banners, Articles, FAQs, About}` | Content owner frames; export/interactive review pending | covered structurally |
| Admin customer/user/profile | `Admin / Account / {Customer, User}`; `Admin / Profile` | Customer commerce handoffs; profile identity/security frame | covered structurally |
| Admin settings/payments/notifications | `Admin / Settings`, `Admin / Payments`, `Admin / Notifications` | Validation/readiness/error states | covered structurally |
| API-tagged, no canonical UI | Reference-only classification in Wave A handoffs | No product frame by design | reference-only |

## Interpretation

“Covered structurally” means the canonical frame/state exists with expected content shape, state semantics and bounded ownership; it does not claim that every screenshot export or every prototype path has passed interactive QA. Export timeouts and remaining interactive checks are recorded in `figma-qa-evidence.md`.

The exhaustive SC-ID list remains in the Wave A handoffs and aggregated inventory. This matrix maps those compact contracts to canonical UX flows without putting scenario IDs into frame names or turning scenario wording into component requirements.
