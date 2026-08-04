@admin @payment-collection
Feature: Payment collection configuration
  As a finance operator
  I want to manage receive-money sources
  So that live collection instructions are explicit and ready

  @UC-PCOL-SOURCES
  Rule: Collection sources expose their active receive-money configuration

    @accepted @api @SC-PCOL-SOURCES-001
  Scenario: Read Available Collection Sources
    Given the finance operator opens the collection surface
    When the system presents configured payment collection sources
    Then the operator understands which receive-money sources are active or inactive

  @UC-PCOL-PAYEE
  Rule: Collection sources retain an explicit payee identity

    @accepted @api @SC-PCOL-PAYEE-001
  Scenario: Change Payee Identity
    Given the operator needs to update who receives funds
    When the operator saves a new payee identity
    Then the selected collection source reflects the new receive-money identity

  @UC-PCOL-SETUP
  Rule: QR and transfer setup must be valid before becoming live configuration

    @accepted @api @SC-PCOL-SETUP-001
  Scenario: Update QR Or Transfer Setup
    Given the operator needs to update a QR or transfer instruction
    When the operator saves the collection setup
    Then the selected source becomes the new receive-money instruction
    But an invalid setup is blocked from acting as live configuration

  @UC-PCOL-READINESS
  Rule: Collection readiness is visible before live use

    @accepted @api @SC-PCOL-READINESS-001
  Scenario: Review Readiness Before Live Use
    Given the operator wants to verify a collection source before live use
      When the system presents readiness signals and warnings
      Then the operator can distinguish ready sources from sources needing correction

  @UC-PCOL-SOURCES
  Rule: The browser collection surface reflects backend source readiness

    @accepted @browser @SC-PCOL-SOURCES-002
    Scenario: Read collection sources in the browser
      Given a finance operator opens payment collection in the browser
      Then the browser shows backend collection sources and their readiness states

  @UC-PCOL-PAYEE
  Rule: Browser payee edits persist across reloads

    @accepted @browser @SC-PCOL-PAYEE-002
    Scenario: Persist payee identity from the browser collection surface
      Given a finance operator opens payment collection in the browser
      When the finance operator saves a new payee identity in the browser
      Then the payee identity remains after a browser reload

  @UC-PCOL-SETUP
  Rule: Invalid collection setup never becomes live configuration

    @accepted @browser @SC-PCOL-SETUP-002
    Scenario: Reject invalid QR or transfer setup in the browser
      Given a finance operator opens payment collection in the browser
      When the finance operator enters invalid collection setup
      Then the browser shows the validation error and preserves the previous setup

  @UC-PCOL-READINESS
  Rule: Browser readiness is derived from backend warnings and state

    @accepted @browser @SC-PCOL-READINESS-002
    Scenario: Inspect collection readiness in the browser
      Given a finance operator opens payment collection in the browser
      Then the browser shows backend readiness warnings without fabricated active badges

  @UC-PCOL-SOURCES
  Rule: The desktop collection surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-COLLECT-001
    Scenario: Match the desktop collect contract
      Given the finance operator opens the desktop Figma collect surface
      Then the desktop collect surface matches its visual contract
