import { invariant, requireText } from "../../core/src/index.js";

export function createResearcher({ research }) {
  invariant(typeof research === "function", "researcher requires a research(problem) strategy");

  return Object.freeze({
    async run(problem) {
      requireText(problem?.statement, "problem.statement");
      requireText(problem?.scope, "problem.scope");

      const result = await research(Object.freeze({ ...problem }));
      invariant(result && typeof result === "object", "researcher must return a result object");

      return Object.freeze({
        proposals: Object.freeze(result.proposals ?? []),
        evidence: Object.freeze(result.evidence ?? []),
        gaps: Object.freeze(result.gaps ?? [])
      });
    }
  });
}
