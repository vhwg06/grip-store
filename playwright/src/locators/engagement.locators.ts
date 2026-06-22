/**
 * Engagement Locators — centralized selectors for wishlist, reviews, and profile.
 */

export const EngagementLocators = {
  // Wishlist
  wishlist: {
    container: '[data-testid="wishlist-container"]',
    item: '[data-testid="wishlist-item"]',
    itemTitle: '[data-testid="wishlist-item-title"]',
    itemVotes: '[data-testid="wishlist-item-votes"]',
    addButton: '[data-testid="add-wishlist-btn"]',
    removeButton: '[data-testid="remove-wishlist-btn"]',
    voteButton: '[data-testid="vote-wishlist-btn"]',
    emptyState: '[data-testid="wishlist-empty"]',
  },

  // Reviews
  review: {
    form: '[data-testid="review-form"]',
    ratingInput: '[data-testid="review-rating-input"]',
    starPrefix: '[data-testid^="review-star-"]',
    contentInput: '[data-testid="review-content-input"]',
    submitButton: '[data-testid="review-submit-btn"]',
    item: '[data-testid="review-item"]',
    author: '[data-testid="review-author"]',
    rating: '[data-testid="review-rating"]',
    content: '[data-testid="review-content"]',
  },

  // Profile
  profile: {
    username: '[data-testid="profile-username"]',
    email: '[data-testid="profile-email"]',
    emailInput: '[data-testid="profile-email-input"]',
    saveButton: '[data-testid="profile-save-btn"]',
  },
} as const;
