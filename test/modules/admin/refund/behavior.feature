@admin @refund
Feature: Refund operations
  As an operations administrator
  I want to review refund evidence and make valid decisions
  So that refund outcomes remain explicit and auditable

  @UC-REF-QUEUE
  Rule: Refund review starts from a traceable pending queue

    @accepted @api @SC-REF-QUEUE-001
  Scenario: Read Queue Then Open Evidence
    Given the admin needs to choose a refund request to process
    When the admin opens the refund queue
    Then the system returns pending requests and contextual states
    When the admin selects a request
    Then the system opens its evidence and context
    And an unavailable request ends the review without a false decision

  @UC-REF-DECISION
  Rule: Refund decisions require evidence and are auditable

    @accepted @api @SC-REF-DECISION-001
  Scenario: Approve After Evidence Review
    Given evidence supports a positive refund outcome
    When the admin reads order linkage, customer context, payment evidence, and prior notes
    And the admin confirms an approve decision
    Then the system moves the refund to approved state
    And the linked order context is updated correspondingly

    @accepted @api @SC-REF-DECISION-002
  Scenario: Reject After Evidence Review
    Given evidence does not support a positive refund outcome
    When the admin reads the full context
    And the admin confirms a reject decision
    Then the system moves the refund to rejected state
    And the decision context is stored

  @UC-REF-HISTORY
  Rule: Final refund outcomes remain historical evidence

    @accepted @api @SC-REF-HISTORY-001
  Scenario: Read A Historical Refund Decision
    Given a refund request already has a final outcome
    When the operations admin opens that refund record
      Then the admin reads it as historical operational evidence
      And the admin does not treat it as pending decision work

  @UC-REF-QUEUE
  Rule: The refund browser queue contains only actionable pending requests

    @accepted @browser @SC-REF-QUEUE-002
    Scenario: Read the refund queue and open evidence in the browser
      Given an admin opens the refund queue in the browser
      Then the browser shows the refund queue decision and evidence surfaces
      And pending queue items do not display final refund outcomes

    @accepted @browser @empty-result @SC-REF-QUEUE-003
    Scenario: Render an empty refund queue search
      Given an admin opens the refund queue in the browser
      When the admin searches the refund queue for a non-existent request
      Then the browser shows an empty refund queue without an error boundary

    @accepted @browser @SC-REF-QUEUE-004
    Scenario: Keep an approved refund out of the pending browser queue
      Given an admin has approved a refund request through the API
      When the admin searches the pending refund queue for that request in the browser
      Then the approved request is absent from the pending queue

  @UC-REF-DECISION
  Rule: Browser refund decisions require evidence and reconcile the pending queue

    @accepted @browser @SC-REF-DECISION-003
    Scenario: Approve a refund from the browser decision surface
      Given an admin has a pending refund request ready for browser approval
      When the admin approves the refund from the browser decision surface
      Then the refund is approved and absent from the pending browser queue

    @accepted @browser @SC-REF-DECISION-004
    Scenario: Reject a refund from the browser decision surface
      Given an admin has a pending refund request ready for browser rejection
      When the admin rejects the refund from the browser decision surface
      Then the refund is rejected and absent from the pending browser queue

    @accepted @browser @SC-REF-DECISION-005
    Scenario: Preserve a decision note when approving a refund
      Given an admin has a pending refund request ready for browser approval with a note
      When the admin approves the refund with a decision note
      Then the historical refund evidence contains the decision note

    @accepted @browser @SC-REF-DECISION-006
    Scenario: Prevent a second decision on a historical refund
      Given an admin has already decided a refund request
      When the admin opens that refund in browser history
      Then the browser does not expose the reject action for the decided refund

  @UC-REF-HISTORY
  Rule: Browser refund history keeps final outcomes and decision evidence readable

    @accepted @browser @SC-REF-HISTORY-002
    Scenario: Read an approved refund from browser history
      Given an admin has approved a refund request with historical evidence
      When the admin opens that refund in browser history
      Then the browser shows the approved outcome and its evidence
