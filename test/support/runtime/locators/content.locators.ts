/**
 * Content Locators — centralized selectors for content pages (articles, about, contact).
 */

export const ContentLocators = {
  // Articles
  articles: {
    card: '[data-testid="article-card"]',
    title: '[data-testid="article-title"]',
    excerpt: '[data-testid="article-excerpt"]',
    pagination: '[data-testid="articles-pagination"]',
    detailTitle: '[data-testid="article-detail-title"]',
    detailContent: '[data-testid="article-detail-content"]',
    detailDate: '[data-testid="article-detail-date"]',
    detailAuthor: '[data-testid="article-detail-author"]',
  },

  // About page
  about: {
    title: '[data-testid="about-title"]',
    content: '[data-testid="about-content"]',
    gallery: '[data-testid="about-gallery"]',
    galleryImage: '[data-testid="about-gallery-image"]',
    teamSection: '[data-testid="about-team"]',
  },

  // Contact page
  contact: {
    form: '[data-testid="contact-form"]',
    nameInput: '[data-testid="contact-name"]',
    emailInput: '[data-testid="contact-email"]',
    messageInput: '[data-testid="contact-message"]',
    submitButton: '[data-testid="contact-submit-btn"]',
    successMessage: '[data-testid="contact-success"]',
    mapEmbed: '[data-testid="contact-map"]',
    companyInfo: '[data-testid="contact-company-info"]',
    phone: '[data-testid="contact-phone"]',
    address: '[data-testid="contact-address"]',
  },
} as const;
