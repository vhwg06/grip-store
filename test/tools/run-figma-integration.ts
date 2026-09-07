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

import type { ResolvedIntegrationTask } from "./task-provider/integration-resolver";

interface Options {
  task: string;
}

interface ReviewProbe {
  summary?: string;
}

interface TerminalStateProbe {
  last_review?: string | null;
}

type TargetResolution = "RESOLVED" | "NOT_FOUND" | "AMBIGUOUS" | "UNKNOWN";
type IntegrationResolution = "VERIFIED" | "GAP" | "DOC_GAP" | "UNKNOWN";

const root = process.cwd();
const harnessArtifactRoot = resolve(root, "artifacts", "figma-harness");
const integrationContract = ".agents/figma-product-integration.md";

function die(message: string): never {
  console.error(`[figma-integration] ${message}`);
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
      console.log(`Internal executor usage:\n  npm run figma:integration -- --task <resolved-task.json>\n\nProduct integration tasks must be created through Task Provider:\n  npm run task -- --task figma-product-integration\n`);
      process.exit(0);
    }
    die(`unknown argument: ${arg}. figma:integration only consumes Task Provider packages`);
  }
  if (!task) die("--task is required; invoke product integration through npm run task");
  return { task };
}

function loadTask(path: string): ResolvedIntegrationTask {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) die(`resolved task not found: ${path}`);

  let task: ResolvedIntegrationTask;
  try {
    task = JSON.parse(readFileSync(absolute, "utf8")) as ResolvedIntegrationTask;
  } catch (error) {
    die(`invalid resolved task JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (task.version !== 1 || task.provider !== "grip-task-provider") {
    die("resolved task must be version 1 from grip-task-provider");
  }
  if (task.pipeline !== "figma-integration") {
    die(`resolved task pipeline must be figma-integration, got ${task.pipeline}`);
  }
  if (!task.checkpoint?.id || !task.checkpoint?.label) die("resolved task is missing checkpoint information");
  if (!task.plan?.id || !task.plan?.label || !Array.isArray(task.plan.stages) || task.plan.stages.length === 0) {
    die("resolved task is missing integration stage plan");
  }
  if (!Array.isArray(task.modules) || task.modules.length === 0) die("resolved task has no Module checkpoint states");
  if (!Array.isArray(task.inputDocs) || task.inputDocs.length === 0) die("resolved task has no inputDocs");
  if (!Number.isInteger(task.maxRepairs) || task.maxRepairs < 0 || task.maxRepairs > 10) {
    die("resolved task maxRepairs must be an integer between 0 and 10");
  }

  for (const doc of task.inputDocs) {
    if (!existsSync(resolve(root, doc))) die(`resolved input document not found: ${doc}`);
  }
  if (!existsSync(resolve(root, integrationContract))) die(`integration contract not found: ${integrationContract}`);

  return task;
}

function semanticTarget(task: ResolvedIntegrationTask): string {
  const stageLines = task.plan.stages.map(
    (stage) =>
      `- ${stage.id} | ${stage.mode} | mutation=${String(stage.mutation)} | dependsOn=[${stage.dependsOn.join(", ")}] | ${stage.objective}`,
  );
  const moduleLines = task.modules.map(
    (module) => `- ${module.id} | scope=${module.scope} | state=${module.state.id} | docs=${module.state.docs.join(", ")}`,
  );

  return [
    "TASK PROVIDER RESOLVED PRODUCT INTEGRATION TASK — this is the complete execution intent. Do not rediscover or broaden it.",
    `Product checkpoint: ${task.checkpoint.id} (${task.checkpoint.label})`,
    `Integration plan: ${task.plan.id} (${task.plan.label})`,
    `Integration contract: ${integrationContract}`,
    "",
    "Resolve the existing canonical GRIP product surface set through figma-mcp-go. Do not require a hard-coded Figma URL or node id.",
    "This task is UPDATE/VERIFY ONLY. It is not init/rewrite and it is not a new product patch.",
    "Missing or ambiguous required canonical surfaces are terminal routing failures; never create replacement roots as fallback.",
    "Provider-resolved Module states at the checkpoint:",
    ...moduleLines,
    "",
    "Execute the provider-owned internal stage DAG exactly as resolved:",
    ...stageLines,
    "",
    "D1 is session-local orientation. D2-D6 are the only mutation-authorized stages. D7 is fresh independent validation. D8 is executor evidence, not a second product specification.",
    "Never invent behavior/state absent from the resolved documents. If required behavior is undocumented, return INTEGRATION_DOC_GAP and stop.",
    "Mutation is limited to product integration/prototype continuity: existing screen flow, prototype reactions, documented state reachability, cross-Module handoffs, responsive journey continuity, and defects directly blocking those concerns.",
    "Do not perform unrelated redesign, visual cleanup, copy tuning, new capability design, domain ownership changes, or implementation work.",
    "",
    "Reviewer summary contract:",
    "- summary MUST begin exactly TARGET_RESOLVED:, TARGET_NOT_FOUND:, or TARGET_AMBIGUOUS:",
    `- resolved integration complete: include exactly INTEGRATION_VERIFIED: ${task.plan.label}`,
    `- documented integration gap: include exactly INTEGRATION_GAP: ${task.plan.label}`,
    `- planning authority gap: include exactly INTEGRATION_DOC_GAP: ${task.plan.label}`,
  ].join("\n");
}

function harnessArgs(task: ResolvedIntegrationTask, mode: "verify" | "write"): string[] {
  const args = ["run", mode === "verify" ? "figma:verify" : "figma:harness", "--"];
  if (mode === "write") args.push("--mode", "write");
  args.push(
    "--scope",
    task.plan.label,
    "--figma",
    semanticTarget(task),
  );
  for (const doc of task.inputDocs) args.push("--doc", doc);
  if (mode === "write") args.push("--max-repairs", String(task.maxRepairs));
  return args;
}

function snapshotHarnessRuns(): Set<string> {
  if (!existsSync(harnessArtifactRoot)) return new Set();
  return new Set(
    readdirSync(harnessArtifactRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("pipeline-") && !entry.name.startsWith("integration-"))
      .map((entry) => entry.name),
  );
}

function newestNewHarnessRun(before: Set<string>): string | null {
  if (!existsSync(harnessArtifactRoot)) return null;
  const candidates = readdirSync(harnessArtifactRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith("pipeline-") &&
        !entry.name.startsWith("integration-") &&
        !before.has(entry.name),
    )
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

function integrationResolution(summary: string, label: string): IntegrationResolution {
  const upper = summary.toUpperCase();
  const expected = label.toUpperCase();
  if (upper.includes(`INTEGRATION_VERIFIED: ${expected}`)) return "VERIFIED";
  if (upper.includes(`INTEGRATION_GAP: ${expected}`)) return "GAP";
  if (upper.includes(`INTEGRATION_DOC_GAP: ${expected}`)) return "DOC_GAP";
  return "UNKNOWN";
}

function writeState(
  taskPath: string,
  task: ResolvedIntegrationTask,
  status: "PASS" | "FAILED",
  updated: boolean,
  reviewRun: string | null,
  writeRun: string | null,
  message: string,
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(harnessArtifactRoot, `integration-${timestamp}`);
  mkdirSync(runDir, { recursive: true });
  const statePath = resolve(runDir, "integration-state.json");
  writeFileSync(
    statePath,
    `${JSON.stringify(
      {
        pipeline: task.pipeline,
        taskProvider: task.provider,
        resolvedTask: taskPath,
        checkpoint: task.checkpoint,
        plan: {
          id: task.plan.id,
          label: task.plan.label,
          stages: task.plan.stages.map((stage) => stage.id),
        },
        modules: task.modules.map((module) => ({ id: module.id, state: module.state.id })),
        status,
        updated,
        message,
        evidence: {
          reviewRun,
          writeRun,
        },
        completedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return statePath;
}

function failWithState(
  taskPath: string,
  task: ResolvedIntegrationTask,
  updated: boolean,
  reviewRun: string | null,
  writeRun: string | null,
  message: string,
  exitCode = 1,
): never {
  const statePath = writeState(taskPath, task, "FAILED", updated, reviewRun, writeRun, message);
  console.error(`[figma-integration] STOP: ${message}`);
  console.error(`[figma-integration] Integration state: ${statePath}`);
  process.exit(exitCode > 0 ? exitCode : 1);
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const task = loadTask(options.task);
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  console.log(`[figma-integration] checkpoint=${task.checkpoint.id} (${task.checkpoint.label})`);
  console.log(`[figma-integration] plan=${task.plan.id} (${task.plan.label})`);
  console.log(`[figma-integration] modules=${task.dependency.modules.join(" -> ")}`);
  task.plan.stages.forEach((stage, index) => {
    console.log(`[figma-integration] ${index + 1}. ${stage.id} mode=${stage.mode} mutation=${String(stage.mutation)}`);
  });

  const beforeReview = snapshotHarnessRuns();
  const reviewChild = spawnSync(npm, harnessArgs(task, "verify"), {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  });
  if (reviewChild.error) {
    failWithState(options.task, task, false, null, null, `review failed to start: ${reviewChild.error.message}`);
  }

  const reviewRun = newestNewHarnessRun(beforeReview);
  const summary = reviewSummary(reviewRun);
  const target = targetResolution(summary);
  const integration = integrationResolution(summary, task.plan.label);

  if (target !== "RESOLVED") {
    failWithState(
      options.task,
      task,
      false,
      reviewRun,
      null,
      `target resolution=${target}; writer forbidden`,
      reviewChild.status ?? 1,
    );
  }
  if (integration === "DOC_GAP") {
    failWithState(
      options.task,
      task,
      false,
      reviewRun,
      null,
      `INTEGRATION_DOC_GAP at checkpoint ${task.checkpoint.id}; writer forbidden`,
      reviewChild.status ?? 1,
    );
  }
  if (integration === "VERIFIED" && reviewChild.status === 0) {
    const statePath = writeState(
      options.task,
      task,
      "PASS",
      false,
      reviewRun,
      null,
      "Product integration already verified; zero mutation.",
    );
    console.log(`[figma-integration] PASS — integration already verified, zero mutation`);
    console.log(`[figma-integration] Integration state: ${statePath}`);
    return;
  }
  if (integration !== "GAP" || reviewChild.status !== 2) {
    failWithState(
      options.task,
      task,
      false,
      reviewRun,
      null,
      `review must return INTEGRATION_VERIFIED/PASS, INTEGRATION_GAP/FAIL_VERIFICATION, or INTEGRATION_DOC_GAP; got integration=${integration} exit=${String(reviewChild.status)}`,
      reviewChild.status ?? 1,
    );
  }

  console.log(`[figma-integration] UPDATE — documented product integration gap established`);
  const beforeWrite = snapshotHarnessRuns();
  const writeChild = spawnSync(npm, harnessArgs(task, "write"), {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  });
  if (writeChild.error) {
    failWithState(options.task, task, false, reviewRun, null, `writer failed to start: ${writeChild.error.message}`);
  }

  const writeRun = newestNewHarnessRun(beforeWrite);
  const writeSummary = reviewSummary(writeRun);
  const writeTarget = targetResolution(writeSummary);
  const writeIntegration = integrationResolution(writeSummary, task.plan.label);

  if (writeChild.status !== 0 || writeTarget !== "RESOLVED" || writeIntegration !== "VERIFIED") {
    failWithState(
      options.task,
      task,
      true,
      reviewRun,
      writeRun,
      `fresh post-write evidence did not verify integration: target=${writeTarget} integration=${writeIntegration} exit=${String(writeChild.status)}`,
      writeChild.status ?? 1,
    );
  }

  const statePath = writeState(
    options.task,
    task,
    "PASS",
    true,
    reviewRun,
    writeRun,
    "Product integration updated and independently verified.",
  );
  console.log(`[figma-integration] PASS — integration updated and independently verified`);
  console.log(`[figma-integration] Integration state: ${statePath}`);
}

run();
