# GRIP Engagement — IKEA Research

**Status:** Final  
**Pipeline stage:** 01 — External research  
**Module:** Engagement  
**Surfaces:** Public Storefront + admin-adjacent evidence  
**Research date:** 2026-08-16

# 1. Purpose

This file records verified IKEA behavior relevant to a GRIP Engagement module.

It is research evidence, not GRIP semantic authority and not a screen blueprint.

```text
verified IKEA evidence
→ observed behavior
→ product/UX implication
→ candidate GRIP capability
```

Do not convert inference into an IKEA fact.

# 2. Research conclusion

The strongest IKEA engagement behaviors are:

```text
Engagement
├── Favourites / Lists
│   ├── save product
│   ├── multiple named lists
│   ├── cross-device persistence
│   ├── private by default
│   ├── share list
│   ├── recipient can buy/save independently
│   └── save-for-later from shopping flow
│
└── Ratings & Reviews
    ├── aggregate rating on product
    ├── review count
    ├── public customer reviews
    ├── review submission
    ├── purchase/identity trust signals
    └── moderation
```

IKEA US also documents Product Questions & Answers, and its product/app surfaces expose recommendation concepts such as `Recommended for you`, `Get the look`, and ideas based on recently viewed products.

Research-derived boundary:

```text
Saved intent + product feedback
→ Engagement

Product recommendation / discovery composition
→ Catalog

Q&A
→ research reference, not current GRIP scope
```

# 3. IKEA Favourites / Lists

## E1 — Product save action is attached directly to the product

**Observed — IKEA US**

IKEA tells customers to add a product to Favourites using the heart icon on the product. The heart placement can vary depending on where the customer is browsing.

**Implication**

Saving is a lightweight action available at the point where purchase intent forms.

**GRIP candidate**

Expose save/favourite on canonical product surfaces:

```text
product card
product detail
```

Account can surface saved products, but does not own saving.

**Source**

IKEA US — How can I create and share a favourites list?  
https://www.ikea.com/us/en/customer-service/knowledge/articles/eb4a447f-bcbb-4e60-81e9-98de1919015e.html

## E2 — Favourites are organized into multiple named lists

**Observed — IKEA US**

IKEA says customers can create as many lists as they want, name/rename them, and see all lists in one place. The Lists page explicitly describes categorizing favourites into different lists.

**Implication**

Saved intent can represent a room, project, occasion, or comparison set instead of one flat wishlist.

**GRIP candidate**

Support a zero-setup default list plus optional named lists.

**Sources**

https://www.ikea.com/us/en/customer-service/knowledge/articles/eb4a447f-bcbb-4e60-81e9-98de1919015e.html  
https://www.ikea.com/us/en/favorites/

## E3 — Saved lists persist across devices through identity

**Observed — IKEA US**

IKEA says sign-in lets customers view Favourites across devices. The IKEA app page says Lists work across the IKEA account: save online and find the same favourites in the app.

**Implication**

Saved intent is more valuable as persistent account-backed data than as browser-local state.

**GRIP candidate**

```text
save on device/session A
→ persistent Engagement data
→ view on device/session B
```

Account provides identity; Engagement owns the list data.

**Sources**

https://www.ikea.com/us/en/customer-service/knowledge/articles/eb4a447f-bcbb-4e60-81e9-98de1919015e.html  
https://www.ikea.com/us/en/ikea-app/

## E4 — Lists are private by default

**Observed — IKEA US**

IKEA explicitly says shopping lists are private by default and can be shared by the owner.

**Implication**

Saved purchase intent should be treated as private personal data until an explicit sharing action occurs.

**GRIP candidate**

```text
new saved list
→ private
```

Admin should not receive a routine “browse customer wishlists” surface just because the data exists.

**Source**

https://www.ikea.com/us/en/customer-service/knowledge/articles/eb4a447f-bcbb-4e60-81e9-98de1919015e.html

## E5 — List sharing is read-oriented, not collaborative mutation

**Observed — IKEA US**

IKEA lets the owner share a list by link/email. A recipient can view items, buy items, or save items to their own list. Buying or saving does not mark or remove products from the source list.

**Implication**

Sharing does not transfer ownership or create shared mutable state.

**GRIP candidate**

```text
owner list
→ share link
→ recipient reads
→ recipient may buy or copy/save
→ source remains unchanged
```

**Source**

https://www.ikea.com/us/en/customer-service/knowledge/articles/eb4a447f-bcbb-4e60-81e9-98de1919015e.html

## E6 — Save for later appears inside the purchase journey

**Observed — IKEA US**

IKEA documents `Save for later` when an item cannot be purchased in online checkout because it is out of stock; the product is saved into a list.

**Implication**

Saved intent is also a graceful exit from an interrupted purchase.

**GRIP candidate**

```text
Cart / Checkout
→ Save for later
→ Engagement list
```

Cart/Checkout remains responsible for its own line state.

**Source**

https://www.ikea.com/us/en/customer-service/knowledge/articles/eb4a447f-bcbb-4e60-81e9-98de1919015e.html

