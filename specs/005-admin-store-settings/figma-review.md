# Figma Review: Admin Store Settings

Status: PASS WITH GAPS for Phase 1 on 2026-06-18

Review basis:

- Figma file: `GRIP-Website Design`
- Page: `Admin CMS - Media Workflows`
- Frame: `Admin / Store Settings` (`282:10564`)
- Review method: inspected live frame text/content, not inferred from spec

Screenshot evidence:

- [store-settings.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/store-settings.png)
- [store-settings-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/store-settings-updated.png)
- [store-settings-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/store-settings-stronger.png)

Route verdict summary:

- `/admin/settings`: `Strong`

## Evidence Observed In Figma

- Header title: `Store Settings`
- Subtitle: `Storefront configuration for brand, contact, homepage layout, footer, support channels, and visibility rules.`
- Metrics present:
  - `Brand fields 4 editable`
  - `Homepage modules 3 active`
  - `Support actions 4 channels`
- Sections present:
  - `Brand identity`
  - `Contact surface`
  - `Homepage composition`
  - `Footer, social, support`
- Public-impact note present:
  - `Structured settings sync to storefront after reload.`
- Added in updated frame:
  - `Discovery & visibility`
  - `Registry & legacy controls`
  - grouped save buttons for `brand`, `footer`, `visibility`, `registry`
  - logo preview + media picker CTA
  - structured cards for `homepageBlocks[]`, `footerColumns[]`, `socialLinks`, and floating support actions
  - inline validation blocker note for invalid email and negative homepage count

## Screen Review

### `Admin / Store Settings` (`282:10564`)

Observed:

- Title and subtitle are aligned to storefront-settings intent
- Section groups are visible and route-specific:
  - `Brand identity + logo`
  - `Contact + discovery`
  - `Homepage composition`
  - `Footer, social, support`
  - `Discovery & visibility`
  - `Registry & legacy controls`
- Concrete control/state evidence is visible:
  - logo preview tile + media picker CTA
  - grouped save CTAs by section
  - structured nested-setting cards
  - inline validation blocker note

Verdict:

- Strong enough for route-level workflow coverage. The frame now shows grouped settings ownership, structured nested editors, per-section save boundaries, media-pick intent, and validation blockers without forcing FE to invent the basic workflow.

## Use Case Coverage Check

- [x] Required settings domains from spec are at least visible as separate sections
- [x] Save/edit boundaries are explicit enough for section-level operations
- [x] Screen hierarchy roughly supports storefront configuration work
- [x] Figma does not force FE to invent missing section structure
- [x] Validation/error states are fully represented at route level
- [x] Explicit per-section save CTA and dirty-state behavior are shown at route level
- [x] Discovery/visibility and registry/legacy controls are explicitly visible in the reviewed frame

## Gate Result

Pass with gaps for Phase 1, no route-level blocker remains inside this module.

Reason:

- The frame now confirms route ownership, structured nested-setting groups, media-pick flow, validation blockers, and section save boundaries.
- Residual gaps are polish/detail density, not missing route-level workflow proof. Spec/tests still carry authoritative behavior truth for this module.

## Follow-up Constraints

- Backend remains owner of validation, normalization, visibility semantics, ordering, and public projection.
- Phase 2 may use this frame as UI direction, but tests must assert server-driven outcomes rather than FE-derived config logic.
