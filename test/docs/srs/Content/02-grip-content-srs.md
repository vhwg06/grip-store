# GRIP Content Module — Software Requirements Specification

**Status:** Final  
**Pipeline stage:** 02 — SRS  
**Module:** Content  
**Surfaces:** Public Storefront + Admin Console  
**Research input:** `01-grip-content-ikea-research.md`

---

# 1. Purpose

The Content module owns editorial information that helps customers understand, discover and use the GRIP catalog.

Content is responsible for:

- inspiration;
- practical guidance;
- buying/planning guidance;
- editorial/campaign storytelling;
- content taxonomy;
- content publication lifecycle;
- editorial curation;
- typed references to other modules.

Content is **not** a second Catalog.

Core invariant:

```text
Content owns meaning + composition.
Catalog owns commerce truth.
```

---

# 2. Current semantic scope

```text
Content
├── Idea Article
├── Guide
├── Editorial Landing
├── Content Hub / Curation
└── Taxonomy
    ├── room
    ├── topic / need
    └── style, when useful
```

Admin includes:

```text
Content Admin
├── Content inventory
├── Create / edit
├── Structured blocks
├── Catalog reference picker
├── Preview
├── Publish / unpublish
├── Schedule
└── Archive
```

---

# 3. Explicit out-of-scope capabilities

The current Content module does not require:

```text
Social / Instagram UGC
Comments
Ratings / reviews
Live shopping
Newsletter/email campaigns
3D planning
Interior-design service workflow
A/B testing
Personalized content ranking
AI content generation
Localization workflow
Multi-stage editorial approval workflow
Arbitrary HTML/CSS page building
Version comparison/history UI
Complex multi-release campaign orchestration
```

These require separate product decisions.

---

# 4. Ownership boundaries

## 4.1 Content owns

Content is authoritative for:

- content identity;
- content type;
- editorial title;
- editorial summary/intro;
- editorial body/blocks;
- content-associated editorial media;
- content taxonomy assignments;
- explicit related-content references;
- explicit Catalog references;
- editorial ordering within the content item;
- slug/public route metadata;
- SEO/editorial metadata defined in this SRS;
- publication state;
- future publish/unpublish schedule;
- editorial curation/featured placement configuration owned by Content.

## 4.2 Catalog owns

Catalog remains authoritative for:

- product identity;
- product title/specification;
- product/variant state;
- current price;
- current promotion state;
- stock/sellability;
- canonical product images where Catalog owns them;
- category identity;
- product ratings projection;
- recommendation composition.

Content stores references, not copied commerce truth.

## 4.3 Engagement owns

Engagement owns:

- saved products/lists;
- customer reviews;
- rating aggregates.

If a canonical product card inside Content includes Save or rating UI, those semantics remain Engagement-owned.

## 4.4 Account owns

Account owns customer identity/profile.

Content public reading does not require Account by default.

## 4.5 Home/storefront composition

Home or another public surface may display Content projections.

That does not transfer Content ownership to Home.

---

# 5. Content types

## CNT-TYPE-001 — Idea Article

An Idea Article is editorial content intended primarily to:

- inspire;
- explain;
- teach;
- provide practical advice;
- show a customer-oriented solution.

Examples of user goals:

```text
How do I organize a small room?
How can I make a workspace more comfortable?
What should I consider when furnishing a bedroom?
```

An Idea Article can contain structured editorial blocks and typed cross-domain references.

---

## CNT-TYPE-002 — Guide

A Guide is structured content intended primarily to reduce purchase/planning uncertainty.

A Guide can:

- explain a decision process;
- explain compatibility/selection concepts;
- provide ordered steps;
- link to relevant Catalog destinations;
- link to external specialized workflows where an accepted contract exists.

A Guide is not required to be a PDF.

---

## CNT-TYPE-003 — Editorial Landing

An Editorial Landing is a compositional public page intended for:

- a campaign;
- a seasonal/style story;
- a curated topic;
- a thematic collection of editorial and commerce references.

It can contain multiple structured sections and curated destinations.

It must not become an arbitrary page-code editor.

---

## CNT-TYPE-004 — Content Hub / Curation

