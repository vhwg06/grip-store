# GRIP Content — IKEA Research

**Status:** Final  
**Pipeline stage:** 01 — External research  
**Module:** Content  
**Surfaces covered:** Public Storefront + admin implications  
**Research date:** 2026-08-25  
**Primary reference:** IKEA US  
**Admin comparators:** Contentful + Shopify official documentation

---

# 1. Purpose

This file records verified external evidence relevant to the GRIP Content module.

It is not the GRIP specification and it is not a screen blueprint.

```text
verified external evidence
→ observed behavior
→ product/UX implication
→ candidate GRIP value
```

Rules:

1. Do not invent IKEA internal CMS/backoffice behavior.
2. Do not use a public IKEA page as proof of the exact authoring UI behind it.
3. Product truth remains Catalog-owned even when products are embedded in editorial content.
4. Comparator behavior is not an IKEA fact.
5. `02-grip-content-srs.md` decides actual GRIP scope.

---

# 2. Research conclusion

IKEA treats content as a **shopping-assistance layer**, not as an isolated company blog.

Current public surfaces combine:

```text
inspiration
+ practical guidance
+ room/use-case discovery
+ real product references
+ category/shop actions
```

The strongest reusable model is:

```text
Content
├── Ideas / inspiration
├── How-to / practical advice
├── Buying / planning guides
├── Room / topic discovery
└── Editorial / campaign landing experiences

Content references Catalog
but does not own product truth.
```

Core lesson:

> Content should help the customer understand what they can do, why a solution works, and which current products can help them do it.

---

# 3. IKEA Ideas is a first-class discovery surface

## E1 — Dedicated Ideas & Inspiration hub

**Observed — IKEA US**

The current IKEA US Ideas page is a dedicated discovery destination titled `Home ideas and design inspiration`.

It contains entry points such as:

- How-to guide;
- Inspiration by room;
- Tips from experts;
- style-oriented editorial content;
- design/planning tools;
- business inspiration.

The page also mixes inspiration with current shoppable product selections.

**Implication**

Editorial content is part of the shopping journey, not hidden under corporate/news navigation.

**GRIP candidate**

A canonical Content discovery destination should exist once enough content is published:

```text
Ideas / Inspiration
```

It should organize content by customer intent, not backend content type.

**Source**

IKEA US — Home ideas and design inspiration  
https://www.ikea.com/us/en/ideas/

---

# 4. Content discovery uses customer semantics

## E2 — Inspiration is organized by room

**Observed — IKEA US**

The Ideas and Rooms Inspiration surfaces expose room-oriented discovery such as bedroom, kitchen, living room, dining room, children, entry/hallway, workspace/home office, bathroom and outdoor.

The Rooms Inspiration page separates seeing the range in action from tips & tricks for similar room contexts.

**Implication**

`Room` is a useful customer-facing discovery dimension across multiple content kinds; it is not necessarily the content type itself.

**GRIP candidate**

Content taxonomy can include:

```text
room
need / problem
style
topic
```

while content type remains separate.

**Sources**

https://www.ikea.com/us/en/ideas/  
https://www.ikea.com/us/en/ideas/rooms-inspiration/

---

# 5. Content solves practical jobs, not only aesthetic inspiration

## E3 — How-to topics map to real-life problems

**Observed — IKEA US**

The current Ideas hub exposes practical themes such as store and organize, small spaces, family life, affordability, sleep and sustainable living.

**Implication**

Useful content taxonomy can start from a customer job/problem instead of campaign terminology.

**GRIP candidate**

Prefer public labels such as:

```text
Không gian nhỏ
Sắp xếp & lưu trữ
Phòng ngủ
Làm việc tại nhà
Mua sắm tiết kiệm
```

over internal editorial labels.

**Source**

https://www.ikea.com/us/en/ideas/

---

# 6. IKEA articles use meaningful sections

## E4 — Inspiration article is section-based

**Observed — IKEA US**

`A flexible small-space studio designed for easy moves` contains a title/introduction, multiple images, multiple titled content sections, practical narrative, contributor credits and tags.

