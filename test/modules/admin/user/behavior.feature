@admin @user
Feature: User account operations
  As an administrator
  I want to manage account state without taking over commerce support
  So that user and customer ownership remain separate

  @UC-USER-SEARCH
  Rule: User administration can identify and read an account

    @accepted @api @SC-USER-SEARCH-001
  Scenario: Search Then Read Account
    Given the admin needs to identify a specific account
    When the admin opens user management and searches the paginated account list
    Then the system displays the selected account state

  @UC-USER-STATE
  Rule: Account state changes are controlled by the user domain

    @accepted @api @SC-USER-STATE-001
  Scenario: Change Account State
    Given the admin needs to block or unblock an account
    When the admin requests a valid account-level state change
    Then the system updates the account state
    But a stale or unsuitable state change is rejected

  @UC-USER-CUSTOMER-HANDOFF
  Rule: Commerce concerns hand off from user context to customer context

    @accepted @api @SC-USER-CUSTOMER-HANDOFF-001
  Scenario: Handoff To Customer Domain
    Given the admin recognizes that the concern is commerce history
    When the admin reads the account and the system shows a linked customer context
    Then the admin can move to the customer root
    And an account without a customer link remains valid in the user domain

  @UC-USER-SCOPE
  Rule: Account controls do not replace commerce support operations

    @accepted @api @SC-USER-SCOPE-001
  Scenario: Keep Commerce Support Out Of Account Control
    Given the admin is looking at an account-level issue
    When the actual question turns out to be about order, refund, or review history
      Then the admin moves into the customer-led commerce context
      And the admin does not misuse account controls as a substitute for commerce support

  @UC-USER-SEARCH
  Rule: The browser account root is explicitly account-centric

    @accepted @browser @SC-USER-SEARCH-002
    Scenario: Search the account management root
      Given an admin opens user management in the browser
      When the admin searches for the buyer account
      Then the browser shows the buyer account without commerce history actions

    @accepted @browser @SC-USER-SEARCH-003
    Scenario: Refine account search after an empty result
      Given an admin opens user management in the browser
      When the admin searches for an unknown account and then the buyer account
      Then the browser replaces the empty result with the buyer account

  @UC-USER-STATE
  Rule: Browser account controls expose reversible block state owned by the user domain

    @accepted @browser @SC-USER-STATE-002
    Scenario: Read and reverse an account block state
      Given an admin opens the buyer account controls in the browser
      When the admin toggles the buyer block state
      Then a fresh account read shows the toggled block state
      When the admin restores the original buyer block state
      Then a fresh account read shows the original block state

  @UC-USER-CUSTOMER-HANDOFF
  Rule: Account context hands commerce concerns to the customer root

    @accepted @browser @SC-USER-CUSTOMER-HANDOFF-002
    Scenario: Open customer context from account management
      Given an admin opens the buyer account controls in the browser
      When the admin opens the linked customer context
      Then the browser enters customer management

  @UC-USER-SCOPE
  Rule: Account controls do not expose customer commerce actions

    @accepted @browser @SC-USER-SCOPE-002
    Scenario: Keep commerce actions outside the account panel
      Given an admin opens the buyer account controls in the browser
      Then the account panel exposes block and customer handoff controls only