A Content Hub is a discovery surface composed from published Content.

It can expose:

- featured items;
- room/topic groupings;
- latest or curated content;
- content-type-specific destinations where useful.

A hub does not duplicate source content bodies.

---

# 6. Core content metadata

Every public content item must support, as applicable:

```text
id
type
title
slug
summary / intro
hero media?
taxonomy assignments
editorial blocks
related content refs?
created_at
updated_at
publication metadata
SEO metadata
```

Optional contributor metadata may include:

```text
display name
role
```

No unnecessary internal author/account information should be exposed publicly.

---

# 7. Taxonomy

## CNT-TAX-001 — Controlled taxonomy

Content classification uses controlled values managed by authorized Admin users.

Free-text uncontrolled tag creation from every content edit is not the default behavior.

---

## CNT-TAX-002 — User-facing semantics

Taxonomy labels must be understandable to customers.

Candidate dimensions:

```text
Room
Topic / Need
Style
```

Examples:

```text
Phòng ngủ
Không gian nhỏ
Sắp xếp & lưu trữ
Làm việc tại nhà
```

Do not expose implementation categories such as backend content table names.

---

## CNT-TAX-003 — Content type is separate from taxonomy

`Article`, `Guide`, and `Editorial Landing` are content semantics.

`Bedroom`, `Small spaces`, and `Storage` are discovery classifications.

They must not be conflated.

---

# 8. Structured content composition

## CNT-BLK-001 — Supported block set

Current Content authoring supports a constrained canonical set of block semantics.

Minimum candidate set:

```text
Rich text section
Media
Text + media
Product reference
Product set
Catalog destination CTA
Related content
Callout / quote, if required
```

The final implementation may omit any block not supported by the accepted content contract.

---

## CNT-BLK-002 — No arbitrary presentation code

Normal Content Admin does not require authors to enter:

```text
HTML
CSS
JavaScript
layout coordinates
grid implementation values
```

Presentation is selected through approved semantic blocks and limited content options.

---

## CNT-BLK-003 — Block order

Editors can reorder blocks within a content item.

The order is part of Content-owned editorial composition.

---

## CNT-BLK-004 — Block validation

A content block must satisfy its required semantic fields before publication.

Examples:

- informative media requires accessible alternative text;
- product reference requires a resolvable Catalog reference;
- CTA requires an allowed destination;
- empty structural blocks are rejected or ignored according to contract.

---

# 9. Catalog references

## CNT-CAT-001 — Typed Catalog reference

Content can reference Catalog entities through published identifiers/contracts.

Supported reference kinds may include:

```text
Product
Product selection / variant, if necessary
Category
Product family/collection, if canonical
```

Do not model unsupported Catalog concepts merely for Content convenience.

---

## CNT-CAT-002 — Catalog picker in Admin

Admin authors should select Catalog entities using human-readable search/picker behavior.

Normal authoring must not require manually typing internal Catalog IDs.

---

## CNT-CAT-003 — Current commerce projection

When public Content renders a structured Catalog reference, current Catalog projection is resolved at read/render time.

Content is not authoritative for:

- current price;
- current availability;
- current product name/spec;
- product rating;
- current merchandising badge.

---

## CNT-CAT-004 — Catalog reference failure

If a referenced Catalog entity is unavailable, unpublished or no longer publicly resolvable:

- the Content page must remain structurally usable;
- stale copied commerce data must not be shown as current;
- the affected reference block must follow a defined graceful-degradation rule.

Recommended default:

```text
single invalid product reference
→ omit product commerce card

product set with some valid refs
→ render valid refs only

CTA to invalid Catalog destination
→ do not render actionable broken CTA
```

The editor should receive validation/warning in Admin.

---

## CNT-CAT-005 — Editorial prose is not commerce authority

Authors may mention products in prose for editorial reasons.

However manually written commerce facts such as prices, availability and current promotional claims are not treated as Catalog truth.

Admin UX should discourage copying volatile commerce data into rich text where a typed Catalog reference exists.

---

# 10. Related Content

## CNT-REL-001 — Explicit related content

An editor can associate published Content items as related content.

