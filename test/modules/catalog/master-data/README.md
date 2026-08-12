# Catalog / Master Data

This slice owns the greenfield Catalog vocabulary defined by
`test/docs/srs/srs_001_product.md`:

- Category hierarchy, ordering, activation, and non-destructive lifecycle;
- typed Attribute Definitions and stable Enum Options;
- Material, Finish, and Pack Master Data.

`behavior.feature` is the acceptance contract. Category is classification only;
it does not own Attribute schema, ProductModel templates, publication rules, or
Variant rules. Deactivated definitions, options, and masters block new
assignments while keeping existing references readable.
