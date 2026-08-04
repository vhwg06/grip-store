@browse
Feature: Public catalog browsing
  As a guest
  I want to discover products and inspect details
  So that I can choose what to buy

  @UC-BROWSE-HOME
  Rule: Discover catalog entry points from the homepage

  @accepted @browser @SC-BROWSE-HOME-001
  Scenario: Render homepage discovery blocks
    Given a guest opens the homepage
    When homepage content finishes loading
    Then hero, category, and featured product blocks are visible

  @accepted @browser @SC-BROWSE-HOME-002
  Scenario: Render active announcement banner
    Given an active announcement exists
    When a guest opens the homepage
    Then the announcement banner is visible

  @accepted @browser @SC-BROWSE-HOME-003
  Scenario: Navigate from homepage category
    Given a guest sees a homepage category
    When the guest selects the category
    Then the catalog listing opens for that category

    @accepted @browser @SC-BROWSE-HOME-004
    Scenario: Navigate from homepage discovery CTA
      Given a guest sees a featured product card
      When the guest selects its discovery CTA
      Then the product detail opens

    @accepted @browser @SC-BROWSE-HOME-005
    Scenario: Homepage discovery CTA does not mutate the cart
      Given a guest opens the homepage
      And the guest cart is empty
      When a guest selects the homepage discovery CTA without a cart action
      Then the product detail opens
      And the guest cart remains empty

    @accepted @browser @SC-BROWSE-HOME-006
    Scenario: Homepage product cards do not expose follow action
      Given a guest opens the homepage
      When homepage product cards are visible
      Then homepage product cards contain no follow action

    @accepted @browser @SC-BROWSE-HOME-007
    Scenario: Homepage product cards do not expose add-to-cart action
      Given a guest opens the homepage
      When homepage product cards are visible
      Then homepage product cards contain no add-to-cart action

  @UC-BROWSE-CATALOG
  Rule: Browse, filter, sort, search, and paginate the public catalog

  @accepted @browser @SC-BROWSE-CATALOG-001
  Scenario: Render product listing cards
    Given active products exist
    When a guest opens the product listing
    Then product cards are visible

  @accepted @browser @SC-BROWSE-CATALOG-002
  Scenario: Filter products by category
    Given products exist in multiple categories
    When a guest selects a category filter
    Then the listing contains products from that category

  @accepted @browser @SC-BROWSE-CATALOG-003
  Scenario: Sort products by price
    Given products have different prices
    When a guest selects price sorting
    Then the listing follows the selected price order

  @accepted @browser @SC-BROWSE-CATALOG-004
  Scenario: Navigate listing pagination
    Given the catalog has multiple result pages
    When a guest changes the listing page
    Then the corresponding result page is shown

  @accepted @browser @SC-BROWSE-CATALOG-005
  Scenario: Search products by keyword
    Given a product matches a known keyword
    When a guest searches for that keyword
    Then matching product results are shown

  @accepted @browser @SC-BROWSE-CATALOG-006
  Scenario: Show empty state for no matches
    Given no product matches the requested keyword
    When a guest searches for that keyword
    Then an empty result state is shown

  @accepted @browser @SC-BROWSE-CATALOG-007
  Scenario: Display result count
    Given a guest has searched the catalog
    When matching results are returned
      Then the displayed result count matches the result set

  @accepted @browser @SC-BROWSE-CATALOG-009
  Scenario: Add a product directly from a listing card
    Given a guest opens the product listing
    When the guest adds the first available product from its listing card
    Then the cart contains the listed product

  @accepted @browser @SC-BROWSE-CATALOG-008
  Scenario: Navigate from product card
    Given a guest sees a product card
    When the guest selects the card title or image
    Then the product detail opens

  @UC-BROWSE-DETAIL
  Rule: Read and interact with public product detail

  @accepted @browser @SC-BROWSE-DETAIL-001
  Scenario: Render product information
    Given an active product exists
    When a guest opens its detail page
    Then the product information is visible

  @accepted @browser @SC-BROWSE-DETAIL-002
  Scenario: Display product image gallery
    Given an active product has product images
    When a guest opens its detail page
    Then the image gallery is visible

  @accepted @browser @SC-BROWSE-DETAIL-003
  Scenario: Switch product detail tabs
    Given a guest is reading product detail
    When the guest selects another detail tab
    Then the selected tab content is displayed

  @accepted @browser @SC-BROWSE-DETAIL-004
  Scenario: Add product to cart from detail
    Given a guest is viewing an available product detail
    When the guest selects add to cart
    Then the product is added to the cart

  @accepted @browser @SC-BROWSE-DETAIL-005
  Scenario: Render product specifications
    Given an active product has specification data
    When a guest opens its detail page
    Then the specification table is visible

    @accepted @browser @SC-BROWSE-DETAIL-006
    Scenario: Add product to cart from refactored detail flow
      Given a guest is viewing an available product in the refactored detail flow
      When the guest adds the product to the cart
      Then the cart reflects the product

    @accepted @browser @SC-BROWSE-DETAIL-007
    Scenario: Do not expose add-to-cart for an unavailable product
      Given an unavailable product identifier is used
      When a guest opens that product detail route
      Then the unavailable product state is visible
      And the detail add-to-cart action is absent
