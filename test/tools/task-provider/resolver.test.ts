import assert from "node:assert/strict";
import test from "node:test";

import { resolveTask, type ModuleGraph, type PatchRegistry, type PipelineConfig } from "./resolver";

const config: PipelineConfig = {
  version: 1,
  id: "figma",
  executor: "figma:pipeline",
  dependencyGraph: "graph.json",
  patchRegistry: "patches.json",
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

function base(module: string): ModuleGraph {
  return {
    version: 1,
    module,
    base: { id: "BASE", stateDocs: [`${module.toLowerCase()}-base.md`] },
    patches: [],
  };
}

test("Task Provider derives direct patch modules and dependency closure", () => {
  const graphs: Record<string, ModuleGraph> = {
    A: {
      ...base("A"),
      patches: [
        { id: "P001-one", parent: "BASE", taskDoc: "a-p1.md", stateDocs: ["a-p1-state.md"] },
      ],
    },
    B: base("B"),
    C: {
      ...base("C"),
      patches: [
        { id: "P001-one", parent: "BASE", taskDoc: "c-p1.md", stateDocs: ["c-p1-state.md"] },
      ],
    },
    D: base("D"),
  };

  const task = resolveTask(config, registry, dependency, graphs, "P001-one", "2026-01-01T00:00:00.000Z");
  assert.deepEqual(task.dependency.directPatchModules, ["A", "C"]);
  assert.deepEqual(task.dependency.affectedModules, ["A", "B", "C"]);
  assert.equal(task.modules[0].mode, "PATCH");
  assert.equal(task.modules[1].mode, "COMPATIBILITY");
  assert.equal(task.modules[1].state.id, "BASE");
  assert.equal(task.modules[2].mode, "PATCH");
});

test("Module resolver advances compatibility state to latest earlier patch", () => {
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
    D: base("D"),
  };

  const task = resolveTask(config, registry, dependency, graphs, "P002-two");
  const b = task.modules.find((module) => module.id === "B");
  assert.equal(b?.mode, "COMPATIBILITY");
  assert.equal(b?.state.id, "P001-one");
  assert.deepEqual(b?.inputDocs, ["b-p1-state.md"]);
});

test("inactive patch and broken module parent fail closed", () => {
  const graphs: Record<string, ModuleGraph> = {
    A: base("A"),
    B: base("B"),
    C: base("C"),
    D: base("D"),
  };
  assert.throws(() => resolveTask(config, registry, dependency, graphs, "P002-two"), /not activated/i);

  graphs.A = {
    ...base("A"),
    patches: [
      { id: "P001-one", parent: "WRONG", taskDoc: "a-p1.md", stateDocs: ["a-p1-state.md"] },
    ],
  };
  assert.throws(() => resolveTask(config, registry, dependency, graphs, "P001-one"), /parent must be BASE/i);
});
