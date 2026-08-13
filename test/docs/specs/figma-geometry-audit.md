# GRIP Figma geometry audit

This audit records the layout repair for the greenfield Figma artifact. It is a geometry/containment check only; it does not redefine behavior, IA or screen composition.

This audit keeps the pre-redesign hierarchy as historical evidence and records
the current canonical anchor/slice separately. Historical geometry does not
make a rejected artifact canonical; current frame results are reported only
from the current node/property audit.

## Invariant

For every parent with direct layout children:

```text
for every sibling pair A, B:
  intersection(A.bounds, B.bounds).area == 0

rowHeight = max(height of every item in current row)
nextRowY = currentRowY + rowHeight + verticalGap
```

The audit also checks that children are contained by the parent in the correct coordinate space and that the parent is resized to the children bounding box plus padding. Parent containment alone is not a pass condition.

## Scope

| Root | Node | Audited scope |
|---|---|---|
| Rejected Public | `521:1052` | historical module → use-case/responsive wrapper → viewport tree; recursive frame/component/instance tree |
| Canonical Public rebuild | `561:142`–`561:163`, `561:614`, `561:657`, `561:686`, `561:724`–`561:731`, `562:1011` | current top-level behavior-preserved Public frames; recursive local node/property audit captured |
| Canonical Catalog anchor | `561:47`, `561:48`, `561:49`, `561:123` | SRS-owned Catalog/ProductModel production frames; node/property and screenshot evidence captured |
| Rejected Admin | `521:1053` | historical module → use-case/responsive wrapper → viewport tree; recursive frame/component/instance tree |
| Rejected Design System | `519:862` | historical board hierarchy; not a canonical foundation source |

## Canonical rebuild status

The current Catalog/ProductModel anchor and the 34-frame Public
behavior-preserved slice were created with explicit viewport bounds and
reparented to the Index so prototype navigation can target top-level frames.
The node/property audit confirms the bounds, ownership names, content and
top-level parentage. A recursive local containment scan reports:

```text
frames = 33
descendants = 636
overflowCount = 0
```

This scan checks every descendant against its immediate parent. It does not
classify intentional visual layering as a sibling-overlap failure, and it is
not a substitute for final visual review of timed-out exports. The historical
rejected artifact's passing geometry does not transfer to these frames.

The same current audit includes the validated foundation board `561:2`:

```text
Public frames:       34 roots / 655 descendants / overflow 0
Foundation + Public: 35 roots / 714 descendants / overflow 0
Layout-parent checks: 1 / positive-area layout overlap 0
```

### Current Index topology

The current `00 — Index` page intentionally keeps the canonical Public
production frames top-level so Figma `NAVIGATE` reactions can reach them. The
page also contains the rejected Public/Admin archives, the IA map, the Catalog
scope frame and the validated-foundation scope. This is a deliberate prototype
topology, not an orphan-screen finding; the rejected archive hierarchy remains
separately marked historical.
The historical rejected product sections did not use a flat screen list. Their direct children were module containers:

```text
90 — Archive / Rejected Public Storefront / Pending Rebuild
  → Public / Browse, Auth, Checkout, Engagement, Content
90 — Archive / Rejected Admin Console / Pending Rebuild
  → Admin / Operations, Catalog, Content, Account, Profile, Settings, Payments, Notifications
module
  → use-case or responsive-state wrapper
  → applicable Desktop/Mobile viewport frames
```

This is the 1:1 mapping contract for the Figma artifact: a responsive wrapper may contain both viewport variants when both are applicable, while a single-viewport contract remains explicit rather than being paired with a fabricated view.

## Findings before repair

The initial direct-child audit found four Public sibling intersections:

1. `522:1098` Catalog empty intersected `522:1099` Product unavailable by 30px vertically.
2. `523:1787` Auth logout intersected `527:2309` Checkout cart loaded by 440px.
3. `523:1787` Auth logout intersected `527:2310` Checkout cart empty by 440px.
4. `527:2433` Checkout quantity state intersected `528:2980` Wishlist loaded by 83px.

The historical Admin section itself was empty while its 35 historical frames lived outside it. The Public quantity state `527:2433` also lived outside the Public section. This was corrected by reparenting the frames before relayout. The initially flat section layout was then replaced by the historical module → use-case/responsive wrapper → viewport hierarchy; no product viewport remains a direct child of either rejected greenfield section.

The recursive audit then found two genuine nested intersections in duplicate-email auth forms:

