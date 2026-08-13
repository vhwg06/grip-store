# Wave A — Public Browse discovery handoff

## Source boundary

This handoff is derived only from:

- `test/modules/browse/README.md`
- `test/modules/browse/manifest.yaml`
- `test/modules/browse/behavior.feature`
- `test/modules/browse/behavior.steps.ts`

The feature file is the accepted behavior source of truth. The step file is used here only to identify the observable contract, data prerequisites, and navigation assertions. This is a discovery handoff, not a screen inventory or an implementation specification.

## User goals

The public-browse guest wants to:

1. Get oriented from the homepage through a hero, categories, featured products, and—when active—an announcement.
2. Move from a discovery cue to the relevant catalog category or product detail.
3. Explore the catalog by category, keyword, price order, and result page.
4. Understand whether exploration returned products, how many results were returned, or that no result matched.
5. Inspect enough product information to decide whether to buy: title, price, images, tabbed detail content, and specifications.
6. Make an explicit purchase step by adding an available product from a catalog card or product detail.
7. Recognize when a product is unavailable and understand that adding it to the cart is not offered.

## Browse/catalog discovery mental model

The journey is an intent-preserving funnel:

`orient → narrow or compare → inspect → explicitly add`

The homepage is an entry surface, not a transactional surface. A category is a route into a narrowed catalog, while a featured-product discovery cue is a route into detail. Selecting either must preserve the guest's exploratory intent; the homepage discovery CTA does not add to the cart, and homepage cards expose neither follow nor add-to-cart actions (`SC-BROWSE-HOME-003` through `007`).

The catalog is the exploration workspace. A guest can combine the concepts of a product result set, category narrowing, keyword matching, price ordering, and page navigation. A result count helps the guest understand the size of a searched set. A product card offers two distinct intents: open the product through its title/image, or explicitly add the listed product to the cart (`SC-BROWSE-CATALOG-001` through `009`).

Detail is the inspection and decision point. It exposes product information, an image gallery, tabbed content, and specifications. Add-to-cart is available for an available product, including the refactored detail flow. An unavailable identifier instead produces an unavailable-product state with no detail add-to-cart action (`SC-BROWSE-DETAIL-001` through `007`).

## User-visible information shape

The accepted behavior implies the following information groups. These are content responsibilities and relationships, not prescribed layouts.

| Discovery context | Information the guest can perceive | Interaction meaning |
| --- | --- | --- |
| Homepage | Hero; category discovery blocks/icons; featured product cards; active announcement banner | Start catalog or product discovery. Homepage product cards are discovery-only. |
| Catalog result set | Product cards; category filter; price sorting; keyword search; result count after search; pagination when there are multiple pages | Narrow, order, inspect, page through, or explicitly add a listed product. |
| Product card | A product represented as a selectable card, with title/image navigation and (in catalog context) an add-to-cart action | Title/image opens detail; catalog add-to-cart mutates cart explicitly. |
| Product detail | Product title and price; image gallery; detail tabs and selected tab panel; specification table | Inspect product before deciding. |
| Unavailable detail | An unavailable/not-found product state | Explain that the product cannot be purchased in this state; omit detail add-to-cart. |
| Empty catalog result | No-match result state | Confirm that the requested keyword returned no products. |

The source validates presence and relationships, but does not define exact copy, card fields beyond the detail title/price assertions, gallery controls, tab labels, specification rows, result-count wording, or visual arrangement.

## Discovery state matrix

### Homepage

- **Loaded:** Hero, at least one category discovery block/icon, and at least one featured product block are visible (`SC-BROWSE-HOME-001`).
- **Announcement present:** An active announcement is visible as a banner (`SC-BROWSE-HOME-002`). The source does not define the inactive/no-announcement presentation.
- **Category selected:** The catalog listing opens for that category (`SC-BROWSE-HOME-003`).
- **Featured product selected:** Product detail opens (`SC-BROWSE-HOME-004`).
- **Discovery-only action:** Selecting the homepage discovery CTA leaves an empty guest cart empty (`SC-BROWSE-HOME-005`).
- **Action boundaries:** Homepage product cards contain no follow action and no add-to-cart action (`SC-BROWSE-HOME-006`, `SC-BROWSE-HOME-007`).

