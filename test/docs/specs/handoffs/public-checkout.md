# Wave A — Public Checkout Discovery Handoff

## Scope and evidence

This handoff is derived only from:

- `test/modules/checkout/README.md`
- `test/modules/checkout/manifest.yaml`
- `test/modules/checkout/behavior.feature`
- `test/modules/checkout/behavior.steps.ts`

The checkout README declares `behavior.feature` as the executable source of truth and `behavior.steps.ts` as the browser/API binding boundary. No frontend, backend, Figma, or designer artifacts were used.

## Semantic authority status

No separate canonical Checkout semantic specification was located. This
handoff records user goals and observable browser/API evidence; it does not
make Gherkin the semantic authority for cart, order, payment or history.

Cart/order ownership, item identity, quantity rules, payment outcomes,
durability and shopper order-history routing remain a `semantic source gap`.
Do not strengthen permissive assertions or invent those meanings during UX
synthesis. If a later canonical semantic specification conflicts with a
scenario, the semantic specification wins and the scenario is marked
`conflicting` or `stale`.

## Capability goal

Checkout is the public shopper capability for managing a cart and completing a purchase that produces a durable order result. The accepted coverage has three connected goals:

1. **Cart management:** find an available product, add it, view its total, change quantity, remove it, and render an empty-cart state.
2. **Checkout completion:** preserve the product → cart → checkout CTA flow, allow a valid cart to reach order placement, and display a confirmation or payment/order result.
3. **Order and API boundaries:** expose a completed order through an order-list route and make the checkout API enforce authentication, validate order input, return order identity/status/amount, and protect payment, status, cancellation, and preview operations.

The module does not define pricing rules, payment-provider behavior, inventory reservation, order status values, error payload shapes, or an exact shopper order-history route beyond what the scenarios assert.

## Accepted scenario inventory

### Cart behavior

| ID | Contract derived from the scenario | Observable assertion | Setup/dependencies |
|---|---|---|---|
| `SC-CHECKOUT-CART-001` | An available product can be added and viewed in the cart. | Cart item collection has at least one item. The binding does not compare the item identity with the selected product. | Reachable catalog; at least one product whose buy metadata says `available`; browser product-detail and cart drivers. |
| `SC-CHECKOUT-CART-002` | A cart containing a product exposes its total. | `[data-testid="cart-total"]` is visible. | Same available-product/catalog and browser dependencies. |
| `SC-CHECKOUT-CART-003` | A product quantity can be changed to `2`. | First cart item reports `quantity === 2`. | Cart item at index `0`; browser cart driver. No reload/fresh read. |
| `SC-CHECKOUT-CART-004` | A cart product can be removed. | Cart item collection has length `0`. | Cart item at index `0`; browser cart driver. No reload/fresh read. |
| `SC-CHECKOUT-CART-005` | A cart with no products renders the empty state. | `[data-testid="empty-cart"]` is visible. | `clearCart` navigates to the cart and removes every currently visible item before the scenario opens the cart again. |

### Browser checkout and order-history behavior

| ID | Contract derived from the scenario | Observable assertion | Setup/dependencies |
|---|---|---|---|
| `SC-CHECKOUT-ORDER-001` | The cart route keeps the total and checkout CTA available when the cart page loads. | `[data-testid="cart-total"]` and `[data-testid="checkout-btn"]` are visible. The setup does not require a non-empty cart. | Browser cart route/driver. |
| `SC-CHECKOUT-ORDER-002` | A shopper can move from available product detail through cart to checkout. | `[data-testid="place-order-btn"]` is visible after navigation to checkout. | Available product; browser product-detail/cart/checkout drivers; DOM content loaded after proceeding. |
| `SC-CHECKOUT-ORDER-003` | A valid cart can be submitted. | `getOrderConfirmation()` returns a value, or the final URL contains `payment` or `order`. | Available product; cart and checkout drivers; `TEST_USER_EMAIL` if the email field is visible; the first payment-method control if visible; place-order action. |
| `SC-CHECKOUT-ORDER-004` | After a completed purchase, the orders-list route can be opened and yields a visible result. | The first `[data-testid="order-row"]`, `[data-testid="admin-table-empty"]`, or authorization-state locator is visible. | A newly submitted cart/order; browser navigation to `/admin/orders`; DOM content loaded. |

