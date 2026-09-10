import { invariant, requireText } from "../../core/src/index.js";

export function createTaskProvider({ definitions }) {
  invariant(definitions && typeof definitions === "object", "task provider requires task definitions");

  const resolveWorkUnit = (id) => {
    requireText(id, "workUnit.id");
    const definition = definitions[id];
    invariant(definition, `unknown work unit: ${id}`);
    requireText(definition.consumer, `workUnit(${id}).consumer`);
    requireText(definition.objective, `workUnit(${id}).objective`);
    requireText(definition.scope, `workUnit(${id}).scope`);

    return Object.freeze({
      id,
      consumer: definition.consumer,
      objective: definition.objective,
      scope: definition.scope,
      authorityRefs: Object.freeze((definition.authorityRefs ?? []).map((ref) => Object.freeze({ ...ref }))),
      dependencies: Object.freeze([...(definition.dependencies ?? [])]),
      expectedOutputs: Object.freeze([...(definition.expectedOutputs ?? [])]),
      mutationPolicy: Object.freeze({ ...(definition.mutationPolicy ?? {}) }),
      evaluationRef: definition.evaluationRef ? Object.freeze({ ...definition.evaluationRef }) : null,
      metadata: Object.freeze({ ...(definition.metadata ?? {}) })
    });
  };

  const resolvePlan = (rootId) => {
    const order = [];
    const visiting = new Set();
    const visited = new Set();

    const visit = (id) => {
      if (visited.has(id)) return;
      invariant(!visiting.has(id), `work dependency cycle detected at: ${id}`);
      visiting.add(id);
      const unit = resolveWorkUnit(id);
      for (const dependency of unit.dependencies) visit(dependency);
      visiting.delete(id);
      visited.add(id);
      order.push(unit);
    };

    visit(rootId);
    return Object.freeze(order);
  };

  return Object.freeze({ resolveWorkUnit, resolvePlan });
}
