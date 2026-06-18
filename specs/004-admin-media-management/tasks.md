# Feature 004 – Admin Content & Media Management
## Superseded Task Plan

> `004-admin-media-management` không còn được dùng để mở work mới.
> Mọi task mới phải đi qua module split trong [specs/admin-module-map.md](/Users/cynus/Desktop/grip-store/specs/admin-module-map.md:1).
>
> Mapping:
> - storefront settings -> `005-admin-store-settings`
> - content/media/articles/about/faqs -> `007-admin-content-ops`
> - product content/media thuộc catalog -> `008-admin-catalog-ops`

Spec: [spec.md](file:///Users/cynus/Desktop/grip-store/specs/004-admin-media-management/spec.md)  
API base: `https://grip.vn/api` (production, no mocking)

---

## 1. Các loại Test cần viết

### Phân loại test theo Use Case

| User Story | Test Type | File đích |
|---|---|---|
| US-1 Banner | E2E (Playwright) – admin CRUD | `playwright/specs/admin/banners.spec.ts` |
| US-1 Banner | E2E (Playwright) – public render | `playwright/specs/browse/hero-banner.spec.ts` |
| US-2 Media Library | E2E – upload / delete / picker | `playwright/specs/admin/media-library.spec.ts` |
| US-3 Article | E2E – admin CRUD + publish | `playwright/specs/admin/articles.spec.ts` |
| US-3 Article | E2E – public News-Blog | `playwright/specs/content/articles.spec.ts` (mở rộng) |
| US-4 Product Content | E2E – admin media+content edit | `playwright/specs/admin/product-content.spec.ts` |
| US-4 Product Content | E2E – public gallery render | `playwright/specs/browse/product-gallery.spec.ts` |
| US-5 Site Config | E2E – admin settings + public reflect | `playwright/specs/admin/site-config.spec.ts` |
| US-6 About-Us | E2E – content + gallery | `playwright/specs/content/about.spec.ts` (mở rộng) |
| US-7 FAQ | E2E – admin CRUD + public render | `playwright/specs/admin/faqs.spec.ts` |

### Test Patterns cần dùng

```
Pattern A – Admin CRUD flow:
  1. Login → navigate admin page
  2. Create record → assert trong list
  3. Toggle active → assert state
  4. Delete → assert biến mất

Pattern B – Public render (dùng route intercept):
  1. Stub API response với seeded data
  2. Stub R2 image URL với tinyPng
  3. Navigate public page
  4. Assert img[src] khớp R2 URL

Pattern C – Upload flow:
  1. Stub presign → stub PUT → stub register
  2. setInputFiles()
  3. Assert blob preview xuất hiện
  4. Assert src sau khi save là R2 URL (không phải blob)

Pattern D – Edge case (empty/single):
  1. Stub API trả về [] hoặc [1 item]
  2. Assert fallback UI (ẩn hero / FallbackPageHeader / ẩn arrows)
```

---

## 2. Playwright Test Breakdown chi tiết

### 2.1 Banner Tests (`playwright/specs/admin/banners.spec.ts`)

> **Hiện trạng**: `media-management.spec.ts` đã có test cho banner upload preview và full flow.  
> **Cần tách** thành file riêng và **bổ sung** các scenario còn thiếu.

**Tests cần có:**

```
[NEW] banners.spec.ts
  describe("Admin Banners – CRUD @admin")
    ✅ US1-S1: Filter banners by target_page (Homepage/News/About-Us/Products)
    ✅ US1-S2: Upload desktop image → assert R2 URL saved + gắn đúng target_page
    ✅ US1-S3: Toggle is_active → deactivated banner không xuất hiện public
    ✅ US1-S4: Reorder sort_order → public slideshow theo thứ tự mới
    ✅ US1-S5: Delete banner → row biến mất
    
  describe("Banner – target_page validation @admin")
    ✅ Invalid target_page → 422 response shown in UI

  describe("Banner – Public render @browse")
    ✅ US1-S6: banners[] rỗng → Homepage: Hero Section ẩn
    ✅ US1-S7: banners[] rỗng → Sub-page: FallbackPageHeader '#99782b' + tên trang
    ✅ US1-S8: banner length === 1 → Prev/Next arrows ẩn, auto-play tắt
    ✅ DD-002: isMobile + no mobile_image → dùng desktop_image_url
```

### 2.2 Media Library Tests (`playwright/specs/admin/media-library.spec.ts`)

> **Hiện trạng**: file `media-management.spec.ts` có 1 số test upload. Tách và mở rộng.

```
[NEW] media-library.spec.ts
  describe("Media Library @admin")
    ✅ US2-S1: Upload valid image → grid hiển thị với preview, filename, size, MIME, URL
    ✅ US2-S2: Click "Copy URL" → clipboard chứa R2 public URL
    ✅ US2-S3: Media Picker mở từ Banner form → chọn ảnh → điền vào field
    ✅ US2-S3b: Media Picker mở từ Article form → chọn ảnh
    ✅ US2-S3c: Media Picker mở từ Product form → chọn ảnh
    ✅ US2-S4: Xoá asset không dùng → biến mất khỏi grid
    ✅ US2-S5: Xoá asset đang dùng → backend 409 → UI hiển thị error, không xoá
    ✅ US2-S6: Upload sai format (.pdf, .mp4) → rejected client-side, không gửi request
    ✅ US2-S6b: Upload > 5MB → rejected client-side với message rõ ràng
    ✅ Edge: R2 upload thất bại → form giữ nguyên, hiển thị lỗi
    ✅ Edge: presign URL expired (simulate 400) → client báo lỗi, yêu cầu thử lại
```

### 2.3 Article Tests

**Admin** (`playwright/specs/admin/articles.spec.ts`):
```
  describe("Admin Articles – CRUD @admin")
    ✅ US3-S1: Article list hiển thị title, status, created_at, action buttons
    ✅ US3-S2: Tạo bài viết → saved với Draft status
    ✅ US3-S4: Publish bài viết → status chuyển Published
    ✅ US3-S4b: Unpublish → status về Draft
    ✅ US3-S5: Edit content + save → nội dung cập nhật
    ✅ US3-S7: Delete article → 404 trên public URL
    ✅ Edge: Article không có featured image → card dùng placeholder
    ✅ Edge: Draft article → không accessible qua public URL
```

**Public** (`playwright/specs/content/articles.spec.ts` – mở rộng):
```
  describe("News-Blog Public @content")
    ✅ US3-S3: Published article xuất hiện trên News-Blog list
    ✅ US3-S4c: Article detail: featured image, title, publish date, author, content
    ✅ US3-S8: Homepage Latest News section hiển thị N bài mới nhất
    ✅ Edge: Article content dài → render đúng, không bị truncate
```

### 2.4 Product Content Tests (`playwright/specs/admin/product-content.spec.ts`)

```
  describe("Product Content – Admin @admin")
    ✅ US4-S1: Mở Product Editor → thấy tab Media & Content
    ✅ US4-S2: Thay main image → product card + detail cập nhật
    ✅ US4-S3: Add gallery images → detail gallery hiển thị đúng
    ✅ US4-S3b: Xoá gallery image → ảnh biến mất
    ✅ US4-S3c: Reorder gallery → thứ tự mới hiển thị đúng
    ✅ US4-S4: Cập nhật introduction rich text → tab Giới thiệu cập nhật
    ✅ US4-S5: Cập nhật detail content → tab Chi tiết cập nhật
    ✅ Edge: FR-D07: gallery ≤ 1 → thumbnail switcher ẩn
    ✅ Edge: FR-D08: main_image null → placeholder hiển thị
    ✅ Edge: gallery rỗng → không có thumbnail switcher
    ✅ Edge: rich text rỗng → tab ẩn hoặc placeholder text
```

### 2.5 Site Config Tests (`playwright/specs/admin/site-config.spec.ts`)

```
  describe("Site Config @admin")
    ✅ US5-S1: Upload logo → public header + footer cập nhật
    ✅ US5-S2: Update stickyBarAddress + stickyBarHotline → sticky bar cập nhật
    ✅ US5-S3: Toggle floating button + change link → appears/disappears public
    ✅ US5-S4: Update footerColumns → footer public phản ánh
    ✅ US5-S5: Update footerCopyright → copyright text cập nhật
    ✅ US5-S6: Update socialLinks → footer social icons link đúng
    ✅ US5-S7: homepageNewsCount = 6 → homepage shows exactly 6 articles
    ✅ US5-S8: Update mapEmbedUrl → Contact page dùng iframe mới
    ✅ Edge: Logo chưa set → default logo từ codebase
    ✅ Edge: mapEmbedUrl không hợp lệ → fallback text thay vì iframe lỗi
    ✅ Edge: homepageNewsCount = 0 → ẩn hoàn toàn section Latest News
    ✅ Edge: Floating button link null → button ẩn
```

### 2.6 About-Us Tests (`playwright/specs/content/about.spec.ts` – mở rộng)

```
  describe("About-Us Content @content")
    ✅ US6-S1: Editor hiển thị current aboutContent
    ✅ US6-S2: Update aboutContent → public About page cập nhật
    ✅ US6-S3: Add ảnh vào aboutGallery → gallery public hiển thị
    ✅ US6-S4: Xoá ảnh khỏi aboutGallery → ảnh biến mất
    ✅ US6-S5: Reorder aboutGallery → thứ tự mới đúng
    ✅ US6-S6: aboutGallery rỗng → gallery section ẩn
```

### 2.7 FAQ Tests (`playwright/specs/admin/faqs.spec.ts`)

```
  describe("FAQ Management @admin")
    ✅ US7-S1: Tạo FAQ → xuất hiện trên Contact page đúng sort_order
    ✅ US7-S2: Toggle is_active = false → ẩn khỏi public Contact
    ✅ US7-S3: Delete FAQ → biến mất hoàn toàn
    ✅ US7-S4: Reorder sort_order → Contact page đúng thứ tự mới
```

---

## 3. Frontend (FE) Tasks Breakdown

### FE-A: Domain Types & API Adapters

#### [MODIFY] [banner.ts](file:///Users/cynus/Desktop/grip-store/src/domain/banner.ts)
- Thêm `targetPage: 'homepage' | 'news' | 'about-us' | 'products'`
- Thêm `id: string`, `isActive: boolean`, `sortOrder: number`

#### [MODIFY] [banners.api.ts](file:///Users/cynus/Desktop/grip-store/src/adapters/api/banners.api.ts)
- Thêm `getBannersByPage(page: TargetPage)` → `GET /api/v1/banners?page={targetPage}`
- Thêm `getAdminBannersByPage(page?: TargetPage)` → `GET /api/v1/admin/banners?page={targetPage}`
- Thêm `createBanner(data)` → `POST /api/v1/admin/banners`
- Thêm `updateBanner(id, data)` → `PUT /api/v1/admin/banners/:id`
- Thêm `toggleBanner(id)` → `PATCH /api/v1/admin/banners/:id/toggle`
- Thêm `deleteBanner(id)` → `DELETE /api/v1/admin/banners/:id`

#### [MODIFY] [articles.api.ts](file:///Users/cynus/Desktop/grip-store/src/adapters/api/articles.api.ts)
- Cập nhật endpoint public → `/api/v1/articles` + `/api/v1/articles/:slug`
- Thêm admin endpoints: `createArticle`, `updateArticle`, `togglePublish`, `deleteArticle` → `/api/v1/admin/articles`

#### [MODIFY] [faq.api.ts](file:///Users/cynus/Desktop/grip-store/src/adapters/api/faq.api.ts)
- Cập nhật public endpoint → `/api/v1/faqs`
- Thêm admin CRUD: `createFAQ`, `updateFAQ`, `toggleFAQ`, `deleteFAQ`

#### [MODIFY] [site-config.api.ts](file:///Users/cynus/Desktop/grip-store/src/adapters/api/site-config.api.ts)
- Cập nhật endpoint → `/api/v1/site-config`
- Thêm `updateSiteConfig(partial)` → `PUT /api/v1/admin/site-config`

#### [NEW] `src/adapters/api/product-content.api.ts`
- `updateProductMedia(id, { mainImageUrl, galleryImages })` → `PATCH /api/v1/admin/products/:id/media`
- `updateProductContent(id, { introduction, detailContent })` → `PATCH /api/v1/admin/products/:id/content`

#### [MODIFY] [site-config.ts](file:///Users/cynus/Desktop/grip-store/src/domain/site-config.ts)
- Thêm fields: `shopLogo`, `stickyBarAddress`, `stickyBarHotline`, `mapEmbedUrl`, `aboutContent`, `aboutGallery`, `homepageNewsCount`, `footerCopyright`

---

### FE-B: Admin Pages

#### [MODIFY] Admin Banners Page (`src/app/admin/banners/page.tsx`)
- Thêm **tab filter** per `target_page`: Homepage / News / About-Us / Products
- Hiển thị danh sách banners của page đang chọn
- **Add form**: desktop image (MediaUploader), optional mobile image, title, subtitle, sort_order, is_active, target_page select
- Toggle active / delete với confirmation dialog
- Drag-drop reorder hoặc sort_order input

#### [NEW] Admin Media Library Page (`src/app/admin/media/page.tsx`)
- Grid ảnh với preview, filename, MIME, size, URL
- Upload via `input[type=file]` → validate format + size → R2 presign flow
- Copy URL button → clipboard
- Delete với guard (backend reject 409 nếu đang dùng)
- `data-testid="admin-media-library"`, `data-testid="media-asset-card"`, `data-testid="media-file-input"`

#### [NEW] Media Picker Modal Component (`src/components/MediaPickerModal.tsx`)
- Reusable across Banner, Article, Product, SiteConfig forms
- Grid browsing + search + pagination
- On select: gọi callback với `public_url`
- `data-testid="media-picker-modal"`, `data-testid="media-picker-item"`

#### [MODIFY] Admin Articles Page (`src/app/admin/articles/page.tsx`)
- List với title, status badge, dates, Edit/Delete actions
- Status filter (All / Draft / Published)

#### [NEW] Admin Article Edit Page (`src/app/admin/article/[id]/page.tsx`)
- Fields: title, slug (auto + editable), excerpt, featured image (MediaPicker), author, tags, status
- **Tiptap rich text editor** cho `content`
- Publish/Unpublish toggle
- `data-testid="article-featured-media"`, `data-testid="article-content-editor"`

#### [MODIFY] Admin Product Page – Media & Content Tab
- Tab "Media & Content" trong product editor
- Main image field (MediaPicker)
- Gallery manager: add/remove/reorder
- Tiptap editor cho `introduction`
- Tiptap editor cho `detail_content`
- `data-testid="product-main-media"`, `data-testid="product-gallery-media"`

#### [NEW/MODIFY] Admin Site Config Page (`src/app/admin/settings/page.tsx`)
- Logo upload (MediaPicker)
- Sticky bar: address + hotline inputs
- Floating buttons: toggle + link per type
- Footer columns manager
- Footer copyright text
- Social links key-value
- `homepageNewsCount` number input
- Map embed URL input
- About-Us rich text + gallery manager

#### [NEW] Admin FAQ Page (`src/app/admin/faqs/page.tsx`)
- List với question, status, sort_order, actions
- Create/Edit form: question, answer (markdown textarea), sort_order, is_active
- Toggle + delete

---

### FE-C: Public Components Update

#### [MODIFY] HeroBanner Component
- Nhận `banners: Banner[]` filter by `targetPage`
- Empty → Homepage: `return null`; Sub-pages: `<FallbackPageHeader>`
- `length === 1` → ẩn Prev/Next arrows, tắt `setInterval`
- `data-testid="hero"`, `data-testid="hero-title"`, `data-testid="fallback-page-header"`

#### [MODIFY] News-Blog Page (`src/app/articles/page.tsx`)
- Gọi `GET /api/v1/articles` (published only)
- Pagination

#### [MODIFY] Article Detail Page (`src/app/articles/[slug]/page.tsx`)
- `GET /api/v1/articles/:slug`
- Render HTML content với DOMPurify sanitization
- 404 nếu không tìm thấy / draft

#### [MODIFY] Product Detail Page
- Gallery thumbnails → click đổi ảnh chính
- `length ≤ 1` → ẩn thumbnail switcher
- Tabs: Giới thiệu / Chi tiết render HTML (DOMPurify)
- Placeholder nếu `main_image_url` null

#### [MODIFY] Homepage
- Latest News section → đọc `homepageNewsCount` từ SiteConfig
- Ẩn section nếu `count = 0`

#### [MODIFY] About-Us Page (`src/app/about/page.tsx`)
- Render `aboutContent` HTML (DOMPurify)
- `aboutGallery` image grid (interactive)
- Ẩn gallery section nếu rỗng

#### [MODIFY] Contact Page (`src/app/contact/page.tsx`)
- Render FAQs từ `/api/v1/faqs` (active only, by sort_order)
- Map embed từ `mapEmbedUrl`; fallback text nếu invalid

#### [MODIFY] Layout / Header / Footer
- Logo từ `SiteConfig.shopLogo` (fallback default)
- Sticky bar: address + hotline
- Footer: columns + copyright + social links
- Floating buttons: điều kiện `enabled && link`

---

## 4. Backend (BE) Contract Tasks

> Backend nằm trong `go-grip` repo. Tasks dưới đây là **API contract** mà FE phụ thuộc.

### BE-A: Banner

- `GET /api/v1/banners?page={targetPage}` → trả `is_active = true`, sorted by `sort_order`
- `GET /api/v1/admin/banners?page={targetPage}` → tất cả, filter optional
- `POST /api/v1/admin/banners` → validate `target_page` enum, reject 422 nếu invalid
- `PUT /api/v1/admin/banners/:id`
- `PATCH /api/v1/admin/banners/:id/toggle`
- `DELETE /api/v1/admin/banners/:id`
- DB: bảng `banners` với schema đầy đủ (xem entity)

### BE-B: Media Library

- `GET /api/v1/admin/media` → list (paginated, q search)
- `POST /api/v1/admin/media/presign` → trả presigned R2 URL + r2_key
- `POST /api/v1/admin/media/register` → lưu metadata sau khi upload thành công
- `DELETE /api/v1/admin/media/:id` → kiểm tra usage → reject 409 nếu đang dùng
- DB: bảng `media_assets`

### BE-C: Article

- `GET /api/v1/articles?limit=&offset=` → `status = published`, sorted `published_at DESC`
- `GET /api/v1/articles/:slug` → 404 nếu không có hoặc draft
- `GET /api/v1/admin/articles` → tất cả status
- `POST /api/v1/admin/articles` → tạo với status `draft`
- `PUT /api/v1/admin/articles/:id`
- `PATCH /api/v1/admin/articles/:id/publish` → toggle; set `published_at` lần đầu
- `DELETE /api/v1/admin/articles/:id`

### BE-D: Product Content

- `PATCH /api/v1/admin/products/:id/media` → update `main_image_url`, `gallery_images`
- `PATCH /api/v1/admin/products/:id/content` → update `introduction`, `detail_content`
- DB: thêm 4 columns vào bảng `products`

### BE-E: Site Config

- `GET /api/v1/site-config` → full SiteConfig (public)
- `PUT /api/v1/admin/site-config` → partial update, singleton row
- DB: cập nhật schema `site_config` thêm các fields mới

### BE-F: About-Us

- `aboutContent` + `aboutGallery` là part của SiteConfig (lưu cùng bảng)

### BE-G: FAQ

- `GET /api/v1/faqs` → `is_active = true`, sorted `sort_order ASC`
- `GET /api/v1/admin/faqs` → tất cả
- `POST /api/v1/admin/faqs`
- `PUT /api/v1/admin/faqs/:id`
- `PATCH /api/v1/admin/faqs/:id/toggle`
- `DELETE /api/v1/admin/faqs/:id`

---

## 5. Verification Plan

### Automated Tests

```bash
# Chạy toàn bộ test suite feature 004
npx playwright test playwright/specs/admin/banners.spec.ts
npx playwright test playwright/specs/admin/media-library.spec.ts
npx playwright test playwright/specs/admin/articles.spec.ts
npx playwright test playwright/specs/admin/product-content.spec.ts
npx playwright test playwright/specs/admin/site-config.spec.ts
npx playwright test playwright/specs/admin/faqs.spec.ts
npx playwright test playwright/specs/content/articles.spec.ts
npx playwright test playwright/specs/content/about.spec.ts

# Hoặc theo tag
npx playwright test --grep @admin
npx playwright test --grep @content
```

### Manual Verification checklist

- [ ] Admin upload ảnh → xuất hiện trong Media Library grid
- [ ] MediaPicker mở được từ tất cả 4 form khác nhau
- [ ] Banner homepage empty → Hero Section ẩn hoàn toàn
- [ ] Banner sub-page empty → FallbackPageHeader màu `#99782b`
- [ ] Banner length 1 → Prev/Next arrow ẩn
- [ ] Publish article → xuất hiện trên News-Blog public ngay sau reload
- [ ] Draft article → URL trả 404
- [ ] Product gallery > 1 ảnh → thumbnail switcher hoạt động
- [ ] SiteConfig update → public site reflect sau reload
- [ ] FAQ toggle off → ẩn khỏi Contact page

---

## Open Questions

> [!IMPORTANT]
> **Q1**: Admin Article rich text editor – dùng Tiptap như DD-006 chỉ định.  
> Cần confirm: package `@tiptap/react` đã có trong `package.json` chưa? Nếu chưa cần add dependency.

> [!IMPORTANT]  
> **Q2**: `media-management.spec.ts` hiện tại có 8 tests liên quan Banner + Media.  
> Nên **migrate** các test đó vào files mới (`banners.spec.ts`, `media-library.spec.ts`) rồi xoá file cũ, hay **giữ lại** và chỉ bổ sung? Đề xuất: migrate để có cấu trúc rõ ràng.

> [!NOTE]
> **Q3**: Product Content tab – hiện tại `src/app/admin/product/` đã có sẵn. Cần xác nhận đây là `new` hay `edit/[id]` route.
