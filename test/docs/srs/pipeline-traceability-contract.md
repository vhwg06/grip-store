# GRIP Planning Pipeline Traceability Contract

**Status:** Canonical planning rule

## Purpose

GRIP planning stages are sequential authority, including when earlier artifacts already exist.

An existing or `Final` artifact is not a skipped stage. It is a canonical input that must be read and traced by the next stage.

```text
existing artifact
≠ skipped artifact

existing artifact
= canonical input that must be traced
```

## Required provenance chain

For roadmap capability evolution:

```text
CAP-01 Reference Research
↓ evidence / lessons
CAP-02 GRIP SRS / Business-Domain Decision
↓ accepted product semantics
CAP-03 Public UI/UX Extension
CAP-04 Admin UI/UX Extension
↓ accepted surface behavior
CAP-05 Impact Map
↓ PATCH / NO PATCH / DEFER
CAP-06 Module patch transitions
↓ exact executable desired state
CAP-07 Provenance + cross-capability review
```

A later stage may reuse an existing earlier artifact without rewriting it, but it may not bypass its authority.

## Research boundary

Reference research is evidence, not direct GRIP product authority.

Valid:

```text
reference evidence
→ accepted GRIP SRS / UX decision
→ impact decision
→ Module patch requirement
```

Invalid:

```text
reference evidence
→ agent invents Module patch behavior
```

If research is stale, unsupported or insufficient for a material decision, refresh CAP-01 before changing downstream product authority.

## CAP-05 requirement

Every `PATCH` decision must trace to accepted SRS and/or Public/Admin UI/UX behavior.

`NO PATCH REQUIRED` and `DEFER` are also authoritative constraints. CAP-06 must not silently convert them into implementation work.

## CAP-06 requirement

Every material Module patch behavior must be traceable upstream.

A CAP-06 task document must make the provenance inspectable, using a compact trace matrix or equivalent:

```text
Module patch requirement
← CAP-05 impact decision
← CAP-02 / CAP-03 / CAP-04 accepted decision
← CAP-01 evidence when that decision depends on external reference evidence
```

CAP-06 may make a task self-contained for execution, but self-contained does not mean newly invented.

If a desired behavior cannot be traced:

```text
UNTRACED REQUIREMENT
→ planning gap
→ remove it from CAP-06 or return to the owning earlier stage
→ update canonical authority
→ derive CAP-06 again
```

Do not use agent judgment to fill a missing product decision silently.

## CAP-07 requirement

CAP-07 reviews both consistency and provenance.

It must verify:

```text
- earlier existing artifacts were actually consumed;
- material CAP-06 behaviors have an upstream trace;
- research lessons were converted through GRIP decisions rather than copied directly;
- only CAP-05 PATCH Modules received direct patch nodes;
- NO PATCH / DEFER decisions remain preserved;
- prior product-patch state remains preserved where it is the Module parent;
- future capability semantics did not leak into the current patch;
```

CAP-07 is incomplete if the resulting patch is plausible but its authority chain cannot be shown.

## Execution boundary

Task Provider and execution harnesses consume already-resolved canonical patch tasks. They do not repair planning provenance.

```text
planning provenance gap
→ docs / Module graph correction
→ fresh task resolution

not

planning provenance gap
→ reviewer/writer invents behavior in Figma
```

This keeps product judgment in canonical planning artifacts and execution bounded to the state that planning actually authorized.
