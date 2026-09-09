# Product QA / Design Review Contract

Product QA / Design Review is the **independent product-level design gate after Product Integration / Prototype**.

It is not a new product capability, not a synthetic product patch, and not implementation QA.

Its purpose is to determine whether the integrated canonical Figma product is coherent, complete, and trustworthy enough to become the design authority consumed by the next engineering/harness phases.

## 1. Position in the pipeline

```text
roadmap capability planning / Module activation
→ capability Figma realization
→ Product Integration / Prototype
→ Product QA / Design Review
→ Core Harness architecture/build
→ later executable behavior / implementation phases
```

Product QA consumes the same final product checkpoint as Product Integration. It does not create `P004` and does not alter Module patch history.

## 2. What this phase is for

Product Integration answers:

> Are the documented product surfaces, states, and cross-Module journeys integrated into one coherent prototype?

Product QA answers:

> Does the resulting integrated product actually satisfy the canonical product/design authority at product level, with no blocking semantic, journey, state, structural, responsive, or design-quality defect left unresolved?

The phase must catch defects that can remain invisible when each Module or integration step is reviewed locally, including:

```text
cross-capability semantic contradiction
cross-Module ownership or handoff confusion
broken or dead-end end-to-end journeys
missing or indistinguishable required states
failure/recovery paths that cannot be completed
responsive journey discontinuity
competing canonical screen/state representations
prototype reactions that do not preserve the documented task model
product-level hierarchy/composition inconsistency
visual/craft defects severe enough to obscure product meaning or action hierarchy
```

## 3. Authority and inputs

The Task Provider resolved package is the execution authority.

Use only:

```text
provider-resolved cumulative Module state at the selected checkpoint
Product Integration / Prototype contract
Product QA / Design Review contract
shared design-base contract
canonical rendered Figma + structural/node evidence when needed
fresh harness/reviewer evidence produced by the current run
```

Do not invent behavior, states, ownership, or product requirements absent from canonical authority.

Do not use writer rationale, hidden reasoning, or self-assessment as evidence.

## 4. Review method

Review the integrated product in this order:

```text
Q1 Scope / authority inventory
→ Q2 Product semantics + ownership
→ Q3 End-to-end journeys + cross-Module handoffs
→ Q4 Required states + failure/recovery + responsive continuity
→ Q5 Canonical structure + composition + design quality
→ Q6 False-positive challenge / defect classification
→ Q7 bounded repair when a valid repairable gap exists
→ Q8 fresh independent product review
→ Q9 evidence / handoff
```

A downstream visual success must not excuse an upstream semantic or journey failure.

### Product semantics and ownership

Verify that the integrated product preserves the accepted business/domain model and does not silently move responsibilities across Modules or introduce unsupported capability semantics.

### End-to-end journeys

Review complete Public and Admin journeys, not isolated frames. Verify entry, progress, backtracking, cancellation, submission, success, failure, retry/recovery, and documented cross-Module handoffs where applicable.

### State coverage

Require only states supported by canonical authority. A required state must be observably distinct when its user-visible meaning differs.

### Responsive continuity

Review the complete task/journey across supported viewport responsibilities. A desktop/mobile difference is not a defect by itself; a loss of required meaning, action, or continuity is.

### Canonical structure

Duplicate/competing representations are judged by semantic responsibility, not frame name, creation time, screenshot hash, or node id alone.

### Product-level design quality

Apply `.agents/design-base.md` to the full resolved product scope. Product QA may block on composition/craft only when the defect is evidenced, gate-relevant, and materially harms hierarchy, comprehension, action priority, continuity, or product trustworthiness. Preference-only polish is not a blocking defect.

## 5. Defect classification and repair loop

A resolved review must classify exactly one product-QA result:

```text
QA_VERIFIED: Product QA / Design Review
QA_GAP: Product QA / Design Review
QA_DOC_GAP: Product QA / Design Review
```

### QA_VERIFIED

Use only when the Definition of Done is satisfied.

```text
TARGET_RESOLVED
+ QA_VERIFIED: Product QA / Design Review
+ successful reviewer exit
→ PASS
→ zero mutation required
```

### QA_GAP

Use only for a **validated, repairable defect in the existing canonical Figma product** where canonical authority already says what the product must mean/do.

```text
TARGET_RESOLVED
+ QA_GAP: Product QA / Design Review
+ failed verification
→ bounded repair loop
→ fresh independent review
→ repeat within the harness repair budget until PASS or terminal failure
```

