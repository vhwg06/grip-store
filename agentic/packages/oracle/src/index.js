import { ArtifactClass, artifactRef, invariant, requireText } from "../../core/src/index.js";

export function createOracle({ artifactStore, resolve }) {
  invariant(artifactStore && typeof artifactStore.list === "function", "oracle requires an artifact store");
  invariant(typeof resolve === "function", "oracle requires a resolve(contextProblem, artifacts) strategy");

  return Object.freeze({
    async resolve(contextProblem) {
      requireText(contextProblem?.consumer, "contextProblem.consumer");
      requireText(contextProblem?.problem, "contextProblem.problem");
      requireText(contextProblem?.scope, "contextProblem.scope");

      const candidates = contextProblem.authorityRefs?.length
        ? artifactStore.resolve(contextProblem.authorityRefs)
        : artifactStore.list({ scope: contextProblem.scope, artifactClass: ArtifactClass.CANONICAL });

      const resolved = await resolve(Object.freeze({ ...contextProblem }), candidates);
      invariant(resolved && typeof resolved === "object", "oracle resolver must return a result object");

      const usedArtifactRefs = resolved.usedArtifactRefs ?? [];
      const candidateKeys = new Set(candidates.map((artifact) => `${artifact.id}@${artifact.version}`));
      for (const ref of usedArtifactRefs) {
        invariant(candidateKeys.has(`${ref.id}@${ref.version}`), "oracle may only cite artifacts from its resolved candidate set");
      }

      return Object.freeze({
        consumer: contextProblem.consumer,
        problem: contextProblem.problem,
        scope: contextProblem.scope,
        facts: Object.freeze(resolved.facts ?? []),
        constraints: Object.freeze(resolved.constraints ?? []),
        relationships: Object.freeze(resolved.relationships ?? []),
        gaps: Object.freeze(resolved.gaps ?? []),
        conflicts: Object.freeze(resolved.conflicts ?? []),
        authorityRefs: Object.freeze(usedArtifactRefs.map((ref) => Object.freeze({ ...ref }))),
        candidates: Object.freeze(candidates.map(artifactRef))
      });
    }
  });
}
