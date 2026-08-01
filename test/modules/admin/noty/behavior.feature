@admin @noty
Feature: Outbound notification operations
  As an operations administrator
  I want to inspect readiness and notification history
  So that outbound communication is controlled and traceable

  @UC-NOTY-SEND
  Rule: Outbound notification sending is gated by readiness

    @accepted @api @SC-NOTY-SEND-001
  Scenario: Check Readiness Then Send
    Given the admin wants to send a website-facing push notification
    When the admin reads current outbound readiness
    Then the system shows whether sending is ready
    When readiness is sufficient and the admin sends the notification
    Then the system accepts the outbound send behavior
    But insufficient readiness blocks the send before dispatch

  @UC-NOTY-HISTORY
  Rule: Outbound notification history remains traceable

    @accepted @api @SC-NOTY-HISTORY-001
  Scenario: Read Outbound List And History
    Given the admin needs to understand outbound notifications
    When the admin opens the notification list
    Then the system returns outbound notifications
    When the admin opens notification or send-set history
    Then the system shows the corresponding outcome states
    And a minimal history remains distinguishable from an untraceable failure

