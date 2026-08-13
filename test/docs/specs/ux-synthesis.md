# UX Synthesis

Source boundary: `AGENTS.md`, `.agents/designer.md`, `test/docs/specs/aggregated-ui-domain-inventory.md`, and approved `test/docs/specs/handoffs/*.md` only. No raw modules, implementation, or Figma were inspected. `.agents/designer.md` was applied. This is design synthesis, not a screen, component, or visual specification.

## 1. User goals and task flows

Goals: discover and buy; maintain authenticated identity; engage with the storefront; and let authorized operators maintain catalog, content, customers, settings, and operational decisions with clear ownership and durable outcomes.
1. **Discover -> inspect -> add:** Orient from homepage hero, categories, featured products, and active announcements; narrow by accepted search/category/price/page concepts; inspect detail; explicitly add an available product. Homepage discovery is non-transactional; unavailable detail has no add action.
2. **Cart -> checkout -> order result:** Review items and total, change quantity or remove an item, reach checkout, place an order, and see a confirmation or payment/order result. Durable order identity, payment success, and shopper order-history ownership remain unresolved.
3. **Register -> authenticate -> maintain session:** Register or log in, distinguish validation/authentication/duplicate-email feedback, start OAuth, verify session persistence after reload, read identity/profile, and log out. Signup does not imply automatic login; OAuth completion is not asserted.
4. **Engage:** Submit an eligible review and verify post-reload visibility, add/remove a wishlist item, vote where allowed, and mark one/all notifications read or clear the inbox.
5. **Author -> ready -> publish:** Create a Draft ProductModel, configure category, definitions, dimensions, variants, media, and Default Variant; inspect readiness blockers; privately preview; publish only when eligible; discontinue only through the terminal path.
6. **Edit content -> project publicly:** Reuse protected media, manage banners, articles, FAQs, About, and product editorial links; maintain storefront identity/homepage/support; verify accepted changes in public projections.
7. **Find a person -> owning context:** Search Customer for commerce history and linked artifacts, or User for account state; hand off without copying the other domain's controls. Keep block/unblock separate from commerce support.
8. **Operate -> decide -> trace:** Find order, refund, or review work; inspect evidence; take an eligible action; confirm where required; and find the terminal result in read-only history. Separately establish collection or notification readiness before live behavior.

## 2. Catalog / ProductModel / Variant mental model

- **Catalog** owns the catalog-authoring boundary: ProductModel, Variant identity/commercial/media rules, Master Data, generation/bulk commands, and public/Draft-preview projections.
- **ProductModel** is the sole customer-visible product concept and aggregate root. It owns identity, slug, category, content, gallery, ordered Dimensions/options, lifecycle, readiness, and an explicit Default Variant. Retired legacy `Product` is not a current UX concept.
- **Variant** is a sellable unit inside a ProductModel. Identity is the canonical combination of Dimension selections; technical values do not participate. SKU, price, status, sale-readiness, Pack, and media are Variant information.
- **Master Data** supplies Categories, typed Attribute Definitions/Options, and typed Masters such as Material, Finish, and Pack. It is reusable vocabulary, not another product aggregate.
- Public query exposes only eligible Active ProductModels with at least one sale-ready Variant. Draft preview privately uses the public projection, preserves Draft state, and excludes operational inventory/order state.
- Default Variant supplies initial public options, price, SKU, and media priority. Variant media takes priority over ProductModel gallery media, with the documented fallback. Inventory, warehouse, order, purchase-limit, and warranty-claim state remain outside this Catalog model; catalog availability versus operational stock needs an explicit contract.

## 3. Public/admin IA and navigation principles

- Apply `.agents/designer.md`: **Domain -> Module -> Use Case -> Screen -> State**. Group by product semantics and intent, not UI type, sprint, or chronology. Give each use case one canonical location; shared design-system material sits outside product flows.
- Public IA follows **orient -> narrow/compare -> inspect -> explicitly add -> manage cart -> checkout**. Homepage cards/CTAs discover or route; catalog/detail add-to-cart is the explicit mutation boundary.
- Keep public engagement, identity, and notifications adjacent to the shopper journey without blurring purchase, account, or notification state. Exact routes and extra labels are not inferred.
- Admin IA separates Catalog, Content, Customer, User, Operations, Store Settings, Payment Context, Collection, Notifications, and current-admin Profile. Shared workflows may share principles, not ownership or semantics.
- Customer is the commerce root; User is the account-control root. A linked destination is a contextual handoff, not a combined account screen.
- Payment facts are evidence in order/refund context. Collection owns receive-money readiness. Neither becomes payment execution or automatic refund authority. Terminal outcomes and read-only histories remain durable destinations; invalid/repeated terminal actions are unavailable.

## 4. Terminology and domain materialization

