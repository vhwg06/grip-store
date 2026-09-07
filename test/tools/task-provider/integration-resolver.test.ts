import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveIntegrationTask,
  type IntegrationPipelineConfig,
  type IntegrationStagePlan,
} from "./integration-resolver";
import type { ModuleGraph, PatchRegistry } from "./resolver";

const config: IntegrationPipelineConfig = {
  version: 1,
  id: "figma-integration",
  resolver: "figma-integration",
  executor: "figma:integration",
  dependencyGraph: "graph.json",
  patchRegistry: "patches.json",
  stagePlan: "plan.json",
  defaultMaxRepairs: 3,
  moduleGraphs: {
    A: "a.json",
    B: "b.json",
    C: "c.json",
    D: "d.json",
  },
};

const registry: PatchRegistry = {
  version: 1,
  patches: [
    { id: "P001-one", label: "One", sequence: 1 },
    { id: "P002-two", label: "Two", sequence: 2 },
  ],
};

const dependency = {
  version: 1,
  name: "test",
  nodes: [
    { id: "A", scope: "A", dependsOn: [] },
    { id: "B", scope: "B", dependsOn: ["A"] },
    { id: "C", scope: "C", dependsOn: ["B"] },
    { id: "D", scope: "D", dependsOn: [] },
  ],
};

const plan: IntegrationStagePlan = {
  version: 1,
  id: "integration",
  label: "Product Integration / Prototype",
  inputDocs: ["integration.md", "design-base.md"],
  stages: [
    {
      id: "D1",
      title: "Inventory",
      mode: "ANALYZE",
      dependsOn: [],
      mutation: false,
      objective: "Resolve flows",
    },
    {
      id: "D2",
      title: "Integrate",
      mode: "WRITE",
      dependsOn: ["D1"],
      mutation: true,
      objective: "Integrate screens",
    },
    {
      id: "D7",
      title: "Review",
      mode: "REVIEW",
      dependsOn: ["D2"],
      mutation: false,
      objective: "Verify integration",
    },
  ],
};

function base(module: string): ModuleGraph {
  return {
    version: 1,
    module,
    base: { id: "BASE", stateDocs: [`${module.toLowerCase()}-base.md`] },
    patches: [],
  };
}

test("integration resolver resolves cumulative full-product state at checkpoint without creating a synthetic patch", () => {
  const graphs: Record<string, ModuleGraph> = {
    A: {
      ...base("A"),
      patches: [
        { id: "P001-one", parent: "BASE", taskDoc: "a-p1.md", stateDocs: ["a-p1-state.md"] },
        { id: "P002-two", parent: "P001-one", taskDoc: "a-p2.md", stateDocs: ["a-p2-state.md"] },
      ],
    },
    B: {
      ...base("B"),
      patches: [
        { id: "P001-one", parent: "BASE", taskDoc: "b-p1.md", stateDocs: ["b-p1-state.md"] },
      ],
    },
    C: base("C"),
    D: {
      ...base("D"),
      patches: [
        { id: "P002-two", parent: "BASE", taskDoc: "d-p2.md", stateDocs: ["d-p2-state.md"] },
      ],
    },
  };

  const task = resolveIntegrationTask(
    config,
    registry,
    dependency,
    graphs,
    "P002-two",
    plan,
    "2026-01-01T00:00:00.000Z",
  );

  assert.equal(task.checkpoint.id, "P002-two");
  assert.deepEqual(task.dependency.modules, ["A", "B", "C", "D"]);
  assert.deepEqual(
    task.modules.map((module) => [module.id, module.state.id]),
    [
      ["A", "P002-two"],
      ["B", "P001-one"],
      ["C", "BASE"],
      ["D", "P002-two"],
    ],
  );
  assert.deepEqual(task.modules[0].inputDocs, ["a-base.md", "a-p1-state.md", "a-p2-state.md"]);
  assert.deepEqual(task.modules[1].inputDocs, ["b-base.md", "b-p1-state.md"]);
  assert.deepEqual(task.modules[2].inputDocs, ["c-base.md"]);
  assert.deepEqual(task.modules[3].inputDocs, ["d-base.md", "d-p2-state.md"]);
  assert.equal(task.inputDocs.includes("a-p2.md"), false);
  assert.equal(task.inputDocs.includes("a-p1.md"), false);
  assert.deepEqual(task.plan.stages.map((stage) => stage.id), ["D1", "D2", "D7"]);
});

test("integration resolver fails closed when checkpoint dependency closure does not cover full product", () => {
  const graphs: Record<string, ModuleGraph> = {
    A: {
      ...base("A"),
      patches: [
        { id: "P002-two", parent: "BASE", taskDoc: "a-p2.md", stateDocs: ["a-p2-state.md"] },
      ],
    },
    B: base("B"),
    C: base("C"),
    D: base("D"),
  };

  assert.throws(
    () => resolveIntegrationTask(config, registry, dependency, graphs, "P002-two", plan),
    /full configured product scope/i,
  );
});

test("integration stage plan fails closed on cycles and invalid mutation modes", () => {
  const graphs: Record<string, ModuleGraph> = {
    A: {
      ...base("A"),
      patches: [
        { id: "P002-two", parent: "BASE", taskDoc: "a-p2.md", stateDocs: ["a-p2-state.md"] },
      ],
    },
    B: base("B"),
    C: base("C"),
    D: {
      ...base("D"),
      patches: [
        { id: "P002-two", parent: "BASE", taskDoc: "d-p2.md", stateDocs: ["d-p2-state.md"] },
      ],
    },
  };

  const cyclic: IntegrationStagePlan = {
    ...plan,
    stages: [
      { ...plan.stages[0], id: "D1", dependsOn: ["D2"] },
      { ...plan.stages[1], id: "D2", dependsOn: ["D1"] },
    ],
  };
  assert.throws(
    () => resolveIntegrationTask(config, registry, dependency, graphs, "P002-two", cyclic),
    /cycle/i,
  );

  const invalidMutation: IntegrationStagePlan = {
    ...plan,
    stages: [
      {
        ...plan.stages[0],
        mode: "ANALYZE",
        mutation: true,
      },
    ],
  };
  assert.throws(
    () => resolveIntegrationTask(config, registry, dependency, graphs, "P002-two", invalidMutation),
    /mutate only in WRITE mode/i,
  );
});
