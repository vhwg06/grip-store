# Product QA / Design Review Phase

**Status:** Canonical post-integration design gate  
**Position:** Product Integration / Prototype → Product QA / Design Review → Core Harness architecture/build

## 1. Purpose — what this phase is for

Product QA / Design Review is the final **product-level design quality gate** after the canonical product has been integrated into one prototype.

It answers:

> Is the integrated GRIP product semantically coherent, journey-complete, state-complete, structurally trustworthy, responsive, and design-quality-ready enough to become the design authority consumed by the next harness/engineering phases?

It is not:

```text
another business capability
P004
implementation QA
an excuse for a second redesign
an open-ended visual-polish pass
```

The phase exists because Module-local review and Product Integration can both pass while product-level defects remain, for example:

```text
cross-capability contradiction
cross-Module ownership/handoff confusion
end-to-end dead ends
missing or indistinguishable required states
broken failure/recovery paths
responsive journey discontinuity
competing canonical representations
prototype reactions that break the documented task model
product-level hierarchy/composition defects that obscure meaning or action priority
```

## 2. Inputs and authority

Product QA consumes the **same final product checkpoint** used by Product Integration.

Authority is:

```text
Task Provider resolved checkpoint package
+ cumulative canonical Module state through that checkpoint
+ Product Integration / Prototype contract
+ this Product QA phase contract
+ shared design-base gates
+ actual current canonical Figma artifact
+ fresh current-run structural/reviewer evidence
```

Historical writer rationale, hidden reasoning, self-assessment, and stale screenshots are not authority.

Product QA does not create a new Module state or product patch.

## 3. Method — how the phase runs

The phase is independent-review-first and repair-capable:

```text
resolve final checkpoint / full product scope
→ inventory authority + canonical surfaces
→ review product semantics / ownership
→ review complete Public/Admin journeys + handoffs
→ review required states / failure / recovery
→ review responsive continuity
→ review canonical structure + design-base gates
→ challenge candidate defects for false positives
→ classify
     ├─ QA_VERIFIED → PASS
     ├─ QA_GAP → bounded repair → fresh independent review → loop
     └─ QA_DOC_GAP → stop / route authority upstream
```

### 3.1 Product semantics / ownership

Verify that the actual integrated product preserves accepted business/domain semantics and Module ownership.

A visually coherent flow that silently changes product semantics is a failure.

### 3.2 End-to-end journeys

Review complete user/operator jobs, not isolated screens.

Where applicable, verify:

```text
entry
progression
backtracking
cancel
submit
success
failure
retry/recovery
cross-Module handoff
return/continuation
```

### 3.3 Required state coverage

Require only states supported by canonical authority.

When two states have different required user-visible meaning, that difference must be observable in the artifact.

### 3.4 Responsive continuity

Desktop/mobile may use different compositions. Product QA fails only when the responsive form loses required meaning, information, action, task completion, or continuity.

### 3.5 Canonical structure

Judge duplicates by semantic responsibility:

```text
Module
+ Surface responsibility
+ Use Case
+ Screen responsibility
+ State responsibility
```

Do not judge duplication from frame name, node id, creation time, screenshot equality, or visual similarity alone.

### 3.6 Product-level design gates

Apply `.agents/design-base.md` at full-product scope.

Product QA can block composition/craft only when the issue is evidenced, gate-relevant, and materially harms hierarchy, comprehension, action priority, continuity, or product trustworthiness.

`I would design this differently` is not a blocking finding.

## 4. Classification and continuation loop

A resolved Product QA review must classify exactly one:

```text
QA_VERIFIED: Product QA / Design Review
QA_GAP: Product QA / Design Review
QA_DOC_GAP: Product QA / Design Review
```

### QA_VERIFIED

```text
TARGET_RESOLVED
+ QA_VERIFIED
+ successful fresh verification
→ PASS
```

### QA_GAP — repairable, not terminal

A valid `QA_GAP` means:

```text
the defect is real
+ canonical authority already defines the intended product meaning
+ the existing canonical Figma artifact can be corrected without inventing behavior
```

Then:

```text
QA_GAP
→ bounded writer repair
→ fresh independent review
→ QA_VERIFIED ? PASS
→ still-valid QA_GAP ? continue within remaining repair budget
→ terminal blocker/budget exhaustion ? FAIL
```

A QA failure is therefore feedback in the loop, not automatically the end of the phase.

