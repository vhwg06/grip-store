@admin @order
Feature: Order operations
  As an operations administrator
  I want to inspect server-owned order context and perform only allowed transitions
  So that order handling remains deliberate and consistent

  @UC-ORD-QUEUE
  Rule: The order queue is a server projection for operational triage

    @accepted @api @SC-ORD-QUEUE-001
    Scenario: Read the order queue
      Given an operations admin is authenticated for order operations
      And the order queue contains orders with server states and action signals
      When the admin reads page 1 of the order queue
      Then each queue row exposes its order identity, status, customer, total, and allowed actions

    @accepted @api @empty-result @SC-ORD-QUEUE-002
    Scenario: Read an empty filtered queue
      Given an operations admin is authenticated for order operations
      When the admin filters the order queue by a non-existent order identifier
      Then the queue returns an empty result without an error boundary

    @accepted @api @SC-ORD-QUEUE-003
    Scenario: Filter the queue without mutating an order
      Given an operations admin is authenticated for order operations
      And the existing order `test-order-0001` has a known server status
      When the admin filters the order queue for `test-order-0001`
      Then the matching queue row preserves that server status
      And the filter request does not mutate the order

    @accepted @api @security @SC-ORD-QUEUE-004
    Scenario: Reject an unauthenticated order queue read
      Given no admin authentication is supplied
      When the client reads the admin order queue
      Then the order queue request returns `401`

    @accepted @api @security @SC-ORD-QUEUE-005
    Scenario: Reject a non-admin order queue read
      Given a normal authenticated customer is not an operations admin
      When that customer reads the admin order queue
      Then the order queue request returns `403`

  @UC-ORD-DETAIL
  Rule: Order detail is the complete context before an operational decision

    @accepted @api @SC-ORD-DETAIL-001
    Scenario: Read complete order detail before deciding
      Given an operations admin opens the existing order `test-order-0001`
      When the system reads its summary, items, shipping, payment, timeline, and notes context
      Then the detail contains the order facts needed for an operational decision
      And the available actions reflect the order's current server status
      And no order state changes before an action is submitted

    @accepted @api @not-found @SC-ORD-DETAIL-002
    Scenario: Read a missing order
      Given an operations admin is authenticated for order operations
      When the admin opens a non-existent order detail
      Then the order detail request returns `404`

    @accepted @api @partial-context @SC-ORD-DETAIL-003
    Scenario: Read an order with missing optional context
      Given an operations admin reads the existing order `test-order-0002` with missing optional context
      When the admin reads the order detail
      Then the order's operational facts remain readable
      And the customer email remains available while phone, shipping address, and payment method are empty
      And the admin may defer decisions that require the missing context

  @UC-ORD-TRANSITION
  Rule: The backend owns the allowed order transition matrix

    @accepted @api @SC-ORD-TRANSITION-001
    Scenario: Execute an allowed transition atomically
      Given an operations admin has created a new order in `PENDING` state
      When the admin submits the allowed `PENDING` to `PAID` transition
      Then the transition is accepted without a partial response
      When the admin rereads the transitioned order
      Then the order status is `PAID`
      And the timeline contains `PENDING` before `PAID`

    @accepted @api @invalid-transition @SC-ORD-TRANSITION-002
    Scenario: Reject a disallowed transition
      Given an operations admin has created a new order in `PENDING` state
      When the admin attempts to move it directly to `DELIVERED`
      Then the transition is rejected with a client or conflict error
      And the order remains in `PENDING` state

    @accepted @api @terminal-state @SC-ORD-TRANSITION-003
    Scenario: Terminal order exposes no ordinary transition
      Given an operations admin reads the delivered order `test-order-0001`
      When the admin reads the allowed actions for that order
      Then no ordinary order transition is available

    @accepted @api @SC-ORD-TRANSITION-006
    Scenario: Reject a malformed order transition payload
      Given an operations admin is authenticated for order operations
      When the admin submits a malformed `REFUNDED` order transition for `test-order-0002`
      Then the order transition request returns `400`

    @accepted @api @SC-ORD-TRANSITION-007
    Scenario: Delete an admin-created order after cancelling it
      Given an operations admin has created a new order in `PENDING` state
      When the admin cancels and deletes that order through the admin API
      Then the order cancellation and deletion are accepted
      And a fresh order read returns `404`

  @UC-ORD-HISTORY
  Rule: Purchase history is a read projection of the order customer identity

    @accepted @api @SC-ORD-HISTORY-001
    Scenario: Read customer purchase history from an order
      Given an operations admin is reading an order detail with a resolved customer identity
      When the admin opens purchase history using that same customer identity
      Then the history query resolves the same customer
      And the response returns the customer's earlier orders without mutating the current order

    @accepted @api @empty-result @SC-ORD-HISTORY-002
    Scenario: Empty customer purchase history remains valid
      Given an operations admin has identified a customer with no orders
      When the admin reads that customer's purchase history
      Then the history response is successful and contains zero orders

  @UC-ORD-REFUND-CONTEXT
  Rule: Refund context is visible but refund ownership remains separate

    @accepted @api @SC-ORD-REFUND-CONTEXT-001
    Scenario: Read refund relevance without deciding the refund
      Given an operations admin is processing an order with a pending refund request
      When the admin reads the order refund signal and pending refund queue
      Then the order context exposes the refund relevance
      And the admin can open refund context for the decision state
      But the order response does not decide the refund outcome

  @UC-ORD-QUEUE
  Rule: The admin order queue exposes the same server projection through the browser

    @accepted @browser @SC-ORD-QUEUE-006
    Scenario: Open a pending order from the admin queue
      Given an admin has created a pending order for browser inspection
      When the admin opens the order queue in the browser
      Then the pending order row shows its server state and disabled invalid action
      When the admin opens that order from the queue row
      Then the browser enters the matching order detail route

    @accepted @browser @SC-ORD-QUEUE-007
    Scenario: Render an empty filtered order queue
      Given an admin is viewing the order queue in the browser
      When the admin filters the browser queue by a non-existent order identifier
      Then the browser shows an empty order state without an error boundary

    @accepted @browser @SC-ORD-QUEUE-008
    Scenario: Filter the browser order queue to matching rows
      Given an admin is viewing the order queue in the browser
      When the admin filters the browser queue for `test-order-0001`
      Then only matching order rows are visible in the browser queue

  @UC-ORD-DETAIL
  Rule: The browser detail view must preserve operational context and safe fallbacks

    @accepted @browser @SC-ORD-DETAIL-004
    Scenario: Read complete order detail in the browser
      Given an admin opens the delivered order detail in the browser
      Then the browser shows order identity customer payment timeline and terminal context

    @accepted @browser @SC-ORD-DETAIL-005
    Scenario: Read incomplete order detail with safe fallbacks in the browser
      Given an admin opens the incomplete order detail in the browser
      Then the browser keeps the order readable and shows safe missing-context fallbacks

    @accepted @browser @SC-ORD-DETAIL-006
    Scenario: Opening a missing order shows a not-found state in the browser
      Given an admin opens a missing order detail in the browser
      Then the browser shows the order not-found state

  @UC-ORD-TRANSITION
  Rule: Browser transition controls reflect the server-owned order state machine

    @accepted @browser @SC-ORD-TRANSITION-004
    Scenario: Execute a valid transition from the browser queue
      Given an admin has created a pending order for browser transition
      When the admin marks that order as paid from the browser queue
      Then a fresh admin read shows the order as paid with a payment timestamp

    @accepted @browser @SC-ORD-TRANSITION-005
    Scenario: Terminal order exposes no browser transition controls
      Given an admin opens the delivered order detail in the browser
      Then the browser disables ordinary order transition controls

  @UC-ORD-HISTORY
  Rule: Browser customer history navigation preserves the selected customer identity

    @accepted @browser @SC-ORD-HISTORY-003
    Scenario: Open customer purchase history from an order customer
      Given an admin has an order belonging to a known customer in the browser
      When the admin opens that customer's purchase history
      Then the browser opens the customer order projection for the same customer

    @accepted @browser @SC-ORD-HISTORY-004
    Scenario: Render an empty customer purchase history in the browser
      Given an admin has a newly registered customer with no orders in the browser
      When the admin opens that customer's purchase history
      Then the browser shows no orders found without crashing

  @UC-ORD-QUEUE
  Rule: The desktop order surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-ORDERS-001
    Scenario: Match the desktop orders contract
      Given the admin opens the desktop Figma orders surface
      Then the desktop orders surface matches its visual contract
