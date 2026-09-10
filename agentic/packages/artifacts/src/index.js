import { ArtifactClass, artifactRef, invariant, refKey, requireText } from "../../core/src/index.js";

export function createArtifact({
  id,
  version,
  artifactClass,
  scope,
  authority,
  content,
  basedOn = [],
  producedBy = "unknown"
}) {
  requireText(id, "artifact.id");
  requireText(version, "artifact.version");
  requireText(scope, "artifact.scope");
  invariant(Object.values(ArtifactClass).includes(artifactClass), `unknown artifact class: ${artifactClass}`);

  return Object.freeze({
    id,
    version,
    artifactClass,
    scope,
    authority: authority ?? (artifactClass === ArtifactClass.CANONICAL ? "AUTHORITATIVE" : "DERIVED"),
    content,
    basedOn: Object.freeze(basedOn.map((ref) => Object.freeze({ id: ref.id, version: ref.version }))),
    producedBy,
    ref: Object.freeze({ id, version })
  });
}

export function createArtifactStore(initialArtifacts = []) {
  const artifacts = new Map();

  const add = (artifact) => {
    const key = refKey(artifact);
    invariant(!artifacts.has(key), `artifact already exists: ${key}`);
    artifacts.set(key, artifact);
    return artifactRef(artifact);
  };

  for (const artifact of initialArtifacts) add(artifact);

  return Object.freeze({
    add,
    get(ref) {
      const artifact = artifacts.get(refKey(ref));
      invariant(artifact, `artifact not found: ${refKey(ref)}`);
      return artifact;
    },
    resolve(refs) {
      return Object.freeze(refs.map((ref) => this.get(ref)));
    },
    list({ scope, artifactClass } = {}) {
      return Object.freeze(
        [...artifacts.values()].filter((artifact) => {
          if (scope && artifact.scope !== scope) return false;
          if (artifactClass && artifact.artifactClass !== artifactClass) return false;
          return true;
        })
      );
    }
  });
}
