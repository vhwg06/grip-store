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
  directlyChanged: boolean;
  invalidatedBy: string[];
  status: "PASS" | "FAILED" | "NOT_RUN";
  exitCode: number | null;
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
      console.log(`Usage:\n  npm run figma:pipeline -- \\\n    --graph docs/srs/figma-pipeline-dependencies.json \\\n    --figma "<Figma file/page reference>" \\\n    --changed Catalog \\\n    --max-repairs 3\n\nRepeat --changed for every module whose canonical planning inputs changed.\n\nSemantics:\n- the supplied changed nodes are invalidation seeds;\n- the runner follows reverse dependencies transitively;\n- only stale nodes are scheduled;\n- stale nodes execute in topological dependency order;\n- each stale node delegates to one normal figma:harness write/review lifecycle;\n- a stale dependent may legitimately require zero visual mutation, but it still gets a fresh review because an upstream dependency changed;\n- unrelated nodes are skipped entirely;\n- the pipeline stops on the first failed child lifecycle and never resets its repair budget automatically.\n\nUse --dry-run to inspect the invalidation plan without touching Figma.\n`);
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
  console.log(`[figma-pipeline] execution-contract=${pipelineContract}`);

  for (const [index, item] of plan.entries()) {
    const reason = item.directlyChanged
      ? "direct-change"
      : `dependency-change:${item.invalidatedBy.join(",")}`;
    console.log(`[figma-pipeline] ${index + 1}. ${item.id} reason=${reason} maxRepairs=${item.maxRepairs}`);
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
      executionContract: pipelineContract,
      results,
      completedAt: new Date().toISOString(),
    }, null, 2)}\n`,
    "utf8",
  );
  return statePath;
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const { graph, plan } = loadPlan(options);
  printPlan(graph.name, options.changed, plan);

  if (options.dryRun) {
    console.log("[figma-pipeline] DRY_RUN PASS — graph, dependency closure, and documents are valid; no Figma lifecycle started.");
    return;
  }

  const results: NodeRunResult[] = plan.map((item) => ({
    id: item.id,
    directlyChanged: item.directlyChanged,
    invalidatedBy: item.invalidatedBy,
    status: "NOT_RUN",
    exitCode: null,
  }));

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  for (let index = 0; index < plan.length; index += 1) {
    const item = plan[index];
    console.log(`[figma-pipeline] START ${item.id}`);

    const args = [
      "run",
      "figma:harness",
      "--",
      "--mode",
      "write",
      "--scope",
      item.scope,
      "--figma",
      options.figma,
      "--doc",
      pipelineContract,
    ];
    for (const doc of item.docs) args.push("--doc", doc);
    args.push("--max-repairs", String(item.maxRepairs));

    const child = spawnSync(npm, args, {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    const exitCode = child.status;
    if (child.error) {
      console.error(`[figma-pipeline] ${item.id} failed to start: ${child.error.message}`);
    }

    results[index] = {
      id: item.id,
      directlyChanged: item.directlyChanged,
      invalidatedBy: item.invalidatedBy,
      status: exitCode === 0 && !child.error ? "PASS" : "FAILED",
      exitCode,
    };

    if (results[index].status !== "PASS") {
      const statePath = writePipelineState(graph.name, options.graph, options.figma, options.changed, results);
      console.error(`[figma-pipeline] STOP ${item.id} failed. No downstream node will run.`);
      console.error(`[figma-pipeline] Pipeline state: ${statePath}`);
      process.exit(exitCode && exitCode > 0 ? exitCode : 1);
    }

    console.log(`[figma-pipeline] PASS ${item.id}`);
  }

  const statePath = writePipelineState(graph.name, options.graph, options.figma, options.changed, results);
  console.log(`[figma-pipeline] PASS pipeline=${graph.name}`);
  console.log(`[figma-pipeline] Pipeline state: ${statePath}`);
}

run();
