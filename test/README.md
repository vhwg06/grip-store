# Test repository

This directory is the test repository. Each capability is a vertical slice
under `modules/`.

`behavior.feature` is the Gherkin business source. Its stable scenario tags
are the navigation key for `cucumber-js`. The colocated `behavior.steps.ts`
file is the static Cucumber binding boundary and contains the executable
adapter for the scenario. There are no parallel module-native `*.spec.ts`
files: API and browser behavior is executed from these feature steps.

Authenticated scenarios require `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`,
`ADMIN_USER_EMAIL`, and `ADMIN_USER_PASSWORD` (or the corresponding token
variables). No local or bypass environment is used.

`shared/` contains cross-module plumbing only. `generated/` contains the
committed deterministic traceability index and the reserved ephemeral output
boundary; Gherkin itself is not rewritten into a second acceptance source.

Run the whole accepted feature suite with `npm run test:acceptance` (or
`npm run test:all`). Run one scenario with
`npm run test:scenario -- @SC-MODEL-01`. The `test:api` and `test:browser`
commands are tag-filtered views over the same Gherkin suite, not separate
test sources. Use `tools/validate-modules.ts` and
`tools/validate-openapi.ts` for structural checks; those commands do not call
the backend.
