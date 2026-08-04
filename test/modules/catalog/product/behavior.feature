@catalog @legacy-product @retired
Feature: Retired legacy Product contract
  As a catalog operator
  I want to manage product records and their catalog relationships
  So that the public product projection is backed by durable admin state

  @UC-CAT-PRODUCT-READ
  Rule: Product administration reads are protected and expose operator health signals

    @deferred @api @security @SC-CAT-PRODUCT-READ-001
    Scenario: Reject an unauthenticated product administration read
      When an unauthenticated client reads the admin product catalog
      Then the admin product catalog response status is `401`

    @deferred @api @security @SC-CAT-PRODUCT-READ-002
    Scenario: Reject a non-admin product administration read
      Given a shopper access token is available
      When the shopper reads the admin product catalog
      Then the admin product catalog response status is `403`

    @deferred @api @SC-CAT-PRODUCT-READ-003
    Scenario: Read the admin product catalog with operator fields
      Given an admin access token is available
      When the admin reads the admin product catalog
      Then the admin product catalog response status is `200`
      And each admin product row exposes identity, category, stock, visibility, and ordering fields

    @deferred @api @SC-CAT-PRODUCT-READ-004
    Scenario: Read product health signals for operator triage
      Given an admin access token is available
      When the admin reads the admin product catalog
      Then each admin product row exposes media, visibility, and stock signals

  @UC-CAT-PRODUCT-COMMAND
  Rule: Product administration persists the complete commercial product contract

    @deferred @api @SC-CAT-PRODUCT-COMMAND-001
    Scenario: Create a sellable product and read its form
      Given an admin access token is available
      When the admin creates a sellable product with a category
      Then the product creation response status is successful
      And the admin product form returns the created product and categories

    @deferred @api @SC-CAT-PRODUCT-COMMAND-002
    Scenario: Update product commercial state
      Given an admin-created product exists
      When the admin updates its title, price, purchase limit, visibility, category, and description
      Then the product update response status is successful
      And the admin product form returns every updated commercial field

    @deferred @api @SC-CAT-PRODUCT-COMMAND-003
    Scenario: Maintain category hierarchy and position
      Given an admin access token is available
      When the admin creates a root category and a child category
      And the admin changes the root category position to `9`
      Then the category read model preserves the parent relationship and position

    @deferred @api @SC-CAT-PRODUCT-COMMAND-004
    Scenario: Keep editorial and media data inside the product form contract
      Given an admin-created product exists
      When the admin reads its product form
      Then the form returns product and category data
      And the form does not claim ownership of cards or inventory

    @deferred @api @SC-CAT-PRODUCT-COMMAND-005
    Scenario: Expose only a published linked intro article in product projections
      Given an admin-created product and published and draft intro articles exist
      When the admin links the published intro article to the product
      Then the product form and public detail expose that published article
      When the admin links the draft intro article to the product
      Then public product detail hides the draft article
      When the admin clears the product intro article link
      Then the product form has no intro article link

  @UC-CAT-PRODUCT-DETAILS
  Rule: Product detail persistence is transactional and visible through public read models

    @deferred @api @SC-CAT-PRODUCT-DETAILS-001
    Scenario: Create a product with specifications
      Given an admin access token is available
      When the admin creates a product with specifications
      Then the public product detail returns those specifications

    @deferred @api @SC-CAT-PRODUCT-DETAILS-002
    Scenario: Replace product specifications transactionally
      Given an admin-created product has specification `KeyA`
      When the admin replaces its specifications with `KeyB`
      Then public product detail contains `KeyB`
      And public product detail does not contain `KeyA`

    @deferred @api @SC-CAT-PRODUCT-DETAILS-003
    Scenario: Delete a product and its public detail projection
      Given an admin-created product has product detail records
      When the admin deletes the product
      Then public product detail responds with `404`
      And product detail records are not publicly visible