Related items remain independently owned Content entries.

---

## CNT-REL-002 — No recursive duplication

A related-content reference is a link/projection.

It does not copy the related article body into the parent content item.

---

## CNT-REL-003 — Public eligibility

Only publicly eligible Content is shown in a public related-content projection.

---

# 11. Content discovery

## CNT-DIS-001 — Ideas / Inspiration hub

Public users can access a Content discovery surface once published content exists.

The hub should expose content based on customer-facing semantics such as:

- featured;
- room;
- topic/need;
- content kind when useful.

---

## CNT-DIS-002 — Room/topic browsing

Users can navigate from a taxonomy topic to relevant published Content.

The exact UI may be tabs, chips, lists or dedicated pages.

The SRS defines the semantic result, not the visual control.

---

## CNT-DIS-003 — Featured curation

Authorized Admin users can curate Content items into defined featured placements owned by Content.

Featured is not publication state.

A content item can be:

```text
published + featured
published + not featured
```

---

## CNT-DIS-004 — Other modules may consume featured Content

Home or another public module may request a Content projection for an agreed placement.

Content publishes the eligible items and metadata.

The consuming module owns where/how the slot appears in its own page hierarchy.

---

## CNT-DIS-005 — Search integration

If GRIP has a global storefront search capability, Content can publish indexable metadata/content to that search contract.

Content does not automatically own global search UI.

A standalone Content search screen is not required in the current SRS.

---

# 12. Public Article requirements

## CNT-PUB-ART-001 — Article detail

A published Idea Article can expose:

- title;
- intro/summary;
- hero media if configured;
- structured body;
- taxonomy;
- optional contributor information;
- Catalog references;
- related content.

---

## CNT-PUB-ART-002 — Reading hierarchy

Editorial narrative remains primary.

Commerce references support the story and must not automatically dominate every article.

---

## CNT-PUB-ART-003 — Product interaction remains canonical

If a Content surface renders a canonical product card:

- Product Detail navigation remains Catalog-owned;
- Save remains Engagement-owned;
- Add to Cart remains Cart-owned;
- price/availability remain Catalog-owned.

---

# 13. Public Guide requirements

## CNT-PUB-GDE-001 — Guide detail

A published Guide presents structured decision/planning information.

A Guide may contain:

- intro;
- ordered steps;
- relevant explanatory sections;
- media;
- Catalog references;
- links to specialized modules/services when valid.

---

## CNT-PUB-GDE-002 — Guide hub/index

If sufficient Guides exist, users can browse Guides by relevant customer semantics such as room/topic/category.

---

## CNT-PUB-GDE-003 — Guide does not own downstream workflow

A Guide may send a user to:

```text
Catalog
Planner
Service
Checkout
```

but does not replicate those workflows.

---

# 14. Public Editorial Landing requirements

## CNT-PUB-LND-001 — Compositional landing

A published Editorial Landing can compose multiple approved blocks/sections.

Typical semantics:

```text
hero/story intro
editorial section
media
curated products
Catalog CTA
related Content
```

---

## CNT-PUB-LND-002 — Current commerce data

All structured product sections resolve current Catalog projection.

Landing publication does not freeze product commerce data.

---

## CNT-PUB-LND-003 — Historical public content

A landing can remain published after a campaign stops being featured.

No automatic archive/unpublish behavior is implied unless explicitly scheduled.

---

# 15. SEO and public route requirements

## CNT-SEO-001 — Unique public slug

Every publicly routable Content item has a unique slug within the applicable route scope.

---

## CNT-SEO-002 — SEO metadata

Content can manage supported metadata such as:

```text
SEO title
meta description
social/share image, if supported
```

Do not duplicate Catalog SEO for a Product.

---

## CNT-SEO-003 — Unpublished content

Unpublished/draft/archived Content must not be returned through the normal public Content delivery path.

Search indexing/sitemap behavior must respect publication eligibility.

---

# 16. Accessibility requirements

## CNT-A11Y-001 — Informative media

Informative Content media requires meaningful alternative text before publication.

Decorative media can be explicitly marked decorative if the rendering contract supports it.

---

