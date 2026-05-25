# UI Test Contract (Figma Traceability)

This contract is the intermediate layer between Figma design context and Playwright UI specs.

## Route Mapping

| Route | Figma Node | Required Sections / Behaviors |
| --- | --- | --- |
| `/` | `27:1404`, `47:1048` | Hero visible, category rail visible, featured products visible, CTA/contact cluster present, mobile-first responsive continuity |
| `/products` | `58:861` | Listing title/intro, filter/sort/result count zone, product cards grid |
| `/products/[id]` | `62:2672` | Detail title/price/gallery/tabs, add-to-cart CTA |
| `/cart` | `114:3466` | Cart items list, remove/update quantity, cart total, checkout CTA |
| `/checkout` | `117:4153` | Shipping form fields, payment method selection, total amount, place order CTA |
| `/articles` | `87:2148` | News/article listing block and navigable cards |
| `/contact` | `47:1048` | Contact information sections + contact form |
| `/admin/*` | `62:2672` (management patterns), `58:861` (table/filter patterns) | Admin nav, admin table, core actions (create/edit/delete/toggle) |

## Selector Contract (Required data-testid)

- `hero`, `hero-title`
- `category-icon`
- `featured-product-card`
- `product-card`, `product-title`, `product-price`
- `product-detail-title`, `product-detail-price`, `product-gallery`, `product-tabs`
- `add-to-cart-btn`
- `cart-item`, `cart-item-title`, `cart-item-price`, `cart-item-qty`, `remove-item-btn`, `cart-total`, `checkout-btn`
- `checkout-email`, `checkout-phone`, `checkout-address`, `checkout-note`, `payment-method-*`, `checkout-total`, `place-order-btn`, `order-confirmation`
- `admin-nav`, `admin-nav-products`, `admin-nav-orders`, `admin-nav-users`, `admin-nav-settings`, `admin-nav-categories`
- `admin-table`, `create-btn`, `edit-btn`, `delete-btn`, `toggle-btn`

## Notes

- Playwright remains source-of-truth for business behavior.
- Figma is used for layout/section intent and traceability.
- Raw MCP payload is intentionally not committed.
