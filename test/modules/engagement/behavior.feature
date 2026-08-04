@engagement
Feature: Shopper engagement
  As a shopper
  I want to review products and maintain a wishlist
  So that I can record purchase intent and feedback

  @UC-ENGAGEMENT-REVIEW
  Rule: Read and submit product review behavior

  @accepted @browser @SC-ENGAGEMENT-REVIEW-001
  Scenario: Display product reviews
    Given a product has public reviews
    When a shopper opens the product page
    Then the reviews are visible

  @accepted @browser @SC-ENGAGEMENT-REVIEW-002
  Scenario: Submit a review with rating
    Given an eligible shopper has a product opinion
    When the shopper submits a review with a rating
    Then the review submission is accepted

  @accepted @browser @SC-ENGAGEMENT-REVIEW-003
  Scenario: Show submitted review on product page
    Given a shopper has submitted a review
    When the shopper reloads the product page
    Then the review appears according to its visibility state

  @UC-ENGAGEMENT-WISHLIST
  Rule: Manage wishlist items and votes

  @accepted @browser @SC-ENGAGEMENT-WISHLIST-001
  Scenario: Add product to wishlist
    Given a shopper has an available engagement product
    When the shopper adds the product to the wishlist
    Then the wishlist contains the product

  @accepted @browser @SC-ENGAGEMENT-WISHLIST-002
  Scenario: View wishlist page
    Given a shopper has wishlist items
    When the shopper opens the wishlist page
    Then the wishlist items are displayed

  @accepted @browser @SC-ENGAGEMENT-WISHLIST-003
  Scenario: Remove item from wishlist
    Given the wishlist contains a product
    When the shopper removes the wishlist product
    Then the product is absent from the wishlist

  @accepted @browser @SC-ENGAGEMENT-WISHLIST-004
  Scenario: Vote on wishlist item
    Given a shopper can vote on a wishlist item
      When the shopper submits a vote
      Then the wishlist vote is recorded

  @UC-ENGAGEMENT-API
  Rule: Engagement API owns public reads, authenticated mutations, and role boundaries

    @accepted @api @SC-ENGAGEMENT-API-001
    Scenario: Read public product reviews
      Given an engagement product exists
      When the client reads public reviews for that product
      Then the engagement response status is `200`
      And the public review response is an array with review fields

    @accepted @api @security @SC-ENGAGEMENT-API-002
    Scenario: Reject review creation without authentication
      When the client creates a review without authentication
      Then the engagement response status is `401`

    @accepted @api @SC-ENGAGEMENT-API-003
    Scenario: Create a review with authentication
      Given an authenticated shopper and engagement product are available
      When the client creates a review for that product
      Then the engagement response status is `200`, `201`, or `409`

    @accepted @api @security @SC-ENGAGEMENT-API-004
    Scenario: Reject review deletion without authentication
      When the client deletes a review without authentication
      Then the engagement response status is `401`

    @accepted @api @security @SC-ENGAGEMENT-API-005
    Scenario: Reject review deletion for a non-admin shopper
      Given an authenticated shopper is available for engagement
      When the shopper deletes a review
      Then the engagement response status is `403` or `404`

    @accepted @api @SC-ENGAGEMENT-API-006
    Scenario: Read the public wishlist projection
      When the client reads the public wishlist
      Then the engagement response status is `200`
      And the wishlist response is an array

    @accepted @api @SC-ENGAGEMENT-API-007
    Scenario: Read the wishlist with authentication
      Given an authenticated shopper is available for engagement
      When the shopper reads the wishlist
      Then the engagement response status is `200`
      And the wishlist response is an array

    @accepted @api @security @SC-ENGAGEMENT-API-008
    Scenario: Reject wishlist mutation without authentication
      When the client adds a wishlist item without authentication
      Then the engagement response status is `401`

    @accepted @api @SC-ENGAGEMENT-API-009
    Scenario: Reject wishlist mutation for an invalid product
      Given an authenticated shopper is available for engagement
      When the shopper adds an invalid product to the wishlist
      Then the engagement response status is `400` or `404`

    @accepted @api @security @SC-ENGAGEMENT-API-010
    Scenario: Reject wishlist vote without authentication
      When the client votes on a wishlist item without authentication
      Then the engagement response status is `401`

    @accepted @api @security @SC-ENGAGEMENT-API-011
    Scenario: Reject wishlist deletion without authentication
      When the client deletes a wishlist item without authentication
      Then the engagement response status is `401`

  @UC-ENGAGEMENT-NOTIFICATIONS
  Rule: Notification inbox operations preserve authentication and read-state contracts

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-001
    Scenario: Read the authenticated notification inbox
      Given an authenticated shopper is available for engagement
      When the shopper reads the notification inbox
      Then the engagement response status is `200`
      And the notification response contains typed notification items

    @accepted @api @security @SC-ENGAGEMENT-NOTIFICATIONS-002
    Scenario: Reject notification inbox read without authentication
      When the client reads the notification inbox without authentication
      Then the engagement response status is `401`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-003
    Scenario: Read authenticated unread notification count
      Given an authenticated shopper is available for engagement
      When the shopper reads the unread notification count
      Then the engagement response status is `200`
      And the unread notification count is numeric

    @accepted @api @security @SC-ENGAGEMENT-NOTIFICATIONS-004
    Scenario: Reject unread notification count without authentication
      When the client reads the unread notification count without authentication
      Then the engagement response status is `401`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-005
    Scenario: Reject an invalid notification identifier
      Given an authenticated shopper is available for engagement
      When the shopper marks an invalid notification identifier as read
      Then the engagement response status is `400`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-006
    Scenario: Reject mark-read without authentication
      When the client marks a notification as read without authentication
      Then the engagement response status is `401`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-014
    Scenario: Mark one authenticated notification as read
      Given an authenticated shopper is available for engagement
      When the shopper marks an existing notification as read
      Then the engagement response status is `200` or `204`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-007
    Scenario: Mark all notifications as read
      Given an authenticated shopper is available for engagement
      When the shopper marks all notifications as read
      Then the engagement response status is `204`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-008
    Scenario: Reject mark-all-read without authentication
      When the client marks all notifications as read without authentication
      Then the engagement response status is `401`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-009
    Scenario: Clear the authenticated notification inbox
      Given an authenticated shopper is available for engagement
      When the shopper clears the notification inbox
      Then the engagement response status is `204`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-010
    Scenario: Reject notification inbox clear without authentication
      When the client clears the notification inbox without authentication
      Then the engagement response status is `401`

    @accepted @api @SC-ENGAGEMENT-NOTIFICATIONS-011
    Scenario: Queue an admin notification test send
      Given an admin notification token is available
      When the admin queues an email notification test
      Then the engagement response status is `200`
      And the notification send response is queued for email

    @accepted @api @security @SC-ENGAGEMENT-NOTIFICATIONS-012
    Scenario: Reject an admin notification test send without authentication
      When the client queues an email notification test without authentication
      Then the engagement response status is `401`

    @accepted @api @security @SC-ENGAGEMENT-NOTIFICATIONS-013
    Scenario: Reject an admin notification test send from a shopper
      Given an authenticated shopper is available for engagement
      When the shopper queues an email notification test
      Then the engagement response status is `403`
