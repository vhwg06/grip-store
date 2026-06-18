# Feature Specification: Admin Content & Media Management

**Feature Branch**: `004-admin-media-management`

**Created**: 2026-06-16
**Updated**: 2026-06-17 (v3 — expanded full admin CMS usecase coverage)

**Status**: Superseded by module split (`005`, `007`, `008`)

> Superseded notice:
> `004-admin-media-management` không còn là active source of truth cho task/spec/test mới.
> Dùng `specs/admin-module-map.md` để xác định module thay thế:
> - storefront settings -> `005-admin-store-settings`
> - content/media/articles/about/faqs -> `007-admin-content-ops`
> - product content/media trong catalog editor -> `008-admin-catalog-ops`
>
> Tài liệu này được giữ lại như historical reference cho những use case chưa di trú xong.

---

## Phạm vi (Scope)

Feature này bao gồm **toàn bộ khả năng quản lý nội dung (CMS)** của admin/owner website, gồm 6 domain chính:

| Domain | Mô tả |
|---|---|
| **Banner** | Slideshow hero image theo từng trang |
| **Media Library** | Thư viện ảnh tập trung, dùng chung cho tất cả domain |
| **Article (News)** | Quản lý bài viết tin tức: tạo, sửa, xoá, xuất bản |
| **Product Content** | Chỉnh ảnh, gallery, introduction, detail content của sản phẩm |
| **Site Config** | Logo, footer, floating buttons, about page, homepage config |
| **About-Us Content** | Nội dung trang Giới thiệu + photo gallery |

> Banner là một **nhánh nhỏ** trong hệ thống CMS này. Media Library là **hạ tầng dùng chung** phục vụ tất cả 5 domain còn lại.

---

## Figma Analysis — Màn hình có Banner

Dựa trên Figma Design page (page ID: `1:3`), các màn hình sau đây có **Hero Banner Slide** (`Section-01: Hero banner-Slide`):

| Màn hình | Figma Node | Kích thước banner | Loại banner |
|---|---|---|---|
| **Homepage** | `8:499` / `8:508` | 1440×668px | Hero slideshow (prev/next arrows) |
| **News-Blog** | `87:2149` / `112:2732` | 1440×520px | Hero slideshow |
| **About-Us** | `27:3293` / `87:2161` | 1440×520px | Hero slideshow |
| **Product-list** | `58:862` / `62:2168` | 1440×520px | Hero slideshow |
| **Product-Details** | `62:3439` | Embedded | Gallery product images |

**Cấu trúc banner chung từ Figma:**
- `Section-01: Hero banner-Slide` — Frame full-width, chứa slide image + prev/next navigation arrows
- Không có text overlay được hardcode — banner dùng background image
- Navigation: left arrow (`vuesax/linear/arrow-circle-left`) + right arrow (`vuesax/linear/arrow-circle-right`)
- Product section (`Section-02: Key Products`) có banner ảnh danh mục với thumbnail + product name

---

## User Scenarios & Testing

### User Story 1 — Quản lý Banner theo từng trang (Priority: P1)

Admin cần quản lý banner riêng cho từng trang: Homepage, News-Blog, About-Us, và Product-list. Mỗi trang có slide banner độc lập.

**Why this priority**: Mỗi trang trong Figma đều có `Section-01: Hero banner-Slide` riêng biệt, cần quản lý độc lập để nội dung phù hợp từng trang.

**Independent Test**: Đăng nhập admin → vào Banner Management → chọn trang Homepage → tải lên banner mới → lưu → mở trang chủ và xác nhận banner mới hiển thị.

**Acceptance Scenarios**:

1. **Given** admin vào trang Banner Management, **When** họ chọn target page (Homepage / News / About-Us / Products), **Then** danh sách banner hiện tại của trang đó được hiển thị.
2. **Given** admin upload ảnh banner desktop (1440×520px recommended) và lưu, **Then** banner record lưu R2 public URL và gắn với đúng trang.
3. **Given** có active banner cho một trang, **When** visitor mở trang đó, **Then** hero section hiển thị đúng ảnh banner theo thứ tự sort_order.
4. **Given** admin thay đổi `sort_order` các banner, **When** visitor tải trang, **Then** slideshow chạy theo thứ tự mới.
5. **Given** admin tắt (deactivate) một banner, **When** visitor mở trang, **Then** banner đó không xuất hiện trong slideshow.
6. **Given** `banners[]` trả về rỗng cho Homepage, **Then** Hero Section ẩn hoàn toàn và content section đẩy lên.
7. **Given** `banners[]` trả về rỗng cho trang con (News/About-Us/Products), **Then** hiển thị Fallback Page Header (nền `#99782b` + tên trang).
8. **Given** banner `length === 1` cho một trang, **Then** Frontend ẩn Prev/Next arrow và tắt auto-play.

