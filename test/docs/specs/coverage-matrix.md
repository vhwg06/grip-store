# GRIP design trace / behavior trace matrix

This document keeps product design reasoning separate from behavioral
verification. Gherkin scenarios are read during discovery and correlated
after UX synthesis; they are not screen blueprints or the primary UX
decomposition source.

## Authority register

| Domain | Applicable semantic authority | Behavioral evidence | Current gap/precedence |
|---|---|---|---|
| Catalog / Product | `test/docs/srs/srs_001_product.md` | `test/modules/catalog/**/behavior.feature` | SRS owns ProductModel, Variant, lifecycle and public meaning. Conflicting legacy Product behavior is not preserved silently. |
| Browse | No separate canonical semantic specification located | `test/modules/browse/behavior.feature` | `semantic source gap`; browser outcomes may be preserved only where they do not conflict with Catalog semantics. |
| Auth | No separate canonical semantic specification located | `test/modules/auth/behavior.feature` | `semantic source gap`; do not promote API behavior into new product meaning. |
| Checkout | No separate canonical semantic specification located | `test/modules/checkout/behavior.feature`, `test/modules/product-flow/behavior.feature` | `semantic source gap`; cart/order meaning remains bounded by the accepted scenarios and unresolved contract notes. |
| Engagement | No separate canonical semantic specification located | `test/modules/engagement/behavior.feature` | `semantic source gap`; API-only scenarios remain verification evidence. |
| Content | No separate canonical semantic specification located | `test/modules/content/behavior.feature` | `semantic source gap`; preserve only observable content/contact outcomes that the scenarios prove. |

## Design trace

| Domain/capability | Actor goal | UX concept / mental model | Canonical flow | Information requirement | Interaction requirement | Screen/pattern | Status |
|---|---|---|---|---|---|---|---|
| Catalog / Public query | Discover a customer-visible product | ProductModel is the public product concept; Variant is internal to that product's selectable selling projection | Orient → browse → inspect | ProductModel identity, Category, content, ordered media/Dimensions/Options, current selling information | Open ProductModel detail; never list Variant as an independent product | Public catalog `561:47`; ProductModel detail `561:48`, `561:49`, `561:123`, `561:145`, `561:726` | design evidence captured; semantic/behavior QA pending |
| Validated foundations | Give product flows consistent visual and interaction primitives | Foundations are consumable infrastructure, not domain meaning or product patterns | Token/type/control/shell/data primitive → product flow | Color roles, typography, spacing, focus, shell, data row, selection, status and responsive rules | Consume validated primitives; promote domain patterns only after repeated product evidence | `561:2` / `562:885` | foundation evidence captured; no speculative domain pattern promoted |
| Catalog / Variant selection | Understand and change a product configuration | Shopper understands current configuration and resulting sellable representation | Initial projection → configure → resolve | Default Variant initial options/price/SKU/media; compatible sale-ready options; resolved Variant projection | Choose dimensions, preserve order, update resolved representation and media fallback | `561:48`, `561:49`, `561:145`, `561:726` | design evidence captured; product validation pending |
| Browse | Move from discovery to inspection | Homepage is orientation; catalog is narrowing; detail is inspection | Home → category/catalog or featured ProductModel → detail | Hero, categories, featured ProductModels, active announcement where contractually present | Discovery actions route without cart mutation; homepage cards do not expose unsupported actions | `561:142`, `561:143`, `561:144`, `561:614`, `561:724`, `561:725` | behavior-preserved slice; semantic source gap |
| Auth | Establish and end an explicit identity | Visitor/account holder distinction; authenticated state is reversible | Login/register → authenticated session → refresh/logout | Validation vs authentication vs duplicate-email feedback; visible identity marker | Submit credentials, start OAuth redirect, preserve session after reload, logout | `561:146`, `561:147`, `561:148`, `561:149`, `561:727` | behavior-preserved slice; semantic source gap |
| Checkout | Manage cart and attempt purchase | Cart is a durable handoff boundary; checkout/order semantics remain contract-bounded | Product → cart → checkout → result | Cart items, total, quantity, empty state, checkout/place-order/result evidence | Add/update/remove/submit only where the applicable browser contract authorizes it | `561:150`, `561:151`, `561:152`, `561:153`, `561:154`, `561:728` | behavior-preserved slice; semantic source gap |
| Engagement | Read and manage shopper-owned engagement | Review, wishlist and notification state have separate ownership | Read → eligible mutation → fresh read where required | Review visibility, wishlist presence/vote, notification read state | Auth-gated submit/add/remove/vote/read/clear actions | `561:155`, `561:156`, `562:1011`, `561:157`, `561:159`, `561:686`, `561:729` | behavior-preserved slice; semantic source gap |
| Content | Understand the store and contact it | Editorial list/detail and contact information are separate intents | List → detail → back; contact → submit → result | Backend-owned narrative/gallery/article content/map/contact information | Pagination, article navigation and contact submission | `561:158`, `561:160`, `561:162`, `561:657`, `561:161`, `561:163`, `561:730`, `561:731` | behavior-preserved slice; semantic source gap |

## Behavior trace

