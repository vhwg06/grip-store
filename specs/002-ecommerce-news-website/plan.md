# Implementation Plan: GRIP E-commerce & News Website

**Branch**: `002-ecommerce-news-website` | **Date**: 2026-05-23 | **Spec**: [spec.md](file:///Users/cynus/Desktop/grip-store/specs/002-ecommerce-news-website/spec.md)

**Input**: Feature specification from `/specs/002-ecommerce-news-website/spec.md`

## Summary

Transform the existing GRIP Store from a virtual-goods shop into a full-featured e-commerce and news website for premium architectural hardware (door handles, cabinet handles, smart locks). The Figma design defines a sophisticated Vietnamese-language storefront with: a top sticky bar (address + hotline), a navigation bar with product categories, a hero banner slider, category rail, featured product grids by category, "Why Choose Us" USP sections, a news/blog section, a "Shop by Color" section, a CTA banner, and a rich multi-column footer. Implementation preserves the existing clean architecture (domain → application → adapter → presentation) while adding new domain entities (Cart, Article, Lead, Banner, FAQ, Brand), new pages, and substantially redesigning the homepage and component library.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2, Next.js 16

**Primary Dependencies**: TailwindCSS 4, Radix UI, Framer Motion 12, SWR, Shadcn UI, Lucide React

**Storage**: Backend REST API (existing adapter pattern via `http-client.ts`). No direct DB.

**Testing**: `npm run lint` + `npm run build` + Import Guard Gates (per Constitution Principle III)

**Target Platform**: Web (Desktop 1440px, Tablet 768px, Mobile 375px) – responsive PWA

**Project Type**: Client-only Next.js web application (standalone output)

**Performance Goals**: LCP < 2.5s, JS bundle < 300KB gzipped initial route, API timeout 10s

**Constraints**: Clean architecture boundaries (Constitution I), no server actions (Constitution VII), JWT auth only, SVN-Gilroy font family (from Figma), Vietnamese language primary

**Scale/Scope**: ~15 new/refactored pages, ~40 new components, 6 new domain entities, 4 new API adapter modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Architecture Boundaries | ✅ PASS | All new code follows domain → application → adapter → presentation layering. New entities in `src/domain/`, hooks in `src/application/hooks/`, API calls in `src/adapters/api/`. |
| II. Frontend Contract Stability | ✅ PASS | Existing contracts (catalog, auth, checkout, orders, profile, wishlist) preserved. New contracts added for cart, articles, leads, banners, FAQ. |
| III. Test-Gate Discipline | ✅ PASS | All gates (lint, build, import guards, smoke tests) will be run before merge. |
| IV. Type-Safe API Communication | ✅ PASS | All new adapters will use typed `apiFetch<T>()` with domain type generics. No `any`. |
| V. User Experience Consistency | ✅ PASS | Existing flows unchanged. New flows follow same UX patterns (loading skeletons, toast notifications, i18n). |
| VI. Performance Budgets | ✅ PASS | Image lazy loading, route-based code splitting, SWR caching for all new data. |
| VII. Migration Completeness | ✅ PASS | No server actions, no direct DB access, JWT auth only. |

## Project Structure

### Documentation (this feature)

```text
specs/002-ecommerce-news-website/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── cart-api.md
│   ├── articles-api.md
│   ├── leads-api.md
│   ├── banners-api.md
│   ├── faq-api.md
│   └── brands-api.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── domain/                      # Domain layer (pure types)
│   ├── catalog.ts               # [MODIFY] Add Brand, extend Product with brand/SKU/gifts/tabs
│   ├── cart.ts                  # [NEW] Cart, CartItem, CartTotals
│   ├── article.ts               # [NEW] Article, ArticleListResponse
│   ├── lead.ts                  # [NEW] Lead, ConsultationRequest
│   ├── banner.ts                # [NEW] Banner, BannerSlide
│   ├── faq.ts                   # [NEW] FAQEntry, FAQResponse
│   ├── site-config.ts           # [NEW] SiteConfig, FloatingButton, FooterColumn
│   ├── auth.ts                  # (unchanged)
│   ├── checkout.ts              # (unchanged)
│   ├── orders.ts                # (unchanged)
│   ├── profile.ts               # (unchanged)
│   ├── wishlist.ts              # (unchanged)
│   ├── notifications.ts         # (unchanged)
│   └── admin.ts                 # [MODIFY] Add admin CRUD types for articles, banners, FAQ, leads
│
├── application/
│   ├── hooks/
│   │   ├── useCatalog.ts        # [MODIFY] Add brand filtering, category tree
│   │   ├── useCart.ts           # [NEW] Cart state management hook
│   │   ├── useArticles.ts      # [NEW] Articles/blog listing + detail
│   │   ├── useBanners.ts       # [NEW] Banner slides for hero
│   │   ├── useFAQ.ts           # [NEW] FAQ entries
│   │   ├── useLeads.ts         # [NEW] Consultation form submission
│   │   ├── useSiteConfig.ts    # [NEW] Site-wide config (floating buttons, footer, etc.)
│   │   ├── useBrands.ts        # [NEW] Brand listing + filtering
│   │   └── useAdmin.ts         # [MODIFY] Admin hooks for new entities
│   └── context/
│       ├── AuthContext.tsx       # (unchanged)
│       └── CartContext.tsx       # [NEW] Cart provider with localStorage persistence
│
├── adapters/api/
│   ├── catalog.api.ts           # [MODIFY] Add brand endpoints, category tree
│   ├── cart.api.ts              # [NEW] Cart REST adapter
│   ├── articles.api.ts          # [NEW] Articles REST adapter
│   ├── leads.api.ts             # [NEW] Leads/consultation REST adapter
│   ├── banners.api.ts           # [NEW] Banners REST adapter
│   ├── faq.api.ts               # [NEW] FAQ REST adapter
│   ├── site-config.api.ts       # [NEW] Site config REST adapter
│   ├── brands.api.ts            # [NEW] Brands REST adapter
│   └── admin.api.ts             # [MODIFY] Add admin CRUD for new entities
│
├── components/
│   ├── ui/                      # Shadcn UI primitives
│   │   ├── carousel.tsx         # [NEW] Image carousel/slider
│   │   ├── tabs.tsx             # [NEW] Tabs component
│   │   ├── slider.tsx           # [NEW] Range slider for price filter
│   │   ├── accordion.tsx        # [NEW] For FAQ
│   │   ├── breadcrumb.tsx       # [NEW] Breadcrumb navigation
│   │   └── skeleton.tsx         # [NEW] Skeleton loading
│   │
│   ├── layout/                  # [NEW] Layout components
│   │   ├── sticky-bar.tsx       # [NEW] Top address/hotline bar
│   │   ├── navbar.tsx           # [NEW] Main navigation bar (categories, search, cart, user)
│   │   ├── mega-footer.tsx      # [NEW] Multi-column footer with CTA banner
│   │   ├── floating-buttons.tsx # [NEW] Zalo/Messenger/Hotline/Scroll-to-top
│   │   └── breadcrumbs.tsx      # [NEW] Page breadcrumb wrapper
│   │
│   ├── home/                    # [NEW] Homepage sections
│   │   ├── hero-banner.tsx      # [NEW] Full-width hero slider (Figma: Section-01)
│   │   ├── category-rail.tsx    # [NEW] Category icon cards (Figma: Category Rail Section)
│   │   ├── product-section.tsx  # [NEW] Product grid by category (Figma: Section-02)
│   │   ├── usp-section.tsx      # [NEW] "Why Choose Us" badges (Figma: Section-03)
│   │   ├── shop-by-color.tsx    # [NEW] Color-based browsing (Figma: Shop by color)
│   │   ├── news-section.tsx     # [NEW] Latest blog posts (Figma: TIN TỨC MỚI NHẤT)
│   │   └── cta-banner.tsx       # [NEW] Pre-footer CTA (Figma: GRIP CTA)
│   │
│   ├── product/                 # [NEW] Product-specific components
│   │   ├── product-card.tsx     # [NEW] Product card (image, name, price, badge, CTA)
│   │   ├── product-gallery.tsx  # [NEW] Image gallery with thumbnails
│   │   ├── product-tabs.tsx     # [NEW] Details/Guide/Reviews tabs
│   │   ├── product-sidebar.tsx  # [NEW] Category tree sidebar
│   │   ├── product-filters.tsx  # [NEW] Price range, brand, sort filters
│   │   ├── quick-view.tsx       # [NEW] Quick product preview modal
│   │   └── consultation-form.tsx # [NEW] Request consultation form
│   │
│   ├── cart/                    # [NEW] Cart components
│   │   ├── cart-drawer.tsx      # [NEW] Slide-out cart panel
│   │   ├── cart-item.tsx        # [NEW] Individual cart item row
│   │   ├── cart-summary.tsx     # [NEW] Cart totals + checkout button
│   │   └── add-to-cart-button.tsx # [NEW] Replaces existing buy-button
│   │
│   ├── article/                 # [NEW] Blog/news components
│   │   ├── article-card.tsx     # [NEW] Article card (image, title, excerpt, date)
│   │   ├── article-content.tsx  # [NEW] Full article body renderer
│   │   └── related-articles.tsx # [NEW] Related articles sidebar/section
│   │
│   ├── contact/                 # [NEW] Contact page components
│   │   ├── contact-form.tsx     # [NEW] Contact/consultation form
│   │   ├── contact-map.tsx      # [NEW] Embedded Google Map
│   │   └── faq-section.tsx      # [NEW] FAQ accordion
│   │
│   ├── site-header.tsx          # [MODIFY] Replace with new navbar design
│   ├── site-footer.tsx          # [MODIFY] Replace with mega-footer
│   ├── home-content.tsx         # [MAJOR REWRITE] New homepage layout per Figma
│   ├── mobile-nav.tsx           # [MODIFY] Update nav items
│   └── ... (existing components preserved)
│
├── app/
│   ├── layout.tsx               # [MODIFY] Add sticky bar, new navbar, mega-footer, floating buttons
│   ├── page.tsx                 # [MODIFY] New homepage with Figma sections
│   ├── products/                # [NEW] Product catalog pages
│   │   ├── page.tsx             # [NEW] Category listing with sidebar + filters
│   │   └── [id]/
│   │       └── page.tsx         # [NEW] Product detail page
│   ├── cart/
│   │   └── page.tsx             # [NEW] Full cart page
│   ├── articles/                # [NEW] Blog/news pages
│   │   ├── page.tsx             # [NEW] Article listing grid
│   │   └── [slug]/
│   │       └── page.tsx         # [NEW] Full article page
│   ├── about/
│   │   └── page.tsx             # [NEW] About Us page
│   ├── contact/
│   │   └── page.tsx             # [NEW] Contact page
│   ├── checkout/                # [NEW] Checkout flow (matches Figma Checkout-page)
│   │   └── page.tsx
│   ├── thank-you/               # [NEW] Order confirmation (matches Figma Thank-you-page)
│   │   └── page.tsx
│   └── ... (existing routes preserved)
│
├── locales/                     # [MODIFY] Add Vietnamese translations, new i18n keys
│   ├── vi.ts                    # [NEW] Vietnamese locale (primary)
│   └── en.ts                    # [MODIFY] Add new keys
│
└── lib/
    ├── i18n/                    # [MODIFY] Add locale support
    ├── constants.ts             # [MODIFY] Add new constants
    └── utils.ts                 # (unchanged)
```

**Structure Decision**: Follows existing clean architecture with domain-driven layering. New features are added as new domain modules (cart, article, lead, banner, faq, site-config) with corresponding hooks and adapters. Presentation layer adds component groups by feature area (home/, product/, cart/, article/, contact/) and new route pages.

## Figma Design Analysis

### Design System (from Figma)

| Property | Value |
|----------|-------|
| **Primary Font** | SVN-Gilroy (Bold, SemiBold, Medium, Medium Italic) |
| **Web Fallback** | Inter / system-ui (closest Google Font to SVN-Gilroy) |
| **Desktop Width** | 1440px canvas, 1190px content area, 125px side margins |
| **Mobile Width** | 2010px canvas (high-fidelity mobile at 2x) |
| **Section Spacing** | ~36-48px between major sections |
| **Card Corner Radius** | 12-16px |
| **CTA Buttons** | Bold, rounded, primary color fill |

### Homepage Sections (Top to Bottom — Figma node `8:499`)

| # | Section | Figma ID | Height | Description |
|---|---------|----------|--------|-------------|
| 1 | **Sticky Bar** | `8:500` | 32px | Address + Hotline |
| 2 | **Navigation Bar** | `8:507` | 72px | Logo, category links (Cabinet ×4), search, cart, user actions |
| 3 | **Hero Banner Slider** | `8:508` | 668px | Full-width hero with CTA, product visual |
| 4 | **"Why Choose Us" Title** | `27:692` | 36px | Section divider |
| 5 | **Category Title** | `47:1652` | 77px | "DANH MỤC SẢN PHẨM" |
| 6 | **Key Products (Category)** | `8:509` | 331px | Category cards with thumbnails (5 categories) |
| 7 | **"Why Choose Us" Title** | `27:638` | 77px | Section divider |
| 8 | **Featured Products** | `20:244` | 553px | "SẢN PHẨM NỔI BẬT" + "TAY NẮM CAO CẤP" product grid with "Xem tất cả" |
| 9 | **Products Section 3** | `27:401` | 553px | Another product category section |
| 10 | **Products Section 4** | `27:480` | 553px | Another product category section |
| 11 | **"Why Choose Us" Title** | `27:696` | 77px | Section divider |
| 12 | **News Section** | `27:559` | 507px | "TIN TỨC MỚI NHẤT" — 4 article cards with CTA buttons |
| 13 | **USP Badges** | `27:1275` | 224px | 4 USP cards (Free shipping, VIP discounts, Quality cert, Hotline) |
| 14 | **CTA Banner** | `I8:619;138:5177` | 127px | "GRIP - TỔNG KHO TAY NẮM VIỆT NAM" + hotline + Zalo/Facebook |
| 15 | **Footer** | `I8:619;1:397` | 414px | Multi-column footer with sub-menus, social, copyright |

### Key Figma Content (Vietnamese)

- **Categories**: TAY NẮM CAO CẤP, KHOÁ CỬA THÔNG MINH, KHOÁ CỬA PHÂN THỂ, MÓC TREO ĐỒ, PHỤ KIỆN CỬA
- **Product Labels**: "Bán chạy" (Best Seller), "Hàng mới về" (New Arrival)
- **Product Card**: SKU, Name, Price (with strikethrough for discount), CTA "Xem chi tiết" / "Khám phá"
- **USPs**: Vận chuyển miễn phí, Ưu đãi khách hàng VIP, Chứng nhận chất lượng, HOTLINE
- **CTA**: "GỌI NGAY 0985694444", Zalo, Facebook
- **Sticky Bar**: Address + Hotline number

### Other Pages in Figma

| Page | Figma ID | Size |
|------|----------|------|
| **Checkout Page** | `117:4153` | 1440×1704px |
| **Thank You Page** | `125:4924` | 1440×1032px |
| **Mobile Homepage** | `27:1404` | 2010×4301px |

## Implementation Phases

### Phase 0: Foundation & Design System
- Update global CSS with GRIP brand colors and SVN-Gilroy / Inter font
- Add new Shadcn UI primitives (carousel, tabs, slider, accordion, breadcrumb, skeleton)
- Create design tokens matching Figma (spacing, typography scale, color palette)

### Phase 1: Domain & Infrastructure
- Define all new domain types (cart, article, lead, banner, faq, site-config, brand)
- Extend existing domain types (catalog with brand/SKU/gifts, admin with new entity management)
- Create all new API adapters
- Create all new application hooks
- Set up CartContext with localStorage persistence
- Add Vietnamese locale (vi.ts) with all new i18n keys

### Phase 2: Layout Components
- Build sticky bar (address + hotline)
- Build new navigation bar with category mega-menu, search, cart indicator, user menu
- Build mega-footer with multi-column layout, CTA banner, social links
- Build floating action buttons (Zalo, Messenger, Hotline, scroll-to-top)
- Update root layout to compose new layout components
- Update mobile navigation

### Phase 3: Homepage Rebuild
- Hero banner slider with auto-play and navigation dots
- Category rail with icon cards
- Featured product sections (3-4 category blocks with "View All" links)
- "Why Choose Us" USP badges
- Shop by Color section
- Latest news section with article cards
- Pre-footer CTA banner

### Phase 4: Product Pages
- Product listing page with category sidebar, filters (price range, brand), sort
- Product detail page with image gallery, tabs (details/guide/reviews), consultation form
- Quick view modal
- Product card component (shared across homepage + listing)

### Phase 5: Cart & Checkout
- Cart drawer (slide-out panel)
- Full cart page
- Add-to-cart button with quantity selector
- Checkout flow page (per Figma Checkout-page design)
- Thank you page (per Figma Thank-you-page design)
- Order request submission

### Phase 6: Content Pages
- News/Blog listing page (article grid)
- Article detail page (full content + related articles)
- About Us page (rich content + company gallery)
- Contact page (form + map + FAQ accordion)

### Phase 7: Admin Extensions
- Admin CRUD for articles/blog posts
- Admin banner management
- Admin FAQ management
- Admin lead/consultation management
- Admin site configuration (floating buttons, footer, homepage blocks)

### Phase 8: Polish & Verification
- Responsive testing (1440px, 768px, 375px)
- SEO optimization (meta tags, heading hierarchy, image alt tags, structured data)
- Performance optimization (image lazy loading, code splitting, SWR caching)
- i18n completeness check
- All Constitution test gates
- Accessibility audit (ARIA, focus management, keyboard navigation)

## Complexity Tracking

> **No constitution violations identified.** All new code follows existing patterns.

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Cart stored in CartContext + localStorage | No payment gateway needed, order-request model. Server-side cart unnecessary. | Server-side cart — adds API complexity for no benefit in order-request flow |
| SVN-Gilroy → Inter font fallback | SVN-Gilroy is a paid Vietnamese font. Inter is the closest free alternative for web. | Self-hosting SVN-Gilroy — licensing unclear, bundle size concern |
| Vietnamese as primary locale | Figma design is entirely in Vietnamese. English as secondary. | English-first — contradicts the design spec |
