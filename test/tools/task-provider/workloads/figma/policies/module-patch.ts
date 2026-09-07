import type { ResolvedModuleTask, ResolvedTask } from "../../../resolver";
import {
  targetResolution,
  type FigmaExecutionPolicy,
  type FigmaExecutionUnit,
} from "../policy";

const pipelineContract = ".agents/figma-pipeline-update.md";
const designBaseContract = ".agents/design-base.md";

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function changeResolution(summary: string, label: string): "VERIFIED" | "GAP" | "NOT_APPLICABLE" | "UNKNOWN" {
  const upper = summary.toUpperCase();
  const expected = label.toUpperCase();
  if (upper.includes(`CHANGE_VERIFIED: ${expected}`)) return "VERIFIED";
  if (upper.includes(`CHANGE_GAP: ${expected}`)) return "GAP";
  if (upper.includes(`CHANGE_NOT_APPLICABLE: ${expected}`)) return "NOT_APPLICABLE";
  return "UNKNOWN";
}

function resolvedTaskBoundary(module: ResolvedModuleTask, task: ResolvedTask): string[] {
  const common = [
    "TASK PROVIDER RESOLVED TASK — this is the complete execution intent. Do not rediscover or broaden it.",
    `Product patch: ${task.patch.id} (${task.patch.label})`,
    `Logical Module: ${module.id}`,
    `Task mode: ${module.mode}`,
    `Resolved Module state at this product patch: ${module.state.id}`,
  ];

  if (module.mode === "PATCH") {
    return [
      ...common,
      `Module patch parent: ${module.patch!.parent}`,
      `Authoritative Module patch task: ${module.patch!.taskDoc}`,
      "Resulting desired-state documents:",
      ...module.patch!.stateDocs.map((doc) => `- ${doc}`),
      "Execute/verify ONLY this Module patch transition. The patch task and resulting desired state are the mutation boundary.",
      `If the desired state is already represented, summary must include exactly CHANGE_VERIFIED: ${task.patch.label}`,
      `If the Module patch is missing/incorrect, summary must include exactly CHANGE_GAP: ${task.patch.label}`,
      `CHANGE_NOT_APPLICABLE: ${task.patch.label} is invalid because Task Provider resolved a direct Module patch node.`,
      "Unrelated pre-existing issues must not authorize mutation.",
    ];
  }

  return [
    ...common,
    "No Module patch node exists for this product patch. This is compatibility verification only.",
    "Current Module state documents:",
    ...module.state.docs.map((doc) => `- ${doc}`),
    `If compatible, summary must include exactly CHANGE_NOT_APPLICABLE: ${task.patch.label}`,
    `If a direct change is actually required, summary must include exactly CHANGE_GAP: ${task.patch.label}; this is DOC_GAP and writer is forbidden.`,
    `CHANGE_VERIFIED: ${task.patch.label} is invalid because this Module has no direct patch node.`,
    "Do not mutate in compatibility mode.",
  ];
}

function target(module: ResolvedModuleTask, task: ResolvedTask): string {
  return [
    "Resolve the existing canonical Figma artifact through figma-mcp-go. Do not use or require a hard-coded Figma URL or node id.",
    "This task is UPDATE/VERIFY ONLY. It is NOT an init/rewrite request.",
    `Pipeline scope: ${module.scope}`,
    `Structural locator contract: ${designBaseContract}`,
    "",
    ...resolvedTaskBoundary(module, task),
    "",
    "Resolve all existing canonical top-level roots owned by this logical Module and required by the resolved task state.",
    "Distinct Public/Admin sibling roots are valid when their responsibilities differ.",
    "Semantic identity is Module + Surface + Use Case + Screen responsibility + State responsibility.",
    "Target-resolution summary contract:",
    "- resolved target: summary MUST begin exactly TARGET_RESOLVED:",
    "- required existing surface missing: summary MUST begin exactly TARGET_NOT_FOUND:",
    "- competing same-responsibility candidates: summary MUST begin exactly TARGET_AMBIGUOUS:",
    "TARGET_NOT_FOUND/TARGET_AMBIGUOUS are terminal; never create replacement roots as fallback.",
  ].join("\n");
}

function moduleForUnit(task: ResolvedTask, unit: FigmaExecutionUnit): ResolvedModuleTask {
  const module = task.modules.find((candidate) => candidate.id === unit.id);
  if (!module) throw new Error(`module patch policy cannot find resolved Module ${unit.id}`);
  return module;
}

export const modulePatchPolicy: FigmaExecutionPolicy<ResolvedTask> = {
  id: "module-patch",
  artifactPrefix: "module-patch",

  units(task) {
    return task.modules.map((module) => ({
      id: module.id,
      scope: module.scope,
      docs: unique([pipelineContract, designBaseContract, ...module.inputDocs]),
      maxRepairs: module.maxRepairs,
      target: target(module, task),
      metadata: { mode: module.mode, state: module.state.id },
    }));
  },

  decideReview(task, unit, summary, exitCode) {
    if (targetResolution(summary) !== "RESOLVED") return "FAIL";
    const module = moduleForUnit(task, unit);
    const change = changeResolution(summary, task.patch.label);

    if (module.mode === "COMPATIBILITY") {
      if (change === "NOT_APPLICABLE" && exitCode === 0) return "PASS";
      if (change === "GAP") return "DOC_GAP";
      return "FAIL";
    }

    if (change === "VERIFIED" && exitCode === 0) return "PASS";
    if (change === "GAP" && exitCode === 2) return "WRITE";
    return "FAIL";
  },

  verifyAfterWrite(task, unit, summary, exitCode) {
    const module = moduleForUnit(task, unit);
    if (module.mode !== "PATCH") return false;
    return (
      exitCode === 0 &&
      targetResolution(summary) === "RESOLVED" &&
      changeResolution(summary, task.patch.label) === "VERIFIED"
    );
  },

  evidence(task) {
    return {
      patch: task.patch,
      dependency: task.dependency,
    };
  },
};