## CNT-A11Y-002 — Heading semantics

Structured content must preserve a valid semantic heading hierarchy.

Authors should choose section semantics, not arbitrary font-size hacks.

---

## CNT-A11Y-003 — Link meaning

CTA/link labels must communicate destination/action meaning.

Avoid meaningless repeated labels where context is insufficient.

---

# 17. Admin — Content inventory

## CNT-ADM-LST-001 — Content list

Authorized Admin users can access Content inventory.

Minimum useful fields:

```text
title
type
publication state
scheduled state, if any
updated time
```

Optional taxonomy/owner fields can be included when operationally useful.

---

## CNT-ADM-LST-002 — Search

Editors can find content by human-readable values such as title/slug.

Internal IDs must not be required for normal lookup.

---

## CNT-ADM-LST-003 — Filters

Content inventory can filter by supported operational dimensions such as:

```text
type
publication state
taxonomy
scheduled status
```

Avoid filter complexity not justified by content volume.

---

# 18. Admin — Create/edit

## CNT-ADM-EDT-001 — Create by semantic type

Editor starts by choosing a semantic content type:

```text
Idea Article
Guide
Editorial Landing
```

Do not begin by choosing arbitrary technical templates.

---

## CNT-ADM-EDT-002 — Draft save

Editor can save incomplete valid-enough working content as Draft.

Draft save does not publish content.

---

## CNT-ADM-EDT-003 — Published content edits remain non-live until Publish

Editing a currently published content item must not silently update the live storefront.

Required behavior:

```text
published revision remains live
+
working changes are saved
→ explicit Publish
→ new working content becomes live
```

Implementation can use revisions internally, but this observable behavior is mandatory.

---

## CNT-ADM-EDT-004 — Structured block editing

Editor can:

- add allowed block;
- edit block;
- reorder block;
- remove block.

The editor UI must use product/content language, not layout-engine language.

---

## CNT-ADM-EDT-005 — Reference selection

Product/category/related-content references are selected through searchable canonical pickers.

---

## CNT-ADM-EDT-006 — Validation feedback

Editor receives field/block-level validation before publication where possible.

Validation messages must identify:

- what is invalid;
- which block/field is affected;
- what action can resolve it.

---

# 19. Admin — Preview

## CNT-ADM-PRV-001 — Preview draft

Authorized editors can preview current working content before publication.

Preview should approximate the canonical public rendering closely enough to verify:

- hierarchy;
- media;
- referenced products/categories;
- responsive content behavior where preview support exists.

---

## CNT-ADM-PRV-002 — Preview security

Preview does not make draft content publicly discoverable through normal public routes.

Preview access must use an authorized mechanism.

---

## CNT-ADM-PRV-003 — Preview current Catalog truth

Preview of structured Catalog references uses an appropriate current Catalog projection.

Preview must not require copying live price/stock into Content.

---

# 20. Admin — Publication lifecycle

## CNT-PUB-001 — Draft

New content begins as Draft unless explicitly created through another approved state.

Draft is non-public.

---

## CNT-PUB-002 — Publish now

An authorized publisher can publish a valid Draft/current working revision.

Successful publication makes it publicly eligible.

---

## CNT-PUB-003 — Unpublish now

An authorized publisher can unpublish currently published Content.

Unpublished content becomes non-public while remaining editable in Admin.

---

## CNT-PUB-004 — Schedule publish

An authorized publisher can schedule a valid content item to publish at a future date/time.

The schedule records:

```text
date
time
timezone
action = publish
```

---

## CNT-PUB-005 — Schedule unpublish

An authorized publisher can schedule a published/scheduled content item to unpublish at a future date/time.

---

## CNT-PUB-006 — Schedule visibility

Admin UI must expose future scheduled actions clearly on the content item and/or inventory.

The editor should not need to remember that a schedule exists.

---

## CNT-PUB-007 — Cancel schedule

Authorized publisher can cancel a pending schedule.

Cancellation does not implicitly publish/unpublish the content.

---

## CNT-PUB-008 — Scheduled failure

If a scheduled publication cannot execute due to invalid current state or system failure:

