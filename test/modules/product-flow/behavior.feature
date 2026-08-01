@product-flow
Feature: Shopper product composition
  As a shopper
  I want product detail actions to compose with the cart
  So that the product and checkout boundaries exchange durable cart state

  @UC-PF-CART-COMPOSITION
  Rule: Product detail owns the add-to-cart command while cart owns stored quantity

    @accepted @browser @SC-PF-CART-COMPOSITION-001
    Scenario: Add an available product from detail
      Given a shopper opens an available product detail
      When the shopper adds the product from detail
      Then the cart count increases by one
      And the add-to-cart confirmation is visible

    @accepted @browser @SC-PF-CART-COMPOSITION-002
    Scenario: Add a selected product quantity from detail
      Given a shopper opens an available product detail
      When the shopper selects quantity `2` and adds the product
      Then the cart stores quantity `2` for that product
