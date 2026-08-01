@admin @admin-profile
Feature: Admin profile operations
  As an operations administrator
  I want to inspect and maintain my own operational identity
  So that account safety and representation remain explicit

  @UC-APRO-IDENTITY
  Rule: The admin can read and maintain their operational identity

    @accepted @api @SC-APRO-IDENTITY-001
  Scenario: Read Self Identity
    Given the current admin opens the self-profile surface
    When the system shows the current identity details
    Then the admin can confirm how the account is represented in operations

    @accepted @api @SC-APRO-IDENTITY-002
  Scenario: Change Display Identity
    Given the current admin wants to update display identity
    When the admin saves a new display identity
    Then the current admin profile reflects the new identity
    And the admin's permission posture does not change as a side effect

  @UC-APRO-SECURITY
  Rule: The admin can inspect account security evidence

    @accepted @api @SC-APRO-SECURITY-001
  Scenario: Review Security Posture
    Given the current admin needs to validate account safety
    When the system presents password, 2FA, and backup-method context
    Then the admin can judge whether the account remains trustworthy

    @accepted @api @SC-APRO-SECURITY-002
  Scenario: Inspect Recent Access
    Given the current admin wants to check recent sessions
    When the system presents recent device and access context
    Then the admin can distinguish expected access from suspicious access

  @UC-APRO-UI
  Rule: The admin profile browser surface renders backend-owned identity and trust evidence

    @accepted @browser @SC-APRO-UI-001
    Scenario: Render the current admin identity
      Given an admin opens the profile page
      When the profile surface loads
      Then the profile renders the backend admin identity and security section

    @accepted @browser @SC-APRO-UI-002
    Scenario: Persist the admin display identity after reload
      Given an admin opens the profile page
      When the admin saves a new display identity
      Then the saved display identity remains after a page reload

    @accepted @browser @SC-APRO-UI-003
    Scenario: Render backend security posture without static green audit copy
      Given an admin opens the profile page
      When the profile requests security posture
      Then the static green audit copy is absent

    @accepted @browser @SC-APRO-UI-004
    Scenario: Render backend recent access context
      Given an admin opens the profile page
      When the profile requests recent access
      Then a backend session device and location are visible
      And static fallback session rows are absent
