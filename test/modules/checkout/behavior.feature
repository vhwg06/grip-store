@checkout
Feature: Checkout and cart
  As a shopper
  I want to manage a cart and complete an order
  So that a purchase produces a durable order result

  @UC-CHECKOUT-CART
  Rule: Manage items and quantities in the cart

  @accepted @browser @SC-CHECKOUT-CART-001
  Scenario: Add product and view cart
    Given a shopper has an available product
    When the shopper adds it to the cart and opens the cart
    Then the cart contains the product

  @accepted @browser @SC-CHECKOUT-CART-002
  Scenario: Display cart total
    Given the cart contains products
    When the shopper opens the cart
    Then the cart total is displayed

  @accepted @browser @SC-CHECKOUT-CART-003
  Scenario: Update cart quantity
    Given the cart contains a product
    When the shopper changes its quantity
    Then the cart stores the new quantity

  @accepted @browser @SC-CHECKOUT-CART-004
  Scenario: Remove item from cart
    Given the cart contains a product
    When the shopper removes the product
    Then the product is absent from the cart

  @accepted @browser @SC-CHECKOUT-CART-005
  Scenario: Show empty cart state
    Given the cart contains no products
    When the shopper opens the cart
    Then the empty cart state is displayed

  @UC-CHECKOUT-ORDER
  Rule: Move from cart through checkout to a durable order

  @accepted @browser @SC-CHECKOUT-ORDER-001
  Scenario: Preserve cart and checkout CTA contract
    Given a shopper opens the cart route
    When the cart page loads
    Then the cart total and checkout CTA are available

  @accepted @browser @SC-CHECKOUT-ORDER-002
  Scenario: Preserve product to cart to checkout flow
    Given a shopper starts from an available product detail
    When the shopper moves through cart to checkout
    Then the core checkout CTA flow remains available

  @accepted @browser @SC-CHECKOUT-ORDER-003
  Scenario: Complete purchase and show confirmation
    Given a shopper has a valid cart
    When the shopper completes checkout
    Then an order confirmation is displayed

  @accepted @browser @SC-CHECKOUT-ORDER-004
  Scenario: Show completed order in order list
    Given the shopper has completed a purchase
      When the shopper opens the orders list
      Then the completed order is present

  @UC-CHECKOUT-API
  Rule: Checkout API owns authentication, validation, payment, status, and cancellation boundaries

    @accepted @api @SC-CHECKOUT-API-001
    Scenario: Create an order with valid checkout data
      Given a shopper access token and purchasable product are available
      When the client creates a checkout order with that product
      Then the checkout order response status is `200` or `201`
      And the checkout order response contains identity, status, and amount

    @accepted @api @security @SC-CHECKOUT-API-002
    Scenario: Reject checkout order creation without authentication
      When the client creates a checkout order without authentication
      Then the checkout response status is `401`

    @accepted @api @SC-CHECKOUT-API-003
    Scenario: Reject invalid checkout order data
      Given a shopper access token is available for checkout
      When the client creates a checkout order with invalid data
      Then the checkout response status is `400` or `422`

    @accepted @api @security @SC-CHECKOUT-API-004
    Scenario: Reject payment-order creation without authentication
      When the client creates a payment order without authentication
      Then the checkout response status is `401`

    @accepted @api @security @SC-CHECKOUT-API-005
    Scenario: Reject payment parameter read without authentication
      When the client reads payment parameters without authentication
      Then the checkout response status is `401`

    @accepted @api @security @SC-CHECKOUT-API-006
    Scenario: Reject order status read without authentication
      When the client reads checkout order status without authentication
      Then the checkout response status is `401`

    @accepted @api @security @SC-CHECKOUT-API-007
    Scenario: Reject order cancellation without authentication
      When the client cancels a checkout order without authentication
      Then the checkout response status is `401`

    @accepted @api @security @SC-CHECKOUT-API-008
    Scenario: Reject checkout preview without authentication
      When the client reads checkout preview without authentication
      Then the checkout response status is `401`
