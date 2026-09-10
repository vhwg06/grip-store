export const EvaluationValidity = Object.freeze({
  VALID: "VALID",
  INVALID: "INVALID",
  INCONCLUSIVE: "INCONCLUSIVE"
});

export const EvaluationVerdict = Object.freeze({
  PASS: "PASS",
  GAP: "GAP",
  BLOCKED: "BLOCKED"
});

export const MemoryKind = Object.freeze({
  FINDING: "FINDING",
  FAILED_DIRECTION: "FAILED_DIRECTION",
  OBSERVATION: "OBSERVATION",
  DECISION: "DECISION"
});

export function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

export function requireText(value, label) {
  invariant(typeof value === "string" && value.trim().length > 0, `${label} must be non-empty text`);
  return value;
}

export function normalizeCandidate(candidate) {
  invariant(candidate && typeof candidate === "object", "candidate is required");
  const id = requireText(candidate.id, "candidate.id");
  const version = requireText(candidate.version, "candidate.version");
  return Object.freeze({ id, version });
}

export function candidateKey(candidate) {
  const normalized = normalizeCandidate(candidate);
  return `${normalized.id}@${normalized.version}`;
}

export function sameCandidate(left, right) {
  if (!left || !right) return false;
  return candidateKey(left) === candidateKey(right);
}

export function validateEvaluation(result) {
  invariant(result && typeof result === "object", "evaluation result is required");
  invariant(Object.values(EvaluationValidity).includes(result.validity), "evaluation validity is invalid");

  if (result.validity === EvaluationValidity.VALID) {
    invariant(Object.values(EvaluationVerdict).includes(result.verdict), "valid evaluation requires a verdict");
  } else {
    invariant(result.verdict == null, "invalid or inconclusive evaluation must not certify a verdict");
  }

  return Object.freeze({
    validity: result.validity,
    verdict: result.verdict ?? null,
    findings: Object.freeze([...(result.findings ?? [])]),
    evidence: Object.freeze([...(result.evidence ?? [])])
  });
}

export function validateMemoryRecord(record) {
  invariant(record && typeof record === "object", "memory record is required");
  const statement = requireText(record.statement, "memory.statement");
  invariant(Object.values(MemoryKind).includes(record.kind), "memory kind is invalid");
  invariant(Array.isArray(record.evidence) && record.evidence.length > 0, "persistent memory requires evidence");

  return Object.freeze({
    kind: record.kind,
    statement,
    evidence: Object.freeze([...record.evidence]),
    scope: record.scope ?? null
  });
}

export function assertPort(port, method, label) {
  invariant(port && typeof port[method] === "function", `${label} requires ${method}()`);
}
