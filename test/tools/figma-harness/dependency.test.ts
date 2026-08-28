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
    { id: "Catalog", scope: "Catalog", dependsOn: [], docs: ["catalog.md"] },
    { id: "Checkout", scope: "Checkout", dependsOn: ["Catalog"], docs: ["checkout.md"] },
    { id: "Account", scope: "Account", dependsOn: ["Checkout"], docs: ["account.md"] },
    { id: "Engagement", scope: "Engagement", dependsOn: ["Catalog", "Checkout", "Account"], docs: ["engagement.md"] },
    { id: "Content", scope: "Content", dependsOn: ["Catalog", "Engagement"], docs: ["content.md"] },
    { id: "Order", scope: "Order", dependsOn: ["Catalog", "Checkout", "Account", "Engagement", "Content"], docs: ["order.md"] },
    { id: "Aftersales", scope: "Aftersales", dependsOn: ["Order", "Account", "Content"], docs: ["aftersales.md"] },
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
      { id: "A", scope: "A", dependsOn: [], docs: ["a.md"] },
      { id: "B", scope: "B", dependsOn: ["A"], docs: ["b.md"] },
      { id: "C", scope: "C", dependsOn: [], docs: ["c.md"] },
    ],
  });
  assert.deepEqual(buildFigmaPipelinePlan(graph, ["A"], 3).map((item) => item.id), ["A", "B"]);
});

test("invalid graph/change input is rejected", () => {
  const graph = parseFigmaPipelineGraph(graphInput);
  assert.throws(() => buildFigmaPipelinePlan(graph, ["Missing"], 3), /unknown changed/i);

  assert.throws(
    () => parseFigmaPipelineGraph({
      version: 1,
      name: "cycle",
      nodes: [
        { id: "A", scope: "A", dependsOn: ["B"], docs: ["a.md"] },
        { id: "B", scope: "B", dependsOn: ["A"], docs: ["b.md"] },
      ],
    }),
    /cycle/i,
  );

  assert.throws(
    () => parseFigmaPipelineGraph({
      version: 1,
      name: "dup-dependency",
      nodes: [
        { id: "A", scope: "A", dependsOn: [], docs: ["a.md"] },
        { id: "B", scope: "B", dependsOn: ["A", "A"], docs: ["b.md"] },
      ],
    }),
    /duplicate dependency/i,
  );
});
