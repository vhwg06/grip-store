import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

import {
  resolveTask,
  type ModuleGraph,
  type PatchRegistry,
  type PipelineConfig,
} from "./task-provider/resolver";

interface Options {
  pipeline: string;
  patch: string;
  dryRun: boolean;
}

const root = process.cwd();

function die(message: string): never {
  console.error(`[task-provider] ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  let pipeline = "";
  let patch = "";
  let dryRun = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === "--pipeline") {
      if (!value) die("--pipeline requires a value");
      pipeline = value.trim();
      index += 1;
      continue;
    }
    if (arg === "--patch") {
      if (!value) die("--patch requires a value");
      patch = value.trim();
      index += 1;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`Usage:\n  npm run task -- --pipeline figma --patch P001-promotions\n\nThe Task Provider resolves pipeline configuration, dependency scope, Module patch graphs,\nexact Module state and patch inputs, then dispatches a resolved task package to the pipeline executor.\nAgents do not pass dependency graphs, changed seeds, Figma targets, or document lists.\n\nUse --dry-run to resolve and persist the task package without executing the pipeline.\n`);
      process.exit(0);
    }
    die(`unknown argument: ${arg}`);
  }

  if (!pipeline) die("--pipeline is required");
  if (!patch) die("--patch is required");
  if (!/^[a-z0-9-]+$/i.test(pipeline)) die("--pipeline contains unsupported characters");
  return { pipeline, patch, dryRun };
}

function readJson<T>(relativePath: string, label: string): T {
  const absolute = resolve(root, relativePath);
  if (!existsSync(absolute)) die(`${label} not found: ${relativePath}`);
  try {
    return JSON.parse(readFileSync(absolute, "utf8")) as T;
  } catch (error) {
    die(`invalid ${label} JSON ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const configPath = `tools/task-provider/pipelines/${options.pipeline}.json`;
  const config = readJson<PipelineConfig>(configPath, "pipeline config");
  if (config.id !== options.pipeline) {
    die(`pipeline config id mismatch: requested ${options.pipeline}, got ${config.id}`);
  }

  const registry = readJson<PatchRegistry>(config.patchRegistry, "patch registry");
  const dependencyInput = readJson<unknown>(config.dependencyGraph, "dependency graph");
  const moduleGraphs: Record<string, ModuleGraph> = {};
  for (const [module, graphPath] of Object.entries(config.moduleGraphs)) {
    moduleGraphs[module] = readJson<ModuleGraph>(graphPath, `${module} module graph`);
  }

  let task;
  try {
    task = resolveTask(config, registry, dependencyInput, moduleGraphs, options.patch);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  for (const module of task.modules) {
    for (const doc of module.inputDocs) {
      if (!existsSync(resolve(root, doc))) {
        die(`resolved input document not found for ${module.id}: ${doc}`);
      }
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(root, "artifacts", "task-provider");
  mkdirSync(runDir, { recursive: true });
  const taskPath = resolve(runDir, `${timestamp}-${options.pipeline}-${options.patch}.json`);
  writeFileSync(taskPath, `${JSON.stringify(task, null, 2)}\n`, "utf8");

  console.log(`[task-provider] pipeline=${task.pipeline}`);
  console.log(`[task-provider] patch=${task.patch.id} (${task.patch.label})`);
  console.log(`[task-provider] direct=${task.dependency.directPatchModules.join(", ")}`);
  console.log(`[task-provider] affected=${task.dependency.affectedModules.join(" -> ")}`);
  for (const module of task.modules) {
    console.log(
      `[task-provider] ${module.id} mode=${module.mode} state=${module.state.id}` +
        (module.patch ? ` patch=${module.patch.id}` : ""),
    );
  }
  console.log(`[task-provider] resolved task: ${taskPath}`);

  if (options.dryRun) {
    console.log("[task-provider] DRY_RUN PASS — task resolved; executor not started.");
    return;
  }

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawnSync(npm, ["run", config.executor, "--", "--task", taskPath], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  });

  if (child.error) die(`executor ${config.executor} failed to start: ${child.error.message}`);
  if (child.status !== 0) {
    console.error(`[task-provider] executor=${config.executor} failed for ${basename(taskPath)}`);
    process.exit(child.status ?? 1);
  }
  console.log(`[task-provider] PASS pipeline=${task.pipeline} patch=${task.patch.id}`);
}

run();