| Scenario scope | Observable outcome / constraint | Relevant design flow/state | Preserved? | Evidence | Status |
|---|---|---|---|---|---|
| `SC-GREEN-PUBLIC-001..008` | Public listing/detail/resolution exposes only valid Active ProductModels and sale-ready Variant projections; Default Variant, canonical identity, compatible options and media fallback remain correct | Public catalog → ProductModel detail → configuration | Compatible with Catalog SRS; prototype alignment captured, API contract not executed in this Figma-only turn | `test/modules/catalog/public-query/behavior.feature`; `561:47`, `561:48`, `561:49`, `561:123`, `561:145` | pending validation |
| `SC-BROWSE-HOME-001..007` | Homepage discovery blocks and announcement where applicable; discovery routes do not mutate cart; homepage cards omit unsupported follow/add actions | Browse home → catalog/detail | Preserved in `561:142`/`561:724`; semantic gap remains | `test/modules/browse/behavior.feature`; `561:307`, `561:315`, `561:872`, `561:815` | semantic-gap / pending validation |
| `SC-BROWSE-CATALOG-001..009` | Listing, category, price order, pagination, search, empty result, count, detail navigation and listing-card add behavior as explicitly asserted | Catalog result set | Preserved in `561:143`, `561:144`, `561:614`, `561:725`; generic browse meaning cannot override Catalog SRS | `test/modules/browse/behavior.feature`; `handoffs/public-browse.md` | semantic-gap / pending validation |
| `SC-BROWSE-DETAIL-001..007` | Product information/gallery/tabs/specifications and add-to-cart/unavailable outcomes where the browser contract owns them | ProductModel detail | Preserved in `561:145`, `561:726` and SRS-owned unavailable states; semantic correlation pending | `test/modules/browse/behavior.feature`; `handoffs/catalog-domain.md` | semantic-gap / pending validation |
| `SC-PF-CART-COMPOSITION-001..002` | Detail add-to-cart and selected quantity compose with cart | Product detail → cart | Only if compatible with the applicable checkout/product semantic authority | `test/modules/product-flow/behavior.feature` | semantic source gap |
| `SC-AUTH-*` browser scenarios | Login/signup validation, OAuth initiation, reload persistence and logout reversal | Auth flows | Preserved in `561:146`–`561:149`, `561:727`; no Auth semantic authority exists | `test/modules/auth/behavior.feature`; `handoffs/public-auth.md` | semantic-gap / pending validation |
| `SC-CHECKOUT-*` browser scenarios | Cart mutation, total/empty state, checkout CTA, order result and order-list visible boundary | Cart → checkout → result | Preserved in `561:150`–`561:154`, `561:728`; unresolved order-history/persistence semantics remain explicit | `test/modules/checkout/behavior.feature`; `handoffs/public-checkout.md` | semantic-gap / pending validation |
| `SC-ENGAGEMENT-*` browser scenarios | Review, wishlist and voting outcomes; notification behavior remains API/reference-classified where no browser contract exists | Engagement flows | Preserved in `561:155`, `561:156`, `562:1011`, `561:157`, `561:159`, `561:686`, `561:729`; no Engagement semantic authority exists | `test/modules/engagement/behavior.feature`; `handoffs/public-engagement.md` | semantic-gap / pending validation |
| `SC-CONTENT-*` browser scenarios | About, article list/detail/pagination and contact form/result | Content flows | Preserved in `561:158`, `561:160`, `561:162`, `561:657`, `561:161`, `561:163`, `561:730`, `561:731`; no Content semantic authority exists | `test/modules/content/behavior.feature`; `handoffs/public-content.md` | semantic-gap / pending validation |
| API-tagged scenarios without browser ownership | Status/auth/error/shape constraints at API boundary | No implied production screen | Trace only unless required as a projection mechanism | Applicable feature files and handoffs | reference-only |

## Behavior-trace statuses

- `compatible`: scenario is consistent with the applicable semantic authority and its outcome is preserved.
- `conflicting`: scenario contradicts canonical semantics; do not encode it into UX; completion is blocked.
- `stale`: scenario describes retired behavior and requires owner resolution.
- `semantic-gap`: no canonical semantic authority exists for the domain; do not infer new meaning from Gherkin alone.
- `pending validation`: UX exists or is being rebuilt, but the outcome has not yet been verified in the actual prototype.
- `reference-only`: API/internal evidence with no implied production screen.

## Conflict and source-gap register

- **Catalog precedence:** `srs_001_product.md` owns ProductModel, Variant,
  Default Variant, public eligibility and projection meaning. A browse or
  legacy scenario that treats Variant as an independent public product would
  be `conflicting`/`stale`; it must not be revived in the Figma flow.
- **Current audit result:** no current Public Gherkin scenario was promoted to
  override the Catalog SRS. Generic Product wording remains correlated as
  behavior evidence until it is semantically reconciled.
- **Missing owners:** Browse, Auth, Checkout, Engagement and Content currently
  have no separate canonical semantic specification in the repository. Their
  frames preserve accepted observable outcomes only and remain `semantic-gap`.
- **Resolution rule:** any future contradiction is returned to the owning
  semantic-spec owner, recorded here, and blocks completion until resolved.

## Completion rule

Design trace proves that the UX has a domain and user-goal rationale.
Behavior trace proves that compatible observable outcomes are preserved. The
two traces meet at validation; neither trace is generated from the other.
