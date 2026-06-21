# Content Scenarios

## SC-CONT-01 Curate Shared Media

- Given the content operator needs a reusable asset
- When the content operator uploads or selects media in the shared library
- Then the library makes that asset available across content surfaces
- And assets already in use remain protected from destructive removal

## SC-CONT-02 Publish Banner Set For A Page Context

- Given a page context needs banner presence
- When the content operator changes the active banner set or banner order
- Then the page context reflects the new banner priority and active state
- And inactive banners stop representing that page context

## SC-CONT-03 Edit Article Content With Dual Modes

### Scenario: Soạn thảo bài viết ở chế độ Visual WYSIWYG
  Given the content operator chooses Visual editor mode
  When the content operator types formatted text or pastes an image
  Then the editor displays the rich text formatting and inline images directly
  And the content is saved as HTML

### Scenario: Soạn thảo bài viết ở chế độ Markdown
  Given the content operator chooses Markdown editor mode
  When the content operator types Markdown syntax or pastes an image
  Then the editor displays the Markdown code and chèn mã ảnh `![image](url)` tự động
  And the content is saved as Markdown

## SC-CONT-04 Publish Article To Public Content Stream
  Given an article is ready for public reading
  When the content operator publishes the article
  Then the article becomes part of the public editorial stream
  And the storefront renders the article using Markdown or HTML dynamically based on its structure

## SC-CONT-05 Reorder FAQ Knowledge

- Given the FAQ set contains multiple answers
- When the content operator changes FAQ order or active state
- Then the public knowledge surface reflects the new answer priority
- And inactive answers stop acting as public guidance

## SC-CONT-06 Link Article to About Us Page

### Scenario: Link a published article to the About Us page
  Given a published article exists in the store content
  When the store operator selects this article for the About Us page in Store Settings
  And the store operator saves the settings
  Then the storefront About Us page displays the title and body of the linked article

### Scenario: Unlink article from the About Us page to show default company narrative
  Given the About Us page is currently linked to an article
  When the store operator selects "None" for the About Us page in Store Settings
  And the store operator saves the settings
  Then the storefront About Us page displays the default company introduction narrative

## SC-CONT-07 Update Product Editorial Context

- Given a product already exists in the catalog
- When the content operator changes product media or rich content
- Then the product gains new editorial context
- But the product's commercial state remains owned by the product domain

## SC-CONT-08 Preview Article Content

### Scenario: Preview a draft article
  Given the content operator is composing an article with draft status
  When the content operator triggers the article preview
  Then a storefront preview modal opens
  And the modal displays the draft article's title, cover image, and body content


