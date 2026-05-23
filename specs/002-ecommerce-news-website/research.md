# Research: GRIP E-commerce & News Website

**Date**: 2026-05-23 | **Plan**: [plan.md](file:///Users/cynus/Desktop/grip-store/specs/002-ecommerce-news-website/plan.md)

## Research Tasks

### 1. Font Strategy: SVN-Gilroy → Web Alternative

**Decision**: Use Inter as the primary web font, with system-ui fallback

**Rationale**: SVN-Gilroy is a commercial Vietnamese font by SVN (Saigon Vietnamese Fonts). It is not available on Google Fonts and requires licensing for web use. Inter is geometrically similar (modern geometric sans-serif), has excellent Vietnamese diacritics support, and is available via Google Fonts / next/font.

**Alternatives Considered**:
- Self-hosting SVN-Gilroy: Requires commercial license, adds ~200KB to bundle per weight variant, unclear licensing for web deployment
- Montserrat: Similar geometric feel but less refined Vietnamese diacritical marks
- Be Vietnam Pro: Vietnamese-first Google Font, but less geometric than SVN-Gilroy

**Implementation**: Use `next/font/google` with Inter, applying weight mappings:
- SVN-Gilroy Bold → Inter 700
- SVN-Gilroy SemiBold → Inter 600
- SVN-Gilroy Medium → Inter 500
- SVN-Gilroy Medium Italic → Inter 500 italic

---

### 2. Hero Banner Carousel Implementation

**Decision**: Use Embla Carousel (via Shadcn UI carousel component)

**Rationale**: Already a dependency pattern in Shadcn ecosystem (shadcn/ui uses Embla internally). Lightweight (~6KB gzipped), performant touch/swipe support, composable API compatible with React 19.

**Alternatives Considered**:
- Swiper.js: Feature-rich but heavy (~35KB), overkill for simple banner slider
- Framer Motion-based custom carousel: Already have Framer Motion in project, but building a full carousel from scratch is complex and error-prone
- CSS-only carousel: Limited interactivity, no autoplay control

**Implementation**: Install `embla-carousel-react` and `embla-carousel-autoplay`. Create `Carousel` Shadcn component wrapping Embla.

---

### 3. Price Range Slider Component

**Decision**: Use Radix UI Slider primitive

**Rationale**: Project already uses Radix UI for all other primitives. Accessible, composable, and maintains consistency with existing component library.

**Alternatives Considered**:
- rc-slider: Popular but adds another dependency outside Radix ecosystem
- Native HTML range input: Poor styling control, no dual-thumb support for min/max range

**Implementation**: Add Shadcn `slider.tsx` component using `@radix-ui/react-slider` for the price filter on product listing pages.

---

### 4. Cart State Management

**Decision**: React Context + localStorage persistence (no server-side cart)

**Rationale**: The spec explicitly states "no online payment gateway required" — the system uses an order-request model. A server-side cart adds unnecessary API complexity. localStorage provides persistence across page reloads.

**Alternatives Considered**:
- Server-side cart via REST API: Adds backend complexity for no user benefit in order-request flow
- Zustand store: Would work but adds a new dependency; Context is sufficient for cart-level state
- SWR cache only: No persistence across sessions

**Implementation**: `CartContext.tsx` with `useReducer` for cart operations (add/remove/update quantity), synced to localStorage. Cart cleared on order submission.

---

### 5. Category Tree Navigation

**Decision**: Extend existing `CatalogCategory` with `parentId` for hierarchy, render recursive tree in sidebar

**Rationale**: Figma shows category links in the navbar (flat) and a tree sidebar on the listing page. The existing `CatalogCategory` type has `id`, `name`, `icon`, `sortOrder` — needs `parentId` for hierarchy.

**Alternatives Considered**:
- Flat category list only: Contradicts Figma design which shows hierarchical navigation
- Nested objects from API: More complex API response, harder to normalize

**Implementation**: Add `parentId?: number | null` and `slug?: string` to `CatalogCategory`. Build tree client-side from flat list.

---

### 6. Google Maps Embed for Contact Page

**Decision**: Use iframe embed with `<iframe src="https://maps.google.com/maps?q=...">`

**Rationale**: Simplest, no API key needed for basic embed. The Figma shows a map on the contact page. Google Maps Platform API would require billing setup and API key management.

**Alternatives Considered**:
- Google Maps JavaScript API: Requires API key, billing, and ~150KB SDK
- Leaflet/OpenStreetMap: No billing required but less familiar UX for Vietnamese users who expect Google Maps

**Implementation**: Configurable iframe URL in site-config, rendered in `contact-map.tsx`.

---

### 7. Image Optimization Strategy

**Decision**: Use Next.js `<Image>` component with existing configuration, add Figma-exported product images via admin upload

**Rationale**: Next.js already configured for remote image patterns (`**`), supports AVIF/WebP, and handles responsive sizing. No additional optimization infrastructure needed.

**Alternatives Considered**:
- External CDN (Cloudinary): Adds complexity and cost for a single-server deployment
- Sharp-based preprocessing: Already handled by Next.js image optimization pipeline

**Implementation**: Use existing `next/image` with proper `sizes` attributes and `priority` for above-fold images. Lazy load all below-fold images.

---

### 8. Vietnamese i18n Strategy

**Decision**: Extend existing i18n system with Vietnamese as primary locale, keep English as secondary

**Rationale**: All Figma content is in Vietnamese. The existing i18n system uses `useI18n()` hook with translation functions. Simply add `vi.ts` locale file.

**Alternatives Considered**:
- next-intl: Full i18n framework but adds dependency; existing custom system sufficient
- react-i18next: Overkill for two-language support

**Implementation**: Create `src/locales/vi.ts` with all keys matching the Figma text content. Set Vietnamese as default locale.

---

### 9. Floating Action Buttons

**Decision**: Fixed-position component with configurable buttons, managed via site-config API

**Rationale**: Figma shows 4 floating buttons (Zalo, Messenger, Hotline, scroll-to-top) in the bottom-right corner. Admin can enable/disable and configure links.

**Alternatives Considered**:
- Third-party chat widgets (Tawk.to, Intercom): External dependency, less control over design
- Native browser notification API: Different use case, not applicable

**Implementation**: `floating-buttons.tsx` with Framer Motion entrance animation, consuming config from `useSiteConfig()` hook.

---

### 10. Rich Text Content Rendering (Articles/About)

**Decision**: Use `react-markdown` (already a dependency) for article content rendering

**Rationale**: `react-markdown` is already in `package.json`. Supports standard markdown rendering with customizable components for styled output.

**Alternatives Considered**:
- TipTap editor output: Requires TipTap as dependency
- dangerouslySetInnerHTML: XSS risk, already used in footer but should be avoided for user-generated content
- MDX: Adds build complexity

**Implementation**: Use existing `react-markdown` with Tailwind Typography plugin (`@tailwindcss/typography` already installed) for article body rendering.
