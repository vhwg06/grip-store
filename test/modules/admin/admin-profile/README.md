# Admin / Admin Profile

This module owns the executable Gherkin behavior for the admin.admin-profile capability.

- behavior.feature is the Gherkin source of truth and contains every accepted scenario for this slice.
- behavior.steps.ts is the colocated Cucumber binding boundary and calls the real API or browser lifecycle.
- manifest.yaml maps scenario IDs to this feature and step file.
- shared/ contains only cross-module plumbing.
