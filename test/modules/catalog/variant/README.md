# Catalog / Variant

This slice owns Variant Dimensions, complete selections, canonical combination
identity, SKU uniqueness, commercial values, status, sale readiness, Pack
references, and Variant media assignments.

`behavior.feature` is the acceptance contract. Create and generate operations
produce Inactive Variants; technical values stay outside identity; inactive
Variants remain readable but are excluded from public options and resolution.
Combination preview/generation and bulk commands have their own slices.
