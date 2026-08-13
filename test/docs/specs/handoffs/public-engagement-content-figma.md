# Figma handoff — Public Storefront Engagement + Content

Scope: Figma file `GRIP-Website Design`, section `521:1052`, ownership region `y >= 27500` only.

Instruction sources applied:

- `.agents/designer.md`
- `test/docs/specs/visual-tone-migration-guide.md`
- `test/docs/specs/handoffs/public-engagement.md`
- `test/modules/content/README.md`
- `test/docs/specs/handoffs/public-content.md`, which was derived from `test/modules/content/README.md` and `behavior.feature`

No frontend/backend files were inspected or modified. No other Figma scope was modified.

## Canonical Figma coverage

Engagement frames are under `521:1052` and include:

- Wishlist: loaded desktop/mobile (`528:2980`, `528:3012`), empty desktop/mobile (`528:3033`, `528:4243`), add available/added desktop/mobile (`528:3748`, `528:3770`, `528:3790`, `528:3805`), remove result desktop/mobile (`528:4324`, `528:4348`), vote recorded desktop/mobile (`528:3052`, `528:4889`).
- Reviews: visible loaded desktop/mobile (`528:3073`, `528:3100`), validation desktop/mobile (`528:3118`, `528:3140`), accepted/reload desktop/mobile (`528:3157`, `528:3175`), unauthenticated 401 desktop/mobile (`528:4456`, `528:4482`).
- Notifications: loaded desktop/mobile (`528:3189`, `528:3214`), marked-read state desktop/mobile (`528:4279`, `528:4304`), empty-after-clear desktop/mobile (`528:4498`, `528:4499`).

Content frames are under `521:1052` and include:

- About loaded desktop/mobile (`528:2822`, `528:2827`).
- Article list page 1 desktop/mobile (`528:2823`, `528:2828`), detail desktop/mobile (`528:2824`, `528:2829`), page 2 desktop/mobile (`528:3819`, `528:3844`), page 3 desktop/mobile (`528:4782`, `528:4783`).
- Contact default desktop/mobile (`528:2825`, `528:2830`) and success desktop/mobile (`528:2826`, `528:2831`).

All canonical frame names follow domain/module/use-case/screen/state semantics. Product frames contain real Vietnamese shell, hierarchy, content, controls and state; no `SC-*` or `Traceability` text remains in `521:1052` product scope.

## Prototype handoff

Verified reaction paths include:

- Wishlist add → added; added → wishlist; remove → empty/after-remove; vote → recorded; mobile vote → wishlist.
- Review loaded → validation → accepted/reload; accepted reload → review context; unauthenticated review → auth (`523:1196`).
- Notification loaded mark-one/mark-all/clear → marked-read state; clear → empty-after-clear. Read/empty states expose no invalid mutation action.
- Article page 1 next → page 2; page 2 → page 3; previous paths back to prior page; article detail uses back; page 3 uses terminal pagination state.
- Contact default submit → success; success → default.

Figma rejected self-navigation attempts for actions inside terminal/post-state frames; those controls were removed or left read-only rather than exposing invalid behavior.

## Structural verification

- Engagement frame count after cleanup: 26.
- Content frame count after cleanup: 14.
- Frame-level overlap scan: pass for Engagement and Content.
- Desktop frames use `1440 × 900`; mobile frames use `390 × 844`.
- Shared public shell and semantic colors use the new light/neutral-first foundation: `#F7F3ED`, `#FFFDF9`, `#24211D`, `#6F675E`, restrained canonical ochre `#805F24`, semantic status roles.
- Visual tone acceptance: representative exports are light/neutral first, warm second; no clay/beige monochromatic wash.
- Scenario/traceability text scan: `SC-*` count 0; `Traceability` count 0 within `521:1052`.

## Evidence

Successful screenshot exports exist for:

- `evidence/public-engagement-wishlist-loaded.png`
- `evidence/public-engagement-reviews.png` (captured before final text-boundary correction; structural correction is recorded above)
- `evidence/public-content-articles.png`
- `evidence/public-content-contact.png`
- `evidence/public-content-about.png`
- `evidence/public-content-contact-success.png`
- `evidence/public-engagement-notifications-after-read.png`
- `evidence/public-engagement-notifications-empty-final.png`
- `evidence/public-engagement-vote-mobile-final.png`

The final export attempts for `528:3073` (reviews desktop) and `528:4279` (notifications read desktop) timed out. They are explicitly not claimed as visual-export passes. Structural/reaction verification remains available from node inspection.

## Handoff status

Scope implementation is structurally complete and handed off to Integration/QA. Visual QA evidence is partial because selected Figma exports timed out; downstream QA must not treat those two timed-out exports as passed screenshots.