---

### User Story 2 — Upload và quản lý Media Library (Priority: P1)

Admin quản lý tất cả ảnh trong một thư viện media tập trung. Từ đây họ có thể chọn (pick) ảnh để dùng cho Banner, Article, Product, About-Us, SiteConfig logo mà không phải upload lại.

**Why this priority**: Media Library là hạ tầng dùng chung. Nếu không có nó, mỗi domain phải tự giải quyết upload, dẫn đến trùng lặp file và URL khó quản lý.

**Independent Test**: Mở Media Library → upload ảnh hợp lệ → ảnh xuất hiện trong grid → copy URL → pick ảnh vào một banner → xoá ảnh (backend từ chối vì đang dùng) → xác nhận thông báo lỗi.

**Acceptance Scenarios**:

1. **Given** admin upload ảnh hợp lệ (JPG/PNG/WebP/GIF, ≤5MB), **Then** ảnh xuất hiện trong media grid với preview, filename, size, MIME type, và public URL.
2. **Given** admin click "Copy URL" trên một asset, **Then** public R2 URL được copy vào clipboard.
3. **Given** admin mở Media Picker từ bất kỳ form nào (Banner/Article/Product/Config), **Then** họ thấy grid ảnh đã upload và có thể chọn ảnh đó điền vào field tương ứng.
4. **Given** admin xoá một asset không đang dùng, **Then** ảnh biến mất khỏi media grid.
5. **Given** admin xoá một asset đang được dùng bởi banner/article/product active, **Then** backend trả lỗi với message cụ thể, UI hiển thị thông báo đó mà không xoá.
6. **Given** admin tải ảnh sai định dạng hoặc quá lớn, **Then** lỗi hiển thị client-side trước khi upload, không gửi request lên server.

---

### User Story 3 — Quản lý bài viết tin tức: Article CRUD (Priority: P1)

Admin (owner website) cần tạo, sửa, xoá, và xuất bản bài viết tin tức/blog. Mỗi bài viết có tiêu đề, nội dung rich text, ảnh đại diện (featured image từ media library), tóm tắt, ngày xuất bản, và trạng thái draft/published.

**Why this priority**: CMS bài viết là nhu cầu vận hành hàng ngày của owner website — không thể tạo bài viết mới đồng nghĩa với website đứng yên về nội dung.

**Independent Test**: Đăng nhập admin → tạo bài viết mới → chọn featured image từ media library → publish → mở trang News-Blog và xác nhận bài viết xuất hiện → vào article detail và xác nhận nội dung đúng.

**Acceptance Scenarios**:

1. **Given** admin vào Article Management, **Then** thấy danh sách bài viết với: tiêu đề, trạng thái (Draft/Published), ngày tạo, ngày cập nhật, action buttons (Edit, Delete).
2. **Given** admin tạo bài viết mới với title, content (rich text), excerpt, featured image (từ media picker), **Then** bài viết được lưu với trạng thái Draft (chưa public).
3. **Given** admin publish một bài viết, **When** visitor vào trang News-Blog, **Then** bài viết đó xuất hiện trong danh sách với featured image, title, và excerpt.
4. **Given** visitor click vào article card, **Then** article detail page hiển thị featured image ở header, title, publish date, author, và full content.
5. **Given** admin sửa nội dung một bài viết đã published và lưu, **Then** trang article detail public hiển thị nội dung mới sau reload.
6. **Given** admin unpublish (set về Draft) một bài viết, **Then** bài viết đó ẩn khỏi trang News-Blog public.
7. **Given** admin xoá một bài viết, **Then** bài viết và article detail URL của nó không còn truy cập được (404).
8. **Given** visitor vào homepage, **Then** section Latest News hiển thị N bài viết published mới nhất (N được cấu hình trong Site Config).

---

