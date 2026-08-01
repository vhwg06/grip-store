# Catalog public query

This vertical slice owns the public catalog read model: product listing,
search, category filtering, product detail, buy metadata, settings, and the
announcement projection. Product administration belongs to
`catalog.product`; storefront interactions belong to `browse` or
`product-flow`.

The feature is the executable specification. The colocated steps use the real
API configured by `TEST_API_BASE_URL` and do not use fixture-only responses.
