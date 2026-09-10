export const ArtifactClass = Object.freeze({
  CANONICAL: "CANONICAL",
  EVALUATION_DEFINITION: "EVALUATION_DEFINITION",
  WORK: "WORK",
  CONTEXT: "CONTEXT",
  EXECUTION: "EXECUTION",
  EVALUATION: "EVALUATION",
  FEEDBACK: "FEEDBACK",
  CONTROL: "CONTROL"
});

export const Verdict = Object.freeze({
  PASS: "PASS",
  GAP: "GAP",
  BLOCKED: "BLOCKED"
});

export const Validity = Object.freeze({
  VALID: "VALID",
  INVALID: "INVALID",
  INCONCLUSIVE: "INCONCLUSIVE"
});

export class InvariantError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvariantError";
  }
}

export function invariant(condition, message) {
  if (!condition) throw new InvariantError(message);
}

export function requireText(value, name) {
  invariant(typeof value === "string" && value.trim().length > 0, `${name} must be a non-empty string`);
  return value;
}

export function artifactRef(artifact) {
  invariant(artifact && artifact.id && artifact.version, "artifact reference requires id and version");
  return Object.freeze({ id: artifact.id, version: artifact.version });
}

export function refKey(ref) {
  invariant(ref && ref.id && ref.version, "artifact reference requires id and version");
  return `${ref.id}@${ref.version}`;
}
