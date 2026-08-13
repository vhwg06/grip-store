# GRIP greenfield Figma QA evidence and redesign disposition

This is the persistent evidence index for the current Figma execution. It
records what was structurally verified, what has been rejected by the new
semantic/design-trace guide, and keeps export limitations explicit.

## Current redesign disposition

The previous Public/Design System artifact is not the canonical UX source for
the next pass. The existing frames remain available as audit history, but the
Public Storefront and product-pattern boards are being treated as
`non-canonical / rejected pending rebuild` because they were composed before
the separate design-trace/behavior-trace rules were applied.

The rebuild must derive UX from applicable domain semantics, actor goals and
product intent; consume only validated foundations; and promote repeated
product solutions into the Design System only after product validation.

Gherkin scenarios are correlated as behavioral evidence. A scenario that
conflicts with canonical semantics is recorded as `conflicting` or `stale`,
not preserved by adding contradictory UI.

## Canonical rebuild started

Because the Starter plan has a three-page limit, the empty `90 — Archive`
page was repurposed as the canonical foundation page after the previous
Design System page was renamed to the rejected archive:

- `01 — GRIP Design System / Validated Foundations` (`514:557`)
- `FOUNDATIONS / Validated Foundation Board` (`561:2`), including shell,
  controls/focus, responsive, generic data-row/selection/status and
  accessibility boundary specimens.

The Index now contains a separate canonical Catalog rebuild scope:

- `10 — Public Storefront / Canonical Rebuild / Catalog` (`561:44`)
- `Public / Catalog / Browse ProductModels / Results / Loaded / Desktop` (`561:47`)
- `Public / Catalog / ProductModel / Detail / Default Variant / Desktop` (`561:48`)
- `Public / Catalog / ProductModel / Detail / Alternate Variant / Desktop` (`561:49`)
- `Public / Catalog / ProductModel / Detail / Unavailable / Desktop` (`561:123`)

The Catalog prototype wires card → detail, detail back → catalog, default
configuration → alternate Variant projection, and unavailable/back → catalog.
The connector rejected reactions while these frames were nested inside the
scope container, so production frames were reparented to the Index as
top-level frames to satisfy Figma navigation requirements. Reactions were
then created successfully.

Fresh screenshot evidence was captured and visually inspected for the
foundation board and every current Catalog/ProductModel production state:

- [`grip-foundations.png`](./evidence/grip-foundations.png)
- [`grip-foundations-v2.png`](./evidence/grip-foundations-v2.png)
- [`grip-catalog-loaded.png`](./evidence/grip-catalog-loaded.png)
- [`grip-product-default.png`](./evidence/grip-product-default.png)
- [`grip-product-alternate.png`](./evidence/grip-product-alternate.png)
- [`grip-product-unavailable.png`](./evidence/grip-product-unavailable.png)
- [`public-catalog-rebuild-v2.pdf`](./evidence/public-catalog-rebuild-v2.pdf)

The inspected states use a warm neutral canvas, restrained ochre action
colour, ProductModel-first listing/detail language, and explicit default,
alternate and unavailable projections. The abstract product forms are visual
representations for the design artifact; they do not introduce inventory,
shipping or purchase behaviour.

The Catalog frames are the SRS-owned semantic anchor. The rest of the Public
artifact is now represented by a separate behavior-preserved slice; it is not
silently promoted to semantic authority where no canonical domain spec exists.

## Current Public behavior-preserved slice

Top-level production frames on `00 — Index`:

| Domain | Desktop frames | Representative mobile |
|---|---|---|
| Browse | `561:142`, `561:143`, `561:144`, `561:614`, `561:145` | `561:724`, `561:725`, `561:726` |
| Auth | `561:146`, `561:147`, `561:148`, `561:149` | `561:727` |
| Checkout | `561:150`, `561:151`, `561:152`, `561:153`, `561:154` | `561:728` |
| Engagement | `561:155`, `561:156`, `562:1011`, `561:157`, `561:159`, `561:686` | `561:729` |
| Content | `561:158`, `561:160`, `561:162`, `561:657`, `561:161`, `561:163` | `561:730`, `561:731` |