### Checkout API behavior

| ID | Contract derived from the scenario | Observable assertion | Request/setup |
|---|---|---|---|
| `SC-CHECKOUT-API-001` | An authenticated shopper can create an order for a purchasable product. | `POST /v1/checkout/orders` returns `200` or `201`; response has a truthy `orderId` or `id`, truthy `status`, and truthy `amount`, `total`, or `total_amount`. | Bearer token from the test user; product from catalog with `stock > 0` and `active !== false`; body `{ product_id, quantity: 1, email }`; `TEST_USER_EMAIL`. |
| `SC-CHECKOUT-API-002` | Checkout-order creation requires authentication. | Unauthenticated `POST /v1/checkout/orders` returns exactly `401`. | Body is an `items` array containing a fake product, quantity `1`, and price `100`; no authorization header. |
| `SC-CHECKOUT-API-003` | Authenticated checkout rejects invalid order data. | Returns `400` or `422`. | Bearer token; `product_id: "non-existent-product"`, `quantity: 0`, and test email. Error body is not asserted. |
| `SC-CHECKOUT-API-004` | Payment-order creation requires authentication. | Unauthenticated `POST /v1/checkout/payment-orders` returns exactly `401`. | Body `{ order_id: "fake-order-id" }`; no authorization header. |
| `SC-CHECKOUT-API-005` | Payment-parameter reads require authentication. | Unauthenticated `GET /v1/checkout/orders/fake-order-id/payment-params` returns exactly `401`. | No authorization header. |
| `SC-CHECKOUT-API-006` | Checkout-order status reads require authentication. | Unauthenticated `GET /v1/checkout/orders/fake-order-id/status` returns exactly `401`. | No authorization header. |
| `SC-CHECKOUT-API-007` | Checkout-order cancellation requires authentication. | Unauthenticated `POST /v1/checkout/orders/fake-order-id/cancel` returns exactly `401`. | No authorization header. |
| `SC-CHECKOUT-API-008` | Checkout preview reads require authentication. | Unauthenticated `GET /v1/checkout/preview` returns exactly `401`. | No authorization header. |

## Behavior and contract notes

### Cart

- Product discovery is live: the browser helper lists up to 20 catalog products and selects the first whose buy metadata is available.
- Adding is exercised through product detail, then the cart is opened. The accepted assertion is only that the cart is non-empty; it does not verify product ID, name, price, line amount, or quantity.
- The cart total is a visible UI contract, but its numeric value and currency are not specified.
- Quantity update is exercised as the first item changing to `2`; bounds, zero/negative quantities, stock limits, and invalid quantity errors are unspecified.
- Removal is exercised for the first item and expects an empty collection. Multi-item removal and the confirmation/error behavior for removal are unspecified.
- Empty-cart setup actively removes all currently visible items. There is no module-level cleanup shown for the other cart scenarios, so shared cart state and execution order matter unless the runner provides isolation.

### Checkout and completion

- The route continuity contract is product detail → add to cart → cart → proceed to checkout → visible place-order CTA.
- Checkout email entry is conditional: it is filled only if `[data-testid="checkout-email"]` is visible, using `TEST_USER_EMAIL`.
- Payment selection is conditional: the first locator matching `[data-testid^="payment-method-"]` is clicked only if visible.
- Completion invokes `placeOrder()` after the optional fields. Confirmation is intentionally broad: a non-null order confirmation object **or** a URL containing `payment` or `order` is accepted.
- The scenarios do not assert a success status, order ID, amount, payment result, order status, cart clearing, duplicate-submit behavior, or durable persistence after completion.

### Order history

`SC-CHECKOUT-ORDER-004` describes a completed order being present, but its binding currently proves only that one of three states is visible after opening `/admin/orders`:

- an order row;
- an empty-table state; or
- an unauthorized/auth-required state.

It does not capture the created order identity, match a row to that order, or require a non-empty list. The route is also `/admin/orders`, while the scenario language says “orders list” for a shopper. Ownership, authorization, pagination, and the intended public order-history route therefore need an explicit contract decision before stronger coverage is added.

### Validation and errors

