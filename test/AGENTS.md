# Test repository rules

- `modules/**` owns capability behavior and its executable Cucumber binding.
- `behavior.feature` is the business acceptance source.
- `behavior.steps.ts` is a thin, statically bound Cucumber automation adapter.
- Stable Scenario IDs are tags on the Scenario. `npm run test:scenario --
  @SC-MODEL-01` selects that Gherkin Scenario via Cucumber after its module
  adapter is implemented.
- Every accepted Scenario ID is declared in its module manifest. Cucumber's
  world hook resolves the feature URI and module-local steps file for that tag;
  there are no parallel native `*.spec.ts` targets.
- `shared/**` contains only cross-module plumbing.
- `generated/**` is build output and must not be edited by hand. Gherkin is
  executed directly by Cucumber; no generated Playwright-BDD source is the
  acceptance source.
- *Always follow: `Spec / Use Case → Test → Implementation → Verification`.