# 4. IKEA Ratings & Reviews

## E7 — Reviews are part of the product decision surface

**Observed — IKEA US**

A current IKEA US product page shows average rating and total review count near primary product information, then later exposes a `Customer reviews` section, sample review content, and `Show all reviews`.

**Implication**

Reviews have two jobs:

```text
quick trust signal
→ near primary decision information

deep evidence
→ later review section
```

**GRIP candidate**

Expose average rating + count near product identity/decision information and full review content lower in Product Detail.

**Source**

https://www.ikea.com/us/en/p/ikea-ps-2026-table-green-80617895/

## E8 — Customers can submit ratings and reviews from product context

**Observed — IKEA US**

IKEA tells customers to visit a product page to leave ratings and reviews. IKEA US Terms define a Customer Ratings and Review service.

**GRIP candidate**

Eligible review entry points:

```text
Product Detail
Order / Purchase History
```

Keep product identity visible while composing a review.

**Sources**

https://www.ikea.com/us/en/customer-service/knowledge/articles/76c87ef4-c664-4fef-gf30-ff8681cb64gf.html  
https://www.ikea.com/us/en/customer-service/terms-conditions/

## E9 — Reviews are UGC, not Catalog content

**Observed — IKEA US**

IKEA Terms define ratings, reviews, questions, answers, photos and similar submissions as User Generated Content and establish content rules around accuracy, legality, abuse, spam and personal information.

**Implication**

Review content needs its own publication lifecycle and policy.

**GRIP ownership**

```text
Catalog
→ product identity and product facts

Engagement
→ customer ratings and review UGC
```

**Source**

https://www.ikea.com/us/en/customer-service/terms-conditions/

# 5. Purchase trust and verification

## E10 — IKEA US can associate reviews with verified purchase/account context

**Observed — IKEA US**

Current US Terms say customers may be asked to or may choose to review following a verified purchase, or while logged into the IKEA Family account.

This proves IKEA can have authenticated and/or purchase-verification context. It does not prove every currently displayed US review is verified.

**Source**

https://www.ikea.com/us/en/customer-service/terms-conditions/

## E11 — Verified-review labeling exists in another IKEA market

**Observed — IKEA Spain**

IKEA Spain documents verified and unverified review distinctions and labels purchase-verifiable reviews as verified / verified buyer or equivalent.

**Implication**

Purchase verification is a useful trust signal, although exact IKEA eligibility varies by market.

**GRIP candidate**

Simplify by allowing product review submission only when Order can establish purchase eligibility. Then every published review can carry a truthful `Đã mua hàng` marker.

**Source**

https://www.ikea.com/es/en/customer-service/ratings-and-reviews-pubcac9c161/

# 6. Review moderation

## E12 — IKEA review publication is moderated

**Observed — IKEA UK**

IKEA UK states that reviews are moderated before publication, compliant positive and negative reviews are displayed, and negative criticism is not itself a reason for removal. Non-compliant reviews can be rejected or removed.

**Implication**

Moderation enforces policy, not sentiment.

**GRIP candidate invariant**

> Low rating or negative criticism is not a valid rejection reason by itself.

**Source**

https://www.ikea.com/gb/en/customer-service/terms-conditions/product-review-terms-and-conditions-pub34f839d1/

## E13 — Review reporting exists in IKEA UK

**Observed — IKEA UK**

IKEA UK documents a public `Report` action for suspected fake or non-compliant reviews.

**GRIP decision**

Useful future capability, but not required in the first Engagement SRS.

**Source**

https://www.ikea.com/gb/en/customer-service/terms-conditions/product-review-terms-and-conditions-pub34f839d1/

# 7. Review UI reference — use cautiously

## E14 — Historical official review-form screenshots exist

**Observed — IKEA UK**

An older official IKEA UK ratings/reviews help page shows review-form screenshots with product context, star input, title/body and submit action.

This is not exact-current UI evidence.

**GRIP lesson**

Preserve reviewed-product identity while the user writes feedback; do not copy the old visual styling.

**Source**

https://www.ikea.com/gb/en/customer-service/product-ratings-and-reviews-pub5b39f1b1/

# 8. Product Questions & Answers

## E15 — IKEA US supports Q&A

**Observed — IKEA US**

Current US Terms allow product questions and answers. Some current product pages expose a Questions and answers count.

**GRIP decision**

Research-only for now.

Do not include Q&A in current SRS/Figma without separate approval because it adds another authorship, answer-quality and moderation model.

**Sources**

https://www.ikea.com/us/en/customer-service/terms-conditions/  
https://www.ikea.com/us/en/p/pax-wardrobe-combination-white-s39560726/

# 9. Recommendations are not Engagement-owned

## E16 — Recommendation surfaces are product-discovery composition

**Observed — IKEA US**

Current Product Detail can show:

- Related products
- Recommended for you
- Get the look
- Ideas based on recently viewed products
- More from the collection

The IKEA app also advertises personalized recommendations.

**GRIP boundary**