The new slice uses domain semantics and actor goals for UX synthesis, consumes
the validated foundation primitives, and uses Gherkin only as an adjacent
behavioral challenge. Prototype wiring covers the current supported paths:
Browse discovery/query/detail, Auth login/signup/session/logout, cart →
checkout → result, review/wishlist outcomes, and article/contact paths. Auth,
Checkout, Engagement and Content remain `semantic-gap` domains; their frames
must not be read as stronger product meaning than the accepted scenarios
prove. Catalog/ProductModel remains governed by the canonical SRS.

The current 34-frame Public text audit found no fabricated inventory/stock,
warehouse, shipping, promotion/discount, purchase-limit or warranty-claim
copy.

Visual evidence is available for the foundation board and representative desktop/mobile frames,
including the corrected `public-home-mobile-v3.png`,
`public-catalog-mobile-v3.png`, `public-wishlist-mobile-v3.png`,
`public-catalog-query-v2.png`, `public-catalog-page2-v2.png`, and
`public-review-accepted-reload-v2.png`. Export
timeouts remain explicitly unverified and are not converted into passes.

## Artifact scope

- Figma file: `GRIP-Website-Design`
- `00 — Index`: rejected Public archive, Admin section and initial canonical Catalog rebuild remain separated.
- `01 — GRIP Design System / Validated Foundations`: current foundation-only board; it deliberately contains no ProductModel, Cart, Queue or other domain pattern.
- `90 — Archive / Rejected Design System / Pending Rebuild`: previous foundation/pattern board; non-canonical historical material.
- `90 — Archive / Rejected Public Storefront / Pending Rebuild`: previous Public storefront frame; non-canonical historical material.
- Historical product sections contain actual screen compositions, but their
  canonical status is suspended pending semantic conflict audit and rebuild.
  Scenario IDs and trace labels are not embedded in product frames.

## Foundation / tone checks

- Canonical collection: `GRIP / New Foundations`, mode `Warm Neutral`.
- Canvas token/style: `#F7F3ED`.
- Elevated surface: `#FFFDF9`.
- Subtle surface: `#F1ECE4`.
- Primary ink: `#24211D`.
- Muted ink: `#6F675E`.
- Ochre accent: `#805F24` (`GRIP / Accent / Ochre`, `Color/Accent/Ochre`). The tone remains restrained, while the darker canonical accent lets `Color/Ink/OnAccent` text meet contrast requirements.
- Semantic roles: success `#2F6B50`, warning `#9A6A1F`, danger `#A63D32`.
- Old `Clay` naming is absent from the canonical product sections.
- Auth context panels were migrated from dark/clay treatment to the subtle neutral surface so the dominant impression stays light/neutral first.

## Historical structural checks for rejected artifact

The following measurements belong to the pre-redesign artifact. They remain
useful geometry evidence but do not establish canonical UX completion.

## Structural checks

- Rejected Public section `521:1052`: five direct module containers (`Browse`, `Auth`, `Checkout`, `Engagement`, `Content`), with use-case/responsive wrappers beneath them.
- Admin greenfield section `521:1053`: eight direct module containers (`Operations`, `Catalog`, `Content`, `Account`, `Profile`, `Settings`, `Payments`, `Notifications`), with use-case/responsive wrappers beneath them.
- Every applicable Desktop/Mobile pair is owned by the same use-case/responsive wrapper; single-viewport contracts remain explicit.
- No canonical viewport is a direct child of either greenfield section, and no canonical screen is left outside a module container.
- Admin desktop viewport frames use `1440 × 1326` where applicable.
- Admin use-case wrappers now declare viewport coverage in their layer names (`Desktop + Mobile`, `Desktop only`, or `Mobile only`), while `00 — Index / Admin ownership + viewport coverage` provides the module-to-use-case map.
- Independent Admin hierarchy audit: 21 use-case wrappers and 35 viewport children; every wrapper has exactly one module owner. The only intentional artifact outside the Admin module tree is `546:5053` under the Index frame, used for ownership/viewport navigation metadata.
- Public desktop frames use `1440 × 900` for the new representative screens; mobile frames use `390 × 844` where applicable.
- No `SC-*` or `Traceability` text was found in the public, admin or Design System canonical sections during the latest searches.
- Legacy admin draft panels were deleted after viewport-complete replacements were verified structurally.