Repair may change only existing canonical Figma representations necessary to satisfy supported product/design authority. It may reconcile incorrect screens/states/interactions/structure, but it must not invent product semantics.

A QA failure is therefore **not automatically terminal**. A valid repairable `QA_GAP` is feedback for the next loop iteration.

### QA_DOC_GAP

Use when the reviewer proves a required product decision/state/ownership rule is missing or contradictory in canonical authority and safe repair cannot be derived without invention.

```text
QA_DOC_GAP
→ STOP
→ writer forbidden for the undocumented behavior
→ route back to the owning planning/integration authority
→ rerun Product QA only after authority is repaired
```

### Other terminal conditions

These remain terminal:

```text
TARGET_NOT_FOUND
TARGET_AMBIGUOUS
unclassifiable reviewer result
execution/tool failure that prevents trustworthy review
fresh verification failure after repair budget exhaustion
repair budget exhausted
```

Do not reset the repair budget or silently accept a defect to make the phase pass.

## 6. False-positive control

Before a candidate issue may become a blocking `QA_GAP`, the reviewer must challenge it against all of the following.

### FP-1 — Authority trace

There must be an applicable canonical requirement, product invariant, journey/state responsibility, or shared design gate supporting the claim.

No authority/gate trace → non-blocking observation, not `QA_GAP`.

### FP-2 — Artifact evidence

The defect must be observable in the current canonical artifact or deterministic structural evidence.

Assumed intent, writer explanation, or stale evidence from a previous attempt is insufficient.

### FP-3 — Product impact

The issue must materially affect product meaning, task completion, state clarity, ownership, cross-Module continuity, responsive continuity, hierarchy, comprehension, or an applicable design gate.

Personal taste, optional polish, or `I would design it differently` is not blocking evidence.

### FP-4 — Scope validity

Do not fail for behavior that is explicitly out of scope, intentionally deferred, or absent from canonical authority.

The absence of a non-required state/feature is not a defect.

### FP-5 — Semantic identity

Do not infer duplicate canonical representations from similar names, sibling roots, screenshot equality, or visual similarity alone.

For example, distinct `Public` and `Admin` roots of one Module are legitimate when they own different surface responsibilities.

### FP-6 — Tooling vs product defect

Do not classify a tool/prototype limitation as a product defect unless the documented product/prototype contract actually requires that observable behavior and the limitation blocks verification of it.

### FP-7 — Freshness

After any repair, prior blocking observations are stale until re-observed by a fresh independent reviewer. Never carry a previous FAIL forward without fresh evidence.

A blocking finding is valid only when it survives these controls.

## 7. Definition of Done

Product QA / Design Review is DONE only when all are true:

```text
1. The provider-resolved final product checkpoint and full configured Module scope are resolved.
2. Canonical authority and the actual integrated Figma artifact were reviewed, not writer claims.
3. Product semantics and Module ownership are coherent.
4. Required Public/Admin end-to-end journeys and cross-Module handoffs are completable and coherent.
5. Required success/failure/recovery/state responsibilities are present and observably meaningful.
6. Responsive continuity preserves required meaning/actions across supported responsibilities.
7. No competing canonical representation remains for the same semantic responsibility.
8. Applicable design-base gates pass at product scope.
9. Every blocking candidate finding passed the false-positive controls.
10. Every repairable QA_GAP was repaired within budget and followed by a fresh independent review.
11. Zero unresolved blocking Product-QA defects remain.
12. Final fresh review returns exactly:

   TARGET_RESOLVED:
   + QA_VERIFIED: Product QA / Design Review

   with successful verification exit.
13. Current-run evidence paths are persisted by the harness/workload.
```

A visually polished prototype with an unresolved semantic/journey/state defect is not DONE.

A reviewer report with unresolved repairable defects is not DONE.

A writer claim that repairs are complete without fresh independent verification is not DONE.

## 8. Mutation boundary

Product QA repair is **corrective**, not exploratory redesign.

Allowed when supported by authority:

```text
repair a broken documented journey
repair an incorrect/missing documented state representation
repair cross-Module handoff continuity
repair responsive continuity
reconcile competing canonical representations
repair composition/hierarchy/craft defects that fail an applicable product-level design gate
```

Forbidden:

```text
new product capability
new undocumented business rule/state
ownership migration
speculative UX
unrelated redesign
implementation/API/database work
changing planning authority merely to make the current artifact pass
```

When repair requires a forbidden action, classify the authority gap instead of improvising.
