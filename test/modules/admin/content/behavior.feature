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

    @accepted @browser @SC-CONT-EDITOR-001
    Scenario: Soạn thảo bài viết ở chế độ Visual WYSIWYG
      Given the content operator chooses Visual editor mode
      When the content operator types formatted text or pastes an image
      Then the editor displays rich text formatting and inline images directly
      And the content is saved as HTML

    @accepted @browser @SC-CONT-EDITOR-002
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

    @accepted @browser @SC-CONT-ARTICLE-PREVIEW-001
    Scenario: Preview a draft article
      Given the content operator is composing an article with draft status
      When the content operator triggers the article preview
      Then a storefront preview modal opens
      And the modal displays the draft article's title, cover image, and body content

  @UC-CONT-ARTICLE
  Rule: Article API CRUD preserves editorial fields and public deletion semantics

    @accepted @api @security @SC-CONT-ARTICLE-API-001
    Scenario: Reject unauthenticated article creation
      When an unauthenticated client creates a content article
      Then the article creation response status is `401` or `403`

    @accepted @api @SC-CONT-ARTICLE-API-002
    Scenario: CRUD an article with editorial metadata
      Given an admin creates an article with priority tags topic and image metadata
      When the admin updates the article title and priority
      Then the admin article read contains all updated editorial fields
      And the public article detail contains the updated article
      When the admin deletes the article
      Then the public article detail returns `404`

    @accepted @api @SC-CONT-ARTICLE-API-003
    Scenario: Sort and filter public articles by editorial metadata
      Given an admin creates published articles with distinct priorities tags and topics
      When a visitor reads the public article stream
      Then the created articles are sorted by priority descending
      When a visitor filters public articles by topic and tag
      Then each filtered result preserves the requested editorial classification

  @UC-CONT-BANNER
  Rule: Public banner projection contains only active slides in sorted order

    @accepted @api @SC-CONT-BANNER-API-001
    Scenario: Manage banners and expose active slides publicly
      Given an admin creates active and inactive banners with explicit sort order
      When the admin updates the inactive banner to active with a higher priority
      Then the public homepage exposes both created slides in sort order
      And every created public slide is active

  @UC-CONT-FAQ
  Rule: Public FAQ projection contains active ordered answers only

    @accepted @api @SC-CONT-FAQ-API-001
    Scenario: Manage FAQs and expose active ordered entries publicly
      Given an admin creates active and inactive FAQs with explicit sort order
      When the admin activates and reorders the inactive FAQ
      Then the public FAQ response exposes the created entries in the new order

  @UC-CONT-ABOUT-LINK
  Rule: About page API persistence reflects updated narrative and gallery

    @accepted @api @SC-CONT-ABOUT-API-001
    Scenario: Persist About page content and gallery
      Given an admin creates About page content with a gallery
      When the admin updates the About narrative and gallery
      Then the public About page returns the updated narrative and gallery

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

  @UC-CONT-BANNER
  Rule: The desktop banner surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-BANNERS-001
    Scenario: Match the desktop banner management contract
      Given the admin opens the desktop Figma banner surface
      Then the desktop banner surface matches its visual contract

  @UC-CONT-MEDIA
  Rule: The desktop media surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-MEDIA-001
    Scenario: Match the desktop media management contract
      Given the admin opens the desktop Figma media surface
      Then the desktop media surface matches its visual contract

  @UC-CONT-FAQ
  Rule: The desktop FAQ surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-FAQS-001
    Scenario: Match the desktop FAQ contract
      Given the admin opens the desktop Figma FAQ surface
      Then the desktop FAQ surface matches its visual contract

  @UC-CONT-ARTICLE
  Rule: The desktop article surface preserves its visual contract

    @accepted @browser @visual @SC-VISUAL-ADMIN-ARTICLES-001
    Scenario: Match the desktop article management contract
      Given the admin opens the desktop Figma article surface
      Then the desktop article management surface matches its visual contract
