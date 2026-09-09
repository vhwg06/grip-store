import assert from "node:assert/strict";
import test from "node:test";

import type { ResolvedIntegrationTask } from "./integration-resolver";
import type { ResolvedTask } from "./resolver";
import { createWorkload } from "./workload-factory";
import { modulePatchPolicy } from "./workloads/figma/policies/module-patch";
import { productIntegrationPolicy } from "./workloads/figma/policies/product-integration";
import { productQaPolicy } from "./workloads/figma/policies/product-qa";

test("workload factory returns reusable Figma workload and rejects unknown types", () => {
  assert.equal(createWorkload("figma").type, "figma");
  assert.equal(createWorkload(" FIGMA ").type, "figma");
  assert.throws(() => createWorkload("unknown"), /unsupported workload type/i);
});

test("module patch policy preserves PATCH and COMPATIBILITY mutation rules", () => {
  const task: ResolvedTask = {
    version: 1,
    provider: "grip-task-provider",
    pipeline: "figma",
    patch: { id: "P001-one", label: "One", sequence: 1 },
    dependency: {
      graph: "graph.json",
      directPatchModules: ["A"],
      affectedModules: ["A", "B"],
    },
    modules: [
      {
        id: "A",
        scope: "A",
        mode: "PATCH",
        maxRepairs: 3,
        state: { id: "P001-one", docs: ["a-state.md"] },
        patch: {
          id: "P001-one",
          parent: "BASE",
          taskDoc: "a-task.md",
          stateDocs: ["a-state.md"],
        },
        inputDocs: ["a-task.md", "a-state.md"],
      },
      {
        id: "B",
        scope: "B",
        mode: "COMPATIBILITY",
        maxRepairs: 3,
        state: { id: "BASE", docs: ["b-base.md"] },
        inputDocs: ["b-base.md"],
      },
    ],
    resolvedAt: "2026-01-01T00:00:00.000Z",
  };

  const [patchUnit, compatibilityUnit] = modulePatchPolicy.units(task);
  assert.equal(
    modulePatchPolicy.decideReview(task, patchUnit, "TARGET_RESOLVED: ok\nCHANGE_VERIFIED: One", 0),
    "PASS",
  );
  assert.equal(
    modulePatchPolicy.decideReview(task, patchUnit, "TARGET_RESOLVED: gap\nCHANGE_GAP: One", 2),
    "WRITE",
  );
  assert.equal(
    modulePatchPolicy.decideReview(task, compatibilityUnit, "TARGET_RESOLVED: gap\nCHANGE_GAP: One", 2),
    "DOC_GAP",
  );
  assert.equal(
    modulePatchPolicy.decideReview(
      task,
      compatibilityUnit,
      "TARGET_RESOLVED: compatible\nCHANGE_NOT_APPLICABLE: One",
      0,
    ),
    "PASS",
  );
});

function checkpointTask(label: string, pipeline: string): ResolvedIntegrationTask {
  return {
    version: 1,
    provider: "grip-task-provider",
    pipeline,
    checkpoint: { id: "P003-three", label: "Three", sequence: 3 },
    dependency: { graph: "graph.json", modules: ["A"] },
    modules: [
      {
        id: "A",
        scope: "A",
        maxRepairs: 3,
        state: { id: "P003-three", docs: ["a-base.md", "a-p3.md"] },
        inputDocs: ["a-base.md", "a-p3.md"],
      },
    ],
    plan: {
      version: 1,
      id: pipeline,
      label,
      inputDocs: [`${pipeline}.md`],
      stages: [
        {
          id: "D1",
          title: "Inventory",
          mode: "ANALYZE",
          dependsOn: [],
          mutation: false,
          objective: "Resolve flows",
        },
      ],
    },
    inputDocs: [`${pipeline}.md`, "a-base.md", "a-p3.md"],
    maxRepairs: 3,
    resolvedAt: "2026-01-01T00:00:00.000Z",
  };
}

test("product integration policy shares the lifecycle but keeps its own review markers", () => {
  const task = checkpointTask("Product Integration / Prototype", "figma-integration");
  const [unit] = productIntegrationPolicy.units(task);
  assert.equal(
    productIntegrationPolicy.decideReview(
      task,
      unit,
      "TARGET_RESOLVED: ok\nINTEGRATION_VERIFIED: Product Integration / Prototype",
      0,
    ),
    "PASS",
  );
  assert.equal(
    productIntegrationPolicy.decideReview(
      task,
      unit,
      "TARGET_RESOLVED: gap\nINTEGRATION_GAP: Product Integration / Prototype",
      2,
    ),
    "WRITE",
  );
  assert.equal(
    productIntegrationPolicy.decideReview(
      task,
      unit,
      "TARGET_RESOLVED: docs\nINTEGRATION_DOC_GAP: Product Integration / Prototype",
      2,
    ),
    "DOC_GAP",
  );
});

test("product QA policy loops repairable QA gaps and stops only on authority gaps", () => {
  const task = checkpointTask("Product QA / Design Review", "figma-product-qa");
  const [unit] = productQaPolicy.units(task);

  assert.equal(
    productQaPolicy.decideReview(
      task,
      unit,
      "TARGET_RESOLVED: product reviewed\nQA_VERIFIED: Product QA / Design Review",
      0,
    ),
    "PASS",
  );
  assert.equal(
    productQaPolicy.decideReview(
      task,
      unit,
      "TARGET_RESOLVED: repairable defect\nQA_GAP: Product QA / Design Review",
      2,
    ),
    "WRITE",
  );
  assert.equal(
    productQaPolicy.decideReview(
      task,
      unit,
      "TARGET_RESOLVED: authority missing\nQA_DOC_GAP: Product QA / Design Review",
      2,
    ),
    "DOC_GAP",
  );
  assert.equal(
    productQaPolicy.verifyAfterWrite(
      task,
      unit,
      "TARGET_RESOLVED: fresh review\nQA_VERIFIED: Product QA / Design Review",
      0,
    ),
    true,
  );
  assert.equal(
    productQaPolicy.verifyAfterWrite(
      task,
      unit,
      "TARGET_RESOLVED: stale gap\nQA_GAP: Product QA / Design Review",
      2,
    ),
    false,
  );
});
