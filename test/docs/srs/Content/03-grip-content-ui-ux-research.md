# GRIP Content — UI/UX Research and Design Direction

**Status:** Final  
**Pipeline stage:** 03 — UI/UX research  
**Module:** Content  
**Surfaces:** Public Storefront + Admin Console  
**Inputs:**  
- `01-grip-content-ikea-research.md`  
- `02-grip-content-srs.md`

---

# 1. Purpose

This file translates verified IKEA research + the GRIP Content SRS into UI/UX direction.

It must not:

- override SRS ownership;
- reconstruct IKEA internal CMS UI;
- copy a screenshot as a canonical layout;
- turn Content into a second Catalog;
- expose arbitrary web-layout controls to normal Admin users.

Design trace:

```text
IKEA evidence
+ Content SRS
→ public user jobs
→ content IA
→ reading/shopping composition
→ admin authoring workflow
→ screen/state inventory
→ Design System requirements
```

---

# 2. UX thesis

Content should answer one of these customer questions:

```text
"What can I do with this space?"
"How should I solve this problem?"
"What should I consider before buying?"
"How would these products work together?"
```

Then it should make the transition to shopping easy.

The experience should feel like:

```text
Understand
→ Imagine
→ Explore relevant products
→ Continue shopping
```

not:

```text
Marketing page
→ giant product grid
```

and not:

```text
Blog article
→ dead end
```

---

# 3. Public user jobs

Primary Content jobs:

1. Get inspiration for a room or need.
2. Learn how to solve a practical problem.
3. Understand what to consider before buying/configuring something.
4. See products used in context.
5. Move from an idea into relevant Catalog exploration.
6. Continue to another related idea.
7. Discover current editorial campaigns/styles without losing shopping context.

These jobs should determine hierarchy.

---

# 4. Recommended Public IA

```text
Ideas / Inspiration
├── Featured
├── By room
├── By need/topic
├── Guides
└── Editorial stories / campaigns
```

This is semantic IA, not a requirement for five permanent navigation tabs.

If Content volume is small, use a simpler hub and avoid empty taxonomy chrome.

---

# 5. IKEA lesson — organize by customer language

IKEA exposes room and real-life topics rather than only technical editorial categories.

GRIP should therefore prefer:

```text
Phòng khách
Phòng ngủ
Không gian nhỏ
Sắp xếp & lưu trữ
Làm việc tại nhà
```

over:

```text
Article Type A
Campaign
Content Family
Post
```

Content type matters to Admin and rendering, but public discovery should mostly speak in customer intent.

---

# 6. Ideas / Inspiration Hub

## Goal

Help a user answer:

> “Tôi muốn xem ý tưởng phù hợp với nhu cầu của mình.”

Recommended hierarchy:

```text
Ý tưởng & cảm hứng

Featured story / current editorial focus

Khám phá theo không gian
[Phòng khách] [Phòng ngủ] [Bếp] ...

Giải pháp theo nhu cầu
[Không gian nhỏ] [Lưu trữ] [...]

Hướng dẫn mua sắm
...

Mới / Đáng xem
...
```

Do not automatically surface every possible taxonomy value.

The hub is curated navigation, not a database browser.

---

# 7. Content cards

A Content card should communicate:

```text
What is this about?
Why might I care?
What kind of content is it?
```

Recommended minimum:

```text
image
title
short contextual label or summary
```

Optional lightweight metadata:

```text
Hướng dẫn
Phòng ngủ
5 bước...
```

Avoid badge overload.

Do not present Content cards like Product Cards.

Content cards should not show:

- price;
- cart action;
- stock;
- review score;

unless a specific embedded product component is being rendered.

---

# 8. Idea Article — reading hierarchy

IKEA's strongest article pattern is repeated:

```text
visual context
→ specific idea
→ explanation
→ relevant shopping path
```

Recommended GRIP article:

```text
Breadcrumb / context

Title
Short intro

Hero / key image

Section heading
Text
Media

Section heading
Text
Relevant Catalog references

...

Related ideas
```

