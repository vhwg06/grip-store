import type { ResolvedIntegrationTask } from "../../../integration-resolver";
import {
  targetResolution,
  type FigmaExecutionPolicy,
} from "../policy";

function integrationResolution(
  summary: string,
  label: string,
): "VERIFIED" | "GAP" | "DOC_GAP" | "UNKNOWN" {
  const upper = summary.toUpperCase();
  const expected = label.toUpperCase();
  if (upper.includes(`INTEGRATION_VERIFIED: ${expected}`)) return "VERIFIED";
  if (upper.includes(`INTEGRATION_GAP: ${expected}`)) return "GAP";
  if (upper.includes(`INTEGRATION_DOC_GAP: ${expected}`)) return "DOC_GAP";
  return "UNKNOWN";
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
    "TASK PROVIDER RESOLVED PRODUCT INTEGRATION TASK — this is the complete execution intent. Do not rediscover or broaden it.",
    `Product checkpoint: ${task.checkpoint.id} (${task.checkpoint.label})`,
    `Integration plan: ${task.plan.id} (${task.plan.label})`,
    "Resolve the existing canonical GRIP product surface set through figma-mcp-go. Do not require a hard-coded Figma URL or node id.",
    "This task is UPDATE/VERIFY ONLY. It is not init/rewrite and it is not a new product patch.",
    "Provider-resolved Module states:",
    ...moduleLines,
    "",
    "Execute the provider-owned internal stage DAG exactly as resolved:",
    ...stageLines,
    "",
    "D1 is orientation. D2-D6 are the only mutation-authorized stages. D7 is fresh independent validation. D8 is execution evidence.",
    "Never invent behavior/state absent from the resolved documents. If required behavior is undocumented, return INTEGRATION_DOC_GAP and stop.",
    "Mutation is limited to screen-flow integration, prototype reactions, documented state reachability, cross-Module handoffs, responsive journey continuity, and defects directly blocking those concerns.",
    "Do not perform unrelated redesign, copy/spacing cleanup, new capability design, domain ownership changes, or implementation work.",
    "Reviewer summary contract:",
    "- summary MUST begin exactly TARGET_RESOLVED:, TARGET_NOT_FOUND:, or TARGET_AMBIGUOUS:",
    `- resolved integration complete: include exactly INTEGRATION_VERIFIED: ${task.plan.label}`,
    `- documented integration gap: include exactly INTEGRATION_GAP: ${task.plan.label}`,
    `- planning authority gap: include exactly INTEGRATION_DOC_GAP: ${task.plan.label}`,
  ].join("\n");
}

export const productIntegrationPolicy: FigmaExecutionPolicy<ResolvedIntegrationTask> = {
  id: "product-integration",
  artifactPrefix: "product-integration",

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
    if (targetResolution(summary) !== "RESOLVED") return "FAIL";
    const integration = integrationResolution(summary, task.plan.label);
    if (integration === "VERIFIED" && exitCode === 0) return "PASS";
    if (integration === "DOC_GAP") return "DOC_GAP";
    if (integration === "GAP" && exitCode === 2) return "WRITE";
    return "FAIL";
  },

  verifyAfterWrite(task, _unit, summary, exitCode) {
    return (
      exitCode === 0 &&
      targetResolution(summary) === "RESOLVED" &&
      integrationResolution(summary, task.plan.label) === "VERIFIED"
    );
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
    };
  },
};
