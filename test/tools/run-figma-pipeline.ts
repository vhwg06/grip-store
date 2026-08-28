import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildFigmaPipelinePlan,
  parseFigmaPipelineGraph,
} from "./figma-harness/dependency";

interface Options {
  graph: string;
  figma: string;
  changed: string[];
  maxRepairs: number;
  dryRun: boolean;
}

interface NodeRunResult {
  id: string;
  review: "PASS" | "NEEDS_UPDATE" | "FAILED" | "NOT_RUN";
  updated: boolean;
  status: "PASS" | "FAILED" | "NOT_RUN";
  reviewExitCode: number | null;
  updateExitCode: number | null;
}

const root = process.cwd();
const pipelineContract = ".agents/figma-pipeline-update.md";

function die(message: string): never {
  console.error(`[figma-pipeline] ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  let graph = "";
  let figma = "";
  const changed: string[] = [];
  let maxRepairs = 3;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];

    if (arg === "--graph") {
      if (!value) die("--graph requires a value");
      graph = value;
      i += 1;
      continue;
    }

    if (arg === "--figma") {
      if (!value) die("--figma requires a value");
      figma = value;
      i += 1;
      continue;
    }

    if (arg === "--changed") {
      if (!value) die("--changed requires a node id");
      changed.push(value);
      i += 1;
      continue;
    }

    if (arg === "--max-repairs") {
      if (!value) die("--max-repairs requires a value");
      maxRepairs = Number.parseInt(value, 10);
      if (!Number.isInteger(maxRepairs) || maxRepairs < 0 || maxRepairs > 10) {
        die("--max-repairs must be an integer between 0 and 10");
      }
      i += 1;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log(`Usage:\n  npm run figma:pipeline -- \\\n    --graph docs/srs/figma-pipeline-dependencies.json \\\n    --figma "<Figma file/page reference>" \\\n    --changed Catalog \\\n    --max-repairs 3\n\nRule:\n  changed node → lookup dependents → for each affected root run review first.\n  review PASS → no mutation.\n  review FAIL_VERIFICATION → run normal write/repair harness → fresh review.\n\nRepeat --changed when multiple module planning inputs changed.\nUse --dry-run to print dependency lookup only; it does not review or mutate Figma.\n`);
      process.exit(0);
    }

    die(`unknown argument: ${arg}`);
  }

  if (!graph) die("--graph is required");
  if (!figma) die("--figma is required");
  if (changed.length === 0) die("at least one --changed node is required");
  return { graph, figma, changed, maxRepairs, dryRun };
}

function loadPlan(options: Options) {
  if (!existsSync(resolve(root, pipelineContract))) {
    die(`pipeline update contract not found: ${pipelineContract}`);
  }

  const graphPath = resolve(root, options.graph);
  if (!existsSync(graphPath)) die(`dependency graph not found: ${options.graph}`);

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(graphPath, "utf8"));
  } catch (error) {
    die(`invalid dependency graph JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  let graph;
  try {
    graph = parseFigmaPipelineGraph(raw);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  let plan;
  try {
    plan = buildFigmaPipelinePlan(graph, options.changed, options.maxRepairs);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  for (const item of plan) {
    for (const doc of item.docs) {
      if (!existsSync(resolve(root, doc))) {
        die(`input document not found for ${item.id}: ${doc}`);
      }
    }
  }

  return { graph, plan };
}

function printPlan(name: string, changed: string[], plan: ReturnType<typeof buildFigmaPipelinePlan>): void {
  console.log(`[figma-pipeline] graph=${name}`);
  console.log(`[figma-pipeline] changed=${changed.join(", ")}`);
  console.log(`[figma-pipeline] affected=${plan.map((item) => item.id).join(" -> ")}`);
  for (const [index, item] of plan.entries()) {
    console.log(`[figma-pipeline] ${index + 1}. ${item.id} maxRepairs=${item.maxRepairs}`);
    item.docs.forEach((doc, docIndex) => {
      console.log(`[figma-pipeline]    ${docIndex + 1}. ${doc}`);
    });
  }
}

function writePipelineState(
  name: string,
  graphPath: string,
  figma: string,
  changed: string[],
  results: NodeRunResult[],
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(root, "artifacts", "figma-harness", `pipeline-${timestamp}`);
  mkdirSync(runDir, { recursive: true });
  const statePath = resolve(runDir, "pipeline-state.json");
  writeFileSync(
    statePath,
    `${JSON.stringify({
      pipeline: name,
      graph: graphPath,
      figma,
      changed,
      results,
      completedAt: new Date().toISOString(),
    }, null, 2)}\n`,
    "utf8",
  );
  return statePath;
}

function harnessArgs(
  item: ReturnType<typeof buildFigmaPipelinePlan>[number],
  figma: string,
  mode: "verify" | "write",
): string[] {
  const args = [
    "run",
    mode === "verify" ? "figma:verify" : "figma:harness",
    "--",
  ];

  if (mode === "write") args.push("--mode", "write");

  args.push(
    "--scope",
    item.scope,
    "--figma",
    figma,
    "--doc",
    pipelineContract,
  );

  for (const doc of item.docs) args.push("--doc", doc);
  if (mode === "write") args.push("--max-repairs", String(item.maxRepairs));
  return args;
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const { graph, plan } = loadPlan(options);
  printPlan(graph.name, options.changed, plan);

  if (options.dryRun) {
    console.log("[figma-pipeline] DRY_RUN PASS — dependency lookup is valid; no Figma review or mutation started.");
    return;
  }

  const results: NodeRunResult[] = plan.map((item) => ({
    id: item.id,
    review: "NOT_RUN",
    updated: false,
    status: "NOT_RUN",
    reviewExitCode: null,
    updateExitCode: null,
  }));

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  for (let index = 0; index < plan.length; index += 1) {
    const item = plan[index];
    console.log(`[figma-pipeline] REVIEW ${item.id}`);

    const reviewChild = spawnSync(npm, harnessArgs(item, options.figma, "verify"), {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    const reviewExitCode = reviewChild.status;
    if (reviewChild.error) {
      console.error(`[figma-pipeline] ${item.id} review failed to start: ${reviewChild.error.message}`);
    }

    if (!reviewChild.error && reviewExitCode === 0) {
      results[index] = {
        id: item.id,
        review: "PASS",
        updated: false,
        status: "PASS",
        reviewExitCode,
        updateExitCode: null,
      };
      console.log(`[figma-pipeline] PASS ${item.id} — review says no update required`);
      continue;
    }

    if (reviewChild.error || reviewExitCode !== 2) {
      results[index] = {
        id: item.id,
        review: "FAILED",
        updated: false,
        status: "FAILED",
        reviewExitCode,
        updateExitCode: null,
      };
      const statePath = writePipelineState(graph.name, options.graph, options.figma, options.changed, results);
      console.error(`[figma-pipeline] STOP ${item.id} review failed terminally. Dependents will not run.`);
      console.error(`[figma-pipeline] Pipeline state: ${statePath}`);
      process.exit(reviewExitCode && reviewExitCode > 0 ? reviewExitCode : 1);
    }

    results[index].review = "NEEDS_UPDATE";
    results[index].reviewExitCode = reviewExitCode;
    console.log(`[figma-pipeline] UPDATE ${item.id} — review found required changes`);

    const updateChild = spawnSync(npm, harnessArgs(item, options.figma, "write"), {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    const updateExitCode = updateChild.status;
    if (updateChild.error) {
      console.error(`[figma-pipeline] ${item.id} update failed to start: ${updateChild.error.message}`);
    }

    results[index] = {
      id: item.id,
      review: "NEEDS_UPDATE",
      updated: updateExitCode === 0 && !updateChild.error,
      status: updateExitCode === 0 && !updateChild.error ? "PASS" : "FAILED",
      reviewExitCode,
      updateExitCode,
    };

    if (results[index].status !== "PASS") {
      const statePath = writePipelineState(graph.name, options.graph, options.figma, options.changed, results);
      console.error(`[figma-pipeline] STOP ${item.id} update failed. Dependents will not run.`);
      console.error(`[figma-pipeline] Pipeline state: ${statePath}`);
      process.exit(updateExitCode && updateExitCode > 0 ? updateExitCode : 1);
    }

    console.log(`[figma-pipeline] PASS ${item.id} — updated and closed by normal harness review`);
  }

  const statePath = writePipelineState(graph.name, options.graph, options.figma, options.changed, results);
  console.log(`[figma-pipeline] PASS pipeline=${graph.name}`);
  console.log(`[figma-pipeline] Pipeline state: ${statePath}`);
}

run();