### User Story 4 — Quản lý nội dung & media sản phẩm (Priority: P1)

Admin (owner website) cần chỉnh sửa ảnh chính, gallery ảnh, nội dung "Giới thiệu sản phẩm" (introduction tab), và nội dung "Chi tiết sản phẩm" (detail tab) cho từng sản phẩm. Đây là content editing — không phải product creation (product creation thuộc spec 002).

**Why this priority**: Ảnh và nội dung chi tiết sản phẩm trực tiếp ảnh hưởng đến tỷ lệ chuyển đổi. Owner website cần tự cập nhật mà không cần developer.

**Independent Test**: Mở product editor → thay ảnh chính → thêm gallery ảnh → viết introduction content → lưu → mở product detail page và xác nhận gallery + content hiển thị đúng.

**Acceptance Scenarios**:

1. **Given** admin vào Product Editor (từ Product list), **When** họ click tab "Media & Content", **Then** thấy: field main image, gallery manager, rich text editor cho introduction, rich text editor cho detail content.
2. **Given** admin chọn ảnh chính mới từ media picker hoặc upload trực tiếp, **Then** thumbnail sản phẩm trên listing page và product detail đều cập nhật ảnh mới.
3. **Given** admin thêm/xoá/sắp xếp gallery images trong product editor, **Then** product detail gallery hiển thị đúng số lượng và thứ tự ảnh.
4. **Given** admin viết/cập nhật introduction rich text, **Then** tab "Giới thiệu" trên product detail page hiển thị nội dung mới.
5. **Given** admin viết/cập nhật detail content, **Then** tab "Chi tiết" trên product detail page hiển thị nội dung mới.
6. **Given** product chưa có main image, **Then** product card hiển thị placeholder image thay vì bị vỡ layout.
7. **Given** product có gallery 1 ảnh, **Then** sản phẩm hiển thị ảnh đó mà không có thumbnail switcher.
8. **Given** product có gallery nhiều ảnh, **Then** visitor có thể click thumbnail để đổi ảnh chính hiển thị.

---

### User Story 5 — Quản lý Site Configuration (Priority: P2)

Admin (owner website) cần cấu hình các thành phần cố định của website: logo, sticky bar (địa chỉ, hotline), footer columns, floating buttons (Zalo, Messenger, Hotline), và số lượng bài viết hiển thị trên homepage. Thay đổi bất kỳ field nào phản ánh ngay trên public site sau reload.

**Why this priority**: Site Config là "xương sống" cấu hình website. Logo sai, hotline sai, footer sai → uy tín thương hiệu giảm ngay lập tức.

**Independent Test**: Đăng nhập admin → vào Site Config → thay logo → lưu → mở public site và xác nhận logo mới → cập nhật Zalo link → xác nhận floating button dẫn đến link mới.

**Acceptance Scenarios**:

1. **Given** admin upload logo mới từ media picker hoặc trực tiếp, **Then** logo trong header và footer của public site cập nhật sau reload.
2. **Given** admin cập nhật `stickyBarAddress` hoặc `stickyBarHotline`, **Then** sticky top bar trên public site hiển thị thông tin mới.
3. **Given** admin bật/tắt một floating button (Zalo/Messenger/Hotline/ScrollTop) hoặc thay đổi link, **Then** floating button tương ứng xuất hiện/biến mất hoặc dẫn đến link mới.
4. **Given** admin cập nhật `footerColumns` (thêm/xoá/sửa link), **Then** footer của public site phản ánh cấu trúc mới.
5. **Given** admin thay `footerCopyright` text, **Then** text copyright ở cuối footer cập nhật.
6. **Given** admin thay `socialLinks` (Facebook, Zalo, YouTube...), **Then** social icons trong footer dẫn đến đúng URL mới.
7. **Given** admin đặt `homepageNewsCount = 6`, **Then** homepage hiển thị đúng 6 bài viết mới nhất trong section Latest News.
8. **Given** admin cập nhật `mapEmbedUrl` với Google Maps embed link mới, **Then** trang Contact hiển thị bản đồ mới.

---

### User Story 6 — Quản lý nội dung trang Giới thiệu (About-Us) (Priority: P2)

Admin (owner website) cần cập nhật nội dung trang About-Us: văn bản giới thiệu công ty (rich text), và photo gallery (ảnh nhà máy, đội ngũ, sản phẩm). Banner của trang About-Us được quản lý trong Banner Management (User Story 1).