### Catalog

- **Results available:** Product cards are visible (`SC-BROWSE-CATALOG-001`).
- **Category-filtered:** The listing contains products from the selected category (`SC-BROWSE-CATALOG-002`).
- **Price-sorted:** The listing follows the selected price order; the exercised selection is `price_asc` (`SC-BROWSE-CATALOG-003`). The source does not establish other price directions.
- **Paged:** Changing to page 2 shows the corresponding result page and exposes `page=2` in the URL (`SC-BROWSE-CATALOG-004`).
- **Keyword match:** Matching product results are shown (`SC-BROWSE-CATALOG-005`).
- **No match:** A no-results/empty result state is visible (`SC-BROWSE-CATALOG-006`).
- **Counted search:** Once matching results return, a result count is visible and is at least consistent with the number of rendered cards (`SC-BROWSE-CATALOG-007`). The source does not define whether the count is filtered, total, or paginated beyond this observed relationship.
- **Card navigation:** Selecting the title or image intent on a product card opens detail (`SC-BROWSE-CATALOG-008`).
- **Card purchase:** An available product can be added from its listing card and then appears in the cart (`SC-BROWSE-CATALOG-009`).

### Product detail

- **Available product:** Title and price are visible (`SC-BROWSE-DETAIL-001`); an image gallery is visible when product images exist (`SC-BROWSE-DETAIL-002`); another detail tab can be selected and its panel is visible (`SC-BROWSE-DETAIL-003`); specification data is represented by a visible specification table (`SC-BROWSE-DETAIL-005`).
- **Explicit purchase:** Add-to-cart from the standard detail flow adds the product to the cart (`SC-BROWSE-DETAIL-004`). The refactored detail flow has the same observable cart outcome (`SC-BROWSE-DETAIL-006`).
- **Unavailable product:** An unavailable product state is visible and the detail add-to-cart action is absent (`SC-BROWSE-DETAIL-007`).

## Search, filter, sort, and pagination contract

These controls should be understood as transformations of the guest's current catalog result set:

- **Search:** Accept a keyword and show matching product results. The accepted no-match path must become an explicit empty result state.
- **Category filter:** Selecting a category narrows the listing to that category. The homepage category entry point and catalog category filter are related discovery mechanisms, but the source does not specify whether they share a control or state representation.
- **Sort:** Selecting price sorting changes result order. `price_asc` is the only exercised order; do not infer additional sort options from the scenario name.
- **Pagination:** When multiple result pages exist, changing page shows the corresponding result page. Page 2 is explicitly observable in the URL.
- **Result count:** After a search returns results, show a count that corresponds to the result set sufficiently to satisfy the accepted assertion.

The approved sources do not define precedence when search, category, sort, and pagination are combined; whether changing a filter resets the page; whether controls persist in the URL; debounce or submit behavior; case/diacritic handling; page-size selection; or a way to clear a search/filter. Those are discovery questions, not assumptions for Wave A.

## Empty and error states

### Accepted empty/unavailable states

- A no-match catalog search has a visible empty result state (`SC-BROWSE-CATALOG-006`).
- An unavailable or missing product identifier has a visible unavailable/not-found state and no detail add-to-cart action (`SC-BROWSE-DETAIL-007`).

### Not specified by the approved sources

No accepted scenario defines a catalog-load error, homepage-load error, announcement-fetch failure, image failure, search failure, filter/sort failure, pagination failure, or cart-add failure presentation. The step bindings do require the public catalog and announcement contracts to be reachable for their prerequisite data, but that is a test dependency, not a user-facing error design.

The handoff therefore treats these as unresolved states requiring product decisions before they become behavior commitments. It does not invent retry, recovery, fallback, or error-copy behavior.

## Scenario index and evidence