Latest hierarchy/coordinate verification:

```text
Index map `546:5053`: contained, no sibling overlap
Admin section `521:1053`: 8 direct modules, no sibling overlap, no out-of-parent children
Admin section canvas position: (3877, 692)
Admin module local positions: (80,80), (80,12050), (80,18372), (80,35210), (80,37668), (80,39234), (80,40800), (80,42366)
Admin hierarchy: 8 modules → 21 use-case wrappers → 35 viewport children
```

## Verified representative visual evidence

Successful exports available under `test/docs/specs/evidence/`:

- `admin-reviews-viewport.png` — admin shell, moderation queue, decision context, action hierarchy and light-neutral tone.
- `admin-orders-mobile.png` — mobile order detail, status, total, action and fresh-read guidance.

Earlier evidence files include Design System and public browse/auth tone checks where present.

## Export limitations

Figma export requests for several large/complex frames timed out. A timeout is not treated as a visual pass. For those frames, only node geometry, children, copy, token colors, naming and prototype reaction evidence is recorded until a successful export is available.

## Prototype / integration evidence

The current Public action audit inspected the original 40 intended action
nodes plus 101 added category/card/back/shell/reload-state handoff actions. Of
141 audited nodes, 135 have reachable top-level `NAVIGATE` reactions. The six without a
reaction are five same-frame/decorative self-navigation candidates
(`561:298`, `561:321`, `561:786`, `561:790`, `561:799`) plus OAuth (`561:397`),
which remains an external provider-redirect boundary. No cross-frame reaction
points to a nested or non-existent destination.

- Public auth owner supplied state-frame and intra-auth reactions for login,
  validation, invalid credentials, signup, duplicate email, success, session
  reload and logout; OAuth remains an explicit external redirect boundary.
- Public browse owner supplied catalog/detail/empty/unavailable reactions.
- Public checkout owner supplied quantity reversal, remove-to-empty, cart-to-checkout, place-order-to-result, result recovery and empty-cart-to-browse paths.
- Cross-module wiring added for product card → cart, checkout result → browse, customer → order/refund/review.
- Admin operations action reactions connect order processing, refund approve/reject and review decision to terminal/read-only states.
- Content/engagement entry reactions were added within their owning sections; Integration does not redesign those artifacts.
- The current mobile article Page 2 “Tiếp” path is represented by the reachable
  top-level Page 2 frame `561:657` from the desktop article-list flow. The
  former nested `528:*` destination remains historical only.

The previous Public/Design System prototype evidence is retained as historical
audit evidence only. New Catalog reactions were verified from successful
connector responses, and screenshot/export-level visual verification is now
available for the foundation board plus all four rebuilt Catalog states. This
does not close the remaining whole-Public semantic-source gaps.

## Geometry audit

The layout repair was performed after a direct-child and recursive geometry audit, not from parent bounds alone. Full details are persisted in [`figma-geometry-audit.md`](./figma-geometry-audit.md).

