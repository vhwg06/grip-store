# Wave A handoff — Admin content

Source boundary: approved sources under `test/modules/admin/content` only. No implementation or design sources.

## Coverage

27 accepted scenarios across 17 rules; 15 API-tagged, 12 browser, 4 visual, 3 security. Scenario groups: media, banners, editor, articles, FAQ, About, product editorial and UI ownership.

## User goals and visible information

- Upload/select reusable media and protect media currently in use.
- Manage homepage banners by page context, active state, priority and order.
- Create/edit/delete/publish articles with title, body, slug, cover, topic, tags and priority; support Visual and Markdown editing plus preview.
- Manage ordered active/draft FAQs.
- Link a published article or `None` to About and maintain narrative/gallery content.
- Enter editorial content from Product management without taking ownership of commercial state.

## Behavior constraints

- Media: needed → uploaded/selected → reusable; in-use assets are protected from destructive removal.
- Banner/FAQ active/inactive and ordering control public projections.
- Article: draft → published → public stream/detail; delete → public detail `404`; draft preview does not publish.
- About link ↔ `None`; `None` restores default narrative.
- Public projections require successful fresh reads.
- Explicit authorization includes unauthenticated `401/403` and shopper `403` cases where specified.

Unspecified: field-validation copy/rules, duplicate/conflict handling, loading/offline/unavailable states, broad not-found behavior, concurrency and some reverse/deletion fresh-read cases. Do not invent them.

## Dependencies and candidates

Dependencies: admin/content authorization, persistent media/content records, public article/banner/FAQ/About projections, Store Settings ownership of `about_article_id`, Product commercial ownership and serial cleanup.

Candidates: media picker/modal, ordering control, active/draft control, dual-mode editor, preview, gallery editor, ownership selector, save feedback and destructive protection, plus standard permission/empty/error states where contractually required.

API-tagged behavior is UI-supporting when it mutates or projects browser-visible content; classify only explicitly no-canonical-UI behavior as reference-only.
