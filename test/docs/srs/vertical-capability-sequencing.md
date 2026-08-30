# Vertical Capability Sequencing Contract

**Status:** Canonical planning/execution rule  
**Roadmap:** Promotions → Membership → Business Solutions

## 1. Purpose

GRIP vertical capabilities are activated into the existing product **in roadmap order**.

Capability-specific source artifacts may be prepared ahead of their activation turn, but preparing those artifacts does not make their decisions active canonical inputs for earlier module reconciliation or Figma update runs.

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
→ activate affected reconciliation docs in figma-pipeline-dependencies.json
→ Figma dependency update

Membership
→ CAP-06 Membership-only reconciliation on top of already-active Promotions
→ CAP-07 review
→ add Membership reconciliation docs to figma-pipeline-dependencies.json
→ Figma dependency update

Business Solutions
→ CAP-06 Business-Solutions-only reconciliation on top of already-active Promotions + Membership
→ CAP-07 review
→ add Business Solutions reconciliation docs to figma-pipeline-dependencies.json
→ Figma dependency update
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

Do not create a cumulative file whose current meaning silently expands from:

```text
Promotions
```

to:

```text
Promotions + Membership + Business Solutions
```

because that destroys roadmap sequencing and makes downstream Figma review consume future capability requirements early.

## 4. Figma dependency input rule

`docs/srs/figma-pipeline-dependencies.json` is a list of **active canonical inputs** for each logical Module scope.

For each Module, its `docs` list contains:

```text
baseline canonical Module docs
+
reconciliation/audit docs for capabilities already activated through the current roadmap position
```

It MUST NOT include reconciliation/audit docs for a future capability that has not reached CAP-06.

Example while Promotions is the latest activated capability:

```text
Catalog docs
= Catalog baseline
+ Promotions reconciliation

NOT
= Catalog baseline
+ Promotions reconciliation
+ future Business Solutions reconciliation
```

When Membership reaches CAP-06, add its accepted Module reconciliation docs to the relevant graph nodes. Existing Promotions inputs remain active.

## 5. No future-capability leakage

A current capability reconciliation may reference an earlier already-active capability when needed for compatibility.

It must not materialize a later roadmap capability merely because that capability's source SRS/UIUX already exists in the repository.

```text
current = Promotions
future Membership/Business Solutions source docs exist
→ do not patch Membership/Business Solutions semantics into Module reconciliation
→ do not add them to Figma graph inputs
```

## 6. Review rule

CAP-07 reviews the product **through the current activation point**, not through every future source artifact available in the repository.

The final product-wide consistency pass may review all capabilities only after every roadmap capability has completed its own CAP-06/CAP-07 activation.

## 7. Current activation checkpoint

```text
Promotions          ✅ activated
Membership          ⏭ next activation
Business Solutions  ⏳ queued after Membership
```

Membership and Business Solutions source planning artifacts remain valid inputs for their future turns; they are not deleted or rewritten merely because their canonical Module reconciliation is not active yet.
