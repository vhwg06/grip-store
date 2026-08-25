# GRIP Engagement Module — Software Requirements Specification

**Status:** Final  
**Pipeline stage:** 02 — SRS  
**Module:** Engagement  
**Surfaces:** Public Storefront + Admin Console  
**Research input:** `01-grip-engagement-ikea-research.md`

# 1. Purpose

The Engagement module owns persistent customer intent and customer-generated product feedback.

Current capability groups:

```text
Engagement
├── Saved Lists
└── Product Reviews
```

It helps customers:

- remember products they may buy later;
- organize saved products;
- return to saved intent across sessions;
- share a read-only list;
- move interrupted purchase intent into “save for later”;
- read trustworthy customer feedback;
- review products they actually purchased.

Admin supports product-review moderation.

# 2. Explicit current-scope exclusions

```text
Product Questions & Answers
Review images/video
Merchant public replies
Public review reporting
Review incentives
Following users
Social feed
Comments/chat
Recently viewed history
Recommendation engine
Recommendation presentation
Collaborative list editing
Gift registry
Loyalty / rewards
```

Recommendation remains Catalog-owned.

# 3. Ownership model

## 3.1 Engagement owns

```text
SavedList
SavedListItem
SavedListShare
ProductReview
ReviewModerationState
```

Engagement is authoritative for:

- customer saved-list membership;
- list identity/name;
- list privacy/share state;
- saved product/selection references;
- submitted rating/review;
- moderation/publication state;
- rating aggregate derived from published reviews.

## 3.2 Account owns

Account owns customer identity/profile.

Account can surface Saved Lists but does not persist them.

## 3.3 Catalog owns

Catalog owns:

- product/model/variant identity;
- current title/images;
- current price;
- current availability;
- publication state;
- related/recommended product composition.

Engagement references Catalog objects.

## 3.4 Cart / Checkout owns

Cart/Checkout owns current cart lines and checkout state.

`Save for later` is a cross-module integration.

## 3.5 Order owns

Order is authoritative for purchase eligibility used to verify review submission.

Engagement consumes a published Order eligibility contract.

# 4. Saved List model

Conceptual minimum:

```text
SavedList
- id
- owner_account_id
- name
- share_state
- created_at
- updated_at

SavedListItem
- list_id
- catalog_selection_ref
- desired_quantity?   // only if supported
- created_at
```

Price/availability are not authoritative Engagement data.

# 5. Saved List requirements

## ENG-SAV-001 — Authentication

Persistent Saved Lists require authenticated customer identity.

If signed-out customer invokes Save:

```text
Save
→ contextual sign-in
→ return to origin
→ complete save
```

Successful contextual sign-in must not route to Account Overview.

## ENG-SAV-002 — Default list

Every authenticated customer can save to a zero-setup default list.

User-facing name can be:

```text
Đã lưu
```

The first save must not require naming/configuring a list.

## ENG-SAV-003 — Create named list

Customer can create additional named lists.

Validation follows domain contract.

## ENG-SAV-004 — Rename list

Owner can rename a list.

Renaming does not change:

- list identity;
- contained items;
- Catalog data.

## ENG-SAV-005 — Delete list

Owner can delete a deletable named list.

Deletion affects only Engagement membership.

It does not delete Catalog objects, Cart lines or Orders.

If default list is mandatory, it cannot be deleted.

## ENG-SAV-006 — Add product

Owner can add a valid Catalog selection to a list.

Reference must identify the intended sellable selection at the level required by Catalog.

Same selection added twice to the same list is idempotent unless explicit quantity semantics say otherwise.

## ENG-SAV-007 — Remove product

Owner can remove an item from their list.

## ENG-SAV-008 — Current Catalog projection

Saved list rendering uses current Catalog state.

Saving does not guarantee:

- old price;
- old availability;
- old promotion;
- continued publication.

If a saved selection is no longer purchasable, UI should represent that state honestly rather than pretending old commerce state still applies.

## ENG-SAV-009 — Add saved item to Cart

When currently purchasable, a saved item can invoke canonical Cart add behavior.

Cart performs current validation.

Successful add-to-cart does not automatically remove saved membership unless a separate explicit move behavior exists.