- Authentication failures are exact `401` checks for order creation, payment-order creation, payment-parameter reads, status reads, cancellation, and preview.
- Invalid authenticated order input accepts either `400` or `422`; no error code, field map, message, or payload schema is defined.
- The invalid-data case combines a non-existent product ID with `quantity: 0`, so it does not isolate which validation rule is responsible.
- No authenticated payment, status, cancellation, or preview success path is accepted by this module. No authorization/ownership case for another shopper’s order is covered.
- No browser-visible validation, payment failure, unavailable-product, stock-limit, missing-email, or retry error behavior is defined.

### Authentication

- API setup obtains a user token through `getUserToken` and sends it as `Authorization: Bearer <token>` for the valid and invalid authenticated order-create cases.
- Unauthenticated cases deliberately omit the authorization header and use fake order/product identifiers where a body/path is required.
- Browser scenarios do not explicitly authenticate in the checkout steps. If the driver/session supplies auth, that is an external runtime dependency rather than an asserted checkout behavior.
- The only required environment value visible in this module is `TEST_USER_EMAIL`, and it is needed when checkout exposes the email field and for API order creation.

## Fresh-read and reversible-state semantics

The repository instructions require reversible state changes to be tested in both directions and verified after reload or a fresh API read. The current checkout module does not yet meet that bar; this is a discovery gap, not a reason to weaken the accepted scenarios.

Observed coverage versus the required follow-up:

| State/change | Current observation | Fresh-read or reverse-direction gap |
|---|---|---|
| Add product | Reads the current cart driver after add. | No cart reload/fresh API read and no assertion that the selected product is the persisted item. |
| Quantity | Changes the first item to `2` and reads it immediately. | No reload/fresh read; no `2 → 1` (or documented inverse) check; no stock/boundary validation. |
| Remove | Removes the first item and reads the current cart collection. | No reload/fresh read and no add-back/reversal check. |
| Empty state | Removes visible items, reopens the page, and checks the empty locator. | This is a navigation reread, but it does not establish persistence beyond the browser cart source or test adding again. |
| Order creation | Checks only the create response fields. | No fresh order/status read, payment-parameter read, or order-list match using the returned identity. |
| Completion | Checks confirmation object or a broad URL pattern. | No durable order reread, no success-state assertion, and no cart/order transition verification after reload. |
| Cancellation | Only unauthenticated access is checked. | No authenticated state transition, no post-cancel status reread, and no documented reversibility policy. |

Wave A should explicitly decide which of these are reversible and encode both directions where the public contract permits reversal. For non-reversible actions such as cancellation or order completion, the contract should define the one-way transition and the fresh-read postcondition rather than inventing an inverse operation.

## Derived discovery tasks

These tasks are ordered by dependency and keep the existing scenario IDs as the traceability anchors.

1. **Define the public cart contract** — specify item identity, quantity bounds, stock behavior, totals, empty state, persistence scope, and the supported inverse for add/update/remove. Covers `SC-CHECKOUT-CART-001` through `005`.
2. **Add persistence semantics to cart checks** — after mutation, reload or perform the supported fresh read; verify quantity/removal state and the permitted reverse direction. Depends on the cart contract and an isolated shopper/cart fixture. Covers `SC-CHECKOUT-CART-001`, `003`, `004`, `005`.
3. **Lock the route/CTA contract** — define whether cart and checkout are public or session-authenticated, and the expected behavior for empty/unavailable carts. Covers `SC-CHECKOUT-ORDER-001` and `002`.
4. **Define checkout form and payment completion** — specify required email/payment fields, validation errors, payment states, success criteria, order identity, idempotency/retry behavior, and post-submit cart state. Covers `SC-CHECKOUT-ORDER-003` and its API counterpart `SC-CHECKOUT-API-001`.
5. **Define durable order confirmation** — require a stable order identity and a fresh read of the created order/status after completion. Depends on the order-create contract and payment completion contract. Covers `SC-CHECKOUT-ORDER-003`.
6. **Resolve order-history ownership and route** — decide whether `/admin/orders` is the intended public shopper order list; define authorization, row identity matching, empty state, and pagination. Then strengthen `SC-CHECKOUT-ORDER-004` to prove the just-created order is present.
7. **Specify API validation/error contracts** — separate missing product, invalid quantity, invalid email, unavailable/insufficient stock, and malformed payload cases; define whether each is `400` or `422` and the error body. Starts from `SC-CHECKOUT-API-003`.
8. **Cover authenticated API lifecycle operations** — define successful payment-order creation, payment-parameter read, status read, preview, and cancellation, including ownership and post-transition status. The existing `SC-CHECKOUT-API-004` through `008` establish only the unauthenticated boundary.
9. **Create deterministic state/fixture policy** — ensure an available catalog product, authenticated shopper, test email, isolated cart, and serial execution for persistent mutations. This is a prerequisite for all browser mutation scenarios and `SC-CHECKOUT-API-001`/`003`.

