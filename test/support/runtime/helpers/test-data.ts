/**
 * Test Data Factories — generate predictable test data for E2E scenarios.
 */

let counter = 0;

function uid(): string {
  return `${Date.now()}-${++counter}`;
}

export const TestData = {
  /** Generate a unique email for isolation across test runs */
  email(prefix = "testuser"): string {
    return `${prefix}+${uid()}@test.grip.store`;
  },

  /** Random password meeting minimum requirements */
  password(): string {
    return `Test@${uid()}!Aa1`;
  },

  /** Generate a product title */
  productTitle(base = "Test Product"): string {
    return `${base} ${uid()}`;
  },

  /** Generate a category name */
  categoryName(base = "Category"): string {
    return `${base} ${uid()}`;
  },

  /** Generate a valid phone number */
  phone(): string {
    const num = Math.floor(1000000000 + Math.random() * 9000000000);
    return `+1${num}`;
  },

  /** Generate an address object */
  address() {
    return {
      street: `${Math.floor(100 + Math.random() * 900)} Test Street`,
      city: "Test City",
      state: "TC",
      zip: "12345",
      country: "US",
    };
  },

  /** Generate a price string */
  price(min = 1, max = 999): string {
    const value = (Math.random() * (max - min) + min).toFixed(2);
    return value;
  },

  /** Generate a quantity */
  quantity(min = 1, max = 10): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
} as const;
