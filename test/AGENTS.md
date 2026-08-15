# Repository Non-Violable Rules

These rules are repository law. Workflows define process. Agent files define role expertise. Neither may override this file.

## 1. Source & Behavior Authority

Repository evidence has distinct ownership:

```text
docs / SRS / accepted contracts
→ product/domain semantics

modules/**/behavior.feature
→ executable business acceptance behavior

modules/**/behavior.steps.ts
→ thin Cucumber automation binding only

implementation
→ must satisfy accepted semantics + executable behavior
```

Rules:

- `modules/**` owns a capability's accepted behavior and its executable Cucumber binding.
- `behavior.feature` is the business acceptance source for that module.
- `behavior.steps.ts` MUST remain a thin, statically bound Cucumber automation adapter; it MUST NOT become a second business-rule layer.
- Docs/SRS may define semantic meaning, constraints, contracts, research, or design intent. They are not executable acceptance tests unless explicitly designated as such.
- If canonical docs/contracts and `behavior.feature` conflict, do not silently choose one. Record the conflict and block downstream work until authority is reconciled.
- Never infer product semantics from step implementation, generated output, or test plumbing when a higher-authority source exists.

## 2. Scenario Identity & Execution

- Stable Scenario IDs are tags on the Gherkin `Scenario`.
- `npm run test:scenario -- @SC-MODEL-01` selects that Scenario through Cucumber after its module adapter is implemented.
- Every accepted Scenario ID MUST be declared in its module manifest.
- Cucumber world/hooks resolve the feature URI and module-local steps file for that tag.
- Do not create parallel native `*.spec.ts` acceptance targets for the same Scenario.
- Gherkin is executed directly by Cucumber.
- Generated Playwright-BDD or other generated sources are never the acceptance authority.

## 3. Repository Ownership

```text
modules/**
→ capability behavior + module-local executable binding

shared/**
→ cross-module plumbing only

generated/**
→ build output only

docs/**
→ specifications, research, planning, design evidence, accepted decisions
```

Rules:

- Do not move module-specific semantics into `shared/**`.
- Do not duplicate accepted behavior across modules.
- Do not hand-edit `generated/**`.
- Do not treat generated output as canonical input.
- Do not create a second canonical source when an existing owner already exists.

## 4. Mandatory Development Direction

Always follow:

```text
Spec / Use Case
→ Test
→ Implementation
→ Verification
```

Non-violable:

- No implementation-first development when required behavior is not represented by an accepted spec/use case and test.
- Do not weaken or rewrite tests merely to make implementation pass.
- Do not implement behavior that contradicts accepted semantics.
- Verification must exercise the accepted path, not a substitute path invented for convenience.
- A passing tool command is not proof that the intended behavior was verified.

## 5. Change Scope & Reconciliation

- Every change must identify the owning module/capability before mutation.
- Do not modify unrelated modules merely because they are nearby or structurally convenient.
- If an upstream semantic/contract change affects tests, implementation, docs, or design artifacts, reconcile all affected downstream artifacts.
- Do not leave two artifacts claiming canonical authority for the same behavior.
- Known conflicts, stale contracts, or unresolved gaps MUST remain explicit; never silently normalize them away.

## 6. Agent Isolation

A subagent is primarily an **isolation boundary**, not a parallelism primitive.

```text
subagent
→ isolate exploration
→ keep repeated reads / failed attempts / intermediate reasoning local
→ return only useful result
→ protect orchestrator working memory
```

**Isolation is the primary value. Parallelism is a bonus.**

Non-violable:

- Spawn a specialist only when its exploration can be bounded by a clear question, scope, and expected result.
- Keep failed attempts, noisy exploration, repeated source reads, and intermediate reasoning inside the specialist context.
- Specialists return compact conclusions, evidence, affected scope, and unresolved gaps — not their entire exploration transcript.
- Pass the minimum context required to solve the delegated problem.
- The orchestrator owns reconciliation of specialist outputs into canonical state.
- A specialist MUST NOT silently override upstream authority or mutate canonical artifacts outside its assigned ownership.
- Parallel execution is allowed only when tasks are genuinely independent after orientation.