# 6. Sharing

## ENG-SHR-001 — Private by default

All lists are private until owner explicitly enables sharing.

## ENG-SHR-002 — Create share access

Owner can enable sharing.

System generates an opaque, non-guessable share reference/link.

Sharing must not expose private Account data beyond intentionally shared list content.

## ENG-SHR-003 — Recipient read-only

Recipient can view the shared list but cannot:

- rename source list;
- add/remove source items;
- change source quantity;
- change share settings.

## ENG-SHR-004 — Recipient shopping

Recipient can use current Catalog/Cart behavior on shared items.

Recipient purchase activity does not mutate source list.

## ENG-SHR-005 — Recipient saves independently

Authenticated recipient can save/copy a shared product into their own list.

This creates independent Engagement membership.

## ENG-SHR-006 — Revoke share

Owner can disable sharing.

Old share reference must stop exposing list content.

# 7. Save for later

## ENG-CART-001 — Save current purchase intent

Where Cart/Checkout exposes `Save for later`, it requests Engagement to save the current Catalog selection.

## ENG-CART-002 — Failure safety

Cart/Checkout must not remove its current line before Engagement confirms save success.

Required sequence:

```text
save request
→ Engagement success
→ owning Cart/Checkout changes its line
```

If save fails:

```text
cart/checkout line remains
```

## ENG-CART-003 — No frozen commerce terms

Saved-for-later does not preserve a promise of:

- price;
- stock;
- promotion;
- fulfillment option.

Current commerce rules apply when the user returns.

# 8. Product Review model

Conceptual minimum:

```text
ProductReview
- id
- author_account_id
- product_ref
- purchase_evidence_ref
- rating
- title?
- body
- submitted_at
- moderation_state
- published_at?
```

Current scope has no review media.

# 9. Review eligibility

## ENG-REV-001 — Authenticated author

Review submission requires authenticated customer identity.

## ENG-REV-002 — Verified purchase eligibility

Order must establish that the customer has an eligible purchase relationship with the reviewed product.

Exact eligible Order state remains Order-owned.

Engagement must not infer eligibility by reading Order persistence directly.

## ENG-REV-003 — One active review per customer/product

Current GRIP policy allows one active review per customer per canonical reviewed product.

A second submission must not create duplicate rating weight.

Editing/replacing submitted review is outside current scope.

# 10. Review submission

## ENG-REV-004 — Rating

Required integer:

```text
1..5
```

## ENG-REV-005 — Review body

Product-related written feedback is required.

Exact min/max thresholds belong to accepted domain contract.

## ENG-REV-006 — Optional title

Review title is optional if backend supports it.

If backend does not support it, UI omits it.

## ENG-REV-007 — Product-only feedback

Review flow is not the canonical channel for:

- delivery complaints;
- payment disputes;
- account support;
- safety incident escalation.

UI can route those intents to owning flows.

## ENG-REV-008 — Pending moderation

Successful review submission enters:

```text
pending
```

Pending review does not contribute to public rating aggregate.

# 11. Review moderation lifecycle

```text
pending
├── approve → published
└── reject  → rejected

published
└── hide    → hidden
```

Admin cannot edit customer-authored rating/body.

## ENG-MOD-001 — Pending queue

Authorized moderator can view pending reviews.

## ENG-MOD-002 — Review context

Moderator can inspect only decision-relevant context:

- rating;
- title/body;
- product identity;
- appropriate customer identity reference;
- verified-purchase status/evidence;
- submitted time;
- moderation state.

Do not expose unrelated sensitive Account or Order data.

## ENG-MOD-003 — Approve

Compliant pending review can transition:

```text
pending
→ published
```

It then becomes publicly visible and contributes to aggregate rating.

## ENG-MOD-004 — Reject

Non-compliant pending review can transition:

```text
pending
→ rejected
```

Rejection requires supported moderation reason.

Rejected review is non-public and excluded from aggregates.

## ENG-MOD-005 — Hide

Authorized moderator can hide a published review for a valid policy reason.

Hidden review is non-public and excluded from public aggregate.

## ENG-MOD-006 — Sentiment neutrality

These are not valid rejection reasons by themselves:

