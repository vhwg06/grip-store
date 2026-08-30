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
  task: string;
  dryRun: boolean;
}

interface TaskDefinition {
  id: string;
  pipeline: string;
  patch: string;
}

interface TaskRegistry {
  version: 1;
  tasks: TaskDefinition[];
}

const root = process.cwd();
const taskRegistryPath = "tools/task-provider/tasks.json";

function die(message: string): never {
  console.error(`[task-provider] ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  let task = "";
  let dryRun = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === "--task") {
      if (!value) die("--task requires a value");
      task = value.trim();
      index += 1;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`Usage:\n  npm run task -- --task figma-p001-promotions\n\nAgent-facing boundary:\n  The caller provides only a task id.\n  The Task Provider resolves the pipeline, patch/version, pipeline configuration,\n  dependency scope, Module patch graphs, exact Module states and patch inputs.\n  Agents do not pass pipeline ids, dependency graphs, changed seeds, Figma targets,\n  document lists, Module patch paths, or resolver arguments.\n\nUse --dry-run to resolve and persist the task package without executing its pipeline.\n`);
      process.exit(0);
    }
    die(`unknown argument: ${arg}`);
  }

  if (!task) die("--task is required");
  return { task, dryRun };
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

function resolveTaskDefinition(registry: TaskRegistry, taskId: string): TaskDefinition {
  if (registry.version !== 1 || !Array.isArray(registry.tasks)) {
    die(`invalid task registry: ${taskRegistryPath}`);
  }

  const matches = registry.tasks.filter((task) => task.id.toLowerCase() === taskId.toLowerCase());
  if (matches.length === 0) die(`unknown task: ${taskId}`);
  if (matches.length > 1) die(`ambiguous task id in registry: ${taskId}`);

  const task = matches[0];
  if (!task.pipeline || !task.patch) die(`task ${task.id} is missing pipeline or patch routing`);
  return task;
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const taskRegistry = readJson<TaskRegistry>(taskRegistryPath, "task registry");
  const definition = resolveTaskDefinition(taskRegistry, options.task);

  const configPath = `tools/task-provider/pipelines/${definition.pipeline}.json`;
  const config = readJson<PipelineConfig>(configPath, "pipeline config");
  if (config.id !== definition.pipeline) {
    die(`pipeline config id mismatch: task ${definition.id} routes to ${definition.pipeline}, config declares ${config.id}`);
  }

  const registry = readJson<PatchRegistry>(config.patchRegistry, "patch registry");
  const dependencyInput = readJson<unknown>(config.dependencyGraph, "dependency graph");
  const moduleGraphs: Record<string, ModuleGraph> = {};
  for (const [module, graphPath] of Object.entries(config.moduleGraphs)) {
    moduleGraphs[module] = readJson<ModuleGraph>(graphPath, `${module} module graph`);
  }

  let resolved;
  try {
    resolved = resolveTask(config, registry, dependencyInput, moduleGraphs, definition.patch);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  const task = {
    task: {
      id: definition.id,
      pipeline: definition.pipeline,
      patch: definition.patch,
    },
    ...resolved,
  };

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
  const taskPath = resolve(runDir, `${timestamp}-${definition.id}.json`);
  writeFileSync(taskPath, `${JSON.stringify(task, null, 2)}\n`, "utf8");

  console.log(`[task-provider] task=${definition.id}`);
  console.log(`[task-provider] resolved pipeline=${task.pipeline}`);
  console.log(`[task-provider] resolved patch=${task.patch.id} (${task.patch.label})`);
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
  console.log(`[task-provider] PASS task=${definition.id}`);
}

run();