The user should understand the idea before being asked to shop it.

---

# 9. Keep articles scannable

Avoid one giant rich-text region.

Use:

- meaningful section headings;
- short paragraphs;
- strong imagery only when it adds context;
- occasional structured commerce blocks;
- visible progression through the article.

On mobile, an article should remain a natural vertical reading flow.

Do not create horizontal mini-layout complexity just because desktop allows it.

---

# 10. Editorial media

Media can do two jobs:

```text
explain / demonstrate
```

or:

```text
set inspiration/context
```

Do not force every image into a product-selling role.

Rules:

- informative image has useful alt text;
- decorative imagery should not produce redundant screen-reader noise;
- caption only when it adds information;
- do not make important explanatory text exist only inside an image.

---

# 11. Product references inside an Article

The key design rule:

> Product commerce information must look canonical wherever it appears.

If an article references one product:

```text
[small canonical product projection]
Product name
current price
current state
→ Product Detail
```

If it references a set:

```text
Shop this idea
<Product Card> <Product Card> ...
```

Reuse the same canonical Product Card semantics as Catalog.

Do not invent a “Content Product Card” with different:

- price hierarchy;
- badges;
- Save behavior;
- Add-to-Cart behavior.

---

# 12. Commerce should support the story

Product sections should appear near the idea they support.

Good:

```text
section explains vertical storage
→ relevant storage products/category
```

Weak:

```text
whole article
→ unrelated 20-product grid at bottom
```

Editorial content should not become a disguised category page.

---

# 13. Product reference degradation

Content layout must remain coherent when a referenced product disappears.

For example:

```text
2-column product set
one product becomes non-public
→ remaining valid product renders cleanly
```

No empty broken card.

No stale manually copied product name/price.

Admin preview should expose the problem before publication where possible.

---

# 14. Catalog destination CTA

When the editorial intent is broad, category/system CTA is often better than listing many products.

Example:

```text
Xem giải pháp lưu trữ
Xem tất cả bàn làm việc
Khám phá hệ tủ ...
```

Use typed Catalog destination selection.

Public CTA should describe where the user is going.

Avoid generic repeated:

```text
Xem thêm
```

when the destination is unclear.

---

# 15. Related Ideas

IKEA uses related editorial content to continue inspiration.

Recommended pattern:

```text
Ý tưởng liên quan

[content card]
[content card]
[content card]
```

Keep this editorial.

Do not mix:

```text
Related ideas
Recommended products
```

into one visually ambiguous carousel.

Ownership should be clear in the page structure.

---

# 16. Guide UX

Guide is more task-oriented than an Idea Article.

Recommended structure:

```text
Title
What this guide helps you do
Optional quick overview

1. Consider ...
2. Choose ...
3. Check ...
4. Continue to ...

Relevant Catalog / planner actions
```

A Guide can still use images, but information hierarchy should favor decision clarity.

---

# 17. Guide index

If enough Guides exist:

```text
Hướng dẫn mua sắm

Theo không gian / nhu cầu

Bedroom
- Mattress guide
- Bed selection guide

Storage
- ...
```

Avoid recreating IKEA's PDF-heavy structure if GRIP can serve native responsive pages.

Downloadable resources should be secondary unless the use case specifically benefits from a document.

---

# 18. Editorial Landing UX

An Editorial Landing can be richer than an Article but must remain constrained.

Recommended composition vocabulary:

```text
Hero
Editorial intro
Image-led story section
Text + media
Curated product set
Catalog CTA
Related idea set
```

The editor can arrange approved sections.

The editor should not control:

```text
absolute coordinates
arbitrary CSS
custom responsive breakpoints
raw animation scripts
```

---

# 19. Campaign/seasonal content

A temporal campaign should communicate its editorial concept without manually encoding volatile product claims.

If the landing contains current products:

```text
content chooses products
Catalog supplies current commerce state
```