```text
low rating
negative opinion
product criticism
```

Compliant negative reviews remain publishable.

## ENG-MOD-007 — No Admin rewriting

Admin can approve, reject or hide.

Admin cannot silently rewrite review text or rating.

## ENG-MOD-008 — Moderation audit

Moderation mutation records:

- moderator;
- action;
- time;
- reason where applicable.

# 12. Public review read model

## ENG-PUB-REV-001 — Rating summary

For products with published reviews, Engagement exposes:

- average rating;
- published review count.

Only published reviews contribute.

## ENG-PUB-REV-002 — No-review state

No published reviews must not be represented as `0/5`.

## ENG-PUB-REV-003 — Review list

Public users can read published product reviews.

Minimum projection:

- rating;
- title if supported;
- body;
- author display identity per privacy policy;
- date where allowed;
- verified-purchase marker.

## ENG-PUB-REV-004 — Verified purchase marker

Because current GRIP submission requires Order eligibility, published reviews can expose:

```text
Đã mua hàng
```

This is a trust marker, not endorsement.

## ENG-PUB-REV-005 — Scalable retrieval

Review list supports pagination/incremental loading.

Exact UI mechanics are implementation/design decisions.

# 13. Catalog integration

## ENG-CAT-001 — Rating summary

Catalog can consume Engagement aggregate for product card/detail surfaces.

Catalog does not independently calculate review aggregates.

## ENG-CAT-002 — Full reviews

Catalog Product Detail can compose Engagement review read model.

Product page stays Catalog-owned.

Review data/component semantics stay Engagement-owned.

## ENG-CAT-003 — Save action

Catalog can invoke Engagement save from product card/detail.

Catalog must not persist saved-state separately.

# 14. Recommendation boundary

## ENG-REC-001

Engagement does not own:

- Recommended for you;
- related products;
- Get the look;
- recently-viewed recommendation composition.

These remain Catalog/discovery behaviors.

## ENG-REC-002

Future recommendation can consume published Engagement signals if explicitly contracted.

No such personalization contract is required now.

# 15. Account integration

## ENG-ACC-001

Account Overview can surface Saved Lists through Engagement projection/navigation.

## ENG-ACC-002

Account must not duplicate list persistence.

## ENG-ACC-003

Account deletion/retention interaction must be explicit in account-deletion contracts.

# 16. Admin scope

Current Engagement Admin:

```text
Engagement Admin
└── Reviews
    ├── moderation queue
    └── review detail/context
```

No routine Admin browsing of private customer Saved Lists.

# 17. Admin requirements

## ENG-ADM-001 — Permission boundary

Only authorized moderators can access review moderation.

## ENG-ADM-002 — Search/filter

Moderation can filter/search by operational dimensions supported by backend, such as:

- state;
- rating;
- product;
- submitted date.

Common tasks must not require internal IDs.

## ENG-ADM-003 — Queue-first workflow

Default Admin experience prioritizes pending reviews requiring action.

## ENG-ADM-004 — Product navigation

Moderator can navigate to canonical Catalog product context.

## ENG-ADM-005 — Order/Account evidence

Where permission allows, moderator can navigate to relevant Account/Order context through published surfaces without duplicating those domains.

# 18. Privacy

## ENG-PRV-001

Only owner can mutate private list.

## ENG-PRV-002

Shared access grants only supported read behavior.

## ENG-PRV-003

Share references must not make private lists enumerable.

## ENG-PRV-004

Ordinary Admin moderation does not include Saved List browsing.

## ENG-PRV-005

Public reviews must not expose private customer contact information.

# 19. Integrity invariants

```text
1. Only published reviews affect public aggregates.
2. Pending/rejected/hidden reviews do not affect public aggregates.
3. Negative sentiment alone cannot justify moderation rejection.
4. Purchase verification comes from Order.
5. Admin cannot forge or rewrite customer reviews.
6. Catalog cannot manipulate Engagement aggregate independently.
7. One active customer/product review prevents duplicate weighting.
8. Lists are private by default.
9. Shared-list recipients cannot mutate source.
10. Saved products use current Catalog commerce state.
```

# 20. Canonical Public flows

## Save product