**Why this priority**: Trang About-Us là nơi khách hàng tìm hiểu về thương hiệu — cần cập nhật kịp thời khi công ty có milestone mới (mở rộng, giải thưởng, team mới).

**Independent Test**: Admin → Site Config → About tab → viết nội dung mới + thêm ảnh vào gallery → lưu → mở public About-Us page và xác nhận content + gallery hiển thị đúng.

**Acceptance Scenarios**:

1. **Given** admin vào About-Us Content editor, **Then** thấy rich text editor chứa nội dung hiện tại của `aboutContent`.
2. **Given** admin cập nhật `aboutContent` rich text và lưu, **Then** trang About-Us public hiển thị nội dung mới.
3. **Given** admin thêm ảnh vào `aboutGallery` từ media picker, **Then** gallery section trên trang About-Us public hiển thị thêm ảnh mới.
4. **Given** admin xoá ảnh khỏi `aboutGallery`, **Then** ảnh đó biến mất khỏi gallery public.
5. **Given** admin sắp xếp lại thứ tự ảnh trong `aboutGallery`, **Then** gallery public hiển thị đúng thứ tự mới.
6. **Given** `aboutGallery` rỗng, **Then** gallery section trên trang About-Us ẩn hoàn toàn (không hiển thị section trống).

---

### User Story 7 — Quản lý FAQ (Priority: P3)

Admin quản lý danh sách câu hỏi thường gặp (FAQ) hiển thị trên trang Contact. Có thể thêm, sửa, xoá, bật/tắt, và sắp xếp thứ tự từng FAQ entry.

**Why this priority**: FAQ giảm tải câu hỏi lặp lại cho support team, nhưng ít khẩn cấp hơn các nội dung cốt lõi.

**Independent Test**: Tạo FAQ entry mới → publish → mở Contact page và xác nhận câu hỏi xuất hiện đúng vị trí.

**Acceptance Scenarios**:

1. **Given** admin tạo FAQ entry mới với question + answer + sort_order, **Then** entry xuất hiện trên trang Contact theo thứ tự sort_order.
2. **Given** admin tắt một FAQ entry, **Then** entry đó ẩn khỏi trang Contact public.
3. **Given** admin xoá một FAQ entry, **Then** entry biến mất hoàn toàn.
4. **Given** admin thay đổi sort_order các FAQ entries, **Then** trang Contact hiển thị đúng thứ tự mới.

---

### Edge Cases

**Banner:**
- `banners[]` rỗng — Homepage: ẩn Hero Section. Trang con: Fallback Page Header (`#99782b` + tên trang).
- Banner `length === 1` → ẩn Prev/Next arrow, tắt auto-play.
- Banner `target_page` không hợp lệ → rejected với HTTP 422 khi tạo.

**Media Upload:**
- File sai định dạng (không phải JPG/PNG/WebP/GIF) bị reject client-side trước khi upload.
- File > 5MB bị reject với thông báo rõ ràng.
- R2 upload thất bại → form giữ nguyên, hiển thị lỗi, không tạo DB record.
- Xoá asset đang được dùng → backend reject với message, UI hiển thị thông báo mà không xoá.
- Presign URL hết hạn (> 15 phút) → client báo lỗi và yêu cầu thử lại.

**Article:**
- Draft article không được public API trả về → không thể truy cập qua URL public.
- Article bị xoá → URL trả về 404, không crash trang.
- Article không có featured image → article card dùng placeholder image.
- Article content quá dài → rich text editor scroll được, không bị truncate trong DB.

**Product Content:**
- Product không có main image → card hiển thị placeholder, không vỡ layout.
- Gallery ảnh rỗng → không hiển thị thumbnail switcher trên product detail.
- Gallery có 1 ảnh → hiển thị ảnh đó, ẩn thumbnail switcher.
- Rich text content rỗng → tab "Giới thiệu" / "Chi tiết" ẩn hoặc hiển thị placeholder text.

**Site Config:**
- Logo chưa được set → dùng default logo từ codebase.
- `mapEmbedUrl` không hợp lệ → trang Contact hiển thị fallback text thay vì iframe lỗi.
- `homepageNewsCount = 0` → ẩn hoàn toàn section Latest News trên homepage.
- Floating button link trống (`null`) → button bị ẩn khỏi UI, không hiển thị button broken.