If the campaign ends but content remains useful:

```text
remove featured placement
≠ automatically unpublish
```

This distinction should appear in Admin as well.

---

# 20. Homepage Content composition

Home may surface Content as:

```text
Featured idea
Ideas by room
Current editorial landing
Guide callout
```

but Home owns the page composition.

Content should publish compact projections optimized for embedding:

```text
title
image
summary
type/topic
route
```

Do not make Home fetch full article bodies.

---

# 21. Public responsive model

## Mobile

Prioritize:

- strong title/intro;
- single reading column;
- full-width or appropriately cropped media;
- stacked product cards/list;
- clear CTA;
- no tiny horizontal text layouts.

## Desktop

Use width to improve:

- media storytelling;
- text measure;
- related content composition;
- product-set browsing.

Do not stretch long-form text to the full viewport width.

---

# 22. Navigation behavior

Content links should preserve the user's mental model.

Examples:

```text
Ideas
→ Small spaces
→ Article
→ Product
```

Back navigation should return naturally to the prior discovery context.

Avoid trapping users in campaign microsites with a different shell unless explicitly required.

---

# 23. Content search

Current SRS does not require a standalone Content search screen.

If global search includes Content:

- result type must be clear;
- Content result must not look like a product;
- result should show title + contextual summary/image.

Do not build separate search merely because Content exists.

---

# 24. Admin UX thesis

A non-technical Content operator should be able to:

```text
find content
→ understand current status
→ edit meaningful sections
→ select real products/categories
→ preview
→ publish/schedule safely
```

without understanding:

```text
HTML
CSS
JSON
component props
breakpoints
database IDs
```

The Admin editor is a **content tool**, not a page-builder IDE.

---

# 25. Admin evidence boundary

There is no verified public evidence for IKEA's internal Content Admin.

Therefore the Admin design should be labeled:

```text
GRIP requirements
+ Contentful comparator
+ Shopify comparator
```

not “IKEA CMS”.

---

# 26. Admin Content inventory

Recommended:

```text
Content

[Tìm theo tiêu đề...]

Type ▾
Status ▾
Topic ▾

Title
Type
Status
Schedule
Updated
```

Default table should answer:

1. What content is this?
2. What kind is it?
3. Is it live?
4. Is something scheduled?
5. When was it last touched?

Avoid showing 15 taxonomy/SEO columns by default.

---

# 27. Status language

Use simple operational states:

```text
Bản nháp
Đã xuất bản
Đã gỡ xuất bản
Đã lưu trữ
```

Scheduled action should be a secondary explicit indicator:

```text
Xuất bản 09:00 · 01/09/2026
Gỡ 23:59 · 07/09/2026
```

Do not create a confusing generic state called `Scheduled` that hides whether the action is publish or unpublish.

---

# 28. Create Content

Recommended first step:

```text
Tạo nội dung

Bạn muốn tạo gì?

Ý tưởng / Bài hướng dẫn thực tế
Hướng dẫn mua sắm
Trang biên tập / chiến dịch
```

Each choice should include a short job description.

Do not ask editors to choose technical template IDs.

---

# 29. Editor layout

Recommended desktop structure:

```text
Top bar
Title / status / preview / publish actions

Main editor
- metadata
- ordered content blocks

Side/supporting panel
- taxonomy
- SEO
- schedule
- publication info
```

Do not put every metadata field above the article body.

The central area should focus on authoring.

---

# 30. Block authoring

A block picker should use semantic names.

Good:

```text
Đoạn nội dung
Hình ảnh
Nội dung + hình ảnh
Sản phẩm
Nhóm sản phẩm
Liên kết danh mục
Nội dung liên quan
```

Bad:

```text
Grid 12
Flex row
50/50 container
Raw HTML
Spacer 32
```

The Design System controls presentation.

---

# 31. Add block interaction

Recommended:

```text
[+ Thêm nội dung]
→ searchable/simple block chooser
```

If block count is small, a simple menu is better than a large component gallery.