| User journey | Scenario IDs | Discovery evidence |
| --- | --- | --- |
| Homepage entry points | `SC-BROWSE-HOME-001`–`007` | Orientation blocks, announcement, category/product navigation, no implicit cart mutation, no follow/add actions on homepage cards |
| Catalog exploration | `SC-BROWSE-CATALOG-001`–`009` | Cards, category filtering, price sorting, pagination, keyword search, no-match state, result count, card navigation, listing-card add-to-cart |
| Product inspection and purchase | `SC-BROWSE-DETAIL-001`–`007` | Title/price, gallery, tabs, add-to-cart, specifications, refactored detail purchase, unavailable state without add-to-cart |

The manifest lists all 23 IDs. The feature presents catalog IDs `009` before `008`; both are included above in numeric order for handoff readability. All listed scenarios are tagged accepted/browser and belong to the three rules `UC-BROWSE-HOME`, `UC-BROWSE-CATALOG`, and `UC-BROWSE-DETAIL`.

## Dependencies and readiness assumptions

### Data and state dependencies

- A guest session and browser lifecycle are available.
- Homepage readiness requires visible hero, category, and featured-product content.
- The active-announcement scenario requires an active announcement.
- Catalog-card scenarios require active products; category filtering requires category data; sorting requires at least two products with different prices; pagination requires more than one result page.
- Keyword-match search derives a known keyword from an active product title; no-match search uses a keyword expected not to match.
- Detail scenarios require an active product; gallery and specification scenarios require the corresponding product data.
- Cart assertions require a readable guest cart and use cart contents to prove that an explicit catalog/detail action had an effect—or that homepage discovery did not.

### Journey dependencies

`homepage category → catalog filtered by category`

`homepage featured product/card navigation → product detail`

`catalog product card → product detail`

`catalog/detail explicit add → cart reflects product`

`detail availability state → add-to-cart availability`

These are behavioral relationships, not a requirement that every context use the same visual component or route.

### Verification dependencies

The approved bindings observe visible blocks, cards, state markers, URL changes, and cart contents. They do not establish visual design, responsive behavior, accessibility semantics, exact copy, or persistence across a reload except where navigation/cart reads are used to observe the outcome. Any future behavior in those areas needs its own source-of-truth scenario or explicit product decision.

## Reusable interaction candidates

These candidates are reusable patterns identified from repeated intent, not mandated components:

- **Discovery card:** A product representation with a clear open-detail target. Use the same conceptual pattern for homepage featured products and catalog products, while keeping the homepage action boundary discovery-only.
- **Category entry/filter:** A category affordance that can start discovery from the homepage or narrow an existing catalog set. Preserve the selected category as understandable context.
- **Catalog query controls:** Search, category filter, price sort, result count, and pagination form one result-set navigation model. Their combined behavior remains to be clarified before treating them as a single persistent control group.
- **Result-state pattern:** One stable result region that can express populated results, no keyword matches, and unavailable product detail without making the guest guess whether content is loading, empty, or unavailable.
- **Detail inspection pattern:** Product identity (title/price), visual evidence (gallery), structured content (tabs/specifications), and an explicit purchase action for available products.
- **Action-boundary rule:** Discovery surfaces open or refine information; purchase actions are explicit and context-specific. This rule is evidenced by homepage CTA/cart invariance, homepage action absence, and catalog/detail add-to-cart scenarios.

## Open discovery questions

The accepted behavior is sufficient to define the Wave A goals and observable states, but not to settle these product decisions:

- What exact product information belongs on a catalog card beyond its selectable title/image and available add-to-cart action?
- What are the supported price sort directions and any other sort modes?
- How should combined search, category, sort, and pagination state behave, including reset/persistence rules?
- What does the guest do to clear a query or recover from no results?
- What are the user-facing recovery states for loading or failed catalog/detail data?
- What are the announcement's dismiss, persistence, and inactive states?
- What are the detail tab names/content boundaries, gallery behavior, and specification presentation?
- How should a successful add-to-cart action be acknowledged while keeping the guest's discovery context understandable?

