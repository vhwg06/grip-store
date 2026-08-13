# UX Synthesis

## Source boundary and authority

UX synthesis is derived primarily from applicable canonical semantic
specifications, actor goals and product intent. Relevant Gherkin features are
read during discovery as behavioral evidence, then used to challenge and
verify the resulting UX. They are not screen blueprints, interaction
specifications or the primary decomposition of the UX.

Applicable semantic authority is owned by domain:

```text
Catalog/Product SRS → Catalog/Product meaning
Auth semantic spec → Auth meaning
Checkout semantic spec → Checkout meaning
Content semantic spec → Content meaning
Engagement semantic spec → Engagement meaning
```

Where no canonical semantic specification exists, record a `semantic source
gap`. Do not promote Gherkin, a legacy UI or implementation convention into
semantic authority.

## 1. Design trace

```text
domain semantics
→ actor goals + product intent
→ UX model / IA / canonical flows
→ shopper mental model
→ information requirements
→ interaction requirements
→ validated DS foundations
→ screens / states / prototype
→ product validation
→ proven repeated solutions
→ DS promotion
```

The shopper mental model is a UX synthesis output. It is not copied from a
test scenario or assumed from a product category.

## 2. Behavior trace

```text
Gherkin scenario
→ observable outcome / constraint
→ relevant UX flow/state
→ compatibility challenge
→ compatible / conflicting / stale / semantic-gap
→ evidence
```

If Gherkin is compatible with the applicable semantic authority, preserve its
observable outcome. If it conflicts:

```text
canonical semantics win on meaning
→ do not encode contradictory behavior
→ mark the conflict
→ block completion until the contract is resolved
```

## 3. Actor goals and task flows

These flows are synthesized from the domain contracts and user-facing intent;
they are not a one-scenario-per-screen inventory.

1. **Discover → inspect → configure or explicitly add:** Orient from public
   discovery, narrow or compare where an applicable contract supports it,
   inspect a ProductModel, understand its current configuration and complete
   the next authorized action. Discovery must not imply a purchase mutation.
2. **Configure a ProductModel:** Understand ProductModel as the customer-visible
   product, understand the semantic relationship to Variant, inspect the
   current configuration, choose compatible dimensions and see the resulting
   sellable representation.
3. **Cart → checkout → result:** Preserve the product-to-cart-to-checkout
   boundary only where the applicable checkout contract owns it. Do not infer
   durable order, payment, inventory or history semantics from permissive
   assertions.
4. **Register → authenticate → maintain session:** Register or log in,
   distinguish validation/authentication/duplicate-email feedback, initiate
   OAuth, verify reload persistence and log out.
5. **Engage:** Read and submit eligible reviews, manage wishlist state and
   notification read state only where the applicable contract owns the action.
6. **Read public content:** Discover published articles, read detail, paginate,
   understand About content and submit contact information when the contract
   supports it.

## 4. Catalog / ProductModel / Variant mental model

- `ProductModel` is the customer-visible product concept and aggregate root.
- `Variant` is a sellable unit belonging to a ProductModel; it is not an
  independent public product.
- Variant identity is the canonical combination of complete Dimension
  selections; technical values do not participate in identity.
- `Default Variant` supplies the initial public projection when the contract
  requires it: selected options, price, SKU and media priority.
- Public query exposes only eligible Active ProductModels with at least one
  sale-ready Variant. Draft preview is private and uses the same projection
  semantics over Draft data.
- Variant media takes priority when applicable; ProductModel media is the
  documented fallback. Inventory, warehouse, order, purchase-limit and
  warranty-claim state are not Catalog public projection data.

## 5. Public IA and information grouping

Public IA is organized by user intent, not internal packages:

```text
orient → narrow/compare where authorized → inspect → configure → explicitly act
```

### Discovery

Group orientation cues, result-set transformations, result count where
contractual, ProductModel cards and no-match state. Do not add search, sort,
availability, promotion or purchase controls solely because the storefront is
ecommerce; each needs an applicable capability contract.

### ProductModel detail

Group ProductModel identity/content, gallery, ordered Dimensions/Options,
current configuration, resolved selling projection and technical information
where public. The interaction model must make the semantic relationship
between ProductModel and Variant understandable without exposing backend
internals as the primary UI.

### Auth, checkout, engagement and content

Keep identity/session, cart/checkout, engagement and editorial content as
separate ownership contexts. Share visual foundations and proven primitives;
do not merge domain controls merely because screens look similar.

## 6. Design System boundary

Before product composition, consume only validated foundations/primitives:

```text
tokens · typography · color roles · spacing · surfaces · focus · basic controls
```

Product flows may solve an unproven interaction locally. After the solution
is repeated and validated for behavior and visual quality, promote it into
the Design System. Do not create speculative domain patterns before product
evidence exists.

## 7. Screen and state modeling

Canonical production frames represent a coherent runtime state. Do not mix
mutually exclusive runtime states inside one production screen. Supporting
artifacts may show adjacent or component states for exploration and
verification.

Do not create one frame per scenario. A single coherent flow may preserve
multiple compatible outcomes. Create separate production states only when
content, action availability, permissions, recovery or visual contract changes
materially.

## 8. Responsive and prototype principles

- Desktop and mobile share semantic goals, ownership and transitions, but may
  recompose layout and density independently.
- Prototype real user operations and resulting product states, not scenario
  cards or acceptance annotations.
- Reversible flows need a return path. Terminal/read-only states hide invalid
  actions.
- Reload/fresh-read evidence is represented only when the applicable contract
  requires it.
- API-only behavior is traceable evidence, not an implied screen.

## 9. Traceability artifacts

Maintain two independent matrices:

```text
DESIGN TRACE
domain concept/capability
→ actor goal
→ UX concept
→ flow
→ information requirement
→ interaction requirement
→ screen/pattern
```

```text
BEHAVIOR TRACE
scenario
→ observable outcome/constraint
→ relevant flow/state
→ preserved?
→ evidence
→ conflict status
```

## 10. Completion gates

### Semantic gate

- Correct domain semantic owner is identified.
- ProductModel/Variant and other owned concepts retain their meaning.
- No unresolved semantic conflict is encoded in UX.
- Semantic source gaps are explicit.

### UX gate

- The flow serves a clear actor goal.
- The mental model is understandable without backend knowledge.
- Information and actions are grouped by user intent and ownership.
- Unsupported familiar ecommerce behavior is absent.

### Behavior gate

- Compatible observable outcomes are preserved.
- Gherkin/API classification is respected.
- Conflicts are marked and block completion.
- Prototype evidence demonstrates the relevant flow/state rather than only
  showing annotations.

### Visual gate

- Validated foundations are used consistently.
- Reusable patterns were promoted only after product evidence.
- Production frames contain real UI and coherent runtime states.
- Responsive composition, hierarchy, geometry and visual QA pass.
