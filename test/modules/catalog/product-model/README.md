# Catalog / ProductModel

This slice owns ProductModel authoring, derived publish readiness, media,
Default Variant guards, optimistic version checks, and the explicit lifecycle:
Draft → Active → Discontinued.

`behavior.feature` is the acceptance contract for the ProductModel aggregate.
ProductModel is the only customer-visible product concept; inventory,
warehouse, order, purchase-limit, and warranty-claim state are outside this
slice. Publication is readiness-gated and Discontinued is terminal.