Current storage articles similarly use repeated titled sections with images and relevant product/category actions.

**Implication**

A useful article is not just:

```text
title
+ giant rich-text blob
```

**GRIP candidate**

Editorial authoring should support a constrained set of semantic blocks, for example:

```text
text section
media section
text + media
product reference
product set
category CTA
related content
```

Keep the set constrained enough for non-technical authors.

**Sources**

https://www.ikea.com/us/en/ideas/a-flexible-small-space-studio-designed-for-easy-moves-pubdc0aa431/  
https://www.ikea.com/us/en/ideas/home-furnishings/theres-room-for-that-storage-ideas-to-maximise-any-space-pubcddfbea0/

---

# 7. Editorial content references products in context

## E5 — Inspiration connects media/sections to product information

**Observed — IKEA US**

Current Ideas articles contain links identified as `Product information page` near relevant room imagery/content. Other articles expose explicit shoppable groups such as `Shop top designer picks`.

**Implication**

The content-to-commerce connection is contextual:

```text
idea / room / advice
→ relevant products
```

rather than forcing every article to become a product grid.

**GRIP candidate**

Content can reference:

```text
Product
Product selection / variant where necessary
Category
Collection/search destination
```

through typed Catalog references.

**Sources**

https://www.ikea.com/us/en/ideas/home-furnishings/theres-room-for-that-storage-ideas-to-maximise-any-space-pubcddfbea0/  
https://www.ikea.com/us/en/ideas/south-philly-3-tips-for-small-space-living-puba9ec1160/  
https://www.ikea.com/us/en/ideas/home-furnishings/ask-an-ikea-interior-designer-easy-updates-for-a-bold-home-look-pub4690d560/

---

# 8. Product truth stays live inside editorial composition

## E6 — Current commerce information appears in editorial surfaces

**Observed — IKEA US**

The Ideas hub and 2026 Style Guide expose current shoppable product information such as product name, current price, promotional state and review summary.

**Inference**

The editorial surface behaves as a composition of current commerce information rather than as a static historical product catalog.

The public pages do not reveal IKEA's internal data architecture, so this research does not claim a specific backend implementation.

**GRIP candidate**

Enforce the semantic equivalent:

```text
Content stores Catalog reference
        ↓
public render resolves current Catalog projection
```

Content must not become authoritative for:

```text
price
stock
review score
sellability
product specification
```

**Sources**

https://www.ikea.com/us/en/ideas/  
https://www.ikea.com/us/en/ideas/styles/

---

# 9. Content can lead into broader Catalog exploration

## E7 — Articles link to category/system destinations

**Observed — IKEA US**

Current articles use calls such as `See all shelving units, bookcases & storage options`, `See the ENHET kitchen system`, `See all storage & organization`, `See all vases`, and `See all EKET cube shelves & cabinets`.

**Implication**

Content can move a user from a specific idea to a broader Catalog path.

**GRIP candidate**

Support typed Catalog CTA references rather than relying only on arbitrary pasted URLs.

**Sources**

https://www.ikea.com/us/en/ideas/home-furnishings/theres-room-for-that-storage-ideas-to-maximise-any-space-pubcddfbea0/  
https://www.ikea.com/us/en/ideas/home-furnishings/ask-an-ikea-interior-designer-easy-updates-for-a-bold-home-look-pub4690d560/

---

# 10. Related editorial content is part of the journey

## E8 — Articles expose related inspiration

**Observed — IKEA US**

Current articles include related-content areas such as `See more of this home` and `Learn more from our IKEA interior designers`.

**Implication**

A content detail should not always dead-end after the final paragraph.

**GRIP candidate**

Support:

```text
Related ideas
```

through explicit editorial curation first. A recommendation engine is not required.

**Sources**

https://www.ikea.com/us/en/ideas/home-furnishings/modern-life-a-decor-centric-small-apartment-for-living-well-pub93238940/  
https://www.ikea.com/us/en/ideas/home-furnishings/ask-an-ikea-interior-designer-easy-updates-for-a-bold-home-look-pub4690d560/

