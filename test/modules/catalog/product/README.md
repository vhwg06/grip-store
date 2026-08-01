# Catalog product administration

This vertical slice owns catalog administration API behavior: operator reads,
product creation and update, category hierarchy, product editorial/media
boundary, and transactional detail persistence. ProductModel and Variant
policies remain in their dedicated catalog slices; admin product UI belongs to
`admin.product`.

All steps call the real admin/public API. Authentication and the API base URL
are resolved during scenario execution from the test environment.