- `523:1594` Email error intersected `523:1599` Password by 12px.
- `523:1628` Email error intersected `523:1633` Password by 12px.

## Repair

- Reparented `527:2433` to Public section `521:1052`.
- Reparented the 35 Admin canonical frames to Admin section `521:1053`.
- Relayout grouped by cognitive module, not viewport owner.
- Within every generated row, positioned items sequentially with an 80px gap.
- Computed row height from the maximum child height in that row.
- Started each next row at the previous row bottom plus the configured gap.
- Resized Public to `3300 × 35804` and Admin to `2070 × 31610` after computing the children extents.
- Moved the nested password fields and following actions below the full error-field height, then increased the affected auth-form heights to contain their children.
- Shortened the duplicate-email context heading after export review exposed clipping.
- Created canonical Public module containers for Browse, Auth, Checkout, Engagement and Content.
- Created canonical Admin module containers for Operations, Catalog, Content, Account, Profile, Settings, Payments and Notifications.
- Reparented each screen/use-case wrapper under its owning module and placed applicable Desktop/Mobile viewport frames inside the same responsive wrapper.
- Reparented the stray mobile checkout layers back into `528:2550` and verified
  the historical page root contained only the Index frame and the two
  greenfield sections. The current Index intentionally adds top-level
  canonical Public frames for prototype navigation.

## Coordinate-space evidence

The connector documents `move_nodes` as targeting an absolute canvas position, but nested node inspection shows the effective coordinates exposed and retained for a nested child are parent-local. This was verified empirically with `532:4972` under `534:4978`:

```text
move_nodes(532:4972, x=80, y=96)
→ child bounds x=80, y=96 in Admin / Operations
move_nodes(532:4972, x=40, y=40)
→ child bounds x=40, y=40 in Admin / Operations
```

The same inspection showed `534:4978` as a direct child of `521:1053`, with local `(80,80)` and canvas position `(3957,772)` because the Admin section canvas position is `(3877,692)`. Therefore all nested Admin placement mutations use parent-relative coordinates; canvas coordinates are recorded only as derived evidence.

Latest direct-child probe before the Admin repair:

```text
section `521:1053` canvas position = (3877,692)
move_nodes(`534:4978`, x=3957, y=772)
→ inspected child bounds = (3957,772), proving the mutation is retained in the
  nested node's effective parent-local x/y rather than converted to section space
move_nodes(`534:4978`, x=80, y=80)
→ inspected child bounds = (80,80)
```

The probe was immediately restored to `(80,80)`. No parent resize was used to hide the probe's invalid placement. The final module record below derives absolute canvas coordinates only as `section.canvas + child.local`.

## Postcondition

The final layout-node scan (using Section canvas coordinates and Frame/Component parent-local coordinates) reported:

```text
Public:        outsideCount = 0, overlapCount = 0
Admin:         outsideCount = 0, overlapCount = 0
Design System: outsideCount = 0, overlapCount = 0
```

The final direct-child checks reported zero out-of-parent children and zero sibling intersections for both greenfield sections. Module containers and responsive wrappers also reported zero out-of-parent children and zero sibling intersections; module/use-case gaps are 80px and paired viewport gaps are 48px. All tested rows used `max(child.height)` rather than a fixed row height.

The Admin section was re-audited after the coordinate-space correction. It remains at canvas `(3877,692)`, now measures `1760 × 43450`, and its eight direct modules use local positions `(80,80)`, `(80,12050)`, `(80,18372)`, `(80,35210)`, `(80,37668)`, `(80,39234)`, `(80,40800)` and `(80,42366)`. The union is contained with 80px horizontal and vertical padding; `outside=[]` and `overlaps=[]`. No 44k-pixel containment workaround remains.

Admin module coordinate record after correction:

| Module | Parent | Local x/y | Absolute canvas x/y | Width × height |
|---|---|---:|---:|---:|
| Operations | `521:1053` | `(80,80)` | `(3957,772)` | `1600 × 11890` |
| Catalog | `521:1053` | `(80,12050)` | `(3957,12742)` | `1600 × 6242` |
| Content | `521:1053` | `(80,18372)` | `(3957,19064)` | `1600 × 16758` |
| Account | `521:1053` | `(80,35210)` | `(3957,35902)` | `1600 × 2378` |
| Profile | `521:1053` | `(80,37668)` | `(3957,38360)` | `1600 × 1486` |
| Settings | `521:1053` | `(80,39234)` | `(3957,39926)` | `1600 × 1486` |
| Payments | `521:1053` | `(80,40800)` | `(3957,41492)` | `1600 × 1486` |
| Notifications | `521:1053` | `(80,42366)` | `(3957,43058)` | `1600 × 1004` |