---

## Design Decisions (Resolved — V1)

> Các quyết định dưới đây được chốt sau khi phân tích kỹ thuật & UX. Không cần re-open trong quá trình implement V1.

### DD-001: Fallback khi không có active banner

**Quyết định V1** — Chiến lược hai tầng theo loại trang:

| Trang | Hành vi khi `banners[]` rỗng |
|---|---|
| **Homepage** (`1440×668px`) | Ẩn hoàn toàn Hero Section. Các section bên dưới tự động đẩy lên. |
| **Trang con** (News, About-Us, Products — `1440×520px`) | **KHÔNG ẩn**. Hiển thị `<FallbackPageHeader>`: nền `#99782b` + tên trang làm title. |

```tsx
if (banners.length === 0) {
  if (targetPage === 'homepage') return null;
  return <FallbackPageHeader title={pageName} />;
}
```

---

### DD-002: Mobile Breakpoint — Banner image

**Quyết định V1**: `mobile_image_url` là **optional**.

```tsx
const bannerSrc = isMobile && banner.mobile_image_url
  ? banner.mobile_image_url
  : banner.desktop_image_url;
```

- Ops rule: Designer thiết kế Desktop với **Safe Area ~600px giữa ảnh**.
- Frontend dùng `object-fit: cover` trên Mobile → crop 2 bên an toàn.
- V2: Admin upload thêm `mobile_image_url` vào field đã chừa sẵn.

---

### DD-003: Text Overlay trong Banner

**Quyết định V1**: Text nhúng trong ảnh (Cleanest approach).

- `title`/`subtitle` chỉ dùng làm `alt=""` cho SEO & Accessibility.
- Frontend **KHÔNG render text overlay** ở V1.
- `cta_label`/`cta_url` giữ trong schema cho V2.

```html
<img src={banner.desktop_image_url} alt={banner.title ?? pageName} />
```

---

### DD-004: About-Us banner — Endpoint xác nhận

**Quyết định V1**: XÁC NHẬN — CẦN THIẾT.

```
GET /api/v1/banners?page=about-us
```

`length === 1` → Frontend tự ẩn navigation + tắt auto-play. Không cần flag từ backend.

---

### DD-005: Article publish flow

**Quyết định V1**: Hai trạng thái `draft | published`. Không có scheduled publish ở V1.

- Public API `GET /api/v1/articles` chỉ trả về `status = published`.
- Admin API `GET /api/v1/admin/articles` trả về tất cả.
- `published_at` được set tự động khi admin publish (lần đầu).

---

### DD-006: Rich text editor

**Quyết định V1**: Dùng **Tiptap** (headless rich text editor).

- Output: HTML string lưu trong DB.
- Frontend render bằng `dangerouslySetInnerHTML` với sanitization (DOMPurify).
- Scope V1: bold, italic, heading H2/H3, ordered/unordered list, link, image (từ media picker), blockquote.

---

## Requirements

### Functional Requirements

#### FR-Group A: Banner Management

- **FR-A01**: System MUST support banner management per page. Valid `target_page` values: `homepage`, `news`, `about-us`, `products`.
- **FR-A02**: System MUST allow admin to create banners with: `desktop_image_url` (R2), `mobile_image_url` (optional), `title` (optional, dùng làm alt text), `subtitle` (optional), `cta_label` (optional), `cta_url` (optional), `sort_order`, `is_active`.
- **FR-A03**: System MUST filter active banners by `target_page` for public API, ordered by `sort_order` ASC.
- **FR-A04**: System MUST allow admin to reorder banners (drag-drop or sort_order input).
- **FR-A05**: System MUST allow admin to activate/deactivate individual banners without deleting.
- **FR-A06**: Frontend MUST hide Hero Section on Homepage when `banners[]` is empty.
- **FR-A07**: Frontend MUST show `FallbackPageHeader` on sub-pages when `banners[]` is empty.
- **FR-A08**: Frontend MUST hide Prev/Next arrows and disable auto-play when `banners.length === 1`.

#### FR-Group B: Media Library

