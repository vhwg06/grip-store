/**
 * Auth Locators — centralized selectors for authentication pages.
 * Prefer data-testid attributes for stability across UI refactors.
 */

export const AuthLocators = {
  // Login page
  loginPage: {
    emailInput: '[data-testid="login-email-input"]',
    passwordInput: '[data-testid="login-password-input"]',
    submitButton: '[data-testid="login-submit-btn"]',
    errorMessage: '[data-testid="login-error-message"]',
    forgotPasswordLink: '[data-testid="forgot-password-link"]',
    signUpLink: '[data-testid="signup-link"]',
  },

  // Sign up page
  signUpPage: {
    nameInput: '[data-testid="signup-name-input"]',
    emailInput: '[data-testid="signup-email-input"]',
    passwordInput: '[data-testid="signup-password-input"]',
    confirmPasswordInput: '[data-testid="signup-confirm-password-input"]',
    submitButton: '[data-testid="signup-submit-btn"]',
    errorMessage: '[data-testid="signup-error-message"]',
  },

  // Common auth elements
  common: {
    userAvatar: '[data-testid="user-avatar"]',
    logoutButton: '[data-testid="logout-btn"]',
    profileLink: '[data-testid="profile-link"]',
  },
} as const;
