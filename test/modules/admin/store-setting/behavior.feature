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

  @UC-SET-CONTACT
  Rule: Store settings read models expose structured identity facts across admin and public APIs

    @accepted @api @SC-SET-CONTACT-API-001
    Scenario: Read structured storefront identity from all read models
      When the client reads admin store settings and public catalog settings
      Then the admin identity response contains brand contact stats and visitor count
      And public settings contain storefront identity fields

    @accepted @api @SC-SET-CONTACT-API-002
    Scenario: Update storefront identity and reflect it publicly
      Given an admin has a valid storefront identity payload
      When the admin updates brand and contact facts
      Then admin settings contain the updated identity facts
      And public catalog settings contain the updated shop identity

    @accepted @api @security @SC-SET-CONTACT-API-003
    Scenario: Reject storefront identity reads without admin authorization
      When an unauthenticated client reads admin store settings
      Then the store settings response status is `401`
      When a shopper reads admin store settings
      Then the store settings response status is `403`

  @UC-SET-HOMEPAGE
  Rule: Homepage settings reject duplicate ordering and negative news counts

    @accepted @api @SC-SET-HOMEPAGE-API-001
    Scenario: Accept homepage composition and reject ordering conflicts
      When the admin saves a valid homepage composition
      Then the homepage settings response status is `200`
      When the admin saves duplicate homepage ordering and a negative news count
      Then the homepage settings response status is `400`

  @UC-SET-REGISTRY
  Rule: Footer and support settings reject malformed external targets

    @accepted @api @SC-SET-REGISTRY-API-001
    Scenario: Update footer support commitments and reject malformed targets
      When the admin saves valid footer and support commitments
      Then the footer and support settings responses are successful
      When the admin saves malformed support targets
      Then the support settings response status is `400`

  @UC-SET-CONTACT
  Rule: Store settings browser controls persist only valid contact input

    @accepted @browser @SC-SET-CONTACT-UI-001
    Scenario: Save contact facts and reflect them on the homepage
      Given an admin opens store settings in the browser
      When the admin saves valid contact facts in the browser
      Then the homepage shows the saved contact facts

    @accepted @browser @SC-SET-CONTACT-UI-002
    Scenario: Block invalid contact email in the browser
      Given an admin opens store settings in the browser
      When the admin enters an invalid contact email
      Then the browser disables the contact save action and shows the validation message

  @UC-SET-HOMEPAGE
  Rule: Homepage composition controls persist priority decisions through the browser

    @accepted @browser @SC-SET-HOMEPAGE-UI-001
    Scenario: Save homepage composition in the browser
      Given an admin opens store settings in the browser
      When the admin saves a homepage composition decision
      Then the homepage shows the configured content modules

    @accepted @browser @SC-SET-HOMEPAGE-UI-002
    Scenario: Block negative homepage news count in the browser
      Given an admin opens store settings in the browser
      When the admin enters a negative homepage news count
      Then the browser disables the homepage save action

  @UC-SET-REGISTRY
  Rule: Footer and support controls remain visible in the browser

    @accepted @browser @SC-SET-REGISTRY-UI-001
    Scenario: Save footer and support commitments in the browser
      Given an admin opens store settings in the browser
      When the admin saves valid footer and support controls
      Then the homepage shows the configured support links

  @UC-SET-CONTACT
  Rule: The desktop settings surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-SETTINGS-001
    Scenario: Match the desktop store settings contract
      Given the admin opens the desktop Figma store settings surface
      Then the desktop store settings surface matches its visual contract