After insertion:

- focus the new block;
- show required fields;
- allow reorder;
- allow remove/duplicate only where useful.

---

# 32. Reordering

Use clear drag/reorder handles on desktop where accessible.

Keyboard alternative must exist.

On long pages:

- show block title/type;
- allow collapse/expand;
- avoid forcing the editor to scroll through every full media preview just to reorder content.

---

# 33. Product picker

This is one of the most important Admin patterns.

Do not ask for:

```text
product_id
SKU string
URL
```

unless needed for troubleshooting.

Recommended:

```text
Chọn sản phẩm

[Tìm theo tên / SKU if operator knows it]

[thumbnail]
Product name
variant/selection
state

[Chọn]
```

The resulting block stores the canonical Catalog reference.

---

# 34. Category/destination picker

Similarly:

```text
Liên kết đến
○ Sản phẩm
○ Danh mục
○ Nội dung
○ URL ngoài   // only where allowed
```

Then use a searchable picker for first-party references.

Prefer canonical first-party references over manually pasted internal URLs.

---

# 35. Rich text boundaries

Rich text should support normal editorial needs:

- paragraphs;
- emphasis;
- links;
- lists;
- semantic headings where allowed.

Do not make rich text a secret escape hatch for arbitrary layout.

Product grids, media groups and CTAs should remain structured blocks.

---

# 36. Draft behavior

The editor should make safe working state obvious.

Example:

```text
Bản nháp đã lưu
```

or:

```text
Có thay đổi chưa xuất bản
```

For a currently live page:

```text
Đang hiển thị bản đã xuất bản
Có thay đổi bản nháp
```

This distinction is critical.

A normal `Save` action must not imply `Publish`.

---

# 37. Editing Published content

The most important lifecycle UX:

```text
LIVE
Published revision A

ADMIN
working changes B
```

Saving B:

```text
does not replace A
```

Publishing B:

```text
A → B live
```

The UI should communicate this explicitly so editors can experiment safely.

---

# 38. Preview

Contentful's useful principle is preview before publication.

Recommended action hierarchy:

```text
Preview
Publish ▾
```

Preview opens a storefront-like view of the current working content.

Key preview requirements:

- clearly marked as preview;
- not discoverable publicly;
- shows current Catalog reference behavior;
- supports desktop/mobile preview if the implementation can faithfully provide it.

Do not build a fake static thumbnail preview that cannot catch real composition issues.

---

# 39. Publish action

For valid Draft:

```text
[Publish]
```

Confirmation is not always necessary for a routine publication if status is clear.

For high-impact landing/campaign content, a lightweight review modal can show:

```text
Publish now?
Public URL
Content type
Any scheduled unpublish
```

Do not create ceremony for every small Article unless risk justifies it.

---

# 40. Schedule publication

Recommended:

```text
Publish ▾
├── Publish now
└── Schedule publish
```

Schedule modal:

```text
Schedule publish

Date
Time
Timezone

[Cancel]
[Schedule]
```

Timezone must be visible.

After schedule:

```text
Scheduled to publish
01 Sep 2026 · 09:00 · Asia/Bangkok
[Edit/Cancel]
```

No hidden schedule.

---

# 41. Schedule unpublish

For temporary campaign content:

```text
Publication
Published

Schedule unpublish
07 Sep 2026 · 23:59 · Asia/Bangkok
```

This allows the editor to understand the whole lifecycle.

Avoid hiding future unpublish under an overflow menu only.

---

# 42. Scheduled-action conflicts

If the editor creates impossible/contradictory schedule order, detect it in Admin.

Example:

```text
Unpublish is earlier than scheduled Publish.
```

Do not rely on the operator to reason about invisible event sequences.

---

# 43. Publication validation

Before Publish/Schedule, surface actionable errors grouped by content location.

Example:

```text
Chưa thể xuất bản

Block 3 — Hình ảnh
Thiếu mô tả hình ảnh.

Block 6 — Sản phẩm
Sản phẩm không còn khả dụng để hiển thị.

SEO
Slug đã được sử dụng.
```

