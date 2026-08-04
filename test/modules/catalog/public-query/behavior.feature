@catalog @public-query
Feature: Public catalog query
  As a shopper
  I want the public catalog read models to be complete and server-filtered
  So that public discovery never exposes inactive or inconsistent data

  @UC-CAT-PUBLIC-LIST
  Rule: The public product list is an active, paginated server projection

    @accepted @api @SC-CAT-PUBLIC-LIST-005
    Scenario: List only Active ProductModels with publicly sellable Variants
      Given the catalog contains Draft, Active, Inactive, and Discontinued ProductModels
      When the shopper reads the public ProductModel list
      Then only Active ProductModels are returned
      And every returned ProductModel has at least one publicly sellable Variant
      And stock and warehouse state are absent from the Catalog Base projection

    @accepted @api @SC-CAT-PUBLIC-LIST-001
    Scenario: Read a paginated active product list
      Given active and inactive catalog products are available to query
      When the shopper reads the public product list
      Then the public product list response status is `200`
      And the public product list contains `items`, `page`, `limit`, and `total`
      And inactive catalog products are absent from the public product list

    @accepted @api @SC-CAT-PUBLIC-LIST-002
    Scenario: Respect public product pagination
      Given the public catalog can return products
      When the shopper reads page `1` with limit `5`
      Then the public product list response status is `200`
      And the public product list contains no more than `5` items

    @accepted @api @SC-CAT-PUBLIC-LIST-003
    Scenario: Filter the public product list by category
      Given an active public category exists
      When the shopper reads the public product list for that category
      Then the public product list response status is `200`
      And every returned public product belongs to that category

    @accepted @api @SC-CAT-PUBLIC-LIST-004
    Scenario: Sort the public product list by ascending price
      Given the public catalog contains products with different prices
      When the shopper reads the public product list sorted by ascending price
      Then the public product list response status is `200`
      And returned public product prices are in ascending order

  @UC-CAT-PUBLIC-SEARCH
  Rule: Public search returns only matching products and a valid empty projection

    @accepted @api @SC-CAT-PUBLIC-SEARCH-001
    Scenario: Search the public catalog by a product keyword
      Given a public product has a searchable title keyword
      When the shopper searches the public catalog by that keyword
      Then the public search response status is `200`
      And every matching result contains the searched keyword

    @accepted @api @empty-result @SC-CAT-PUBLIC-SEARCH-002
    Scenario: Return an empty result for a missing public search keyword
      Given no public product has the reserved missing keyword
      When the shopper searches the public catalog by the reserved missing keyword
      Then the public search response status is `200`
      And the public search result is an empty array

  @UC-CAT-PUBLIC-FILTER
  Rule: Catalog Base exposes only the committed discovery filters

    @accepted @api @SC-CAT-PUBLIC-FILTER-001
    Scenario: Filter public ProductModels by Material Finish and SellingPrice
      Given publicly sellable ProductModels have distinct Material, Finish, and SellingPrice values
      When the shopper filters the public catalog by Material, Finish, and SellingPrice
      Then every returned ProductModel satisfies every requested filter
      And no generic attribute filtering contract is exposed

    @accepted @api @SC-CAT-PUBLIC-FILTER-002
    Scenario: Filter the public catalog by Material and Finish references
      Given publicly sellable ProductModels have distinct Material and Finish references
      When the shopper filters by a Material and a Finish reference
      Then every returned ProductModel matches both reference filters

    @accepted @api @SC-CAT-PUBLIC-FILTER-003
    Scenario: Filter the public catalog by SellingPrice range
      Given publicly sellable Variants have different current SellingPrice values
      When the shopper filters by a SellingPrice range
      Then every returned ProductModel has a publicly sellable Variant in that range

  @UC-CAT-PUBLIC-DETAIL
  Rule: Public product detail exposes the complete purchasable read model

    @accepted @api @SC-CAT-PUBLIC-DETAIL-005
    Scenario: Public detail exposes catalog-owned Variant and option data only
      Given an Active ProductModel has publicly sellable Variants and catalog media
      When the shopper reads the public ProductModel detail
      Then the detail exposes model content, media, options, and current SellingPrice
      And the detail does not expose stock, warehouse, order, or warranty-claim state

    @accepted @api @SC-CAT-PUBLIC-DETAIL-001
    Scenario: Read public product detail
      Given an active public product exists
      When the shopper reads its public product detail
      Then the public product detail response status is `200`
      And public product detail contains the product identity and core fields
      And public product detail contains images

    @accepted @api @SC-CAT-PUBLIC-DETAIL-002
    Scenario: Read public product detail specifications
      Given an active public product has public specification data
      When the shopper reads its public product detail
      Then public product detail contains specifications
      And public specifications contain at least one key and value

    @accepted @api @not-found @SC-CAT-PUBLIC-DETAIL-003
    Scenario: Read a missing public product
      Given a public product identifier does not exist
      When the shopper reads that public product detail
      Then the public product detail response status is `404`

    @accepted @api @SC-CAT-PUBLIC-DETAIL-004
    Scenario: Do not expose an inactive product as public detail
      Given an inactive or unavailable public product identifier is used
      When the shopper reads that public product detail
      Then the public product detail response status is `404`

  @UC-CAT-PUBLIC-OPTIONS
  Rule: Available options are derived from compatible publicly sellable Variants

    @accepted @api @SC-CAT-PUBLIC-OPTIONS-001
    Scenario: Exclude incompatible and non-public Variant options
      Given an Active ProductModel has publicly sellable, inactive, and incompatible Variants
      When the shopper asks for available options after selecting one dimension value
      Then each returned option completes at least one publicly sellable Variant
      And options belonging only to inactive or incompatible Variants are absent

    @accepted @api @SC-CAT-PUBLIC-OPTIONS-002
    Scenario: Return an empty option projection when no public Variant is compatible
      Given an Active ProductModel has no publicly sellable Variant compatible with the selected values
      When the shopper asks for available options
      Then the available option projection is empty

  @UC-CAT-PUBLIC-RESOLVE
  Rule: Public Variant resolution uses an exact canonical combination

    @accepted @api @SC-CAT-PUBLIC-RESOLVE-001
    Scenario: Resolve only the exact publicly sellable selected combination
      Given an Active ProductModel has a publicly sellable canonical Variant combination
      When the shopper resolves that exact selected combination
      Then the public catalog returns that Variant
      When the shopper resolves a missing or non-public combination
      Then the public catalog does not return a Variant

    @accepted @api @SC-CAT-PUBLIC-RESOLVE-002
    Scenario: Resolve equivalent canonical representations to one public Variant
      Given a publicly sellable Variant has a numeric Size canonicalized to `200 mm`
      When the shopper resolves the equivalent Size representation `20 cm`
      Then the public catalog returns the same Variant

  @UC-CAT-PUBLIC-BUY-META
  Rule: Public buy metadata reports availability without changing catalog state

    @accepted @api @SC-CAT-PUBLIC-BUY-META-001
    Scenario: Read public buy metadata
      Given an active public product exists
      When the shopper reads its public buy metadata
      Then the public buy metadata response status is `200`
      And public buy metadata contains product identity, availability, and stock

  @UC-CAT-PUBLIC-CONTEXT
  Rule: Public catalog context exposes stable category and site projections

    @accepted @api @SC-CAT-PUBLIC-CONTEXT-001
    Scenario: Read public categories
      When the shopper reads public catalog categories
      Then the public categories response status is `200`
      And every public category has an id, name, and slug

    @accepted @api @SC-CAT-PUBLIC-CONTEXT-002
    Scenario: Read public site settings
      When the shopper reads public catalog settings
      Then the public settings response status is `200`
      And public settings contain site name and currency

    @accepted @api @SC-CAT-PUBLIC-CONTEXT-003
    Scenario: Read the public announcement projection
      When the shopper reads the public catalog announcement
      Then the public announcement response status is `200`
      And the public announcement is null or contains identity, content, and active state