- Public section `521:1052`: five direct module containers; initial flat-layout audit found 4 sibling intersections. After hierarchy normalization and parent resize, the layout-node postcondition is `outsideCount=0`, `overlapCount=0`.
- Admin section `521:1053`: eight direct module containers; 35 viewport frames were reparented into module/use-case wrappers. Postcondition is `outsideCount=0`, `overlapCount=0`.
- Rejected Design System page `519:862`: major board frames were checked; postcondition is zero sibling intersections.
- Recursive layout-node scan after coordinate-space normalization: Public `outside=0, overlap=0`; Admin `outside=0, overlap=0`; Design System `outside=0, overlap=0`.
- The nested auth duplicate-email forms were corrected using the same rule: the password field and following actions now start after the error field's actual bottom; form heights were increased to contain the resulting content.
- Current representative exports used alongside the geometry audit:
  `public-home-loaded.png`, `public-catalog-query.png`,
  `public-product-detail-purchase.png`, `public-about-loaded.png`,
  `public-cart-loaded-v2.png`, `public-reviews-loaded-v2.png`, and
  `public-contact-ready.png`.
- Auth and post-reparent viewport exports timed out even at reduced scale; geometry is structurally verified but remains visually unverified by export.

## Latest tone and prototype verification

- The canonical accent paint style and `Color/Accent/Ochre` variable were migrated from `#A78342` to `#805F24` at the Design System level.
- Text on canonical accent surfaces was rebound to `Color/Ink/OnAccent`; this includes homepage announcement/CTA copy, browse actions and checkout/result actions. The resulting white-on-accent contrast is approximately `5.77:1`.
- No local per-screen accent recoloring was used for this migration.
- The connector rejects `NAVIGATE` and `SCROLL_TO` from nested Admin mobile action nodes to nested terminal/read-only viewport nodes after hierarchical reparenting. No fake destination frame or invalid terminal action was introduced; the limitation remains explicit pending a supported connector wiring path.

## Coordinate-space correction

The Admin section coordinate issue was corrected after verifying nested `move_nodes` behavior with `532:4972` under `534:4978`: the returned child position is parent-local (`80,96` and then `40,40` when those values were passed). The Admin section remains at canvas `(3877,692)`; its eight direct modules now use local coordinates beginning at `(80,80)` and are laid out sequentially with an 80px gap. The section was then resized to `1760 × 43450` from the direct-child union plus padding, rather than enlarged to contain canvas-scale child coordinates.

A fresh probe on direct child `534:4978` confirmed the same discrepancy between the connector description and nested behavior: passing `(3957,772)` produced inspected nested bounds `(3957,772)`, while passing `(80,80)` restored the intended parent-local placement. The invalid probe was restored before the final audit; no parent resize was used to mask it.

Latest Admin direct-child audit:

```text
outside = []
overlaps = []
section canvas = (3877,692)
section size = 1760 × 43450
module local positions =
  Operations (80,80)
  Catalog (80,12050)
  Content (80,18372)
  Account (80,35210)
  Profile (80,37668)
  Settings (80,39234)
  Payments (80,40800)
  Notifications (80,42366)
```

Fresh post-correction exports for Admin Orders desktop/mobile both timed out and were not written; no timeout is treated as visual-pass evidence.

## Recursive geometry correction

The subsequent recursive audit found and corrected child-level overflow that section containment did not expose:

```text
Admin before: 33 child overflow cases
Admin after:  overflow=0, layoutOverflow=0, layoutOverlap=0
Public after: overflow=0, overlap=0
Design System after: overflow=0, overlap=0
```

Corrections were made at the actual child geometry: desktop surfaces and rows were resized to the 1440px content edge, mobile copy was wrapped within its inner gutter, auth/success/wishlist text was constrained to its real content column, and Design System field specimens were expanded to contain their labels and values. No parent was enlarged to mask a child overflow.

The historical hierarchy audit passes for the rejected Public/Admin sections;
the current `00 — Index` additionally contains the canonical foundation scope,
Catalog anchor frames and top-level behavior-preserved Public frames so Figma
prototype navigation can target them. Admin still contains eight direct module
containers, and no canonical Admin module remains outside its owner.