- **FR-B01**: System MUST provide admin-only media asset listing: image preview, filename, MIME type, size in bytes, public R2 URL, `uploaded_at`.
- **FR-B02**: System MUST support R2 direct upload via presigned URL + metadata registration flow.
- **FR-B03**: System MUST provide a **Media Picker** modal reusable across Banner, Article, Product, SiteConfig forms.
- **FR-B04**: System MUST allow admin to delete media assets (backend may reject if asset is in use).
- **FR-B05**: System MUST reject unsupported file types (JPG, PNG, WebP, GIF only) client-side.
- **FR-B06**: System MUST reject files > 5MB client-side.

#### FR-Group C: Article (News) Management

- **FR-C01**: System MUST allow admin to create articles with: `title`, `slug` (auto-generated from title, editable), `content` (rich text HTML), `excerpt`, `featured_image_url` (from media picker), `author`, `tags[]`, `status` (`draft` | `published`).
- **FR-C02**: System MUST allow admin to list all articles (draft + published) with pagination and status filter.
- **FR-C03**: System MUST allow admin to edit any article field and save.
- **FR-C04**: System MUST allow admin to publish/unpublish articles (toggle status).
- **FR-C05**: System MUST allow admin to delete articles.
- **FR-C06**: Public API MUST return only `published` articles, ordered by `published_at` DESC.
- **FR-C07**: Article detail page MUST render rich text content with proper HTML sanitization.
- **FR-C08**: Homepage Latest News section MUST show N published articles (N from `SiteConfig.homepageNewsCount`).

#### FR-Group D: Product Content Management

- **FR-D01**: System MUST allow admin to assign/replace `main_image_url` (from media picker) for any product.
- **FR-D02**: System MUST allow admin to manage `gallery_images[]` for a product: add, remove, reorder.
- **FR-D03**: System MUST allow admin to write/edit `introduction` (rich text) for a product.
- **FR-D04**: System MUST allow admin to write/edit `detail_content` (rich text) for a product.
- **FR-D05**: Product detail page MUST render gallery thumbnails as clickable image switcher.
- **FR-D06**: Product detail page MUST render `introduction` and `detail_content` as HTML with sanitization.
- **FR-D07**: If `gallery_images` has ≤ 1 image, thumbnail switcher MUST be hidden.
- **FR-D08**: If `main_image_url` is null, product card MUST display a placeholder image.

#### FR-Group E: Site Configuration

- **FR-E01**: System MUST allow admin to update `shopLogo` (from media picker).
- **FR-E02**: System MUST allow admin to update `stickyBarAddress` and `stickyBarHotline`.
- **FR-E03**: System MUST allow admin to configure `floatingButtons[]` (enable/disable each button, set link).
- **FR-E04**: System MUST allow admin to update `footerColumns[]` (add/remove columns, manage links per column).
- **FR-E05**: System MUST allow admin to update `footerCopyright` text.
- **FR-E06**: System MUST allow admin to update `socialLinks` (key-value pairs).
- **FR-E07**: System MUST allow admin to set `homepageNewsCount` (integer ≥ 0).
- **FR-E08**: System MUST allow admin to update `mapEmbedUrl`.
- **FR-E09**: SiteConfig changes MUST reflect on public site after page reload (no cache required for V1).

#### FR-Group F: About-Us Content

- **FR-F01**: System MUST allow admin to edit `aboutContent` (rich text) and save.
- **FR-F02**: System MUST allow admin to manage `aboutGallery[]` (add from media picker, remove, reorder).
- **FR-F03**: Public About-Us page MUST render `aboutContent` HTML with sanitization.
- **FR-F04**: Public About-Us page MUST render `aboutGallery` as interactive image gallery.
- **FR-F05**: If `aboutGallery` is empty, gallery section MUST be hidden (no empty section).

#### FR-Group G: FAQ Management

- **FR-G01**: System MUST allow admin to create FAQ entries with: `question`, `answer` (supports markdown), `sort_order`, `is_active`.
- **FR-G02**: System MUST allow admin to edit, delete, toggle active, and reorder FAQ entries.
- **FR-G03**: Public Contact page MUST show only active FAQ entries ordered by `sort_order` ASC.

---

### Key Entities

#### Banner