---

# 11. Tags and contributor metadata

## E9 — IKEA articles expose tags

**Observed — IKEA US**

Examples include tags such as Organizing, Personal home, Small spaces, On a budget and How to.

**Implication**

Editorial classification can support cross-cutting discovery independent of room.

**GRIP candidate**

Use a small controlled taxonomy. Avoid unlimited free-text tag creation.

## E10 — Some articles credit contributors

**Observed — IKEA US**

The flexible small-space studio article exposes `Made by` credits for interior designer, photographer and writer.

**GRIP decision**

Contributor attribution is useful optional metadata, not mandatory for every content item.

**Sources**

https://www.ikea.com/us/en/ideas/a-flexible-small-space-studio-designed-for-easy-moves-pubdc0aa431/  
https://www.ikea.com/us/en/ideas/south-philly-3-tips-for-small-space-living-puba9ec1160/

---

# 12. Buying Guides are semantically distinct

## E11 — Dedicated Buying Guides destination

**Observed — IKEA US**

IKEA states that buying guides help customers plan, buy and build popular furniture systems. Guides are grouped by customer-recognizable areas such as bathroom, bedroom, organization, kitchen & dining, living room, office, outdoor and textiles.

Many current guides are downloadable documents.

**Implication**

A buying/planning guide solves a different job from inspiration: it reduces purchase/configuration uncertainty.

**GRIP candidate**

Treat `Guide` as a distinct content semantic.

GRIP does not need to copy IKEA's PDF-first delivery model; responsive native guides may be more appropriate.

**Source**

https://www.ikea.com/us/en/customer-service/product-support/buying-guides/

---

# 13. Guidance bridges inspiration, planning and purchase

## E12 — IKEA Kitchen connects inspiration → planner → guide → purchase

**Observed — IKEA US**

IKEA's kitchen support flow describes browsing inspiration, using a planner, using a buying guide, reviewing the plan, then finalizing shopping/order actions.

A separate five-step kitchen page combines guidance with planning, category shopping and services.

**Implication**

Content can orchestrate a customer job while specialized modules own the execution.

**GRIP candidate**

Content may link to:

```text
Catalog
Planner/configurator
Service
Checkout
```

without absorbing those workflows.

**Sources**

https://www.ikea.com/us/en/customer-service/knowledge/articles/74ef61g1-35d6-4f5g-g360-d50gg12d66e1.html  
https://www.ikea.com/us/en/rooms/kitchen/how-to-plan-buy/

---

# 14. Campaign/editorial landing mixes narrative and commerce

## E13 — 2026 Style Guide is editorial and shoppable

**Observed — IKEA US**

The current Style Guide contains trend narrative, color-of-the-year editorial, current curated products, links to earlier Style Guide archives and further style exploration.

**Implication**

An editorial/campaign landing can be more compositional than an article:

```text
narrative
+ media
+ curated sections
+ current commerce references
+ related editorial destinations
```

**GRIP candidate**

Support an `Editorial Landing` semantic type with constrained reusable sections.

Do not expose arbitrary HTML/CSS as the default authoring method.

**Source**

https://www.ikea.com/us/en/ideas/styles/

---

# 15. Content has temporal relevance

## E14 — Current and archived editorial campaigns coexist

**Observed — IKEA US**

The 2026 Style Guide remains current while linking to 2025 and 2024 archives. Homepage/Ideas featured editorial changes over time.

**Implication**

These states are different:

```text
published
featured
historical
unpublished
```

A content item can remain published after it stops being featured.

**GRIP candidate**

Publication lifecycle and editorial placement/curation state must be separate.

**Sources**

https://www.ikea.com/us/en/ideas/styles/  
https://www.ikea.com/us/en/ideas/

---

# 16. Content is surfaced outside the Content hub

## E15 — Homepage promotes inspiration alongside shopping

**Observed — IKEA US**

The current homepage includes inspiration, designer tips, the Style Guide and room inspiration.

**Implication**

