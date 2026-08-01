@auth
Feature: Authentication
  As a shopper or account holder
  I want to authenticate and maintain a session
  So that protected flows have an explicit identity

  @UC-AUTH-LOGIN
  Rule: Log in and validate credentials

  @accepted @browser @SC-AUTH-LOGIN-001
  Scenario: Log in with valid credentials
    Given a registered account has valid credentials
    When the account submits the login form
    Then the account is authenticated

  @accepted @browser @SC-AUTH-LOGIN-002
  Scenario: Reject invalid credentials
    Given an account submits invalid credentials
    When the login request is processed
    Then the system shows an authentication error

  @accepted @browser @SC-AUTH-LOGIN-003
  Scenario: Validate empty login fields
    Given the login form has required fields
    When the account submits the form without required values
    Then the system shows validation errors

  @UC-AUTH-OAUTH
  Rule: Initiate the OAuth redirect

  @accepted @browser @SC-AUTH-OAUTH-001
  Scenario: Initiate OAuth redirect
    Given the account chooses OAuth authentication
    When the account starts the OAuth flow
    Then the system initiates the provider redirect

  @UC-AUTH-SESSION
  Rule: Maintain and invalidate an authenticated session

  @accepted @browser @SC-AUTH-SESSION-001
  Scenario: Persist session after refresh
    Given an account has an authenticated session
    When the account refreshes the page
    Then the session remains available

  @accepted @browser @SC-AUTH-SESSION-002
  Scenario: Log out and invalidate session
    Given an account has an authenticated session
    When the account logs out
    Then the session is invalidated

  @UC-AUTH-SIGNUP
  Rule: Register and validate a new account

  @accepted @browser @SC-AUTH-SIGNUP-001
  Scenario: Show registration form
    Given a visitor opens registration
    When the registration surface loads
    Then the registration form is visible

  @accepted @browser @SC-AUTH-SIGNUP-002
  Scenario: Validate empty registration fields
    Given a visitor submits registration without required fields
    When the registration request is processed
    Then the system shows validation errors

  @accepted @browser @SC-AUTH-SIGNUP-003
  Scenario: Reject duplicate email registration
    Given an email already belongs to an account
    When a visitor registers with that email
    Then the system shows a duplicate-email error

  @accepted @browser @SC-AUTH-SIGNUP-004
  Scenario: Register with a unique email
    Given a visitor has a unique registration email
      When the visitor submits valid registration details
      Then the account registration is accepted

  @UC-AUTH-API
  Rule: Authentication API owns credential, session, and token boundary responses

    @accepted @api @SC-AUTH-API-001
    Scenario: Login API returns access and refresh tokens
      Given the configured shopper credentials are valid
      When the client posts those credentials to the login API
      Then the login API response status is `200`
      And the login API response contains an access token and refresh token

    @accepted @api @SC-AUTH-API-002
    Scenario: Login API rejects invalid credentials
      Given invalid shopper credentials are supplied
      When the client posts those credentials to the login API
      Then the login API response status is `401`

    @accepted @api @SC-AUTH-API-003
    Scenario: Login API validates a missing email
      Given a login request has no email
      When the client posts that login request to the login API
      Then the login API response status is `400` or `422`

    @accepted @api @SC-AUTH-API-004
    Scenario: Read the authenticated user profile through auth API
      Given a valid shopper access token is available
      When the client reads the authenticated user endpoint
      Then the authenticated user response status is `200`
      And the authenticated user response contains identity and role

    @accepted @api @security @SC-AUTH-API-005
    Scenario: Reject an unauthenticated authenticated-user read
      When the client reads the authenticated user endpoint without a token
      Then the authenticated user response status is `401`

    @accepted @api @SC-AUTH-API-006
    Scenario: Refresh a valid session token
      Given a valid refresh token is available
      When the client posts that refresh token to the refresh API
      Then the refresh API response status is `200`
      And the refresh API response contains access and refresh tokens

    @accepted @api @security @SC-AUTH-API-007
    Scenario: Reject an invalid refresh token
      When the client posts an invalid refresh token to the refresh API
      Then the refresh API response status is `401`

    @accepted @api @SC-AUTH-API-008
    Scenario: Logout an authenticated session
      Given a valid shopper access token is available
      When the client logs out with that token
      Then the logout API response status is `200`, `204`, or `400`

    @accepted @api @security @SC-AUTH-API-009
    Scenario: Reject logout without authentication
      When the client logs out without a token
      Then the logout API response status is `401`

  @UC-AUTH-PROFILE
  Rule: Profile read models require authentication and exclude removed loyalty surfaces

    @accepted @api @SC-AUTH-PROFILE-001
    Scenario: Read the authenticated shopper profile
      Given a valid shopper access token is available
      When the client reads the shopper profile endpoint
      Then the shopper profile response status is `200`
      And the shopper profile exposes an identity

    @accepted @api @security @SC-AUTH-PROFILE-002
    Scenario: Reject shopper profile read without authentication
      When the client reads the shopper profile endpoint without authentication
      Then the shopper profile response status is `401`

    @accepted @api @security @SC-AUTH-PROFILE-003
    Scenario: Reject shopper email update without authentication
      When the client updates shopper email without authentication
      Then the shopper profile response status is `401`

    @accepted @api @security @SC-AUTH-PROFILE-004
    Scenario: Reject shopper notification update without authentication
      When the client updates shopper notifications without authentication
      Then the shopper profile response status is `401`

    @accepted @api @SC-AUTH-PROFILE-005
    Scenario: Read the legacy shopper profile projection
      Given a valid shopper access token is available
      When the client reads the legacy shopper profile endpoint
      Then the shopper profile response status is `200`
      And the legacy shopper profile does not expose loyalty points

    @accepted @api @security @SC-AUTH-PROFILE-006
    Scenario: Reject legacy shopper profile read without authentication
      When the client reads the legacy shopper profile endpoint without authentication
      Then the shopper profile response status is `401`

    @accepted @api @SC-AUTH-PROFILE-007
    Scenario: Keep removed check-in mutation absent
      Given a valid shopper access token is available
      When the client posts to the removed check-in endpoint
      Then the shopper profile response status is `404`

    @accepted @api @SC-AUTH-PROFILE-008
    Scenario: Keep removed check-in read models absent
      When the client reads the removed check-in status endpoints
      Then every removed check-in endpoint responds with `404`