```text
Catalog
├── related products
├── recommendation presentation
├── merchandising composition
└── product discovery

Engagement
├── saved intent
└── product feedback
```

A future recommendation engine may consume Engagement signals, but that does not transfer UI/presentation ownership.

**Sources**

https://www.ikea.com/us/en/p/ikea-ps-2026-table-green-80617895/  
https://www.ikea.com/us/en/ikea-app/

# 10. Account boundary

IKEA exposes Lists through account/app context, but GRIP ownership should remain:

```text
Account
→ identity
→ entry point / summary

Engagement
→ saved lists
→ saved items
→ authored reviews
```

# 11. Cart / Checkout boundary

Recommended integration:

```text
Cart / Checkout
owns current purchase lines

Engagement
owns saved intent

Save for later:
1. save through Engagement
2. only after success, owning Cart/Checkout changes its own line
```

# 12. Catalog boundary

Catalog owns current:

- product identity
- selection/variant
- price
- availability
- publication state
- recommendation composition

A saved list does not freeze old commerce state.

Rendering:

```text
saved reference
+ current Catalog projection
→ current list UI
```

# 13. Admin evidence boundary

No verified public evidence was found for IKEA's internal review-moderation console.

Do not fabricate IKEA Admin UI.

IKEA review policy can inform moderation semantics. A separate comparator can inform workflow.

# 14. Admin comparator — Yotpo Reviews

## C1 — Review moderation is queue/state-oriented

**Comparator**

Yotpo official docs describe review management/moderation with states including pending, published, rejected and hidden/unpublished, plus manual approve/reject/hide actions.

**GRIP candidate**

```text
Reviews
→ moderation queue
→ review context
→ approve / reject / hide
```

**Sources**

https://support.yotpo.com/docs/reviews-product  
https://support.yotpo.com/docs/moderating-reviews  
https://support.yotpo.com/docs/reviews-moderation-1

## C2 — Merchant responses exist in mature review systems

Yotpo supports public/private merchant comments.

**GRIP decision**

Future only. First version should prioritize:

```text
collect
→ moderate
→ publish
```

**Source**

https://support.yotpo.com/docs/adding-comments-to-reviews

# 15. What GRIP should take now

```text
Engagement
├── Saved Lists
│   ├── default list
│   ├── named lists
│   ├── add/remove product
│   ├── cross-session persistence
│   ├── private by default
│   ├── read-only sharing
│   └── save-for-later integration
│
└── Product Reviews
    ├── public rating summary
    ├── public review list
    ├── purchase-verified submission
    ├── moderation lifecycle
    └── Admin moderation queue
```

# 16. Out of current iteration

```text
Product Q&A
Review images/video
Review incentives
Merchant replies
Public review reporting
Social comments
Following users
Recently viewed tracking
Recommendation engine
Recommendation UI ownership
Collaborative list editing
Gift registry
Loyalty/rewards
```

# 17. Research-derived invariants

```text
1. Private lists are private by default.
2. Sharing does not transfer list ownership.
3. Recipient actions do not mutate the owner's shared list.
4. Saved items use current Catalog price/availability.
5. Account surfaces Engagement but does not own it.
6. Catalog owns recommendations.
7. Reviews are UGC, not Catalog product content.
8. Review moderation is policy-based, not sentiment-based.
9. Negative compliant reviews remain publishable.
10. Admin does not casually browse private customer lists.
```

# 18. Source ledger

## IKEA US

1. https://www.ikea.com/us/en/customer-service/knowledge/articles/eb4a447f-bcbb-4e60-81e9-98de1919015e.html
2. https://www.ikea.com/us/en/favorites/
3. https://www.ikea.com/us/en/ikea-app/
4. https://www.ikea.com/us/en/customer-service/knowledge/articles/76c87ef4-c664-4fef-gf30-ff8681cb64gf.html
5. https://www.ikea.com/us/en/customer-service/terms-conditions/
6. https://www.ikea.com/us/en/p/ikea-ps-2026-table-green-80617895/
7. https://www.ikea.com/us/en/p/pax-wardrobe-combination-white-s39560726/

## Other IKEA markets

8. https://www.ikea.com/es/en/customer-service/ratings-and-reviews-pubcac9c161/
9. https://www.ikea.com/gb/en/customer-service/terms-conditions/product-review-terms-and-conditions-pub34f839d1/
10. https://www.ikea.com/gb/en/customer-service/product-ratings-and-reviews-pub5b39f1b1/

## Admin comparator

11. https://support.yotpo.com/docs/reviews-product
12. https://support.yotpo.com/docs/moderating-reviews
13. https://support.yotpo.com/docs/reviews-moderation-1
14. https://support.yotpo.com/docs/adding-comments-to-reviews

# 19. Final research position

IKEA's reusable engagement loop is:

```text
interest before purchase
→ save it

uncertainty before purchase
→ read customer experience

experience after purchase
→ contribute feedback
```

GRIP can express that as:

```text
Save
→ Buy
→ Review
→ Help the next buyer
```

while recommendation stays in Catalog/discovery.
