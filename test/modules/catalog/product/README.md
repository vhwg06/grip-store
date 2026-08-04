# Retired legacy Product slice

This directory is retained only as a migration ledger for the pre-Catalog Base
`Product` contract. The Catalog Base Markdown explicitly replaces that model
with `ProductModel` and `Variant`; therefore these scenarios are deferred and
must not be treated as accepted behavior.

Authoritative Catalog Base behavior lives in:

- `catalog.master-data`
- `catalog.product-model`
- `catalog.variant`
- `catalog.public-query`

Do not add new scenarios here. Retire this ledger after the legacy migration
mapping is formally closed.
