/**
 * Catalog Locators — centralized selectors for product browsing pages.
 */

export const CatalogLocators = {
  // Product cards
  productCard: {
    container: '[data-testid="product-card"]',
    title: '[data-testid="product-title"]',
    price: '[data-testid="product-price"]',
    image: '[data-testid="product-image"]',
    badge: '[data-testid="product-badge"]',
  },

  // Filter panel
  filter: {
    panel: '[data-testid="filter-panel"]',
    categoryPrefix: '[data-testid^="category-filter-"]',
    priceRange: '[data-testid="price-range-filter"]',
    resetButton: '[data-testid="reset-filters-btn"]',
  },

  // Sort
  sort: {
    select: '[data-testid="sort-select"]',
    optionPrefix: '[data-testid^="sort-option-"]',
  },

  // Pagination
  pagination: {
    container: '[data-testid="pagination"]',
    pagePrefix: '[data-testid^="page-"]',
    prevButton: '[data-testid="page-prev"]',
    nextButton: '[data-testid="page-next"]',
  },

  // Search
  search: {
    input: '[data-testid="search-input"]',
    submitButton: '[data-testid="search-submit"]',
    resultCount: '[data-testid="result-count"]',
    noResults: '[data-testid="no-results"]',
  },

  // Homepage specific
  homepage: {
    heroTitle: '[data-testid="hero-title"]',
    heroSubtitle: '[data-testid="hero-subtitle"]',
    featuredProducts: '[data-testid="featured-product-card"]',
    categoryIcons: '[data-testid="category-icon"]',
    announcementBanner: '[data-testid="announcement-banner"]',
  },

  // Product detail
  detail: {
    title: '[data-testid="product-detail-title"]',
    price: '[data-testid="product-detail-price"]',
    description: '[data-testid="product-detail-description"]',
    addToCartBtn: '[data-testid="add-to-cart-btn"]',
    imageGallery: '[data-testid="product-gallery"]',
    thumbnails: '[data-testid="product-thumbnail"]',
    tabs: '[data-testid="product-tabs"]',
    reviewItem: '[data-testid="review-item"]',
    reviewAuthor: '[data-testid="review-author"]',
    reviewRating: '[data-testid="review-rating"]',
    reviewContent: '[data-testid="review-content"]',
  },
} as const;
