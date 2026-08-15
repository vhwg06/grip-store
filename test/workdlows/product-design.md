---

name: Product Design
description: 'Orchestrate business analysis, UX synthesis, product design, Figma execution, and verification for one product scope.'
------------------------------------------------------------------------------------------------------------------------------------

# Product Design Workflow

## Goal

Transform canonical product evidence into verified canonical Figma UI.

This workflow owns **process**, not semantic authority.

Applicable `AGENTS.md` rules are non-violable and always take precedence.

## Roles

```text
Business Analyst
→ business meaning / rules / constraints

UX Architect
→ task model / information / flow / IA / screen responsibility

Principal Product Designer
→ composition / responsive / visual execution / canonical Figma

Design Critic
→ UX / composition / visual challenge
```

Only the **Principal Product Designer** may mutate canonical Figma.

Specialists analyze and return compact results. They do not independently change canonical design decisions or Figma.

---

## Shared State

Every scope owns exactly one:

```text
test/docs/specs/<scope>/design-state.md
```

This is the workflow blackboard.

It is **not another research report**.

It stores the current accepted state:

```text
# Design State

## Scope
## Authority / Evidence

## Semantics
- actors
- goals
- concepts
- business rules
- constraints
- states / transitions

## UX
- task model
- decisions
- information requirements
- IA
- canonical flows
- screen/state responsibility
- responsive intent

## Design
- composition decisions
- canonical patterns
- responsive decisions
- Figma node refs

## Open Gaps / Conflicts

## Gates
- Semantic
- UX
- Composition
- Geometry
- Visual

## Next Action
```

Raw SRS, feature files, research and references remain evidence.

Downstream phases consume `design-state.md`; they do not repeatedly reinterpret all raw research unless a gap requires returning to evidence.

---

# Execution

## Step 0 — Resolve Scope

Determine:

```text
product/domain
module
use case
requested outcome
canonical evidence
existing design-state
existing canonical Figma root
```

Read applicable `AGENTS.md`.

Do not spawn specialists yet.

First determine which cognitive domains are unresolved.

---

## Step 1 — Semantic / Business Analysis

Run only when semantics required by the current task are missing, contradictory or stale.

Delegate to:

```text
.agents/business-analyst.md
```

Provide only:

```text
scope
relevant source paths
existing Semantic section
known gaps
```

Expected result:

```text
actors
goals/outcomes
business concepts
rules/invariants
required decisions
constraints
states/transitions
system-known vs user-provided information
semantic gaps/conflicts
```

The specialist MUST NOT propose screens/components/layout.

Reconcile accepted output into `design-state.md`.

### Semantic Gate

PASS only when downstream UX can proceed without guessing product meaning.

If FAIL:

```text
STOP
→ resolve evidence/gap
→ rerun Semantic Gate
```

---

## Step 2 — UX Synthesis

Run when task/flow/information/IA responsibility is unresolved.

Delegate to:

```text
.agents/ux-architect.md
```

Primary input:

```text
design-state.md:
- Scope
- Semantics
- existing UX decisions
```

Read raw evidence only when the shared state points to an unresolved question.

Expected result:

```text
task model
decision points
information timing
interaction model
IA
canonical flow
screen/state responsibility
responsive intent
UX gaps/challenges
```

The specialist MUST NOT choose final visual styling.

Reconcile accepted output into `design-state.md`.

### UX Gate

PASS only when:

```text
user goal is explicit
task steps are justified
required information appears at decision time
screen/state responsibility is clear
no implementation structure leaks into UX without user value
```

FAIL returns to UX or Semantic phase depending on defect ownership.

---

## Step 3 — Design Preflight

Before product design or Figma mutation:

Delegate execution ownership to:

```text
.agents/designer.md
```

Designer reads:

```text
design-state.md
canonical Design System
canonical existing product visual context
target Figma scope
```

Before creating anything, validate current target geometry.

```text
existing target scope BROKEN
→ repair first
→ Geometry CLEAN
→ continue
```

Never build new UI on known-broken geometry.

---

## Step 4 — Composition & Product Design

Principal Designer derives:

```text
information hierarchy
low-fi composition
action hierarchy
responsive composition
canonical pattern usage
visual treatment
```

Do not silently rewrite Semantic or UX state.

If design exposes an upstream defect:

```text
design challenge
→ identify owning phase
→ return challenge
→ reconcile design-state
→ resume design
```

### Composition Gate

PASS before final visual polish.

---

## Step 5 — Figma Execution

Only Principal Designer mutates canonical Figma.

For every mutation batch:

```text
geometry preflight
→ mutate
→ deterministic geometry verification
→ continue only if CLEAN
```

Geometry correctness comes from node coordinates/bounds, not screenshot interpretation.

Do not allocate additional nodes while the affected collision scope is BROKEN.

Persist canonical Figma node refs into `design-state.md`.

---

## Step 6 — Verification

### Geometry / Structural

Deterministically verify:

```text
ownership
parent hierarchy
coordinate spaces
dimensions / scale
recursive sibling intersections
cross-root intersections
required spacing
containment
clipping configuration
```

Failure:

```text
Geometry FAIL
→ Principal Designer repairs
→ recompute
→ repeat until PASS
```

### UX / Visual

Delegate review to:

```text
.agents/design-critic.md
```

Critic evaluates:

```text
goal alignment
information hierarchy
decision support
composition
scan path
density
responsive coherence
visual consistency
```

Critic returns findings only.

Principal Designer owns fixes.

Failure routes to the phase that owns the defect:

```text
semantic defect → Step 1
UX defect       → Step 2
composition     → Step 4
geometry        → Step 5
visual polish   → Step 5
```

Never patch a downstream artifact to hide an upstream defect.

---

## Step 7 — Reconcile & Finish

Update `design-state.md` with:

```text
accepted decisions
canonical Figma refs
remaining gaps
gate status
next action
```

Completion requires:

```text
Semantic PASS
+ UX PASS
+ Composition PASS
+ Geometry PASS
+ Visual PASS
+ canonical state reconciled
```

No applicable unresolved gate may be deferred into "later QA".

---

# Orchestration Rules

Spawn only specialists required by unresolved work.

```text
semantics unclear → Business Analyst
UX unclear       → UX Architect
design execution → Principal Designer
quality challenge → Design Critic
```

Do not automatically invoke every specialist.

Pass minimal context; specialists read their own agent specification.

Keep specialist exploration isolated.

```text
Isolation is mandatory.
Parallelism is optional.
```

Specialists do not negotiate canonical truth peer-to-peer.

The workflow reconciles their outputs through `design-state.md`.

A downstream specialist may challenge upstream state but MUST NOT silently override it.