- Use `ProductModel`, `Variant`, `Category`, `Definition`, `Option`, `Master`, `Default Variant`, `sale-ready`, `Draft`, `Active`, and `Discontinued` with their stated meanings; do not revive `Product` as a parallel concept.
- Use **Customer** for commerce identity/history and **User** for account identity/state. Label linked contexts so a handoff cannot look like a merge.
- Distinguish lifecycle, visibility/public eligibility, availability/buyability, Variant sale-readiness, and backend readiness. Do not collapse them into one generic status.
- Distinguish editorial link/content from commercial ownership; payment facts/signals from execution; collection readiness from notification readiness.
- Materialize backend-owned facts through stable identity/context, status, eligibility, blocker scope, action availability, and fresh public projections. Never substitute static success copy, fabricated defaults, or frontend truth.
- Product UI defaults to Vietnamese under the designer rules; technical identifiers/proper nouns may remain unchanged. Exact labels, copy, enums, and error payload text remain open unless published.

## 5. Information grouping and progressive disclosure

- **Public discovery:** group orientation cues, result-set controls, result count, cards, and empty/no-match state. Search, category, price order, and pagination are transformations of one result set; combined precedence/reset remains unresolved.
- **Public detail:** group identity/price, gallery, tabs, specifications, availability, and explicit purchase. Initialize Variant selection from the Default Variant and compatible sale-ready options; omit unavailable actions.
- **ProductModel authoring:** identity/category/content and media; Dimensions/options and Variant data; generation/bulk results; readiness, preview, and lifecycle. Keep ordered presentation separate from canonical identity.
- **Account/context:** show Customer summary and commerce indicators before User handoff; show User account state and controls before Customer handoff. Empty child histories do not erase the root.
- **Operations:** queue/search -> selected item -> grouped evidence -> allowed decision -> confirmation/note -> terminal history. Share the rhythm across orders, refunds, and reviews, not their transitions.
- **Settings/content/readiness:** group contact/identity, homepage/discovery, support/legacy, editorial content, collection, and notification readiness. Put blockers and validation beside affected scope; disclose evidence/history when a decision needs it.
- Progressive disclosure reduces density without hiding ownership, eligibility, permission, blocker, or recovery information required for safe decisions. Do not fabricate loading, retry, offline, or partial states.

## 6. Interaction principles

- Preserve intent across transitions and stable identifier/context across cross-domain handoffs. Make mutations explicit: discovery does not add to cart; terminal actions confirm when specified and then become read-only.
- Backend owns permissions, validation, normalization, lifecycle, readiness, eligibility, projections, and persistence. Derived readiness/percentages are not editable facts.
- Invalid settings/setup expose the specified boundary and retain the last valid state. Do not invent copy, fields, codes, or recovery controls.
- No-match searches and empty histories are valid contextual states. Keep unavailable, forbidden, unauthenticated, not-found, conflict, and validation outcomes distinct where specified.
- After persisted/reversible changes, reconcile with reload/fresh read and test both directions where permitted. For one-way actions, show the authoritative terminal result rather than inventing an inverse.
- Generation/bulk work preserves per-item `updated`, `skipped`, and `failed` outcomes; it must not imply all-or-nothing success.
- Preserve keyboard/focus and touch clarity as UX concerns without turning unreported accessibility or responsive behavior into new business behavior.

## 7. Cross-module handoffs

| Handoff | UX obligation |
|---|---|
| Auth -> shopper flows | Establish authenticated identity/session before protected actions; preserve reload persistence and logout reversal. |
| Catalog -> browse/detail | Project eligible ProductModels and sale-ready Variants; preserve category, options, Default Variant, media, and availability meaning. |
| Browse -> cart/checkout | Carry explicit product selection into cart; keep cart, checkout, payment, and order identity contracts separate until clarified. |
| Catalog -> editorial | Link/clear editorial context without transferring ProductModel commercial ownership. |
| Settings/content -> public storefront | Verify accepted identity, homepage, support, banner, FAQ, article, and About projections through fresh public reads. |
| Customer <-> User | Preserve root identity and destination ownership; commerce controls stay in Customer, account controls in User. |
| Customer -> operations | Carry customer context into order/refund/review evidence; missing child history remains a valid root projection. |
| Payment context -> operations | Show payment facts as evidence, never payment execution or automatic refund authority. |
| Collection -> readiness | Keep source, payee, QR/transfer setup, and backend warnings together; invalid setup cannot become live. |
| Notification readiness -> history | Gate website-push dispatch before send; expose campaign/outcome/history after reload and search. |

## 8. Reusable UX pattern candidates

