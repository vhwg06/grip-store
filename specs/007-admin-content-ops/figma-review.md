# Figma Review: Admin Content Operations

Status: PASS WITH GAPS for Phase 1 on 2026-06-18

Review basis:

- Figma file: `GRIP-Website Design`
- Page: `Admin CMS - Media Workflows`
- Reviewed frames:
  - `Admin / Media Management` (`280:9648`)
  - `Admin / Banner Management` (`281:9793`)
  - `Admin / Article Management` (`281:9794`)
  - `Admin / Product Media & Content` (`281:9795`)
  - `Admin / About-Us Content` (`281:9796`)
- `Admin / Shared Media Picker Modal` (`281:9942`)
- Review method: inspected live frame text/content, not inferred from spec

Screenshot evidence:

- [media-management.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/media-management.png)
- [banner-management.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/banner-management.png)
- [article-management.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/article-management.png)
- [article-create-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/article-create-added.png)
- [article-edit-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/article-edit-added.png)
- [product-media-content.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/product-media-content.png)
- [about-us-content.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/about-us-content.png)
- [shared-media-picker.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/shared-media-picker.png)
- [faqs-added.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/faqs-added.png)

Route verdict summary:

- `/admin/media`: `Strong`
- `/admin/banners`: `Strong`
- `/admin/articles`: `Strong`
- `/admin/article/new`: `Strong`
- `/admin/article/edit/[id]`: `Strong`
- product content/media slice: `Strong`
- about-us content flow: `Strong`
- shared media picker: `Strong`
- `/admin/faqs`: `Strong`

## Screen Review

### Media Management

- Title: `Media Management`
- Subtitle covers upload/reuse/copy/protect flows
- Upload surface, search/filter, asset cards, selected-asset inspector, and delete-guard messaging are present

Verdict:

- Adapted well to Use Case 1.

### Banner Management

- Title: `Banner Management`
- Rule text present:
  - `No text overlay in V1, title used as alt text`
  - `One slide: hide arrows and stop autoplay.`
  - `Homepage: hide hero. Sub-pages: fallback header #99782B.`
- Fields visible for page target, desktop image, mobile image, alt title, sort order, active state

Verdict:

- Adapted well to Use Case 2.

### Article Management

- Title: `Article Management`
- CRUD lifecycle is visible through draft/published states
- Editor area includes title, slug, excerpt, rich text area, and `Publish changes`
- Create/edit routes are now supported by dedicated route frames in addition to the combined management/editor frame

Verdict:

- Adapted well to Use Case 3.

### Article Create / Edit Routes

Observed:

- `Admin / Article Create` now shows draft-first create-state and publish prerequisites
- `Admin / Article Edit` now shows loaded edit-state, save-update intent, and route-level loading/not-found language

Verdict:

- Strong enough to remove article create/edit from the route-level blocker list.

### Product Media & Content

- Title: `Product Media & Content`
- Explicit separation between media/content and product creation flow
- Rules visible:
  - `Thumbnails show only when gallery > 1`
  - `No main image: show placeholder`

Verdict:

- Adapted reasonably for the product-content slice, but this screen sits on the `007` / `008` boundary and should not be mistaken for full product-editor coverage.

### About-Us Content

- Title: `About-Us Content`
- Subtitle explicitly excludes banner ownership from this screen
- Editor and gallery reorder surfaces are present

Verdict:

- Adapted well to Use Case 4.

### Shared Media Picker

- Title: `Select media`
- Subtitle states reuse from banner/article/product/site-config/about flows
- Selected detail text names caller fields such as `featured_image_url`, `desktop_image_url`, `main_image_url`, `gallery_images[]`, `shopLogo`, `aboutGallery[]`
- Delete guard behavior is explicitly mentioned

Verdict:

- Adapted well as shared infrastructure for content flows.

### FAQ

Observed:

- dedicated frame `Admin / FAQ Management` now exists
- list, search, active/draft state, edit panel, reorder/save affordance, validation note, and public-state language are present

Verdict:

- Strong enough to remove FAQ from the route-level blocker list.

## Use Case Coverage Check

- [x] Shared media infrastructure is clearly represented
- [x] Banner CRUD/public-preview constraints are represented
- [x] Article editing/publish workflow is represented
- [x] About-us content flow is represented
- [x] Product media/content handoff is represented without making FE invent catalog rules
- [x] Shared picker contract is explicit enough for spec and task generation
- [x] FAQ-specific frame exists in reviewed Figma page
- [x] Article create/edit route-state evidence exists as dedicated frames
- [ ] Validation/error states are not complete across every content screen
- [ ] Some save boundaries and destructive confirmations still need test-level definition

## Gate Result

Pass with gaps for Phase 1.

Reason:

- Major content/admin flows are concretely adapted in Figma and now include FAQ as a dedicated route.
- The module is now route-complete enough for Phase 1 gating, but still has detail gaps in validation, confirmation, and editor-state depth.

## Follow-up Constraints

- Backend owns media usage protection, ordering semantics, publish state, and public projection.
- FE tasks in Phase 2 remain limited to rendering, form wiring, and API integration.
