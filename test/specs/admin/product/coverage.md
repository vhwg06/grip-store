# Catalog Base Coverage

## Canonical Documents

- `overview.md`: scope, terminology and lifecycle boundary.
- `domain-model.md`: typed attributes, scopes, Variant identity and integrity.
- `use-cases.md`: admin and public catalog behaviors.
- `scenarios.md`: narrative use-case flows and regression boundaries.
- `ownership.md`: backend/frontend/deferred responsibility split.
- `catalog-base-prd.md`: approved BDD-ready feature specification.
- `features/*.feature`: executable-contract candidates grouped by catalog epic.
- `traceability.json`: machine-readable requirement → scenario → OpenAPI →
  BDD feature/tag/project coverage gate. Accepted scenarios must declare at
  least one executable layer; deferred scenarios declare no layer or BDD mapping.
- `contracts/api-contract.md`: HTTP operation/status semantics that reference,
  but never duplicate, the canonical OpenAPI schema.
- `contracts/browser-acceptance.md`: accepted browser routes and locator policy.

## Accepted Coverage

- master lifecycle for Category, Attribute Definition, Material, Finish and Pack.
- ProductModel authoring, media, measurements, WarrantySummary and publication lifecycle.
- Variant dimensions, canonical combinations, variant-specific technical values and lifecycle.
- SKU, SellingPrice, Pack reference and atomic bulk pricing.
- public browse/search/detail/filter, available options and Variant resolution.

## Explicit Gaps / Deferred

- no legacy Product compatibility or migration; catalog is reset at cutover.
- no stock, warehouse, purchase limits, order or after-sales workflow.
- no quantity pricing or price engine.
- no dynamic attribute filtering, attribute rule, compare-product contract or Variant dimension reconfiguration.

## Priority

- Catalog Base contract and BDD: `P1`.
- Deferred Attribute Rule and cross-domain enrichments: not committed to this phase.

## Executable Contract Rule

PRD/Gherkin approve behavior, the API/browser contract documents fix the phase
projection, and `playwright-bdd` generates the Playwright tests from these
features. A change to accepted behavior requires its scenario tag, contract
mapping, and generated API/browser project coverage to change together. Run
`npm run bddgen:catalog` to materialize the tests and
`npm run validate:catalog-traceability` to enforce the mapping. The acceptance
gate is intentionally red until the Catalog Base backend/frontend contracts
exist.