These are reusable information/interaction patterns, not component or Figma prescriptions:
- Search -> result -> normal empty result; refinement can replace the empty result with a match.
- Ownership-preserving handoff with source context, destination ownership, and no copied controls.
- Fresh-read reconciliation and inverse-state verification for reversible changes; validation that preserves the previous valid state.
- Backend-derived status/readiness/action-eligibility guard; lifecycle pattern for active, inactive, terminal, hidden, featured, read-only, unavailable.
- Queue -> evidence -> decision -> confirmation -> history for operations, with structured customer/order/payment/refund/review evidence.
- Ordered editor and protected-media pattern for galleries, banners, FAQs, categories, and content.
- Variant matrix/combination preview, per-item batch results, Variant table, and explicit Default marker.
- Public selector initialized from Default Variant with compatible options and documented media fallback.
- Readiness -> dispatch -> trace for collection and notifications, kept as separate readiness systems.

## 9. Cognitive-load risks

- ProductModel, Variant, Master Data, stock, availability, and sale-readiness may be mistaken for one model/status; use ownership labels and scoped terms.
- Customer and User look like one person but authorize different controls; repeatedly show current root and handoff destination.
- Active, public, available, sale-ready, lifecycle, collection-ready, and notification-ready are not interchangeable; avoid generic green badges.
- Variant combinations, readiness blockers, operational evidence, and bulk outcomes can overload overviews; disclose detail by decision need.
- Combined catalog filters may confuse result counts or stale pages because precedence/reset/URL semantics are open; do not imply a contract early.
- Checkout confirmation and order history are permissive; do not claim durable success from navigation alone.
- Orders, refunds, and reviews share queue language but differ in transitions; share rhythm, not labels.
- Settings/content/collection/notifications all project outward; distinguish saved configuration, live readiness, and public publication.
- Unspecified loading/retry/offline/partial states invite generic invention; keep them explicitly open.

## 10. Applicable desktop/mobile coverage

- **Desktop:** dense admin workflows—ProductModel authoring, category/media/content, customer/user context, operations evidence, collection, notifications, settings, and profile. Named desktop visual trace IDs exist for users, profile, settings, collection, messages, product create/list/categories, and refunds; their visual contracts were not inspected.
- **Mobile:** public discovery/detail, auth/profile, cart, checkout, wishlist/reviews, and notifications. Admin mobile must preserve search, identity/context, status, handoffs, evidence, and critical decisions; dense matrices/editors/histories need an explicit responsive contract.
- **Both:** preserve domain ownership, terminology, permissions, eligibility, empty/unavailable semantics, and fresh-read expectations. Adapt density, not behavior or source of truth. API-only/reference-only behavior has no implied screen coverage.

## 11. Explicit design trace vs behavior trace

| Trace | Establishes | Does not establish |
|---|---|---|
| **Behavior trace** | Accepted goals, information responsibilities, permissions, errors, states, transitions, terminal/read-only semantics, dependencies, fresh reads, and scenario/API classifications from the inventory and handoffs. | API-tagged behavior does not automatically become a UI control; permissive assertions do not become stronger guarantees. |
| **Design trace** | `.agents/designer.md` applied to domains, intent flows, ownership handoffs, grouping, progressive disclosure, interaction principles, responsive coverage, and pattern candidates. | No exact screens, routes, components, layout, tokens, copy, payloads, or missing states. Figma IDs remain unanalysed dependencies. |

Behavior/spec remains the compatibility boundary. Design decisions must trace to an accepted user-visible responsibility or an explicitly resolved contract; an open question must not silently become behavior.

## 12. Unresolved contract questions

- The Catalog baseline is now published in `handoffs/catalog-domain.md`; remaining questions are the unspecified exact API envelopes/routes, availability/buy-metadata details, and the formal legacy Product retirement criterion.
- What are canonical public/admin routes and screen ownership, especially whether `/admin/orders` is a shopper order-history route?
- How do combined catalog search, category, price order, count, and pagination behave, reset, persist, and recover from no results or failures? Which card, detail, tab, gallery, specification, availability, and error states are contractual?
- What are full ProductModel post-publication edits, Variant status and deletion/archive policy, media lifecycle, role/scope names, API envelopes, exhaustive readiness blockers, and validation/error schemas?
- What identifies a cart item and durable order? What are quantity/stock rules, payment outcomes, idempotency, cancellation, confirmation, fresh-read postconditions, and shopper order-history authorization?
- What are OAuth completion/profile/role contracts, Customer/User route and authorization contracts, and handoff context semantics?
- What settings/content fields, enums, conflicts, reversals, public projection guarantees, and registry/legacy preserve-or-retire decision apply?
- What exact collection and notification readiness, compose, outcome, history, search, failure-injection, recovery, and authorization contracts apply?
- Which desktop visual contracts and mobile/accessibility requirements are authoritative, and what comparison method is allowed once visual work is authorized?
