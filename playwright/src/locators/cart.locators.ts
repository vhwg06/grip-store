/**
 * Cart Locators — centralized selectors for cart page.
 */

export const CartLocators = {
  // Cart items
  items: {
    container: '[data-testid="cart-items"]',
    item: '[data-testid="cart-item"]',
    title: '[data-testid="cart-item-title"]',
    price: '[data-testid="cart-item-price"]',
    quantity: '[data-testid="cart-item-qty"]',
    removeButton: '[data-testid="remove-item-btn"]',
    subtotal: '[data-testid="cart-item-subtotal"]',
  },

  // Cart summary
  summary: {
    total: '[data-testid="cart-total"]',
    subtotal: '[data-testid="cart-subtotal"]',
    shipping: '[data-testid="cart-shipping"]',
    discount: '[data-testid="cart-discount"]',
  },

  // Actions
  actions: {
    checkoutButton: '[data-testid="checkout-btn"]',
    continueShopping: '[data-testid="continue-shopping-btn"]',
    clearCart: '[data-testid="clear-cart-btn"]',
  },

  // Empty state
  emptyState: {
    container: '[data-testid="empty-cart"]',
    message: '[data-testid="empty-cart-message"]',
    shopLink: '[data-testid="empty-cart-shop-link"]',
  },
} as const;