## Recursive child geometry correction

After the section repair, the recursive audit found 33 child-level overflow cases in Admin, including desktop surfaces extending 48px beyond the 1440px viewport and fixed-width mobile copy. These were corrected at the child level: desktop surfaces/rows now end at the viewport right edge, and mobile copy wraps within its available inner gutter. The final Admin recursive audit reports:

```text
overflowCount = 0
layoutOverflowCount = 0
layoutOverlapCount = 0
```

The same recursive audit found and corrected Public/Auth, checkout-success, wishlist, and Design System field/pattern overflow. Final results:

```text
Public:        overflowCount = 0, overlapCount = 0
Admin:         overflowCount = 0, overlapCount = 0
Design System: overflowCount = 0, overlapCount = 0
```

The field specimens were corrected as canonical component anatomy: labels and values are both contained in a 72px field component rather than placing labels at negative y coordinates. The checkout success state was reflowed after text wrapping so heading, body, CTA and label remain non-overlapping.

## Visual evidence

Current representative exports retained under `evidence/` include:

- `public-home-loaded.png`
- `public-catalog-query.png`
- `public-product-detail-purchase.png`
- `public-about-loaded.png`
- `public-cart-loaded-v2.png`
- `public-reviews-loaded-v2.png`
- `public-contact-ready.png`

The final hierarchy is accepted from current node/property inspection and the
recursive geometry audit. Any historical geometry-export names from the
rejected artifact are not treated as current evidence; timed-out exports remain
unverified.

## Hierarchy evidence after restructure

Node/property audit after the hierarchy repair:

```text
Public section: 5 module children, outside=0, overlap=0
Admin section: 8 module children, outside=0, overlap=0
Public modules: 5/5 outside=0, overlap=0
Admin modules: 8/8 outside=0, overlap=0
Public Auth: 10 use-case wrappers, outside=0, overlap=0, gap=80
Historical page root: Index + Public section + Admin section only
```

The Admin ownership audit was rerun after the coordinate-space repair and IA cleanup:

```text
Admin section `521:1053`: 8 direct module children, all at local x=80
Admin module local y sequence: 80, 12050, 18372, 35210, 37668, 39234, 40800, 42366
Admin use-case wrappers: 21, each under exactly one module owner
Viewport mapping: paired wrappers explicitly named `Desktop + Mobile`; single contracts explicitly named `Desktop only` or `Mobile only`
Admin map: `546:5053` is an Index navigation/ownership artifact, not an Admin product screen
Historical page root: Index + Public section + Admin section only; current
canonical Public frames are intentionally top-level on the Index.
Direct-child overlap: 0
Direct-child outside-parent: 0 using Section canvas bounds and nested parent-local bounds
```

An independent read-only audit confirmed the same inventory: 8 Admin modules, 21 wrappers, and 35 viewport children. No canonical Admin wrapper or viewport is outside its module owner. The sole intentional non-module artifact is `546:5053` under `00 — Index / Canonical IA Map`.

This makes the ownership contract visible in the layer tree without inventing mobile frames for contracts that only require one viewport. The map is kept on the Index because it is navigation/traceability metadata; the Admin section contains only its eight canonical module owners.

Full-section exports were written for the Admin section and Operations module. Subsequent representative exports for Admin Orders, Public Checkout Success and the Design System Field specimen all timed out in the Figma renderer and were not written; those are recorded as unverified and are not treated as visual passes. Structural hierarchy and geometry remain verified through node/property inspection.

Two fresh representative exports requested after the coordinate correction (`admin-orders-desktop-after-local-fix.png`, `admin-orders-mobile-after-local-fix.png`) both timed out and were not written. This remains visual evidence pending, not a pass.

The final recursive audit was rerun after the Public/Auth and Design System corrections. It reports zero descendant overflow and zero positive-area layout-node intersections for Public, Admin and Design System. The audit is based on current node properties and does not infer visual success from parent containment.

## Latest visual-token correction

The approved tonal direction was rechecked against the current Design System. The canonical accent is now `#805F24` in both the `GRIP / Accent / Ochre` paint style and `Color/Accent/Ochre` variable. Accent-surface text is bound to `Color/Ink/OnAccent`; no individual screen was recolored with an arbitrary accent value. The previous muted-text-on-ochre announcement pairing was corrected at the token-consumer level.
