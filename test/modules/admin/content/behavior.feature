@admin @content
Feature: Admin content operations
  As a content operator
  I want to manage shared editorial content
  So that public content surfaces remain coherent

  @UC-CONT-MEDIA
  Rule: Shared media remains reusable without destructive loss

    @accepted @api @SC-CONT-MEDIA-001
  Scenario: Curate Shared Media
    Given the content operator needs a reusable asset
    When the content operator uploads or selects media in the shared library
    Then the library makes that asset available across content surfaces
    And assets already in use remain protected from destructive removal

    @accepted @api @security @SC-CONT-MEDIA-002
    Scenario: Reject an unauthenticated media library read
      When an unauthenticated client reads the shared media library
      Then the shared media response status is `401` or `403`

    @accepted @api @security @SC-CONT-MEDIA-003
    Scenario: Reject a shopper media library read
      Given a shopper token is available for content access
      When the shopper reads the shared media library
      Then the shared media response status is `403`

  @UC-CONT-BANNER
  Rule: Banner sets are managed per page context

    @accepted @api @SC-CONT-BANNER-001
  Scenario: Publish Banner Set For A Page Context
    Given a page context needs banner presence
    When the content operator changes the active banner set or banner order
    Then the page context reflects the new banner priority and active state
    And inactive banners stop representing that page context

  @UC-CONT-EDITOR
  Rule: Articles support both editorial modes

    @accepted @api @SC-CONT-EDITOR-001
    Scenario: Soạn thảo bài viết ở chế độ Visual WYSIWYG
      Given the content operator chooses Visual editor mode
      When the content operator types formatted text or pastes an image
      Then the editor displays rich text formatting and inline images directly
      And the content is saved as HTML

    @accepted @api @SC-CONT-EDITOR-002
    Scenario: Soạn thảo bài viết ở chế độ Markdown
      Given the content operator chooses Markdown editor mode
      When the content operator types Markdown syntax or pastes an image
      Then the editor displays Markdown code and inserts image syntax automatically
      And the content is saved as Markdown

  @UC-CONT-ARTICLE
  Rule: Articles move from editorial state to public reading state

    @accepted @api @SC-CONT-ARTICLE-001
  Scenario: Publish Article To Public Content Stream
    Given an article is ready for public reading
    When the content operator publishes the article
    Then the article becomes part of the public editorial stream
    And the storefront renders the article using its stored structure

  @UC-CONT-FAQ
  Rule: FAQ knowledge is ordered and selectively public

    @accepted @api @SC-CONT-FAQ-001
  Scenario: Reorder FAQ Knowledge
    Given the FAQ set contains multiple answers
    When the content operator changes FAQ order or active state
    Then the public knowledge surface reflects the new answer priority
    And inactive answers stop acting as public guidance

  @UC-CONT-ABOUT-LINK
  Rule: Store settings can link or unlink editorial content

    @accepted @api @SC-CONT-ABOUT-LINK-001
    Scenario: Link a published article to the About Us page
      Given a published article exists in the store content
      When the store operator selects this article for the About Us page in Store Settings
      And the store operator saves the settings
      Then the storefront About Us page displays the title and body of the linked article

    @accepted @api @SC-CONT-ABOUT-LINK-002
    Scenario: Unlink article from the About Us page to show default company narrative
      Given the About Us page is currently linked to an article
      When the store operator selects "None" for the About Us page in Store Settings
      And the store operator saves the settings
      Then the storefront About Us page displays the default company introduction narrative

  @UC-CONT-PRODUCT-EDITORIAL
  Rule: Product editorial context stays separate from commercial state

    @accepted @api @SC-CONT-PRODUCT-EDITORIAL-001
  Scenario: Update Product Editorial Context
    Given a product already exists in the catalog
    When the content operator changes product media or rich content
    Then the product gains new editorial context
    But the product's commercial state remains owned by the product domain

  @UC-CONT-ARTICLE-PREVIEW
  Rule: Draft articles can be previewed without publication

    @accepted @api @SC-CONT-ARTICLE-PREVIEW-001
  Scenario: Preview a draft article
    Given the content operator is composing an article with draft status
    When the content operator triggers the article preview
    Then a storefront preview modal opens
    And the modal displays the draft article's title, cover image, and body content

  @UC-CONT-UI
  Rule: Admin content browser surfaces expose ownership and editorial controls

    @accepted @browser @SC-CONT-UI-001
    Scenario: Open the shared media picker from settings
      Given an admin opens content settings
      When the admin opens the shared media picker
      Then reusable media items are visible in the picker

    @accepted @browser @SC-CONT-UI-002
    Scenario: Inspect banner ownership controls
      Given an admin opens banner management
      Then banner page-context controls are visible

    @accepted @browser @SC-CONT-UI-003
    Scenario: Inspect article publishing and About ownership controls
      Given an admin opens article management
      Then article list and About ownership controls are visible

    @accepted @browser @SC-CONT-UI-004
    Scenario: Inspect FAQ ordering and visibility controls
      Given an admin opens FAQ management
      Then FAQ ordering and public-visibility controls are visible

    @accepted @browser @SC-CONT-UI-005
    Scenario: Keep product editorial work inside product editor context
      Given an admin opens product management for editorial review
      Then product editor entry points are visible
