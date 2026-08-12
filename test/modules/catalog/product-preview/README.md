# Catalog / ProductModel Preview

This slice owns the private storefront projection for Draft ProductModels.

Preview reuses the public projection semantics over Draft data, preserves the
Draft lifecycle state, exposes ordered content and selection data, uses the
explicit Default Variant when present, and keeps technical values outside
Variant identity. It does not introduce revisions, scheduling, staged/current
publishing, or partial publishing.
