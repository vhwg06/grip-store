# Wave A handoff — Public content

Source boundary: `test/modules/content/README.md` and `test/modules/content/behavior.feature`. This is a compact execution handoff, not a screen blueprint.

## Semantic authority status

No separate canonical Content semantic specification was located. This
handoff records backend-owned content/contact outcomes as behavioral evidence;
it does not define additional editorial, publication or contact semantics.
Unspecified meaning is a `semantic source gap` rather than permission to
infer behavior from a generic storefront pattern.

## User goals and visible information

- Understand the store through the About narrative and configured gallery.
- Discover published articles, open article detail, read the content, and move between article pages.
- Find company contact information and map context, then submit a valid contact request.

## Behavior constraints

- About loaded state must show backend-owned narrative and gallery when configured.
- Article list shows published article cards; opening a card exposes the corresponding detail and content.
- Pagination changes the visible article page; the mobile Page 2 “Tiếp” control is wired to the reachable Page 2 frame in the prototype.
- Contact default state shows form, configured map and company contact information.
- Valid contact submission is accepted and represented by the success state; no fabricated request success is used when the request fails.

## UX needs / reusable candidates

- Editorial discovery pattern: list → detail → back.
- Pagination pattern with current page and next/previous affordances.
- Contact pattern combining structured information, map context and form feedback.
- Success feedback remains in the real contact form context.

## Figma artifact handoff

- The former `528:*` frames are historical audit material and are not the
  canonical rebuild.
- About: `561:158` desktop.
- Article list/detail/page 2: `561:160`, `561:162`, `561:657` desktop; `561:730`
  representative mobile.
- Contact ready/submitted: `561:161`, `561:163` desktop; `561:731`
  representative mobile.
- Current screenshot evidence includes `evidence/public-about-loaded.png`,
  `evidence/public-articles-list-v2.png`,
  `evidence/public-article-detail-v2.png`,
  `evidence/public-contact-ready.png`, and
  `evidence/public-contact-mobile-v2.png`.
- The current slice has light-neutral tokens, Vietnamese copy and explicit
  content/detail/contact states. It is behavior-preserved evidence under the
  Content semantic source gap, not a claim that unspecified editorial meaning
  has been resolved.

## Open evidence

- Interactive review of all article/contact paths remains in Wave E.
- Exported PNG evidence is partial and recorded in `../figma-qa-evidence.md`.