Clicking an error should take the editor to the affected field/block where possible.

---

# 44. Invalid Catalog references in Admin

Do not silently hide invalid references from the editor.

Show:

```text
Sản phẩm không còn được xuất bản
[Chọn sản phẩm khác]
[Xóa block]
```

Preview should match graceful public behavior, but Admin should expose the cause.

---

# 45. Curation UX

Featured placement is separate from publication.

Example:

```text
Hiển thị nổi bật

[ ] Ideas — Nổi bật
[ ] Phòng khách — Nổi bật
```

Only expose named placements that actually exist in product semantics.

Do not let editors invent arbitrary “slot IDs”.

---

# 46. Curation list

For an ordered placement:

```text
Ideas — Nổi bật

1. Article A
2. Guide B
3. Landing C

[+ Thêm nội dung]
```

Rules:

- only public-eligible content can render;
- Admin may allow selecting draft for preparation, but must warn it will not appear publicly until published;
- ordering should be explicit.

---

# 47. Archive UX

Archive is for editorial cleanup, not immediate deletion.

Suggested:

```text
•••
Gỡ xuất bản
Lưu trữ
```

If currently Published:

```text
Archive
→ explain that content will no longer be public
→ unpublish/archive according to SRS behavior
```

Do not use Trash/Delete icon if the action is reversible Archive.

---

# 48. SEO UX

SEO should be available but secondary.

Suggested panel:

```text
Tìm kiếm & chia sẻ

Slug
SEO title
Meta description
```

Provide public-path preview if useful.

Do not make an editor complete redundant SEO fields when sensible defaults can be derived.

---

# 49. Taxonomy Admin

Taxonomy assignment in editor:

```text
Không gian
[Phòng khách]

Chủ đề
[Không gian nhỏ] [Lưu trữ]
```

Use controlled choices with search when needed.

Do not allow every editor to create near-duplicate tags inline by default:

```text
Small space
Small spaces
Small-space
Không gian nhỏ
```

Taxonomy management should be permission-controlled.

---

# 50. Content type-specific authoring

Do not force all content types into the exact same editor fields.

## Idea Article

Prioritize:

- intro;
- story sections;
- media;
- product/context references;
- related ideas.

## Guide

Prioritize:

- purpose;
- steps/sections;
- decision support;
- downstream actions.

## Editorial Landing

Prioritize:

- ordered compositional sections;
- hero/current theme;
- curated products/content;
- schedule.

Shared infrastructure is good; semantic authoring should still reflect the user's job.

---

# 51. Admin responsive behavior

Content authoring is primarily desktop-oriented because it involves long structured composition.

Mobile Admin support can focus on:

- viewing status;
- simple metadata;
- urgent publish/unpublish where allowed.

Do not compromise desktop authoring quality to force full block composition into a phone interface unless that is a real requirement.

---

# 52. Permission UX

If editor and publisher permissions differ:

Editor sees:

```text
Save draft
Preview
```

Publisher additionally sees:

```text
Publish
Unpublish
Schedule
```

Do not show enabled destructive/lifecycle actions and then rely on backend 403 as normal UX.

Backend still enforces authorization.

---

# 53. Loading/error states — Public

## Content load failure

Use normal storefront error/retry behavior.

## Product block fails independently

Article narrative can still render when a non-critical commerce projection fails, subject to platform error policy.

Do not take down an entire article solely because one optional product tile is unavailable.

## Related content empty

Omit the section rather than showing a broken empty box.

---

# 54. Loading/error states — Admin

## Draft save failure

Preserve editor input.

Show:

```text
Chưa lưu được thay đổi.
Thử lại.
```

Do not discard long editorial work.

## Publish failure

Keep working draft.

Do not change status to Published unless backend confirms success.

## Scheduled action failure

Surface it distinctly:

```text
Xuất bản theo lịch thất bại
```