```text
Product
→ Save
→ signed in?
   ├── yes → save
   └── no  → sign in
             → return
             → save
```

## Organize

```text
Saved Lists
→ create / rename
→ add / remove
```

## Share

```text
private list
→ enable share
→ recipient reads
→ recipient buys/saves independently
```

## Save for later

```text
Cart / Checkout
→ save request
→ Engagement success
→ owning module removes/changes line
```

## Read reviews

```text
Product Detail
→ rating summary
→ reviews
→ show more/all
```

## Write review

```text
eligible purchased product
→ compose
→ submit
→ pending
→ published OR rejected
```

# 21. Canonical Admin flow

```text
Reviews
→ Pending
→ open review
→ inspect context
→ approve OR reject

Published
→ open review
→ hide only for valid policy reason
```

# 22. Acceptance scenarios

## AS-01 — First save

Given authenticated customer  
When they save a valid product without choosing a list  
Then it is added to default Saved list.

## AS-02 — Contextual sign-in

Given signed-out customer on a product  
When they request Save and authenticate  
Then they return to the original product context and can complete save.

## AS-03 — Duplicate save

Given product already exists in the same list  
When customer saves it again  
Then duplicate membership is not created.

## AS-04 — Named list

Given authenticated customer  
When they create a named list  
Then it can contain products independently from default list.

## AS-05 — Current commerce state

Given saved product price/availability changes  
When list is viewed  
Then current Catalog state is shown.

## AS-06 — Private default

Given a new list  
Then it is not public until owner explicitly enables sharing.

## AS-07 — Shared isolation

Given recipient opens shared list  
When recipient buys or saves an item  
Then source list remains unchanged.

## AS-08 — Revoke share

Given list was shared  
When owner revokes sharing  
Then old share reference no longer exposes list.

## AS-09 — Save for later success

Given current Cart/Checkout line  
When Engagement save succeeds  
Then owning module can remove/change its line.

## AS-10 — Save for later failure

Given current Cart/Checkout line  
When Engagement save fails  
Then line remains.

## AS-11 — Review eligibility

Given customer without eligible Order evidence  
When review is submitted  
Then submission is rejected.

## AS-12 — Valid review

Given authenticated eligible purchaser  
When valid review is submitted  
Then it enters pending and does not yet affect public aggregate.

## AS-13 — Approve

Given compliant pending review  
When authorized moderator approves  
Then it becomes public and contributes to aggregate.

## AS-14 — Reject

Given non-compliant pending review  
When authorized moderator rejects with valid reason  
Then it remains non-public and excluded from aggregate.

## AS-15 — Negative integrity

Given compliant one-star review  
Then low rating alone cannot justify rejection.

## AS-16 — Hide published review

Given valid policy violation on published review  
When authorized moderator hides it  
Then it is removed from public display and aggregate.

## AS-17 — Product summary

Given published reviews  
When public Product surface loads  
Then Catalog can display Engagement average/count.

## AS-18 — No reviews

Given no published reviews  
Then Product surface does not display a zero-star score as a rating.

## AS-19 — Order ownership

Review eligibility uses published Order contract, not direct Order persistence access.

## AS-20 — Recommendation boundary

Catalog recommendation UI remains Catalog-owned.

## AS-21 — Saved List Admin privacy

Ordinary Engagement moderator has no general private-list browsing capability.

# 23. Cross-module contracts

## Engagement ↔ Catalog

- resolve current saved product projection;
- invoke save;
- expose rating summary/review list.

## Engagement ↔ Account

Account surfaces Saved Lists/navigation.

## Engagement ↔ Order

Read-only review eligibility verification.

## Cart/Checkout → Engagement

Save-for-later request.

# 24. Final module definition

```text
Engagement

Public
├── Save product
├── Saved Lists
│   ├── default list
│   ├── named lists
│   ├── private by default
│   ├── read-only share
│   └── save for later
└── Product Reviews
    ├── rating summary
    ├── review list
    └── verified-purchase submission

Admin
└── Review Moderation
    ├── pending
    ├── published
    ├── rejected
    └── hidden
```

Core product value:

> preserve customer intent before purchase and turn real post-purchase experience into trustworthy evidence for the next buyer.
