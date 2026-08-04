@admin @product
Feature: Admin product management
  As a catalog operator
  I want to create and manage products from the admin UI
  So that product administration remains connected to the public catalog

  @UC-ADMIN-PRODUCT-CREATE
  Rule: The admin product editor persists product details through the catalog contract

    @accepted @browser @SC-ADMIN-PRODUCT-CREATE-001
    Scenario: Create a product with specifications and verify storefront detail
      Given an admin opens the product creation form
      When the admin creates a product with two specifications
      Then the created product can be found through the public catalog
      And storefront detail renders both saved specifications

    @accepted @browser @SC-ADMIN-PRODUCT-CREATE-002
    Scenario: Preview media during product creation
      Given an admin opens the product creation form
      When the admin selects an image for the product media field
      Then the media preview card and image are visible
      And the product save action remains enabled

  @UC-ADMIN-PRODUCT-LIST
  Rule: Product list actions expose lifecycle controls without hiding the row context

    @accepted @browser @SC-ADMIN-PRODUCT-LIST-001
    Scenario: Inspect and execute product row actions
      Given an admin opens the product list
      Then each product row exposes toggle, edit, and delete actions
      When the admin toggles a product row and confirms deletion
      Then the product list remains available after the lifecycle actions

    @accepted @browser @SC-ADMIN-PRODUCT-LIST-002
    Scenario: Inspect product health-signal filters
      Given an admin opens the product list
      Then product visibility and stock health filters are visible

    @accepted @browser @empty-result @SC-ADMIN-PRODUCT-LIST-003
    Scenario: Render an empty product search state
      Given an admin opens the product list
      When the admin searches for a non-existent product
      Then the product list shows an empty state without an error boundary

  @UC-ADMIN-PRODUCT-EDITORIAL
  Rule: Product editor keeps linked editorial context inside the product boundary

    @accepted @browser @SC-ADMIN-PRODUCT-EDITORIAL-001
    Scenario: Link an intro article from Product Editor
      Given an admin opens an existing product editor
      When the admin selects a published intro article and saves the link
      Then the product form persists the linked article
      And the editor exposes a return path to the linked article

  @UC-ADMIN-PRODUCT-CATEGORY
  Rule: Category administration preserves explicit position changes

    @accepted @browser @SC-ADMIN-PRODUCT-CATEGORY-001
    Scenario: Reorder a category from admin UI
      Given an admin opens category management
      When the admin saves a category position
      Then the category read model preserves that position

  @UC-ADMIN-PRODUCT-LIST
  Rule: The desktop product list preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-PRODUCT-LIST-001
    Scenario: Match the desktop product list contract
      Given the admin opens the desktop Figma product list surface
      Then the desktop product list surface matches its visual contract

  @UC-ADMIN-PRODUCT-CREATE
  Rule: The desktop product editor preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-PRODUCT-CREATE-001
    Scenario: Match the desktop product create contract
      Given the admin opens the desktop Figma product create surface
      Then the desktop product create surface matches its visual contract

  @UC-ADMIN-PRODUCT-CATEGORY
  Rule: The desktop category surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-CATEGORIES-001
    Scenario: Match the desktop categories contract
      Given the admin opens the desktop Figma categories surface
      Then the desktop categories surface matches its visual contract
