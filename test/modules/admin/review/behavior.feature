@admin @review
Feature: Review moderation operations
  As a moderator
  I want to inspect and moderate review artifacts
  So that public review visibility follows an explicit decision

  @UC-REV-QUEUE
  Rule: Review moderation begins with queue state and context

    @accepted @api @SC-REV-QUEUE-001
  Scenario: Queue Scan Then Context Read
    Given the admin needs to choose a review for moderation
    When the admin opens the moderation queue
    Then the system returns review states and queue statistics
      When the admin opens a review context
      Then the context panel shows product, customer, order, and attachment references when available

    @accepted @api @security @SC-REV-QUEUE-005
    Scenario: Reject unauthenticated moderation queue access
      Given no moderation authentication is supplied
      When the client reads the moderation queue
      Then the moderation queue request returns `401`

    @accepted @api @security @SC-REV-QUEUE-006
    Scenario: Reject non-admin moderation queue access
      Given a normal customer is not a review moderator
      When that customer reads the moderation queue
      Then the moderation queue request returns `403`

    @accepted @api @SC-REV-QUEUE-007
    Scenario: Read moderation context from the queue payload
      Given the admin needs to choose a review for moderation
      When the admin opens the moderation queue
      Then the queue payload preserves review context references

  @UC-REV-DECISION
  Rule: A moderation decision controls the review's public visibility state

    @accepted @api @SC-REV-DECISION-001
  Scenario: Approve A Review
    Given a moderator has enough review context to allow public visibility
    When the moderator approves the review
    Then the review becomes public-eligible content
    And the approval outcome is distinct from hide, feature, or delete

    @accepted @api @SC-REV-DECISION-002
  Scenario: Hide A Review
    Given a moderator has enough review context to remove public visibility
    When the moderator hides the review
    Then the review stops acting as public-visible feedback
    And the hide outcome is distinct from approve, feature, or delete

    @accepted @api @SC-REV-DECISION-003
  Scenario: Feature A Review
    Given a review is already suitable for public visibility
    When the moderator features the review
    Then the review gains elevated public prominence
    And the feature outcome does not replace the underlying moderation decision

  @UC-REV-BULK
  Rule: Bulk moderation preserves individual eligibility rules

    @accepted @api @SC-REV-BULK-001
  Scenario: Bulk Publish A Review Set
    Given the admin wants to process multiple pending reviews
    When the admin selects a review set
    Then the system checks each review's eligibility
    And the system applies the outcome to eligible reviews without bypassing individual moderation rules

  @UC-REV-DELETE
  Rule: Removing a review is distinct from hiding it

    @accepted @api @SC-REV-DELETE-001
  Scenario: Remove A Review From The Moderation Surface
    Given a moderator determines a review should no longer remain as a review artifact
    When the moderator deletes the review
      Then the review disappears from the moderation surface
      And the outcome is not interpreted as the same behavior as hiding the review

  @UC-REV-QUEUE
  Rule: The browser moderation queue exposes state, statistics, actions, and context together

    @accepted @browser @SC-REV-QUEUE-002
    Scenario: Read the moderation queue in the browser
      Given an admin opens review moderation in the browser
      Then the browser shows review statistics queue action and context surfaces

    @accepted @browser @SC-REV-QUEUE-003
    Scenario: Render an empty moderation search
      Given an admin opens review moderation in the browser
      When the admin searches moderation for a non-existent review
      Then the browser shows no reviews without an error boundary

    @accepted @browser @SC-REV-QUEUE-004
    Scenario: Read selected review context in the browser
      Given an admin has created a pending review for browser context
      When the admin opens that review in moderation
      Then the browser shows product customer order attachment and comment context

  @UC-REV-DECISION
  Rule: Browser moderation actions produce distinct public visibility outcomes

    @accepted @browser @SC-REV-DECISION-004
    Scenario: Approve a pending review in the browser
      Given an admin has created a pending review for browser approval
      When the moderator approves that review in the browser
      Then the browser shows the review as approved and disables approve

    @accepted @browser @SC-REV-DECISION-005
    Scenario: Hide an approved review in the browser
      Given an admin has created an approved review for browser hiding
      When the moderator hides that review in the browser
      Then the browser shows the review as hidden and disables hide

    @accepted @browser @SC-REV-DECISION-006
    Scenario: Feature an approved review in the browser
      Given an admin has created an approved review for browser featuring
      When the moderator features that review in the browser
      Then the browser shows the review as featured and disables feature

    @accepted @browser @SC-REV-DECISION-007
    Scenario: Prevent hiding a review that is already hidden
      Given an admin has created a hidden review for browser inspection
      When the moderator opens that hidden review in the browser
      Then the browser disables the hide action

  @UC-REV-BULK
  Rule: Browser bulk moderation applies eligibility per selected review

    @accepted @browser @SC-REV-BULK-002
    Scenario: Bulk publish pending reviews in the browser
      Given an admin has created two pending reviews for browser bulk moderation
      When the moderator publishes both selected reviews in the browser
      Then both reviews become approved in the browser

    @accepted @browser @SC-REV-BULK-003
    Scenario: Bulk publish only eligible reviews in the browser
      Given an admin has created one pending and one hidden review for partial bulk moderation
      When the moderator publishes both selected reviews in the browser
      Then the pending review becomes approved and the hidden review remains hidden

  @UC-REV-DELETE
  Rule: Browser removal ends the review artifact rather than changing only visibility

    @accepted @browser @SC-REV-DELETE-002
    Scenario: Remove a hidden review from the browser moderation surface
      Given an admin has created a hidden review for browser removal
      When the moderator deletes that review in the browser
      Then the review disappears from the browser moderation queue

  @UC-REV-QUEUE
  Rule: The desktop review surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-REVIEWS-001
    Scenario: Match the desktop reviews contract
      Given the admin opens the desktop Figma reviews surface
      Then the desktop reviews surface matches its visual contract
