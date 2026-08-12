# Catalog / Variant Generation

This slice owns the separation between `PreviewVariantCombinations` and
`GenerateVariants`.

Preview is read-only, classifies existing/new/excluded canonical combinations,
reports the warning threshold, and enforces the Cartesian hard limit. Generation
persists only the operator-selected subset, creates Inactive Variants, returns
item-level results, is idempotent for existing combinations, and enforces the
maximum persisted Variant count.
