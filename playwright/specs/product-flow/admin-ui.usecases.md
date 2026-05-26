# Product Flow Admin UI Usecases

Scope: admin product management flow traced as part of product-flow business scenarios.

## UC-PF-ADMIN-001: Create product from admin UI

- Actor: Admin user
- Preconditions:
- Admin is authenticated
- Product category data exists
- Main flow:
1. Admin opens `/admin/product/new`
2. Admin fills required fields: title, price, slug
3. Admin adds product specs rows
4. Admin saves product
5. Buyer-side storefront can search and open created product
6. Product detail renders saved specs
- Postconditions:
- Product is persisted in backend
- Product detail shows created specs

## UC-PF-ADMIN-002: Upload media during product creation

- Actor: Admin user
- Preconditions:
- Admin is authenticated
- Main flow:
1. Admin opens `/admin/product/new`
2. Admin uploads an image through media input
3. Preview card and preview image are shown
4. Admin saves product successfully
- Postconditions:
- Product create flow accepts uploaded media metadata

## UC-PF-ADMIN-003: Product list action contract

- Actor: Admin user
- Preconditions:
- Admin is authenticated
- Main flow:
1. Admin opens `/admin/products`
2. Admin sees table/list container
3. Admin sees row actions: toggle, edit, delete
4. Admin executes toggle on a row
5. Admin executes delete flow on a row and confirms when dialog appears
- Postconditions:
- Admin can perform lifecycle actions from list screen

## Scenario IDs for Playwright

- `PF-ADMIN-UI-001`: create product with specs and verify storefront detail specs.
- `PF-ADMIN-UI-002`: upload image during create and verify media preview contract.
- `PF-ADMIN-UI-003`: verify list action contract and execute toggle/delete path.
