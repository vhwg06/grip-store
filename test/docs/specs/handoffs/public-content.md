# Wave A handoff — Public content

Source boundary: `test/modules/content/README.md` and `test/modules/content/behavior.feature`. This is a compact execution handoff, not a screen blueprint.

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

- About desktop/mobile: `528:2822`, `528:2827`.
- Article list/detail/pagination desktop/mobile: `528:2823`, `528:2824`, `528:2828`, `528:2829`, `528:3506`, `528:3507`.
- Contact default/success desktop/mobile: `528:2825`, `528:2826`, `528:2830`, `528:2831`.
- Structural verification confirmed non-empty frames, Vietnamese copy, 1440×900/390×844 geometry and light-neutral tokens. Screenshot export is not claimed as passed for this handoff.

## Open evidence

- Interactive review of all article/contact paths remains in Wave E.
- Exported PNG evidence is partial and recorded in `../figma-qa-evidence.md`.
