@content
Feature: Public content
  As a visitor
  I want to read the store's public content
  So that editorial and contact information are discoverable

  @UC-CONTENT-ABOUT
  Rule: Read the public About narrative and gallery

  @accepted @browser @SC-CONTENT-ABOUT-001
  Scenario: Render About page
    Given a visitor opens the About page
    When the page loads
    Then the About content is visible

  @accepted @browser @SC-CONTENT-ABOUT-002
  Scenario: Render dynamic About narrative and gallery
    Given the store has an About narrative and gallery
    When a visitor opens the About page
    Then the dynamic narrative and gallery are displayed

  @UC-CONTENT-ARTICLE
  Rule: Browse and read public articles

  @accepted @browser @SC-CONTENT-ARTICLE-001
  Scenario: Render article list
    Given published articles exist
    When a visitor opens the article list
    Then article cards are visible

  @accepted @browser @SC-CONTENT-ARTICLE-002
  Scenario: Navigate to article detail
    Given a visitor sees an article
    When the visitor opens it
    Then the article detail is displayed

  @accepted @browser @SC-CONTENT-ARTICLE-003
  Scenario: Display article content
    Given an article detail exists
    When a visitor opens the detail
    Then the article content is displayed

  @accepted @browser @SC-CONTENT-ARTICLE-004
  Scenario: Paginate articles
    Given the article list has multiple pages
    When a visitor changes the page
    Then the corresponding article page is displayed

  @UC-CONTENT-CONTACT
  Rule: Read and submit public contact information

  @accepted @browser @SC-CONTENT-CONTACT-001
  Scenario: Render contact form
    Given a visitor opens the Contact page
    When the page loads
    Then the contact form is visible

  @accepted @browser @SC-CONTENT-CONTACT-002
  Scenario: Display contact map
    Given the store has a contact map configuration
    When a visitor opens the Contact page
    Then the map embed is visible

  @accepted @browser @SC-CONTENT-CONTACT-003
  Scenario: Display company contact information
    Given the store has contact information
    When a visitor opens the Contact page
    Then the company contact information is visible

  @accepted @browser @SC-CONTENT-CONTACT-004
  Scenario: Submit contact form
    Given a visitor has entered valid contact details
    When the visitor submits the contact form
    Then the contact request is accepted

