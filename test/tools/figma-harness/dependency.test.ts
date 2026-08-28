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

test("changing Order invalidates only Order and its downstream Aftersales node", () => {
  const graph = parseFigmaPipelineGraph(graphInput);
  const plan = buildFigmaPipelinePlan(graph, ["Order"], 3);
  assert.deepEqual(plan.map((item) => item.id), ["Order", "Aftersales"]);
  assert.equal(plan[0].directlyChanged, true);
  assert.equal(plan[1].directlyChanged, false);
  assert.deepEqual(plan[1].invalidatedBy, ["Order"]);
});

test("changing Catalog propagates through the declared dependency graph", () => {
  const graph = parseFigmaPipelineGraph(graphInput);
  const plan = buildFigmaPipelinePlan(graph, ["Catalog"], 3);
  assert.deepEqual(plan.map((item) => item.id), [
    "Catalog",
    "Checkout",
    "Account",
    "Engagement",
    "Content",
    "Order",
    "Aftersales",
  ]);
});

test("multiple changed roots are collapsed into one stale closure without duplicate work", () => {
  const graph = parseFigmaPipelineGraph(graphInput);
  const plan = buildFigmaPipelinePlan(graph, ["Checkout", "Content", "Order"], 2);
  assert.deepEqual(plan.map((item) => item.id), [
    "Checkout",
    "Account",
    "Engagement",
    "Content",
    "Order",
    "Aftersales",
  ]);
  assert.equal(plan.find((item) => item.id === "Order")?.directlyChanged, true);
  assert.equal(plan.find((item) => item.id === "Catalog"), undefined);
});

test("unrelated upstream nodes are not rerun", () => {
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

test("unknown changed nodes are rejected", () => {
  const graph = parseFigmaPipelineGraph(graphInput);
  assert.throws(() => buildFigmaPipelinePlan(graph, ["Missing"], 3), /unknown changed/i);
});

test("dependency cycles are rejected because invalidation order would be ambiguous", () => {
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
});

test("duplicate dependencies and duplicate documents are rejected", () => {
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

  assert.throws(
    () => parseFigmaPipelineGraph({
      version: 1,
      name: "dup-doc",
      nodes: [{ id: "A", scope: "A", dependsOn: [], docs: ["a.md", "a.md"] }],
    }),
    /same document more than once/i,
  );
});