## Dependencies and execution risks

- **Catalog:** browser setup requires a reachable catalog and at least one product whose buy metadata reports `available`; API setup separately requires `stock > 0` and `active !== false`.
- **Authentication/configuration:** authenticated API cases require a retrievable test-user token; checkout/API email paths require `TEST_USER_EMAIL`.
- **Browser boundary:** the module depends on `ScenarioWorld.getCheckoutBrowserDriver()` and page objects for product detail, cart, and checkout. The accepted UI selectors include `cart-total`, `checkout-btn`, `place-order-btn`, `checkout-email`, payment-method prefixes, `empty-cart`, and order-list states.
- **API boundary:** the module calls the checkout paths `/v1/checkout/orders`, `/v1/checkout/payment-orders`, `/v1/checkout/orders/{id}/payment-params`, `/v1/checkout/orders/{id}/status`, `/v1/checkout/orders/{id}/cancel`, and `/v1/checkout/preview`.
- **Shared state:** add, quantity, removal, checkout, and order creation mutate shopper/cart/order state. The instructions require serial execution for shared persistent mutations; the checkout artifacts show no explicit module cleanup hook.
- **Data freshness:** immediate page-object reads are not equivalent to a reload or independent API read. Any stronger persistence claim needs a fresh-read mechanism and an order/product fixture that remains valid for the assertion.
- **Contract ambiguity:** browser confirmation and order-list assertions are permissive, so passing them does not establish a successful durable order without additional identity/status checks.

## Reusable candidates

The following are reusable patterns already present in the checkout binding. Reuse should preserve scenario-level assertions and should not silently merge different product-availability contracts.

- `availableProduct(world)` — browser product discovery through catalog listing plus buy metadata.
- `apiProduct(world)` — API product discovery using stock and active flags. It is conceptually related to `availableProduct`, but the different predicates should be unified only after the product-availability contract is decided.
- `addProduct(world)`, `openCart(world)`, and `clearCart(world)` — browser cart setup/navigation primitives.
- `checkoutToken(world)` — cached authenticated test-user token setup.
- The repeated browser purchase sequence in `SC-CHECKOUT-ORDER-003` and `004` — candidate for a `completeCheckout` helper that returns/captures the created order identity for later fresh-read and order-history assertions.
- The repeated unauthenticated API expectation across `SC-CHECKOUT-API-002` and `004`–`008` — candidate for a small method/path/body matrix while retaining each scenario ID and exact endpoint contract.
- `state(world).response` — existing per-scenario response capture suitable for adding structured status/body assertions without shared mutable state.

## Handoff completion criteria

Wave A discovery is ready for implementation planning when the team can answer, from the public contract:

- what exactly identifies a cart item and a completed order;
- which cart changes are reversible and how both directions are freshly verified;
- what constitutes successful checkout confirmation and durable persistence;
- which route and authorization model define shopper order history;
- the validation/error schema and status for each invalid input;
- the authenticated behavior and postconditions of payment, preview, status, and cancellation; and
- how catalog, auth, email, cart isolation, and serial execution fixtures are provided.

## Canonical Figma rebuild

The current behavior-preserved Checkout slice is represented by top-level
frames on `00 — Index`:

- Cart loaded/empty: `561:150`, `561:151` desktop; `561:728` representative mobile.
- Checkout form: `561:152`.
- Confirmation and orders-list boundary: `561:153`, `561:154`.

Prototype wiring covers cart → checkout → confirmation → orders and remove →
empty cart. The screens expose only the accepted cart/order observations; they
do not claim payment success, durable order identity, order status, or shopper
order-history semantics beyond the current permissive scenarios. Checkout has
no canonical semantic specification in the repository, so the semantic source
gap remains an explicit completion blocker.
