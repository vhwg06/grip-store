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

