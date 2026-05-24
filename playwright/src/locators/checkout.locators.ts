/**
 * Checkout Locators — centralized selectors for checkout page.
 */

export const CheckoutLocators = {
  // Form fields
  form: {
    emailInput: '[data-testid="checkout-email"]',
    phoneInput: '[data-testid="checkout-phone"]',
    addressInput: '[data-testid="checkout-address"]',
    noteInput: '[data-testid="checkout-note"]',
  },

  // Payment
  payment: {
    methodPrefix: '[data-testid^="payment-method-"]',
    selectedMethod: '[data-testid="selected-payment"]',
  },

  // Order summary
  summary: {
    items: '[data-testid="checkout-items"]',
    total: '[data-testid="checkout-total"]',
    placeOrderButton: '[data-testid="place-order-btn"]',
  },

  // Confirmation
  confirmation: {
    container: '[data-testid="order-confirmation"]',
    orderId: '[data-testid="confirmation-order-id"]',
    statusBadge: '[data-testid="confirmation-status"]',
    successMessage: '[data-testid="order-success-message"]',
  },

  // Order list (user orders page)
  orderList: {
    container: '[data-testid="orders-list"]',
    orderRow: '[data-testid="order-row"]',
    orderStatus: '[data-testid="order-status"]',
    orderTotal: '[data-testid="order-total"]',
    orderDate: '[data-testid="order-date"]',
    viewButton: '[data-testid="view-order-btn"]',
    cancelButton: '[data-testid="cancel-order-btn"]',
    refundButton: '[data-testid="refund-btn"]',
    confirmCancelButton: '[data-testid="confirm-cancel-btn"]',
    refundReason: '[data-testid="refund-reason"]',
    submitRefundButton: '[data-testid="submit-refund-btn"]',
  },
} as const;
