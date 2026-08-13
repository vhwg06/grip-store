# GRIP greenfield Figma QA evidence

This is the persistent evidence index for the current Figma execution. It records what was structurally verified and keeps export limitations explicit.

## Artifact scope

- Figma file: `GRIP-Website-Design`
- `00 — Index`: public/admin greenfield sections remain separated.
- `01 — Grip Design System`: new foundations, shells, controls, patterns and state coverage.
- `90 — Archive`: legacy/reference material remains outside canonical product sections.
- Product sections contain actual screen compositions; scenario IDs and trace labels are not embedded in product frames.

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

## Structural checks

- Public greenfield section `521:1052`: five direct module containers (`Browse`, `Auth`, `Checkout`, `Engagement`, `Content`), with use-case/responsive wrappers beneath them.
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

- Public auth owner supplied state-frame and intra-auth reactions for login, validation, invalid credentials, signup, duplicate email, success, OAuth initiation, session reload and logout.
- Public browse owner supplied catalog/detail/empty/unavailable reactions.
- Public checkout owner supplied quantity reversal, remove-to-empty, cart-to-checkout, place-order-to-result, result recovery and empty-cart-to-browse paths.
- Cross-module wiring added for product card → cart, checkout result → browse, customer → order/refund/review.
- Admin operations action reactions connect order processing, refund approve/reject and review decision to terminal/read-only states.
- Content/engagement entry reactions were added within their owning sections; Integration does not redesign those artifacts.
- The mobile article Page 2 “Tiếp” control was repaired to navigate to the published Page 2 frame after the owner reported the missing reaction. The connector rejected the nested Page 2 destination, so it targets the reachable top-level Page 2 frame `528:3506`.

## Geometry audit

The layout repair was performed after a direct-child and recursive geometry audit, not from parent bounds alone. Full details are persisted in [`figma-geometry-audit.md`](./figma-geometry-audit.md).

- Public section `521:1052`: five direct module containers; initial flat-layout audit found 4 sibling intersections. After hierarchy normalization and parent resize, the layout-node postcondition is `outsideCount=0`, `overlapCount=0`.
- Admin section `521:1053`: eight direct module containers; 35 viewport frames were reparented into module/use-case wrappers. Postcondition is `outsideCount=0`, `overlapCount=0`.
- Design System page `519:862`: major board frames were checked; postcondition is zero sibling intersections.
- Recursive layout-node scan after coordinate-space normalization: Public `outside=0, overlap=0`; Admin `outside=0, overlap=0`; Design System `outside=0, overlap=0`.
- The nested auth duplicate-email forms were corrected using the same rule: the password field and following actions now start after the error field's actual bottom; form heights were increased to contain the resulting content.
- Successful geometry evidence exports: `geometry-public-section-final.png`, `geometry-admin-section-final.png`, `geometry-public-browse-home.png`, `geometry-public-content.png`, `geometry-admin-orders.png`, `geometry-admin-content.png`, `geometry-ds-states.png`.
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

The page-root IA audit also passes: `00 — Index` contains only the Index frame and the Public/Admin greenfield sections; Admin contains eight direct module containers and no canonical module remains outside its owner.

Fresh exports requested after these fixes for Public Checkout Success and the Design System Field specimen timed out and were not written. Structural evidence is therefore verified from node/property inspection; visual export evidence remains pending.

The final recursive node/property audit after the last Public/Auth and Design System geometry adjustments reports:

```text
Public:        overflow=0, overlap=0
Admin:         overflow=0, overlap=0
Design System: overflow=0, overlap=0
```

The audit includes all descendant nodes, not only direct section children. It also confirms the corrected signup form contains its navigation prompt, checkout success text/CTA remains inside the mobile viewport, and field specimens contain both label and value within their component frames.

## Canonical hierarchy repair

The previous flat layout was corrected after the Admin section was found empty and the Public/Admin screen nodes were scattered outside their module ownership. The resulting tree is:

```text
20 — Admin Console / Greenfield
  → Admin / Operations, Catalog, Content, Account, Profile, Settings, Payments, Notifications
  → module
      → use-case or responsive-state wrapper
          → applicable Desktop/Mobile viewport frame
```

After the latest hierarchy audit, the Admin section remains at canvas `(3877,692)` with exactly eight direct module children. The ownership map is intentionally kept under the Index frame rather than inside Admin product modules. This separates navigation/traceability metadata from canonical user-facing screens while making every Admin use-case owner and viewport contract visible in the layer tree.

The Public section follows the same structure for Browse, Auth, Checkout, Engagement and Content. Direct-child node/property audits report `outside=0` and `overlap=0` for both sections and all 13 module containers. The page root now contains only the Index frame and the two greenfield sections. Evidence is in `figma-geometry-audit.md`. The `hierarchy-admin-console-final.png` and `hierarchy-admin-operations-final.png` files are retained historical exports from before the final parent-local coordinate normalization; they are not used as final visual hierarchy evidence.

Viewport-level exports requested after reparenting timed out. Those exports are explicitly unverified; the hierarchy result is supported by node/property inspection rather than by a failed screenshot request.

## Remaining execution gates

- The planning artifacts and compact scenario-to-canonical-flow matrix are complete. The matrix intentionally reports structural coverage separately from visual/interactive proof.
- Run visual exports for remaining representative public/admin frames when the Figma exporter permits them. The latest batch for Admin Orders, Public Checkout Success, and Design System Controls timed out; no timeout is a visual pass.
- Review all Figma prototype paths interactively for cross-module navigation and both-direction reversible actions. Structural reactions are recorded where inspected, but connector-limited nested Admin mobile terminal destinations remain unverified.
- Reconcile any late reusable-pattern gaps through Foundation before execution closure. The latest live token audit found zero retired `#A78342` accent consumers across Public, Admin, and Design System; all current accent consumers reference `GRIP / Accent / Ochre`.
- `public-content.md` and `catalog-domain.md` are now persisted compact handoffs. No handoff-missing blocker remains.