```
Banner {
  id: uuid
  target_page: enum('homepage', 'news', 'about-us', 'products')
  desktop_image_url: string           // R2 public URL
  mobile_image_url: string?           // R2 public URL, optional
  title: string?                      // dùng làm alt text (SEO) — KHÔNG render overlay ở V1
  subtitle: string?                   // dùng làm alt text phụ
  cta_label: string?                  // reserved cho V2
  cta_url: string?                    // reserved cho V2
  sort_order: int (default 0)
  is_active: boolean (default true)
  created_at: timestamp
  updated_at: timestamp
}
```

#### MediaAsset

```
MediaAsset {
  id: uuid
  filename: string
  mime_type: string                   // image/jpeg | image/png | image/webp | image/gif
  size_bytes: int
  public_url: string                  // R2 public URL
  r2_key: string                      // R2 object key
  uploaded_by: uuid                   // admin user id
  uploaded_at: timestamp
}
```

#### Article

```
Article {
  id: uuid
  title: string
  slug: string (unique)               // URL: /news/{slug}
  excerpt: string?                    // dùng cho article card
  content: string                     // HTML từ rich text editor (sanitized trước khi render)
  featured_image_url: string?         // R2 public URL
  author: string?
  tags: []string
  status: enum('draft', 'published')
  published_at: timestamp?            // set khi publish lần đầu
  created_at: timestamp
  updated_at: timestamp
}
```

#### Product (extended — chỉ các field media/content)

```
Product {
  ... (existing fields from spec-002)
  main_image_url: string?             // R2 public URL (thay thế field image hiện tại)
  gallery_images: []string            // ordered list R2 public URLs
  introduction: string?               // HTML — tab "Giới thiệu"
  detail_content: string?             // HTML — tab "Chi tiết"
}
```

#### SiteConfig (extended)

```
SiteConfig {
  shopName: string
  shopLogo: string?                   // R2 public URL
  shopDescription: string?
  stickyBarAddress: string?
  stickyBarHotline: string?
  floatingButtons: FloatingButton[]
  footerColumns: FooterColumn[]
  footerCopyright: string?
  socialLinks: Record<string, string>
  mapEmbedUrl: string?
  aboutContent: string?               // HTML — trang About-Us
  aboutGallery: []string             // ordered R2 public URLs
  homepageNewsCount: int (default 3)
}

FloatingButton {
  type: enum('zalo', 'messenger', 'hotline', 'scrollTop')
  enabled: boolean
  link: string?
  label: string?
}

FooterColumn {
  title: string
  links: Array<{ label: string; href: string }>
}
```

#### FAQEntry

```
FAQEntry {
  id: uuid
  question: string
  answer: string                      // markdown
  sort_order: int
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

---

## API Contract (Frontend ↔ Backend)

### Banner Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/banners?page={target_page}` | Public | Active banners for a page |
| `GET` | `/api/v1/admin/banners` | Admin | All banners (filter by target_page) |
| `POST` | `/api/v1/admin/banners` | Admin | Create banner |
| `PUT` | `/api/v1/admin/banners/:id` | Admin | Update banner |
| `PATCH` | `/api/v1/admin/banners/:id/toggle` | Admin | Toggle is_active |
| `DELETE` | `/api/v1/admin/banners/:id` | Admin | Delete banner |

### Media Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/media` | Admin | List all media assets |
| `POST` | `/api/v1/admin/media/presign` | Admin | Get presigned R2 upload URL |
| `POST` | `/api/v1/admin/media/register` | Admin | Register media after R2 upload |
| `DELETE` | `/api/v1/admin/media/:id` | Admin | Delete media asset |

### Article Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/articles` | Public | List published articles (paginated) |
| `GET` | `/api/v1/articles/:slug` | Public | Article detail by slug |
| `GET` | `/api/v1/admin/articles` | Admin | List all articles (any status) |
| `POST` | `/api/v1/admin/articles` | Admin | Create article |
| `PUT` | `/api/v1/admin/articles/:id` | Admin | Update article |
| `PATCH` | `/api/v1/admin/articles/:id/publish` | Admin | Toggle published status |
| `DELETE` | `/api/v1/admin/articles/:id` | Admin | Delete article |

### Product Content Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `PATCH` | `/api/v1/admin/products/:id/media` | Admin | Update main_image_url + gallery_images |
| `PATCH` | `/api/v1/admin/products/:id/content` | Admin | Update introduction + detail_content |

### Site Config Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/site-config` | Public | Get full SiteConfig |
| `PUT` | `/api/v1/admin/site-config` | Admin | Update SiteConfig (partial allowed) |

