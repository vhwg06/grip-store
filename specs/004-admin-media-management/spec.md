# Feature Specification: Admin Media Management

**Feature Branch**: `004-admin-media-management`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "media manage features; backend ensure R2 works; frontend admin media manage; use cases: manage banner from homepage, manage article, manage product details picture and product introduction; workflow: spec -> test -> implement; store specs in /workspaces/grip-store/playwright/specs; update rule always follow it with new features"

## User Scenarios & Testing

### User Story 1 - Manage Homepage Banner Media (Priority: P1)

An admin updates homepage banner images from the admin area, using uploaded or existing R2 media assets, and the homepage hero reflects the change.

**Why this priority**: Homepage banner management is the most visible media operation and validates the full path from admin media selection to public storefront rendering.

**Independent Test**: Log in as admin, upload or select a banner image, save a banner, then verify the homepage hero uses the saved image.

**Acceptance Scenarios**:

1. **Given** an authenticated admin on banner management, **When** they upload a desktop banner image and save an active banner, **Then** the banner record stores the R2 public URL.
2. **Given** an active banner with an R2 image, **When** a visitor opens the homepage, **Then** the hero displays that image.
3. **Given** the admin selects an existing media asset, **When** they save the banner, **Then** the selected asset URL is used without requiring a re-upload.

---

### User Story 2 - Manage Article Media (Priority: P2)

An admin manages article featured images through the same media workflow used by other content areas.

**Why this priority**: Article images appear in both article listing and detail pages, so this proves reusable media selection across content pages.

**Independent Test**: Create or edit an article with a selected media asset and verify the article card and article detail show the selected image.

**Acceptance Scenarios**:

1. **Given** an authenticated admin creating an article, **When** they upload or select a featured image and save, **Then** the article stores that image URL.
2. **Given** an article has a featured image, **When** a visitor opens the article listing, **Then** the article card displays that image.
3. **Given** an article has a featured image, **When** a visitor opens the article detail page, **Then** the article detail header displays that image.

---

### User Story 3 - Manage Product Detail Media and Intro (Priority: P3)

An admin manages product main images, gallery images, and product detail introduction fields so storefront product detail pages stay current.

**Why this priority**: Product detail content affects purchase confidence, but the product form already has partial media upload support.

**Independent Test**: Edit a product with main/gallery images and intro fields, then verify the public product detail gallery and detail tabs render the saved values.

**Acceptance Scenarios**:

1. **Given** an authenticated admin editing a product, **When** they upload or select a main image, **Then** the product stores the selected R2 public URL.
2. **Given** an authenticated admin editing a product, **When** they add gallery images, **Then** the product detail gallery displays those images in order.
3. **Given** an authenticated admin updates product introduction/detail text, **When** a visitor opens the product detail page, **Then** the updated text appears in product detail tabs.

---

### User Story 4 - Manage Media Library (Priority: P4)

An admin browses, uploads, copies, selects, and deletes image media assets from a central media library.

**Why this priority**: A central library reduces duplicate uploads and supports reuse across banners, articles, and products.

**Independent Test**: Open the media library, upload an image, copy/select its URL, and delete it after confirmation.

**Acceptance Scenarios**:

1. **Given** an authenticated admin on media management, **When** they upload a valid image, **Then** the asset appears in the media grid.
2. **Given** an authenticated admin views a media asset, **When** they copy its URL, **Then** the public URL is available for reuse.
3. **Given** an authenticated admin deletes an asset, **When** the backend accepts deletion, **Then** the asset disappears from the media grid.

### Edge Cases

- Invalid or unsupported file types are rejected before requesting a presigned upload URL.
- Files larger than the configured frontend limit are rejected with a clear message.
- R2 upload or metadata registration failure leaves the form unchanged and shows an error.
- Media list/delete endpoints may be unavailable while backend work catches up; admin UI must surface the error without crashing.
- Backend may reject deletion when an asset is still referenced by content; the UI must show the backend message.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide admin-only media asset listing with image preview, filename, size, MIME type, and public URL.
- **FR-002**: System MUST support R2 direct upload through a presigned URL followed by media metadata registration.
- **FR-003**: System MUST allow admins to select existing media assets for banner, article, and product image fields.
- **FR-004**: System MUST allow admins to delete media assets when backend policy allows deletion.
- **FR-005**: System MUST reject unsupported file types and oversized files before upload.
- **FR-006**: System MUST keep banner image updates reflected on the public homepage.
- **FR-007**: System MUST keep article featured image updates reflected on article list and detail pages.
- **FR-008**: System MUST keep product image and intro/detail updates reflected on product detail pages.
- **FR-009**: System MUST store new Playwright specs under `/workspaces/grip-store/playwright/specs`.
- **FR-010**: System MUST document the expected backend media contract for R2-backed list, presign, register, and delete operations.

### Key Entities

- **Media Asset**: Uploaded image stored in R2 with id, filename, MIME type, size, public URL, and timestamps.
- **Banner**: Homepage promotional content with desktop/mobile image URLs, title, subtitle, CTA fields, sort order, and active flag.
- **Article**: Blog/news content with title, slug, content, featured image, author, tags, publish state, and publish date.
- **Product**: Store item with main image, gallery images, description, usage guide, bundled gifts, and product specs.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can upload/select and save banner, article, and product images without manually pasting a URL.
- **SC-002**: Public homepage, article pages, and product detail pages reflect saved media changes after reload.
- **SC-003**: Invalid file type and oversized file scenarios fail before network upload.
- **SC-004**: Media API contract tests document admin authorization and expected R2 media endpoint shapes.
- **SC-005**: Feature validation passes TypeScript checking and targeted Playwright specs in environments with backend media endpoints available.

## Assumptions

- This repository contains the frontend and checked-in API contract tests; the Go backend implementation may live outside this checkout.
- Frontend API calls continue using `apiFetch`, where `/api/...` maps to `/v1/...`.
- V1 media management is image-only and does not include folders, tags, or bulk editing.
- Delete behavior is backend-policy controlled; the frontend sends the request and displays acceptance or refusal.
