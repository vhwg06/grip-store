import { invariant, requireText } from "../../core/src/index.js";

export function createHarness({ oracle, taskProvider, evidenceProviders = [] }) {
  invariant(oracle && typeof oracle.resolve === "function", "harness requires oracle");
  invariant(taskProvider && typeof taskProvider.resolveWorkUnit === "function", "harness requires task provider");
  invariant(Array.isArray(evidenceProviders), "evidenceProviders must be an array");

  return Object.freeze({
    async buildContext({ workUnitId, attemptId, previousAttempts = [], evaluationFeedback = [], localArtifacts = [] }) {
      requireText(workUnitId, "workUnitId");
      requireText(attemptId, "attemptId");

      const workUnit = taskProvider.resolveWorkUnit(workUnitId);
      const resolvedContext = await oracle.resolve({
        consumer: workUnit.consumer,
        problem: workUnit.objective,
        scope: workUnit.scope,
        authorityRefs: workUnit.authorityRefs
      });

      return Object.freeze({
        workUnit,
        attemptId,
        resolvedContext,
        previousAttempts: Object.freeze([...previousAttempts]),
        evaluationFeedback: Object.freeze([...evaluationFeedback]),
        localArtifacts: Object.freeze([...localArtifacts])
      });
    },

    async collectEvidence({ context, candidate }) {
      const collected = [];
      for (const provider of evidenceProviders) {
        invariant(typeof provider === "function", "evidence provider must be a function");
        const result = await provider({ context, candidate });
        if (Array.isArray(result)) collected.push(...result);
        else if (result != null) collected.push(result);
      }
      return Object.freeze(collected);
    }
  });
}