Content discovery can begin from Home or other modules.

**GRIP candidate**

Home may consume a Content projection such as:

```text
featured ideas
featured guide
featured campaign
```

while Home retains composition ownership.

**Source**

https://www.ikea.com/us/en/

---

# 17. Adjacent capabilities deliberately excluded

## E16 — Social/UGC appears on IKEA homepage

**Observed — IKEA US**

The homepage contains `As seen on Instagram` real-home content.

**GRIP decision**

Out of current Content scope because it introduces consent, moderation, source ownership and rights-management semantics.

## E17 — Ideas links to planning/design tools

**Observed — IKEA US**

Ideas links to IKEA Kreativ, 3D planning and interior design services.

**GRIP boundary**

```text
Content
→ explains / inspires / links

Specialized module
→ owns interactive planning/service behavior
```

**Source**

https://www.ikea.com/us/en/ideas/

---

# 18. IKEA Admin evidence boundary

No public source in this research exposes IKEA's internal editorial CMS.

Therefore do not claim IKEA uses:

- a specific draft workflow;
- a block editor;
- scheduling;
- preview;
- an approval queue.

Admin patterns below are explicitly comparator-derived.

---

# 19. Admin comparator — Contentful

## C1 — Draft edits can remain separate from live content

**Observed — Contentful**

Contentful says entry changes can be saved without going live until Publish is explicitly invoked. Its documentation also describes a basic draft/published workflow.

**GRIP candidate**

```text
published revision stays live
+
working draft can change
→ explicit Publish
→ new revision becomes live
```

**Sources**

https://www.contentful.com/help/content-and-entries/  
https://www.contentful.com/help/cms-as-code/

## C2 — Preview before publish

**Observed — Contentful**

Contentful supports live preview or preview in a new tab for draft and published entries; preview delivery is separated from normal production delivery.

**GRIP candidate**

```text
draft
→ secure Preview
→ storefront-like result
→ edit
→ Publish
```

Preview must not make unpublished content publicly discoverable.

**Sources**

https://www.contentful.com/help/content-preview/  
https://www.contentful.com/developers/docs/tutorials/preview/content-preview/

## C3 — Scheduled publish and unpublish

**Observed — Contentful**

Contentful supports scheduling entry publish/unpublish at a selected date, time and timezone, and makes scheduled actions visible to editors.

**GRIP candidate**

```text
Publish now
Schedule publish
Schedule unpublish
```

with explicit timezone and visible future actions.

**Sources**

https://www.contentful.com/help/scheduled-publishing/schedule-an-entry/  
https://www.contentful.com/help/scheduled-publishing/

---

# 20. Admin comparator — Shopify

## C4 — Sections/blocks support constrained non-code composition

**Observed — Shopify**

Shopify's theme editor uses sections and blocks that can contain text, buttons, images and links; blocks/sections can be reordered and can connect to dynamic data sources.

**GRIP candidate**

Use semantic blocks:

```text
Heading / intro
Text + media
Media
Product set
Category CTA
Related ideas
```

Do not expose CSS/grid implementation controls to normal content editors.

**Source**

https://help.shopify.com/pt-BR/manual/online-store/themes/theme-structure/sections-and-blocks

## C5 — Content inventory and publishing are separated from product management

**Observed — Shopify**

Shopify moved Blogs into Admin `Content` in 2025. Blog/page documentation supports editing, organization metadata and visibility/future publishing.

**GRIP candidate**

```text
Content
→ inventory
→ search/filter
→ create/edit
→ preview
→ publish/schedule
```

rather than burying editorial management inside Catalog Product Admin.

**Sources**

https://changelog.shopify.com/posts/blogs-moved-to-the-content-section-in-admin  
https://help.shopify.com/en/manual/online-store/blogs  
https://help.shopify.com/ko/manual/online-store/add-edit-pages

---

# 21. What GRIP should take now