- content must not be falsely reported as successfully published;
- Admin must retain an observable failed/error state or actionable evidence;
- current live content must remain consistent.

Exact notification channel is implementation-specific.

---

# 21. Publication state model

Publicly meaningful state:

```text
Draft
Published
Unpublished
Archived
```

Scheduled action is modeled separately:

```text
none
publish_at(...)
unpublish_at(...)
```

A content item can therefore be:

```text
Draft + scheduled publish
Published + scheduled unpublish
Published + no schedule
```

Do not overload `scheduled` as the sole content state.

---

# 22. Archive

## CNT-ARC-001 — Archive

Authorized Admin can archive content that no longer belongs in active editorial management.

Archived content:

- is not publicly eligible;
- is excluded from default active inventory;
- can remain recoverable if the backend supports restoration.

---

## CNT-ARC-002 — Archive is not delete

Archive must not be presented as permanent deletion.

Permanent destructive deletion is outside the current SRS unless a separate retention requirement is accepted.

---

# 23. Curation

## CNT-CUR-001 — Curated placement

Content can define agreed featured placements/groups.

Example semantic groups:

```text
Ideas featured
Featured by room
Featured Guide
Featured Editorial Landing
```

Exact placements are product-defined.

---

## CNT-CUR-002 — Curated references require published eligibility

A Draft/Archived/Unpublished item must not render publicly solely because it is still referenced by a curation slot.

---

## CNT-CUR-003 — Ordering

Authorized editors can order items within an ordered curated group.

---

# 24. Permission model

## CNT-SEC-001 — Content access

Only authorized Admin principals can create/edit Content.

---

## CNT-SEC-002 — Publication permission

If GRIP Admin authorization distinguishes editing from publishing:

```text
editor
→ draft/edit/preview

publisher
→ publish/unpublish/schedule
```

The UI must reflect backend authorization.

If current RBAC does not distinguish these permissions, the implementation may use one authorized Content role.

---

## CNT-SEC-003 — Backend enforcement

UI visibility is not authorization.

All mutations require backend permission enforcement.

---

# 25. Media boundary

## CNT-MED-001 — Content media

Content can associate editorial media with blocks.

Binary asset storage may be provided by a shared media/file capability.

Content owns the semantic placement and accessibility metadata needed by the content item.

---

## CNT-MED-002 — Catalog media

A structured Product reference should use Catalog-owned product media/projection where canonical.

Editors should not upload a duplicate product image merely to make a normal Product Card.

Editorial room/lifestyle photography remains Content-associated media.

---

# 26. Canonical public flows

## Discover ideas

```text
Home / Ideas
→ room/topic
→ content list
→ content detail
→ Catalog/related content
```

## Read article

```text
Idea Article
→ read sections
→ inspect relevant products/categories
→ continue shopping
```

## Use guide

```text
Guide
→ understand steps/options
→ follow relevant Catalog/planner/service action
```

## Explore campaign landing

```text
Editorial Landing
→ story
→ curated products/topics
→ Catalog or related Content
```

---

# 27. Canonical Admin flows

## Create

```text
Content
→ New
→ choose semantic type
→ author structured content
→ save Draft
→ Preview
→ Publish now OR Schedule
```

## Edit live content

```text
Published item
→ Edit working draft
→ live content stays unchanged
→ Preview
→ Publish
→ updated revision becomes live
```

## Retire

```text
Published
→ Unpublish now
OR
→ Schedule unpublish
→ optional Archive
```

---

# 28. Acceptance scenarios

## AS-01 — Create draft

Given authorized editor  
When they create an Idea Article and save  
Then it exists as Draft  
And is not publicly accessible.

## AS-02 — Draft preview

Given valid Draft  
When authorized editor previews it  
Then they can see a storefront-like rendering  
And the Draft remains unavailable through normal public delivery.

## AS-03 — Publish

Given valid Draft and authorized publisher  
When Publish succeeds  
Then the content becomes publicly eligible.

## AS-04 — Edit published safely

Given Published content  
When editor changes and saves working content  
Then existing public content remains unchanged until explicit Publish.

## AS-05 — Publish update

Given Published content with working changes  
When authorized publisher publishes the changes  
Then the new content becomes the public revision.

