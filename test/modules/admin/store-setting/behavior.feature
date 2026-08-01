@admin @store-setting
Feature: Storefront settings
  As a store operator
  I want to configure storefront behavior
  So that presentation and discovery rules remain intentional

  @UC-SET-CONTACT
  Rule: Storefront contact facts can be changed without accepting invalid data

    @accepted @api @SC-SET-CONTACT-001
  Scenario: Change Storefront Contact Info
    Given the business wants to change store contact information
    When the admin reads and updates the current storefront contact facts
    Then the system accepts valid contact information
    But invalid contact data leaves the previous value unchanged

  @UC-SET-HOMEPAGE
  Rule: Homepage composition preserves priority and uniqueness rules

    @accepted @api @SC-SET-HOMEPAGE-001
  Scenario: Recompose Homepage Priorities
    Given the business wants to change the homepage focus
    When the admin changes block priority or active state
    Then the system accepts a valid homepage composition
    But an ordering or uniqueness conflict is rejected

  @UC-SET-DISCOVERY
  Rule: Discovery and visibility settings retain their public meaning

    @accepted @api @SC-SET-DISCOVERY-001
  Scenario: Toggle Discovery And Visibility Behavior
    Given the admin wants to change how the storefront is discovered
    When the admin changes a visibility or discovery rule
    Then the system accepts the rule with its public behavioral meaning
    But a conflicting combination of rules is rejected

  @UC-SET-REGISTRY
  Rule: Registry and legacy commitments have explicit policy behavior

    @accepted @api @SC-SET-REGISTRY-001
  Scenario: Change Registry Or Legacy Commitment Behavior
    Given the storefront still carries registry or legacy commitments
    When the store operator changes those commitment rules
    Then the storefront reflects the new policy commitment
    And related legacy behavior is either preserved intentionally or retired intentionally

