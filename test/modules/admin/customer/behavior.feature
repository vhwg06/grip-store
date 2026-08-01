@admin @customer
Feature: Customer support context
  As a support operator
  I want to understand a commerce customer without confusing customer and user domains
  So that support actions start from the correct source of truth

  @UC-CUS-SEARCH
  Rule: Support can find and open a customer commerce context

    @accepted @api @SC-CUS-SEARCH-001
  Scenario: Search And Open Customer Context
    Given the admin needs to find a customer for support
    When the admin queries the customer list
    And the system returns customer-centric records
    Then the admin can identify and open the correct customer context
    But similar records may require commerce signals to distinguish them

  @UC-CUS-SUMMARY
  Rule: Customer summary preserves commerce traversal context

    @accepted @api @SC-CUS-SUMMARY-001
  Scenario: Read Customer Summary Then Traverse Commerce Links
    Given the admin has found a customer
    When the admin opens the customer summary
    Then the system shows identity summary and commerce indicators
    When the admin opens order, refund, or review references
    Then the system preserves the same customer context across domains
    And a missing child artifact does not erase the customer root understanding

  @UC-CUS-ACCOUNT-LINK
  Rule: A customer may expose a linked user account without changing ownership

    @accepted @api @SC-CUS-ACCOUNT-LINK-001
  Scenario: Customer With Linked User Account
    Given a customer has a linked user account
    When the admin reads the customer summary
    Then the system shows the linked user account
    When the admin chooses an account concern instead of a commerce concern
    Then the admin can move to the user domain
    And the linked identity does not change ownership of commerce history

  @UC-CUS-COMMERCE-HISTORY
  Rule: Empty commerce history is a valid customer projection

    @accepted @api @SC-CUS-COMMERCE-HISTORY-001
  Scenario: Read A Customer With Empty Commerce History
    Given a customer record exists without orders, refunds, or reviews
    When the support operator opens that customer
    Then the operator reads an empty commerce history as a valid customer state
    And the operator does not treat the customer record as broken or incomplete

  @UC-CUS-ACCOUNT-HANDOFF
  Rule: Account concerns hand off from customer context to the user domain

    @accepted @api @SC-CUS-ACCOUNT-HANDOFF-001
  Scenario: Handoff From Customer To User Domain
    Given the support operator starts from a commerce-root customer view
    When the actual next action is account control rather than commerce support
      Then the operator moves into the user domain
      And the customer record remains the commerce source of truth

  @UC-CUS-SEARCH
  Rule: Customer search in the browser returns only commerce customer context

    @accepted @browser @SC-CUS-SEARCH-002
    Scenario: Find a customer from the admin browser search
      Given an admin opens customer management in the browser
      When the admin searches for the buyer customer
      Then the browser shows one customer result and excludes the admin account

    @accepted @browser @empty-result @SC-CUS-SEARCH-003
    Scenario: Render an empty customer search state
      Given an admin opens customer management in the browser
      When the admin searches for a non-existent customer
      Then the browser shows no customer results without an error boundary

    @accepted @browser @security @SC-CUS-SEARCH-004
    Scenario: Customer search excludes administrator accounts
      Given an admin opens customer management in the browser
      When the admin searches for the administrator account
      Then the browser shows no customer result for the administrator

  @UC-CUS-SUMMARY
  Rule: The browser customer summary exposes commerce indicators and cross-domain actions

    @accepted @browser @SC-CUS-SUMMARY-002
    Scenario: Read customer summary and commerce indicators in the browser
      Given an admin opens the buyer customer summary in the browser
      Then the browser shows customer identity and order refund review indicators

    @accepted @browser @SC-CUS-SUMMARY-003
    Scenario: Open commerce links from the customer root
      Given an admin opens the buyer customer summary in the browser
      Then the browser exposes order refund and review actions from the customer root

  @UC-CUS-ACCOUNT-LINK
  Rule: Customer account navigation hands off to user ownership without copying commerce controls

    @accepted @browser @SC-CUS-ACCOUNT-LINK-002
    Scenario: Move from customer root to linked account controls
      Given an admin opens the buyer customer summary in the browser
      When the admin opens the linked account controls
      Then the browser enters user management with customer commerce actions absent

  @UC-CUS-COMMERCE-HISTORY
  Rule: A newly registered customer remains valid when commerce history is empty

    @accepted @browser @SC-CUS-COMMERCE-HISTORY-002
    Scenario: Read an empty customer commerce state in the browser
      Given an admin has registered a customer with no commerce history
      When the admin searches for that customer in the browser
      Then the browser shows the customer and an empty commerce history