1. Content is a shopping-assistance capability, not only brand publishing.
2. Provide Ideas/Inspiration discovery.
3. Organize discovery by room/problem/topic.
4. Use meaningful structured article sections.
5. Allow typed product/category references.
6. Resolve current Catalog truth at render time.
7. Support related editorial content.
8. Treat Guide separately from inspiration Article.
9. Support compositional Editorial Landing.
10. Allow Home/other surfaces to consume featured Content projections.
11. Content can orchestrate journeys into other modules without owning them.
12. Admin draft should not mutate live content until explicit Publish.
13. Preview before publish.
14. Schedule publish/unpublish.
15. Use constrained blocks for non-technical authoring.

---

# 22. What GRIP should not take in this iteration

```text
IKEA Live shopping
Instagram/social UGC
3D planner
Interior-design service workflow
PDF-first guide authoring
Arbitrary HTML/CSS
A/B testing
Multi-release experimentation
Complex approval workflow
Localization workflow
AI-generated content
Comments
Newsletter/email campaigns
```

---

# 23. Candidate GRIP Content semantics

```text
Content
├── Idea Article
│   └── inspiration / how-to / expert advice
├── Guide
│   └── structured purchase/planning guidance
├── Editorial Landing
│   └── campaign / style / curated story
├── Content Hub / Curation
│   └── featured content by room/topic
└── Taxonomy
    ├── room
    ├── topic / need
    └── style where useful
```

---

# 24. Ownership boundary

```text
Content owns
- editorial narrative
- editorial media association
- content taxonomy
- content ordering/composition
- publication lifecycle
- editorial curation

Catalog owns
- product identity
- product title/specification
- price
- stock/sellability
- canonical product media
- rating projection
- category identity

Engagement owns
- reviews
- saved state

Home/storefront composition
- decides where featured Content projections appear
```

Never encode live product truth like this:

```text
Content product block
- product_name
- product_price
- stock
```

when the block represents a Catalog product.

Use:

```text
catalog_product_ref
→ current Catalog projection
```

---

# 25. Source ledger

## IKEA US

1. https://www.ikea.com/us/en/ideas/
2. https://www.ikea.com/us/en/ideas/rooms-inspiration/
3. https://www.ikea.com/us/en/ideas/a-flexible-small-space-studio-designed-for-easy-moves-pubdc0aa431/
4. https://www.ikea.com/us/en/ideas/south-philly-3-tips-for-small-space-living-puba9ec1160/
5. https://www.ikea.com/us/en/ideas/home-furnishings/theres-room-for-that-storage-ideas-to-maximise-any-space-pubcddfbea0/
6. https://www.ikea.com/us/en/ideas/home-furnishings/ask-an-ikea-interior-designer-easy-updates-for-a-bold-home-look-pub4690d560/
7. https://www.ikea.com/us/en/ideas/home-furnishings/modern-life-a-decor-centric-small-apartment-for-living-well-pub93238940/
8. https://www.ikea.com/us/en/customer-service/product-support/buying-guides/
9. https://www.ikea.com/us/en/customer-service/knowledge/articles/74ef61g1-35d6-4f5g-g360-d50gg12d66e1.html
10. https://www.ikea.com/us/en/rooms/kitchen/how-to-plan-buy/
11. https://www.ikea.com/us/en/ideas/styles/
12. https://www.ikea.com/us/en/

## Admin comparators

13. https://www.contentful.com/help/content-and-entries/
14. https://www.contentful.com/help/content-preview/
15. https://www.contentful.com/help/scheduled-publishing/
16. https://www.contentful.com/help/scheduled-publishing/schedule-an-entry/
17. https://help.shopify.com/pt-BR/manual/online-store/themes/theme-structure/sections-and-blocks
18. https://help.shopify.com/en/manual/online-store/blogs
19. https://changelog.shopify.com/posts/blogs-moved-to-the-content-section-in-admin

---

# 26. Final research position

The reusable IKEA pattern is:

```text
customer has a problem or aspiration
        ↓
content explains / inspires
        ↓
content connects the idea to current Catalog options
        ↓
customer continues into shopping/planning
```

For GRIP:

> **Content owns meaning and composition. Catalog owns commerce truth.**
