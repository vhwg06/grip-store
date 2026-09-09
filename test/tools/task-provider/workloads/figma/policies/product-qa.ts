import type { ResolvedIntegrationTask } from "../../../integration-resolver";
import {
  targetResolution,
  type FigmaExecutionPolicy,
  type ReviewDecision,
} from "../policy";

function qaResolution(
  summary: string,
  label: string,
): "VERIFIED" | "GAP" | "DOC_GAP" | "UNKNOWN" {
  const upper = summary.toUpperCase();
  const expected = label.toUpperCase();
  if (upper.includes(`QA_VERIFIED: ${expected}`)) return "VERIFIED";
  if (upper.includes(`QA_GAP: ${expected}`)) return "GAP";
  if (upper.includes(`QA_DOC_GAP: ${expected}`)) return "DOC_GAP";
  return "UNKNOWN";
}

function decide(task: ResolvedIntegrationTask, summary: string, exitCode: number | null): ReviewDecision {
  if (targetResolution(summary) !== "RESOLVED") return "FAIL";
  const qa = qaResolution(summary, task.plan.label);
  if (qa === "VERIFIED" && exitCode === 0) return "PASS";
  if (qa === "DOC_GAP") return "DOC_GAP";
  if (qa === "GAP" && exitCode === 2) return "WRITE";
  return "FAIL";
}

function target(task: ResolvedIntegrationTask): string {
  const moduleLines = task.modules.map(
    (module) => `- ${module.id} | scope=${module.scope} | state=${module.state.id} | docs=${module.state.docs.join(", ")}`,
  );
  const stageLines = task.plan.stages.map(
    (stage) =>
      `- ${stage.id} | ${stage.mode} | mutation=${String(stage.mutation)} | dependsOn=[${stage.dependsOn.join(", ")}] | ${stage.objective}`,
  );

  return [
    "TASK PROVIDER RESOLVED PRODUCT QA TASK — this is the complete execution intent. Do not rediscover or broaden it.",
    `Product checkpoint: ${task.checkpoint.id} (${task.checkpoint.label})`,
    `QA plan: ${task.plan.id} (${task.plan.label})`,
    "Resolve the existing canonical integrated GRIP product through figma-mcp-go. Do not require a hard-coded Figma URL or node id.",
    "This is the independent Product QA / Design Review gate after Product Integration / Prototype. It is not implementation QA, a new capability, or a synthetic product patch.",
    "Provider-resolved Module states:",
    ...moduleLines,
    "",
    "Apply the provider-owned Product QA plan:",
    ...stageLines,
    "",
    "A QA failure is not automatically terminal. A validated repairable QA_GAP authorizes the bounded review/repair/fresh-review loop.",
    "Before a candidate defect may become QA_GAP, challenge it for: canonical authority/design-gate trace, fresh artifact evidence, material product impact, in-scope validity, correct semantic identity, and tooling-vs-product distinction.",
    "Preference-only polish, intentionally deferred/out-of-scope behavior, absence of a non-required state, stale evidence, or duplicate claims based only on names/screenshots MUST NOT authorize repair.",
    "Distinct Public/Admin roots are not duplicates when they own different surface responsibilities.",
    "Product-level QA may block pre-existing defects when they genuinely violate the final product authority/gates; it must not block merely because a reviewer would choose a different style.",
    "Repair is corrective only: existing canonical Figma may be reconciled to supported product/design authority. Do not invent behavior/state/ownership or perform implementation work.",
    "If a safe repair requires undocumented or contradictory product authority, return QA_DOC_GAP and stop rather than improvising.",
    "After any repair, previous defect observations are stale. Require fresh independent review from the current artifact.",
    "Reviewer summary contract:",
    "- summary MUST begin exactly TARGET_RESOLVED:, TARGET_NOT_FOUND:, or TARGET_AMBIGUOUS:",
    `- Product QA complete: include exactly QA_VERIFIED: ${task.plan.label}`,
    `- validated repairable Product QA defect: include exactly QA_GAP: ${task.plan.label}`,
    `- missing/contradictory planning authority: include exactly QA_DOC_GAP: ${task.plan.label}`,
  ].join("\n");
}

export const productQaPolicy: FigmaExecutionPolicy<ResolvedIntegrationTask> = {
  id: "product-qa",
  artifactPrefix: "product-qa",

  units(task) {
    return [
      {
        id: task.plan.id,
        scope: task.plan.label,
        docs: task.inputDocs,
        maxRepairs: task.maxRepairs,
        target: target(task),
        metadata: { checkpoint: task.checkpoint.id },
      },
    ];
  },

  decideReview(task, _unit, summary, exitCode) {
    return decide(task, summary, exitCode);
  },

  verifyAfterWrite(task, _unit, summary, exitCode) {
    return decide(task, summary, exitCode) === "PASS";
  },

  maxWriteAttempts(task) {
    return task.maxRepairs;
  },

  childRepairBudget() {
    // Product QA must expose every fresh review to the policy so QA_DOC_GAP can
    // terminate immediately and QA_GAP can explicitly continue the outer loop.
    return 0;
  },

  decideAfterWrite(task, _unit, summary, exitCode) {
    return decide(task, summary, exitCode);
  },

  evidence(task) {
    return {
      checkpoint: task.checkpoint,
      dependency: task.dependency,
      plan: {
        id: task.plan.id,
        label: task.plan.label,
        stages: task.plan.stages.map((stage) => stage.id),
      },
      modules: task.modules.map((module) => ({ id: module.id, state: module.state.id })),
      falsePositiveControls: [
        "authority-trace",
        "fresh-artifact-evidence",
        "material-product-impact",
        "scope-validity",
        "semantic-identity",
        "tooling-vs-product",
        "freshness-after-repair",
      ],
    };
  },
};
