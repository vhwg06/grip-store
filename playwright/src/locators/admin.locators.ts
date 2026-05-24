/**
 * Admin Locators — centralized selectors for admin panel.
 */

export const AdminLocators = {
  // Navigation
  nav: {
    container: '[data-testid="admin-nav"]',
    productsLink: '[data-testid="admin-nav-products"]',
    ordersLink: '[data-testid="admin-nav-orders"]',
    usersLink: '[data-testid="admin-nav-users"]',
    settingsLink: '[data-testid="admin-nav-settings"]',
    categoriesLink: '[data-testid="admin-nav-categories"]',
    cardsLink: '[data-testid="admin-nav-cards"]',
    dataLink: '[data-testid="admin-nav-data"]',
  },

  // Table
  table: {
    container: '[data-testid="admin-table"]',
    headerRow: '[data-testid="admin-table"] thead tr',
    bodyRows: '[data-testid="admin-table"] tbody tr',
    emptyState: '[data-testid="admin-table-empty"]',
  },

  // Actions
  actions: {
    createButton: '[data-testid="create-btn"]',
    editButton: '[data-testid="edit-btn"]',
    deleteButton: '[data-testid="delete-btn"]',
    toggleButton: '[data-testid="toggle-btn"]',
    saveButton: '[data-testid="save-btn"]',
    cancelButton: '[data-testid="cancel-btn"]',
    confirmDeleteButton: '[data-testid="confirm-delete-btn"]',
  },

  // Form fields (dynamic)
  form: {
    fieldPrefix: '[data-testid^="field-"]',
    titleField: '[data-testid="field-title"]',
    descriptionField: '[data-testid="field-description"]',
    priceField: '[data-testid="field-price"]',
    categoryField: '[data-testid="field-category"]',
    statusField: '[data-testid="field-status"]',
  },

  // Modals
  modal: {
    container: '[data-testid="admin-modal"]',
    title: '[data-testid="modal-title"]',
    closeButton: '[data-testid="modal-close-btn"]',
  },

  // Settings page
  settings: {
    siteNameInput: '[data-testid="setting-site-name"]',
    descriptionInput: '[data-testid="setting-description"]',
    currencySelect: '[data-testid="setting-currency"]',
    saveButton: '[data-testid="settings-save-btn"]',
  },
} as const;