Fresh exports requested after these fixes for Public Checkout Success and the Design System Field specimen timed out and were not written. Structural evidence is therefore verified from node/property inspection; visual export evidence remains pending.

The final recursive node/property audit after the last Public/Auth and Design System geometry adjustments reports:

```text
Public:        overflow=0, overlap=0
Admin:         overflow=0, overlap=0
Design System: overflow=0, overlap=0
```

The audit includes all descendant nodes, not only direct section children. It also confirms the corrected signup form contains its navigation prompt, checkout success text/CTA remains inside the mobile viewport, and field specimens contain both label and value within their component frames.

## Canonical hierarchy repair

The previous flat layout was corrected after the Admin section was found empty and the Public/Admin screen nodes were scattered outside their module ownership. The historical rejected tree was:

```text
90 — Archive / Rejected Admin Console / Pending Rebuild
  → Admin / Operations, Catalog, Content, Account, Profile, Settings, Payments, Notifications
  → module
      → use-case or responsive-state wrapper
          → applicable Desktop/Mobile viewport frame
```

After the latest hierarchy audit, the Admin section remains at canvas `(3877,692)` with exactly eight direct module children. The ownership map is intentionally kept under the Index frame rather than inside Admin product modules. This separates navigation/traceability metadata from canonical user-facing screens while making every Admin use-case owner and viewport contract visible in the layer tree.

The rejected Public section follows the same historical structure for Browse,
Auth, Checkout, Engagement and Content. Direct-child node/property audits
report `outside=0` and `overlap=0` for both rejected sections and all 13
historical module containers. These measurements do not make the rejected
artifact canonical. Evidence is in `figma-geometry-audit.md`. The
`hierarchy-admin-console-final.png` and `hierarchy-admin-operations-final.png`
files are retained historical exports from before the final parent-local
coordinate normalization; they are not used as final visual hierarchy
evidence.

Viewport-level exports requested after reparenting timed out. Those exports are explicitly unverified; the hierarchy result is supported by node/property inspection rather than by a failed screenshot request.

## Remaining execution gates

- The planning artifacts now maintain separate design and behavior traces. The
  matrix intentionally reports semantic gaps/conflicts separately from
  visual/interactive proof.
- Archive disposition is complete for the rejected Public/Design System
  artifact; the canonical foundation, Catalog/ProductModel anchor and current
  behavior-preserved Public slice now exist. This is not a claim that semantic
  gaps are resolved.
- Foundation, Catalog/ProductModel and representative Public screenshot
  evidence is captured and visually inspected. A recursive local
  node/property audit of the 34 new Public frames (655 descendants) reports zero descendant
  overflow. The same audit includes the foundation board (`561:2`) for 35
  roots/714 descendants with zero overflow and zero positive-area layout-node
  overlap; export timeouts and final interactive review remain explicitly open.
- Catalog/ProductModel remains governed by the canonical Catalog SRS. Browse,
  Auth, Checkout, Engagement and Content are recorded as behavior-preserved
  slices with semantic gaps until applicable owner specifications are
  identified or published.
- Run visual exports for remaining representative public/admin frames when the Figma exporter permits them. The latest batch for Admin Orders, Public Checkout Success, and Design System Controls timed out; no timeout is a visual pass.
- Review all Figma prototype paths interactively for cross-module navigation and both-direction reversible actions. Structural reactions are recorded where inspected, but connector-limited nested Admin mobile terminal destinations remain unverified.
- Reconcile any late reusable-pattern gaps through Foundation before execution closure. The latest live token audit found zero retired `#A78342` accent consumers across Public, Admin, and Design System; all current accent consumers reference `GRIP / Accent / Ochre`.
- `public-content.md` and `catalog-domain.md` are now persisted compact handoffs. No handoff-missing blocker remains.