## AS-06 — Scheduled publish

Given valid non-public content  
When publisher schedules a future publish date/time/timezone  
Then the content remains non-public before that time  
And becomes eligible only after successful scheduled publication.

## AS-07 — Scheduled unpublish

Given Published content  
When publisher schedules unpublish  
Then it remains public before successful scheduled execution  
And becomes non-public afterward.

## AS-08 — Cancel schedule

Given pending scheduled action  
When publisher cancels it  
Then no future lifecycle change occurs from that canceled action.

## AS-09 — Catalog product block

Given published Content with valid Product reference  
When public page renders  
Then current Catalog product projection is displayed.

## AS-10 — Product price changes

Given Content references a Product  
When Catalog price changes  
Then Content does not need editorial re-publication merely to reflect current structured Product Card price.

## AS-11 — Invalid product ref on public page

Given a referenced Product becomes non-public/unresolvable  
When Content renders  
Then stale copied product truth is not shown  
And page degrades according to the defined reference fallback rule.

## AS-12 — Related content

Given Article A explicitly references Article B as related  
And B is published  
Then A can show B as related content.

## AS-13 — Related content unpublished

Given Article B becomes non-public  
Then A must not publicly show B as an active related-content destination.

## AS-14 — Content taxonomy

Given published Content classified under a room/topic  
When user browses that classification  
Then the content can appear in that result.

## AS-15 — Featured does not equal published

Given Published content stops being featured  
Then it remains public unless separately unpublished/archived.

## AS-16 — Curation cannot bypass lifecycle

Given Draft content is accidentally referenced by a public featured group  
Then it is not rendered publicly.

## AS-17 — Article product action ownership

Given product card appears inside Article  
When user opens product  
Then canonical Catalog Product Detail is used.

## AS-18 — Save from product card

Given canonical Product Card in Content supports Save  
Then the action uses Engagement behavior rather than Content persistence.

## AS-19 — Guide downstream boundary

Given Guide links to a planner or Catalog flow  
When user enters that flow  
Then the owning module controls subsequent behavior.

## AS-20 — Archive

Given non-active Content  
When authorized editor archives it  
Then it becomes non-public and leaves default active inventory without being represented as permanently deleted.

## AS-21 — Accessibility validation

Given informative media lacks required accessibility description  
When editor attempts publication  
Then publication validation rejects or blocks according to accepted accessibility contract.

## AS-22 — Unauthorized publish

Given editor lacks publish permission  
When they attempt Publish/Schedule  
Then backend rejects the action.

---

# 29. Required cross-module contracts

## Content → Catalog

Read public/admin-selectable projections for supported references:

```text
Product
Product selection/variant if applicable
Category
other accepted Catalog destination
```

## Catalog/Storefront → Content

Consume:

```text
published content projection
featured content projection
content detail
taxonomy result
```

## Content → Engagement

Only through composed canonical Product components where Save/review data is required.

Content does not write Engagement persistence directly except through agreed interaction contracts.

## Home → Content

Home can request defined featured Content placement(s).

---

# 30. Invariants

```text
1. Draft save never silently publishes.
2. Editing Published content never silently changes the live page.
3. Preview never makes Draft normally public.
4. Featured != Published.
5. Curation never bypasses publication eligibility.
6. Content never owns Product price/stock/sellability.
7. Structured Product references resolve current Catalog truth.
8. Content does not duplicate Product Detail behavior.
9. Content does not own Reviews/Saved state.
10. Admin authoring does not require code/layout coordinates.
11. Scheduled actions always expose date/time/timezone.
12. Archive is not represented as permanent delete.
```

---

# 31. Final module definition

```text
Content

Public
├── Ideas / Inspiration Hub
├── Idea Article
├── Guide
├── Editorial Landing
└── Room / Topic discovery

Admin
├── Content inventory
├── Structured authoring
├── Catalog/Content references
├── Draft
├── Preview
├── Publish / Unpublish
├── Schedule
├── Curation
└── Archive
```

Core product value:

> turn product knowledge and inspiration into understandable shopping guidance without duplicating commerce truth.
