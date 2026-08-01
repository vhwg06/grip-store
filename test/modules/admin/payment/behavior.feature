@admin @payment
Feature: Payment context in operations
  As an operations administrator
  I want payment facts in the relevant commerce context
  So that payment information informs decisions without owning them

  @UC-PAY-ORDER-CONTEXT
  Rule: Payment facts inform order operations without becoming payment control

    @accepted @api @SC-PAY-ORDER-CONTEXT-001
  Scenario: Read Payment Signals On Order Detail
    Given an operations admin needs payment facts while reading an order
    When the system presents payment method and payment-related signals on the order
    Then the admin understands the payment context as operational fact
    And the admin does not treat that context as a payment execution control surface

  @UC-PAY-REFUND-CONTEXT
  Rule: Payment facts remain contextual during refund review

    @accepted @api @SC-PAY-REFUND-CONTEXT-001
  Scenario: Read Payment Context During Refund Review
    Given an operations admin reviews a refund request
    When the system presents payment-related facts relevant to that refund
    Then the admin uses those facts to interpret the refund context
    But the payment context does not decide the refund outcome by itself