### QA_DOC_GAP — terminal authority blocker

Use when safe correction requires a missing or contradictory product/design decision.

```text
QA_DOC_GAP
→ writer forbidden for the undocumented decision
→ route to the owning planning/integration authority
→ repair canonical authority
→ run the downstream realization/integration consequence if needed
→ rerun Product QA fresh
```

### Other terminal blockers

```text
TARGET_NOT_FOUND
TARGET_AMBIGUOUS
unclassifiable review
unrecoverable execution/tool failure
repair budget exhausted
fresh verification cannot establish PASS
```

## 5. False-positive model

A Product QA system is harmful if it repeatedly repairs reviewer preference rather than product defects. Therefore every candidate **blocking** finding must survive the following checks.

### FP-1 — Authority trace

The finding must trace to at least one applicable:

```text
canonical product requirement/invariant
journey/state responsibility
Module ownership rule
shared design-base gate
```

No authority/gate trace → non-blocking observation.

### FP-2 — Current artifact evidence

The defect must be observable in the current canonical Figma artifact or deterministic current structural evidence.

Writer rationale, assumed intent, or evidence from an earlier attempt is insufficient.

### FP-3 — Material product impact

The finding must materially affect at least one of:

```text
product meaning
task completion
state clarity
ownership/handoff
responsive continuity
hierarchy/comprehension
action priority
applicable design gate
```

Preference-only polish is not blocking.

### FP-4 — Scope validity

Do not fail on:

```text
explicitly out-of-scope behavior
intentionally deferred behavior
absence of a non-required feature/state
future capability semantics
```

### FP-5 — Semantic identity

Do not infer duplicates from superficial similarity.

Examples of common false positives:

```text
Catalog Public + Catalog Admin treated as duplicate merely because both are Catalog
same screenshot/hash treated as proof that two semantically distinct contexts are duplicates
similar frame names treated as same state without checking responsibility
```

### FP-6 — Tooling vs product defect

A prototype/tool limitation is blocking only when the canonical product/prototype contract requires the observable behavior and the limitation prevents trustworthy verification of it.

### FP-7 — Freshness after repair

Any previous blocking observation becomes stale after mutation.

The next decision must come from a fresh independent review of the new artifact, not from carrying the old FAIL forward.

## 6. Definition of Done

Product QA / Design Review is DONE only when all are true:

```text
1. The final provider-selected product checkpoint resolves the full configured Module scope.
2. The actual canonical integrated Figma product was reviewed against canonical authority.
3. Product semantics and Module ownership are coherent.
4. Required Public/Admin end-to-end journeys and cross-Module handoffs are completable and coherent.
5. Required success/failure/recovery/state responsibilities are present and observably meaningful.
6. Responsive continuity preserves required meaning/actions across supported responsibilities.
7. No competing canonical representation remains for the same semantic responsibility.
8. All applicable product-level design-base gates pass.
9. Every candidate blocking defect passed FP-1..FP-7.
10. Every repairable QA_GAP was repaired within budget and followed by fresh independent review.
11. Zero unresolved blocking Product-QA defects remain.
12. Final fresh review returns exactly:

    TARGET_RESOLVED:
    + QA_VERIFIED: Product QA / Design Review

    with successful verification exit.
13. Current-run Task Provider / Figma harness evidence is persisted.
```

Not DONE:

```text
review report exists but repairable defects remain
writer says fixed but no fresh independent review exists
artifact looks polished but a semantic/journey/state defect remains
reviewer blocks on preference or unsupported requirements
repair budget is silently reset to obtain PASS
```

## 7. Repair boundary

Allowed corrective repair when canonical authority already supports the answer:

```text
broken documented journey
incorrect/missing documented state representation
cross-Module handoff continuity defect
responsive continuity defect
competing canonical representation
product-level hierarchy/composition/craft defect that genuinely fails an applicable gate
```

Forbidden:

```text
new product capability
new undocumented business rule/state
ownership migration
speculative UX
unrelated redesign
frontend/backend/API/database implementation
changing planning authority merely to make the artifact pass
```

If correction requires a forbidden action, classify the authority gap instead of improvising.

## 8. Agent-facing execution

Once Product Integration / Prototype has completed and the integrated product is ready for final design QA:

```bash
npm run task -- --task figma-product-qa
```

Task Provider owns checkpoint, scope, policy, stage plan, Figma targeting, repair budget, and evidence routing.
