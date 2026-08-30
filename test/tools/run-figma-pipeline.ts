import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import type { ResolvedModuleTask, ResolvedTask } from "./task-provider/resolver";

interface Options {
  task: string;
}

interface NodeRunResult {
  id: string;
  mode: "PATCH" | "COMPATIBILITY";
  review: "PASS" | "NEEDS_UPDATE" | "DOC_GAP" | "FAILED" | "NOT_RUN";
  updated: boolean;
  status: "PASS" | "FAILED" | "NOT_RUN";
  reviewExitCode: number | null;
  updateExitCode: number | null;
}

type TargetResolution = "RESOLVED" | "NOT_FOUND" | "AMBIGUOUS" | "UNKNOWN";
type ChangeResolution = "VERIFIED" | "GAP" | "NOT_APPLICABLE" | "UNKNOWN";

interface ReviewProbe {
  summary?: string;
}

interface TerminalStateProbe {
  last_review?: string | null;
}

const root = process.cwd();
const pipelineContract = ".agents/figma-pipeline-update.md";
const designBaseContract = ".agents/design-base.md";
const harnessArtifactRoot = resolve(root, "artifacts", "figma-harness");

function die(message: string): never {
  console.error(`[figma-pipeline] ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  let task = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--task") {
      if (!value) die("--task requires a resolved task path");
      task = value;
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`Internal executor usage:\n  npm run figma:pipeline -- --task <resolved-task.json>\n\nDependency patch tasks must be created through the Task Provider:\n  npm run task -- --pipeline figma --patch P001-promotions\n\nDo not pass graph, changed seed, change label, change documents, Figma URL, or Module docs directly to this executor.\n`);
      process.exit(0);
    }
    die(`unknown argument: ${arg}. figma:pipeline only consumes Task Provider packages`);
  }
  if (!task) die("--task is required; invoke dependency patch work through npm run task");
  return { task };
}

function loadTask(path: string): ResolvedTask {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) die(`resolved task not found: ${path}`);

  let task: ResolvedTask;
  try {
    task = JSON.parse(readFileSync(absolute, "utf8")) as ResolvedTask;
  } catch (error) {
    die(`invalid resolved task JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (task.version !== 1 || task.provider !== "grip-task-provider") {
    die("resolved task must be version 1 from grip-task-provider");
  }
  if (task.pipeline !== "figma") die(`resolved task pipeline must be figma, got ${task.pipeline}`);
  if (!task.patch?.id || !task.patch?.label || !Array.isArray(task.modules) || task.modules.length === 0) {
    die("resolved task is missing patch/module information");
  }

  for (const contract of [pipelineContract, designBaseContract]) {
    if (!existsSync(resolve(root, contract))) die(`required Figma contract not found: ${contract}`);
  }

  const affected = task.modules.map((module) => module.id);
  if (affected.join("\u0000") !== task.dependency.affectedModules.join("\u0000")) {
    die("resolved task module order does not match its dependency closure");
  }

  for (const module of task.modules) {
    if (module.mode === "PATCH" && !module.patch) die(`PATCH task ${module.id} is missing its module patch node`);
    if (module.mode === "COMPATIBILITY" && module.patch) {
      die(`COMPATIBILITY task ${module.id} must not carry a module patch node`);
    }
    if (!Array.isArray(module.inputDocs) || module.inputDocs.length === 0) {
      die(`resolved task ${module.id} has no inputDocs`);
    }
    for (const doc of module.inputDocs) {
      if (!existsSync(resolve(root, doc))) die(`resolved input document not found for ${module.id}: ${doc}`);
    }
  }
  return task;
}

function printTask(taskPath: string, task: ResolvedTask): void {
  console.log(`[figma-pipeline] task=${taskPath}`);
  console.log(`[figma-pipeline] patch=${task.patch.id} (${task.patch.label})`);
  console.log(`[figma-pipeline] dependency=${task.dependency.graph}`);
  console.log(`[figma-pipeline] direct=${task.dependency.directPatchModules.join(", ")}`);
  console.log(`[figma-pipeline] affected=${task.dependency.affectedModules.join(" -> ")}`);
  for (const [index, module] of task.modules.entries()) {
    console.log(
      `[figma-pipeline] ${index + 1}. ${module.id} mode=${module.mode} state=${module.state.id}` +
        (module.patch ? ` patch=${module.patch.id}` : ""),
    );
    module.inputDocs.forEach((doc, docIndex) => {
      console.log(`[figma-pipeline]    input ${docIndex + 1}. ${doc}`);
    });
  }
}

function writePipelineState(taskPath: string, task: ResolvedTask, results: NodeRunResult[]): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(root, "artifacts", "figma-harness", `pipeline-${timestamp}`);
  mkdirSync(runDir, { recursive: true });
  const statePath = resolve(runDir, "pipeline-state.json");
  writeFileSync(
    statePath,
    `${JSON.stringify(
      {
        pipeline: "figma",
        taskProvider: task.provider,
        resolvedTask: taskPath,
        patch: task.patch,
        dependency: task.dependency,
        targetResolution:
          "figma-mcp-go + logical Module identity + flattened surface-set semantics + design-base structural constraints",
        results,
        completedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return statePath;
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
      "Unrelated pre-existing quality issues are outside this task. They may be non-blocking observations but must not lower task-scoped scores, fail this patch, or authorize mutation.",
      "Writer may mutate only the resolved patch delta plus defects directly caused by or blocking that delta.",
    ];
  }

  return [
    ...common,
    "No Module patch node exists for this product patch. This is compatibility verification only.",
    "Current Module state documents:",
    ...module.state.docs.map((doc) => `- ${doc}`),
    `If the existing Module remains compatible, summary must include exactly CHANGE_NOT_APPLICABLE: ${task.patch.label}`,
    `If this dependency actually requires a direct Module change, summary must include exactly CHANGE_GAP: ${task.patch.label}; this means DOC_GAP and MUST NOT start a writer.`,
    `CHANGE_VERIFIED: ${task.patch.label} is invalid because there is no direct Module patch node to verify.`,
    "Do not perform general quality cleanup, polish, copy tuning, spacing repair, redesign, or any mutation in compatibility mode.",
  ];
}

function semanticFigmaTarget(module: ResolvedModuleTask, task: ResolvedTask): string {
  return [
    "Resolve the existing canonical Figma artifact through figma-mcp-go. Do not use or require a hard-coded Figma URL or node id.",
    "This pipeline is UPDATE/VERIFY ONLY. It is NOT an init/rewrite request.",
    `Pipeline scope: ${module.scope}`,
    `Structural locator contract: ${designBaseContract}`,
    "",
    ...resolvedTaskBoundary(module, task),
    "",
    "Dependency Module identity is logical, not one physical Figma root.",
    "Resolve all existing canonical top-level roots owned by this Module and required by the resolved task state.",
    "Distinct Public/Admin sibling roots are valid when their surface responsibilities differ.",
    "Semantic identity is Module + Surface + Use Case + Screen responsibility + State responsibility.",
    "Target-resolution summary contract:",
    "- resolved existing Module surface set: summary MUST begin exactly TARGET_RESOLVED:",
    "- required existing surface missing: status=fail and summary MUST begin exactly TARGET_NOT_FOUND:",
    "- competing same-responsibility candidates / unresolved ownership: status=fail and summary MUST begin exactly TARGET_AMBIGUOUS:",
    "TARGET_NOT_FOUND/TARGET_AMBIGUOUS are terminal routing failures. Never create a replacement root as fallback.",
  ].join("\n");
}

function harnessArgs(module: ResolvedModuleTask, task: ResolvedTask, mode: "verify" | "write"): string[] {
  const args = ["run", mode === "verify" ? "figma:verify" : "figma:harness", "--"];
  if (mode === "write") args.push("--mode", "write");
  args.push(
    "--scope",
    module.scope,
    "--figma",
    semanticFigmaTarget(module, task),
    "--doc",
    pipelineContract,
    "--doc",
    designBaseContract,
  );
  for (const doc of module.inputDocs) args.push("--doc", doc);
  if (mode === "write") args.push("--max-repairs", String(module.maxRepairs));
  return args;
}

function snapshotHarnessRuns(): Set<string> {
  if (!existsSync(harnessArtifactRoot)) return new Set();
  return new Set(
    readdirSync(harnessArtifactRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("pipeline-"))
      .map((entry) => entry.name),
  );
}

function newestNewHarnessRun(before: Set<string>): string | null {
  if (!existsSync(harnessArtifactRoot)) return null;
  const candidates = readdirSync(harnessArtifactRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("pipeline-") && !before.has(entry.name))
    .map((entry) => {
      const path = resolve(harnessArtifactRoot, entry.name);
      return { path, mtimeMs: statSync(path).mtimeMs };
    })
    .sort((left, right) => right.mtimeMs - left.mtimeMs);
  return candidates[0]?.path ?? null;
}

function reviewSummary(runDir: string | null): string {
  if (!runDir) return "";
  try {
    const terminalPath = resolve(runDir, "terminal-state.json");
    if (!existsSync(terminalPath)) return "";
    const terminal = JSON.parse(readFileSync(terminalPath, "utf8")) as TerminalStateProbe;
    if (!terminal.last_review) return "";
    const reviewPath = terminal.last_review.startsWith(runDir)
      ? terminal.last_review
      : resolve(runDir, terminal.last_review);
    if (!existsSync(reviewPath)) return "";
    const review = JSON.parse(readFileSync(reviewPath, "utf8")) as ReviewProbe;
    return (review.summary ?? "").trim();
  } catch {
    return "";
  }
}

function targetResolution(summary: string): TargetResolution {
  const upper = summary.toUpperCase();
  if (upper.startsWith("TARGET_RESOLVED:")) return "RESOLVED";
  if (upper.startsWith("TARGET_NOT_FOUND:")) return "NOT_FOUND";
  if (upper.startsWith("TARGET_AMBIGUOUS:")) return "AMBIGUOUS";
  return "UNKNOWN";
}

function changeResolution(summary: string, label: string): ChangeResolution {
  const upper = summary.toUpperCase();
  const expected = label.toUpperCase();
  if (upper.includes(`CHANGE_VERIFIED: ${expected}`)) return "VERIFIED";
  if (upper.includes(`CHANGE_GAP: ${expected}`)) return "GAP";
  if (upper.includes(`CHANGE_NOT_APPLICABLE: ${expected}`)) return "NOT_APPLICABLE";
  return "UNKNOWN";
}

function failNode(
  taskPath: string,
  task: ResolvedTask,
  results: NodeRunResult[],
  index: number,
  message: string,
  exitCode = 1,
): never {
  results[index].status = "FAILED";
  const statePath = writePipelineState(taskPath, task, results);
  console.error(`[figma-pipeline] STOP ${results[index].id}: ${message}`);
  console.error(`[figma-pipeline] Pipeline state: ${statePath}`);
  process.exit(exitCode > 0 ? exitCode : 1);
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const task = loadTask(options.task);
  printTask(options.task, task);

  const results: NodeRunResult[] = task.modules.map((module) => ({
    id: module.id,
    mode: module.mode,
    review: "NOT_RUN",
    updated: false,
    status: "NOT_RUN",
    reviewExitCode: null,
    updateExitCode: null,
  }));

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  for (let index = 0; index < task.modules.length; index += 1) {
    const module = task.modules[index];
    console.log(`[figma-pipeline] REVIEW ${module.id} mode=${module.mode}`);

    const beforeReviewRuns = snapshotHarnessRuns();
    const reviewChild = spawnSync(npm, harnessArgs(module, task, "verify"), {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });
    const reviewExitCode = reviewChild.status;
    results[index].reviewExitCode = reviewExitCode;
    if (reviewChild.error) {
      results[index].review = "FAILED";
      failNode(options.task, task, results, index, `review failed to start: ${reviewChild.error.message}`);
    }

    const reviewRun = newestNewHarnessRun(beforeReviewRuns);
    const summary = reviewSummary(reviewRun);
    const target = targetResolution(summary);
    const change = changeResolution(summary, task.patch.label);

    if (target !== "RESOLVED") {
      results[index].review = "FAILED";
      failNode(options.task, task, results, index, `target resolution=${target}; writer forbidden`, reviewExitCode ?? 1);
    }

    if (module.mode === "COMPATIBILITY") {
      if (change === "NOT_APPLICABLE" && reviewExitCode === 0) {
        results[index] = {
          ...results[index],
          review: "PASS",
          status: "PASS",
          updated: false,
        };
        console.log(`[figma-pipeline] PASS ${module.id} — compatibility verified, zero mutation`);
        continue;
      }
      if (change === "GAP") {
        results[index].review = "DOC_GAP";
        failNode(
          options.task,
          task,
          results,
          index,
          `DOC_GAP: dependency requires a ${task.patch.label} Module patch but ${module.id} has no ${task.patch.id} node; writer forbidden`,
          reviewExitCode ?? 1,
        );
      }
      results[index].review = "FAILED";
      failNode(
        options.task,
        task,
        results,
        index,
        `compatibility task returned invalid change classification=${change}`,
        reviewExitCode ?? 1,
      );
    }

    if (change === "VERIFIED" && reviewExitCode === 0) {
      results[index] = {
        ...results[index],
        review: "PASS",
        status: "PASS",
        updated: false,
      };
      console.log(`[figma-pipeline] PASS ${module.id} — module patch already matches desired state`);
      continue;
    }

    if (change !== "GAP" || reviewExitCode !== 2) {
      results[index].review = "FAILED";
      failNode(
        options.task,
        task,
        results,
        index,
        `PATCH task must return CHANGE_VERIFIED/PASS or CHANGE_GAP/FAIL_VERIFICATION; got change=${change} exit=${String(reviewExitCode)}`,
        reviewExitCode ?? 1,
      );
    }

    results[index].review = "NEEDS_UPDATE";
    console.log(`[figma-pipeline] UPDATE ${module.id} — exact ${task.patch.id} Module patch gap established`);
    const beforeUpdateRuns = snapshotHarnessRuns();
    const updateChild = spawnSync(npm, harnessArgs(module, task, "write"), {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });
    const updateExitCode = updateChild.status;
    results[index].updateExitCode = updateExitCode;
    if (updateChild.error) {
      failNode(options.task, task, results, index, `update failed to start: ${updateChild.error.message}`);
    }

    const updateRun = newestNewHarnessRun(beforeUpdateRuns);
    const updateSummary = reviewSummary(updateRun);
    const updateTarget = targetResolution(updateSummary);
    const updateChange = changeResolution(updateSummary, task.patch.label);

    if (updateExitCode !== 0 || updateTarget !== "RESOLVED" || updateChange !== "VERIFIED") {
      failNode(
        options.task,
        task,
        results,
        index,
        `fresh post-write evidence did not verify task: target=${updateTarget} change=${updateChange} exit=${String(updateExitCode)}`,
        updateExitCode ?? 1,
      );
    }

    results[index] = {
      ...results[index],
      review: "NEEDS_UPDATE",
      updated: true,
      status: "PASS",
    };
    console.log(`[figma-pipeline] PASS ${module.id} — ${task.patch.id} patched and independently verified`);
  }

  const statePath = writePipelineState(options.task, task, results);
  console.log(`[figma-pipeline] PASS patch=${task.patch.id} pipeline=figma`);
  console.log(`[figma-pipeline] Pipeline state: ${statePath}`);
}

run();