with reason/action where available.

---

# 55. Design System implications

Likely reusable primitives/patterns:

```text
Content Card
Article reading container
Editorial Hero
Media block
Text + media block
Editorial CTA
Related Content rail/grid
Canonical Product reference slot
Guide step pattern

Admin:
Content status indicator
Content inventory table
Structured editor shell
Block row/container
Block picker
Reference picker
Taxonomy selector
Validation summary
Preview banner
Publish action menu
Schedule dialog
Scheduled-action summary
Curation list
Archive confirmation
```

Do not create visual components named after every Content type if the interaction semantics are reusable.

---

# 56. Candidate Figma inventory

## Public — discovery

```text
Content / Ideas Hub
├── Default
├── By room/topic
└── Empty/no matching content, if applicable
```

## Public — Article

```text
Content / Idea Article
├── Standard
├── With product references
└── Product reference degraded state
```

## Public — Guide

```text
Content / Guide
└── Standard structured guide
```

## Public — Landing

```text
Content / Editorial Landing
└── Standard compositional landing
```

## Admin — Inventory

```text
Content Admin / List
├── Default
├── Filtered
├── Empty
└── Search no result
```

## Admin — Editor

```text
Content Admin / Idea Article Editor
Content Admin / Guide Editor
Content Admin / Editorial Landing Editor
├── Draft
├── Published + no changes
├── Published + draft changes
├── Validation errors
└── Invalid reference warning
```

## Admin — Preview/lifecycle

```text
Content Admin / Preview
Content Admin / Publish
Content Admin / Schedule publish
Content Admin / Schedule unpublish
Content Admin / Scheduled
Content Admin / Schedule failure
Content Admin / Archive confirmation
```

## Admin — Curation

```text
Content Admin / Featured Content
└── Ordered placement management
```

Do not canonicalize every tiny modal as a standalone frame if it is better represented as a state inside the owning flow.

---

# 57. Public design acceptance gates

- [ ] Content discovery uses customer semantics.
- [ ] Article hierarchy is readable before commerce dominates.
- [ ] Content Cards are visually distinct from Product Cards.
- [ ] Structured product blocks reuse canonical Catalog semantics.
- [ ] Product price/stock is never editorially duplicated as authority.
- [ ] Broken Catalog references degrade without breaking the article.
- [ ] Guides prioritize decision clarity.
- [ ] Related ideas do not become a recommendation-engine claim.
- [ ] Editorial Landing remains constrained and readable.
- [ ] Mobile is designed as a true reading flow.
- [ ] Informative media has accessibility treatment.
- [ ] CTA text communicates destination.

---

# 58. Admin design acceptance gates

- [ ] Editor never needs HTML/CSS/layout coordinates for normal work.
- [ ] Create starts from semantic content type.
- [ ] Structured blocks use business/editorial language.
- [ ] Catalog references are selected through a picker.
- [ ] Draft Save does not imply Publish.
- [ ] Editing Published content does not change live output until Publish.
- [ ] Preview shows working content securely.
- [ ] Publish status is unmistakable.
- [ ] Scheduled action exposes action + date + time + timezone.
- [ ] Invalid references are visible and actionable.
- [ ] Publication errors do not discard Draft.
- [ ] Featured state is separate from Published state.
- [ ] Archive is not visually represented as permanent deletion.
- [ ] Curation cannot visually imply Draft content is already public.
- [ ] Permission-dependent actions are represented correctly.
- [ ] Admin uses content/editorial language, not implementation jargon.

---

# 59. Final UI/UX position

For customers:

```text
Need / aspiration
→ understandable content
→ contextual current products
→ continue into Catalog or another owning module
```

For Admin:

```text
Find
→ Author
→ Reference canonical data
→ Preview
→ Publish / Schedule
→ Curate
```

The desired result is a Content module that feels rich publicly while remaining deliberately simple to operate.

The core boundary remains:

> **Content tells the story. Catalog tells the truth about the product.**
