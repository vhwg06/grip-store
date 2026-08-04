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

  @UC-NOTY-SEND
  Rule: Browser notification controls expose channel readiness before dispatch

    @accepted @browser @SC-NOTY-SEND-002
    Scenario: Read outbound channel readiness in the browser
      Given an admin opens notification management in the browser
      When the admin opens notification channel settings
      Then the browser shows outbound channel readiness controls

    @accepted @browser @SC-NOTY-SEND-003
    Scenario: Send a website push from the browser compose flow
      Given an admin opens notification management in the browser
      When the admin sends a website push from the compose flow
      Then the browser shows the sent campaign in the outbound table

    @accepted @browser @SC-NOTY-SEND-004
    Scenario: Update channel readiness before sending a push
      Given an admin opens notification management in the browser
      When the admin saves channel readiness and sends a website push
      Then the browser reports the push campaign as sent

  @UC-NOTY-HISTORY
  Rule: Browser notification history is server-backed and filterable

    @accepted @browser @SC-NOTY-HISTORY-002
    Scenario: Read outbound notifications from browser history
      Given an admin opens notification management in the browser
      When the admin creates a notification through the API
      Then a browser reload shows the notification in outbound history
      And its outcome state is visible

    @accepted @browser @empty-result @SC-NOTY-HISTORY-003
    Scenario: Render an empty notification search state
      Given an admin opens notification management in the browser
      When the admin searches for a non-existent campaign
      Then the browser shows no matching campaigns without an error boundary

  @UC-NOTY-HISTORY
  Rule: The desktop notification surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-MESSAGES-001
    Scenario: Match the desktop messages contract
      Given the admin opens the desktop Figma messages surface
      Then the desktop messages surface matches its visual contract

  @UC-NOTY-SEND
  Rule: Notification failure readiness remains explicit when failure injection is available

    @deferred @browser @SC-NOTY-SEND-005
    Scenario: Show an explicit readiness error when notification settings fail
      Given notification failure injection is configured for the admin browser
      When the notification settings request fails
      Then the browser shows an explicit notification readiness error without fabricated defaults
