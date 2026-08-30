import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFigmaPipelinePlan,
  parseFigmaPipelineGraph,
} from "./dependency";

const graphInput = {
  version: 1,
  name: "grip-figma",
  nodes: [
    { id: "Catalog", scope: "Catalog", dependsOn: [] },
    { id: "Checkout", scope: "Checkout", dependsOn: ["Catalog"] },
    { id: "Account", scope: "Account", dependsOn: ["Checkout"] },
    { id: "Engagement", scope: "Engagement", dependsOn: ["Catalog", "Checkout", "Account"] },
    { id: "Content", scope: "Content", dependsOn: ["Catalog", "Engagement"] },
    { id: "Order", scope: "Order", dependsOn: ["Catalog", "Checkout", "Account", "Engagement", "Content"] },
    { id: "Aftersales", scope: "Aftersales", dependsOn: ["Order", "Account", "Content"] },
  ],
};

test("change rebuilds the changed node and all dependents", () => {
  const graph = parseFigmaPipelineGraph(graphInput);
  assert.deepEqual(buildFigmaPipelinePlan(graph, ["Order"], 3).map((item) => item.id), [
    "Order",
    "Aftersales",
  ]);

  assert.deepEqual(buildFigmaPipelinePlan(graph, ["Catalog"], 3).map((item) => item.id), [
    "Catalog",
    "Checkout",
    "Account",
    "Engagement",
    "Content",
    "Order",
    "Aftersales",
  ]);
});

test("multiple changed nodes are rebuilt once in dependency order", () => {
  const graph = parseFigmaPipelineGraph(graphInput);
  assert.deepEqual(buildFigmaPipelinePlan(graph, ["Checkout", "Content", "Order"], 2).map((item) => item.id), [
    "Checkout",
    "Account",
    "Engagement",
    "Content",
    "Order",
    "Aftersales",
  ]);
});

test("nodes outside the dependency path are skipped", () => {
  const graph = parseFigmaPipelineGraph({
    version: 1,
    name: "independent",
    nodes: [
      { id: "A", scope: "A", dependsOn: [] },
      { id: "B", scope: "B", dependsOn: ["A"] },
      { id: "C", scope: "C", dependsOn: [] },
    ],
  });
  assert.deepEqual(buildFigmaPipelinePlan(graph, ["A"], 3).map((item) => item.id), ["A", "B"]);
});

test("dependency graph rejects docs and invalid topology", () => {
  const graph = parseFigmaPipelineGraph(graphInput);
  assert.throws(() => buildFigmaPipelinePlan(graph, ["Missing"], 3), /unknown changed/i);

  assert.throws(
    () => parseFigmaPipelineGraph({
      version: 1,
      name: "scope-only",
      nodes: [{ id: "A", scope: "A", dependsOn: [], docs: ["a.md"] }],
    }),
    /must not contain docs/i,
  );

  assert.throws(
    () => parseFigmaPipelineGraph({
      version: 1,
      name: "cycle",
      nodes: [
        { id: "A", scope: "A", dependsOn: ["B"] },
        { id: "B", scope: "B", dependsOn: ["A"] },
      ],
    }),
    /cycle/i,
  );

  assert.throws(
    () => parseFigmaPipelineGraph({
      version: 1,
      name: "dup-dependency",
      nodes: [
        { id: "A", scope: "A", dependsOn: [] },
        { id: "B", scope: "B", dependsOn: ["A", "A"] },
      ],
    }),
    /duplicate dependency/i,
  );
});
