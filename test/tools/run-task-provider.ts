import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { ModuleGraph, PatchRegistry, PipelineConfig } from "./task-provider/resolver";
import { createWorkload } from "./task-provider/workload-factory";
import type { TaskDefinition } from "./task-provider/workload";

interface Options {
  task: string;
  dryRun: boolean;
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
      console.log(`Usage:\n  npm run task -- --task <task-id>\n\nExamples:\n  npm run task -- --task figma-p001-promotions\n  npm run task -- --task figma-product-integration\n\nAgent-facing boundary:\n  The caller provides only a task id.\n  Task Provider resolves pipeline config, workload type, resolver/policy, product\n  patch/checkpoint, dependency scope, Module states, exact documents and any\n  pipeline-owned stage plan.\n  Agents do not pass workload/resolver/policy ids, dependency graphs, changed seeds,\n  Figma targets, document lists, Module graph paths, stage ids/order, or executor args.\n\nUse --dry-run to resolve and persist the task package without executing its workload.\n`);
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
  if (!task.pipeline?.trim()) die(`task ${task.id} is missing pipeline routing`);
  return task;
}

function loadModuleGraphs(config: PipelineConfig): Record<string, ModuleGraph> {
  const moduleGraphs: Record<string, ModuleGraph> = {};
  for (const [module, graphPath] of Object.entries(config.moduleGraphs)) {
    moduleGraphs[module] = readJson<ModuleGraph>(graphPath, `${module} module graph`);
  }
  return moduleGraphs;
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
  if (!config.workload?.trim()) die(`pipeline ${config.id} is missing workload type`);

  let workload;
  try {
    workload = createWorkload(config.workload);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  const registry = readJson<PatchRegistry>(config.patchRegistry, "patch registry");
  const dependencyInput = readJson<unknown>(config.dependencyGraph, "dependency graph");
  const moduleGraphs = loadModuleGraphs(config);

  let resolved: unknown;
  try {
    resolved = workload.resolve({
      root,
      definition,
      config,
      registry,
      dependencyInput,
      moduleGraphs,
      readJson,
    });
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  for (const doc of workload.inputDocs(resolved)) {
    if (!existsSync(resolve(root, doc))) die(`resolved input document not found: ${doc}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(root, "artifacts", "task-provider");
  mkdirSync(runDir, { recursive: true });
  const taskPath = resolve(runDir, `${timestamp}-${definition.id}.json`);
  const routing = definition.patch
    ? { patch: definition.patch }
    : definition.checkpoint
      ? { checkpoint: definition.checkpoint }
      : {};
  const taskPackage = {
    task: {
      id: definition.id,
      pipeline: definition.pipeline,
      ...routing,
    },
    ...(resolved as Record<string, unknown>),
  };
  writeFileSync(taskPath, `${JSON.stringify(taskPackage, null, 2)}\n`, "utf8");

  try {
    workload.validateResolved({ root, taskPath, task: resolved });
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  console.log(`[task-provider] task=${definition.id}`);
  console.log(`[task-provider] pipeline=${config.id}`);
  console.log(`[task-provider] workload=${config.workload}`);
  console.log(`[task-provider] resolver=${config.resolver}`);
  console.log(`[task-provider] policy=${config.policy}`);
  for (const line of workload.describe(resolved)) console.log(`[task-provider] ${line}`);
  console.log(`[task-provider] resolved task: ${taskPath}`);

  if (options.dryRun) {
    console.log("[task-provider] DRY_RUN PASS — task resolved; workload not executed.");
    return;
  }

  try {
    workload.execute({ root, taskPath, task: resolved });
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  console.log(`[task-provider] PASS task=${definition.id}`);
}

run();
