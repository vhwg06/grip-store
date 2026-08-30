# Vertical Capability Sequencing Contract

**Status:** Canonical planning/execution rule  
**Roadmap:** Promotions → Membership → Business Solutions

## 1. Purpose

GRIP vertical capabilities are activated into the existing product **in roadmap order**.

Capability-specific source artifacts may be prepared ahead of their activation turn, but preparing those artifacts does not make their decisions active canonical inputs for earlier Module reconciliation or Figma update runs.

Required distinction:

```text
capability source artifacts
= research + SRS + Public/Admin extension + impact map

activated reconciliation
= capability decisions patched into affected existing Module planning inputs at CAP-06
```

Source prepared ahead ≠ reconciliation activated.

## 2. Sequential activation rule

For the current queue:

```text
Promotions
→ CAP-06 Promotions-only reconciliation
→ CAP-07 review
→ activate Promotions reconciliation docs as current Module inputs
→ Figma dependency update with active change = Promotions

Membership
→ CAP-06 Membership-only reconciliation on top of already-active Promotions
→ CAP-07 review
→ add Membership reconciliation docs as current Module inputs
→ Figma dependency update with active change = Membership

Business Solutions
→ CAP-06 Business-Solutions-only reconciliation on top of already-active Promotions + Membership
→ CAP-07 review
→ add Business Solutions reconciliation docs as current Module inputs
→ Figma dependency update with active change = Business Solutions
```

Do not wait for later capabilities so several roadmap items can be patched into existing Module docs in one combined reconciliation.

## 3. Capability-specific reconciliation

Every CAP-06 reconciliation artifact must identify one owning vertical capability.

Prefer:

```text
catalog/07-promotions-reconciliation.md
checkout/06-membership-reconciliation.md
Content/05-business-solutions-reconciliation.md
```

Do not create a cumulative file whose meaning silently expands from:

```text
Promotions
```

to:

```text
Promotions + Membership + Business Solutions
```

because that destroys roadmap sequencing and makes downstream Figma review consume future capability requirements early.

## 4. Dependency graph is scope only

`docs/srs/figma-pipeline-dependencies.json` answers only:

```text
which logical Module scopes must be checked after this Module changes?
```

It does **not** answer:

```text
what capability is being patched?
why this pipeline run exists?
what the writer should mutate?
```

The graph's Module `docs` lists contain current canonical compatibility inputs:

```text
baseline Module docs
+
already-activated capability reconciliation/audit docs
```

They MUST NOT include future capability reconciliation before that capability reaches CAP-06.

The dependency graph may select a broad closure. That closure is inspection scope, not general mutation scope.

## 5. Active change context is patch intent

Every Figma dependency update must carry a run-level active change context separate from the graph:

```text
--change <accepted capability/delta>
--change-doc <authoritative impact/change document>
```

For Promotions:

```bash
npm run figma:pipeline -- \
  --graph docs/srs/figma-pipeline-dependencies.json \
  --changed Catalog \
  --change Promotions \
  --change-doc docs/srs/Promotions/05-promotions-impact-map-and-review.md \
  --max-repairs 3
```

Interpretation:

```text
--changed Catalog
= original changed Module seed
= dependency lookup scope

--change Promotions
+ Promotions impact map
= patch intent
= what child harnesses must verify/materialize
```

The top-level orchestration agent must derive the active change from the accepted planning checkpoint already present in the repository. Do not make the user repeat it when the repository establishes it.

## 6. Child harness change gate

For each dependency-selected Module:

```text
resolve existing canonical Module surface set
↓
TARGET_RESOLVED
↓
classify active change
├── CHANGE_VERIFIED
│    → requested delta already represented
│    → PASS, zero mutation
│
├── CHANGE_NOT_APPLICABLE
│    → no direct delta for this Module
│    → compatibility-only PASS, zero mutation
│
└── CHANGE_GAP
     → requested delta missing/incorrect or directly blocked
     → bounded writer may patch active delta only
     → fresh reviewer must verify the same active change
```

A dependency-selected Module is **not** general cleanup scope.

Unrelated pre-existing spacing, copy, composition, responsive, gallery, or craft issues must not trigger mutation unless they directly block, contradict, or were introduced by the active delta on an affected semantic surface.

## 7. Fresh evidence is required

Child `figma:harness` exit `0` is not enough to prove the requested capability was patched.

The top-level pipeline must inspect the child's fresh independent review and require active-change evidence:

```text
TARGET_RESOLVED: CHANGE_VERIFIED: <active change>
```

or a valid no-direct-change result:

```text
TARGET_RESOLVED: CHANGE_NOT_APPLICABLE: <active change>
```

Writer permission exists only for:

```text
TARGET_RESOLVED
+ CHANGE_GAP: <active change>
+ FAIL_VERIFICATION
```

A generic design failure without `CHANGE_GAP` is not mutation permission.

## 8. No future-capability leakage

A current capability reconciliation may reference an earlier already-active capability when needed for compatibility.

It must not materialize a later roadmap capability merely because that capability's source SRS/UIUX already exists.

```text
current = Promotions
future Membership/Business Solutions source docs exist
→ do not patch Membership/Business Solutions semantics into active Module reconciliation
→ do not add them to current Figma compatibility inputs
→ do not let child harness materialize them
```

## 9. Review rule

CAP-07 reviews the product **through the current activation point**, not through every future source artifact available in the repository.

The final product-wide consistency pass may review all capabilities only after every roadmap capability has completed its own CAP-06/CAP-07 activation.

## 10. Current activation checkpoint

```text
Promotions          ✅ activated
Membership          ⏭ next activation
Business Solutions  ⏳ queued after Membership
```

Membership and Business Solutions source planning artifacts remain valid inputs for their future turns; they are not deleted or rewritten merely because their canonical Module reconciliation is not active yet.