### FAQ Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/faqs` | Public | List active FAQs ordered by sort_order |
| `GET` | `/api/v1/admin/faqs` | Admin | List all FAQs |
| `POST` | `/api/v1/admin/faqs` | Admin | Create FAQ entry |
| `PUT` | `/api/v1/admin/faqs/:id` | Admin | Update FAQ entry |
| `PATCH` | `/api/v1/admin/faqs/:id/toggle` | Admin | Toggle is_active |
| `DELETE` | `/api/v1/admin/faqs/:id` | Admin | Delete FAQ entry |

### R2 Upload Flow

```
1. Admin selects file → client validates: type ∈ {jpg, png, webp, gif}, size ≤ 5MB
2. POST /api/v1/admin/media/presign
   body: { filename, mime_type, size_bytes }
   → { presigned_url, r2_key, expires_at }
3. PUT presigned_url  (direct to R2, binary body)
4. POST /api/v1/admin/media/register
   body: { r2_key, filename, mime_type, size_bytes }
   → { id, public_url, uploaded_at }
5. Use public_url in banner / article / product / site-config fields
```

---

## Success Criteria

**Banner:**
- **SC-A01**: Admin upload và save banner cho từng trang không cần paste URL thủ công.
- **SC-A02**: Public pages phản ánh banner changes sau reload.
- **SC-A03**: Invalid file type và oversized file fail client-side trước khi network upload.
- **SC-A04**: Slideshow chạy đúng sort_order. Deactivated banners không xuất hiện.

**Media Library:**
- **SC-B01**: Media Picker có thể mở từ Banner form, Article form, Product form, SiteConfig form.
- **SC-B02**: Asset đang dùng không thể xoá — UI hiển thị error message từ backend.

**Article:**
- **SC-C01**: Admin tạo và publish bài viết mới → xuất hiện trên News-Blog public trong ≤ 1 reload.
- **SC-C02**: Draft articles không truy cập được qua public URL.
- **SC-C03**: Article rich text render đúng HTML (heading, list, link, image) trên public page.

**Product Content:**
- **SC-D01**: Admin thay ảnh chính → product card và product detail cập nhật ảnh mới.
- **SC-D02**: Admin thêm gallery → visitor thấy đủ thumbnails và click đổi ảnh chính.
- **SC-D03**: Introduction/detail rich text render đúng trên product detail tabs.

**Site Config:**
- **SC-E01**: Tất cả SiteConfig fields (logo, hotline, footer, floating buttons) cập nhật sau reload.

**About-Us:**
- **SC-F01**: `aboutContent` + `aboutGallery` cập nhật phản ánh đúng trên public About page.

**Playwright:**
- **SC-G01**: Playwright specs lưu dưới `/playwright/specs`, hit `https://grip.vn/api` (không mock).

---

## Assumptions

- Frontend dùng `apiFetch` where `/api/...` maps to `/v1/...`.
- V1 media management là image-only (JPG, PNG, WebP, GIF) — không có video, folders, tags, bulk editing.
- Delete behavior là backend-policy controlled — frontend gửi request và hiển thị kết quả.
- Go backend implementation nằm trong `go-grip` repo, frontend nằm trong `grip-store` repo.
- Không có folder structure trong media library ở V1.
- `target_page` trong banner là fixed enum — không có custom page slug ở V1.
- Mobile banner image là optional — nếu không có, frontend dùng desktop image với `object-fit: cover`.
- Text overlay KHÔNG render lên banner ở V1 — `title`/`subtitle` chỉ dùng cho HTML `alt`.
- Fallback Page Header (`#99782b`) implement ở Frontend — không cần backend endpoint riêng.
- Homepage ẩn Hero Section khi không có banner — xử lý phía Frontend bằng conditional render.
- Designer/Marketing tuân thủ Safe Area ~600px giữa ảnh desktop để crop tốt trên mobile.
- Banner `length === 1` → Frontend tự ẩn navigation arrows và tắt auto-play, không cần flag từ backend.
- Article không có scheduled publish ở V1 — chỉ draft/published toggle.
- Rich text editor (Tiptap) output là HTML string — sanitized bằng DOMPurify trước khi render.
- SiteConfig là singleton (1 row trong DB) — không có versioning hay history ở V1.
- Product content editing là update operation — không có draft/published cho product content ở V1.
