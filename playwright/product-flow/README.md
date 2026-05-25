# Product Flow Test-First Package

This folder is the source of truth for Product Flow refactor.

## Contents

- `spec.md`: Product Flow scope, rules, and acceptance intent.
- `use-cases.md`: Functional use cases for Guest and Admin product behavior.
- `scenarios.md`: Scenario IDs and expected Gherkin-style outcomes.
- `api-contract.md`: API behavior required by Product Flow tests.
- `dod.md`: Definition of Done gate.
- `traceability.md`: Mapping between use cases, scenarios, and spec files.

## Execution Model

1. Lock spec in this folder.
2. Implement or update Playwright specs from scenario IDs.
3. Run Product Flow suite red first.
4. Implement backend first.
5. Implement frontend integration.
6. Reach green for Product Flow suite.

## Playwright Skeleton Specs

Skeleton specs are stored in:

- `playwright/specs/product-flow/home.spec.ts`
- `playwright/specs/product-flow/catalog.spec.ts`
- `playwright/specs/product-flow/detail.spec.ts`
- `playwright/specs/product-flow/api.spec.ts`

All tests are intentionally `skip` at this stage to preserve current CI behavior while formalizing the test contract.