## 7. Cognitive Locality

Do not split work merely because it is splittable.

If tasks require the same mental model:

```text
same architecture
same conventions
same surrounding code
same behavioral context
```

prefer one agent/context unless the isolation benefit clearly exceeds duplicated orientation cost.

Avoid:

```text
Agent A → rebuild mental model X
Agent B → rebuild mental model X
```

when both tasks depend on the same tightly coupled context.

Split when at least one is true:

- exploration is noisy or high-risk;
- the result is independently verifiable;
- the task has a narrow specialist boundary;
- the task can fail without contaminating the orchestrator's working memory;
- the task needs materially different expertise or source sets.

Do not optimize agent count. Optimize cognitive locality and useful isolation.

## 8. Canonical Artifact Mutation

- Workflows own orchestration; agent files own expertise; this file owns non-violable constraints.
- Only the role explicitly owning a canonical artifact may mutate it.
- Analysis/review specialists are read-only unless a workflow explicitly grants mutation ownership.
- Do not let multiple agents concurrently mutate the same canonical file, module, or Figma scope.
- Before mutation, inspect current canonical state; after mutation, verify and reconcile it.
- Never declare Done while a known violation in the touched scope remains unresolved.

## 9. Canonical Figma Execution Routing

Canonical Figma generation, redesign, completion, or repair MUST execute through the repository Figma design harness.

This rule applies whenever a request asks to create or mutate canonical Figma from repository artifacts, including natural-language requests such as:

```text
from <path> generate Figma using figma-mcp
from <path> redesign the module in Figma
complete canonical Figma for <scope>
repair the canonical Figma for <scope>
```

Required routing:

```text
user Figma-generation intent
→ resolve the requested scope
→ resolve relevant upstream Figma-phase documents from the supplied path/scope
→ resolve the canonical Figma target
→ invoke `npm run figma:harness -- ...`
→ writer session mutates Figma
→ independent fresh reviewer session evaluates actual Figma
→ FAIL routes defects back to the writer
→ PASS ends the harness run
```

Non-violable:

- Do NOT perform canonical Figma mutation directly in the current/orchestrator session when the request is eligible for the harness.
- Do NOT treat `designer.md`, `figma-reviewer.md`, skills, or workflow prose as substitutes for invoking the external harness.
- The harness owns writer/reviewer session isolation, iteration, PASS/FAIL transitions, and repair routing.
- The writer session owns canonical Figma mutation. Reviewer sessions are read-only.
- Figma-phase inputs are upstream product/design artifacts such as SRS, canonical domain/business docs, accepted product decisions, UX research, UI/design research, and relevant competitor/reference research.
- Feature/Gherkin is NOT an upstream Figma-phase input when it belongs to the later acceptance phase.
- If a supplied directory/path contains multiple candidate documents, select only the relevant upstream Figma-phase artifacts; do not blindly pass unrelated files.
- If the Figma target or required upstream semantics cannot be resolved safely, block and ask for the missing information rather than bypassing the harness.
- A direct request to use `figma-mcp` still routes through the harness; `figma-mcp` is the writer/reviewer tooling, not the orchestration boundary.

Therefore, a prompt like:

```text
from docs/specs/checkout generate canonical Figma using figma-mcp
```

MUST be interpreted as a request to run the Figma design harness, not as permission for the current session to mutate Figma directly.

## 10. Completion

Work is not complete if any applicable condition remains:

```text
semantic/spec conflict
missing accepted Scenario ID declaration
feature/steps ownership violation
duplicate acceptance target
generated file hand-edited
test weakened to fit implementation
unverified behavior
unreconciled downstream artifact
specialist result silently overrides authority
concurrent canonical mutation conflict
canonical Figma generation bypassed the required harness
known touched-scope violation
```

Final ordering:

```text
Accepted semantics > implementation convenience
Executable business behavior > adapter details
Module ownership > shared convenience
Verification > tool success
Isolation > speculative parallelism
Cognitive locality > agent count
Canonical consistency > local shortcut
Harnessed Figma execution > direct canonical Figma mutation
System correctness > "looks done"
```
