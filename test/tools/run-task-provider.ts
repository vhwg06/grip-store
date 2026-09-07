import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

import {
  resolveIntegrationTask,
  type IntegrationPipelineConfig,
  type IntegrationStagePlan,
  type ResolvedIntegrationTask,
} from "./task-provider/integration-resolver";
import {
  resolveTask,
  type ModuleGraph,
  type PatchRegistry,
  type PipelineConfig,
  type ResolvedTask,
} from "./task-provider/resolver";

interface Options {
  task: string;
  dryRun: boolean;
}

interface TaskDefinition {
  id: string;
  pipeline: string;
  patch?: string;
  checkpoint?: string;
}

interface TaskRegistry {
  version: 1;
  tasks: TaskDefinition[];
}

interface PatchPipelineConfig extends PipelineConfig {
  resolver: "figma-patch";
}

type ProviderPipelineConfig = PatchPipelineConfig | IntegrationPipelineConfig;
type ProviderResolvedTask = ResolvedTask | ResolvedIntegrationTask;

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
      console.log(`Usage:\n  npm run task -- --task <task-id>\n\nExamples:\n  npm run task -- --task figma-p001-promotions\n  npm run task -- --task figma-product-integration\n\nAgent-facing boundary:\n  The caller provides only a task id.\n  Task Provider resolves the selected pipeline resolver, product patch/checkpoint,\n  execution configuration, dependency scope, Module states, exact documents and\n  any pipeline-owned stage plan.\n  Agents do not pass pipeline ids, dependency graphs, changed seeds, Figma targets,\n  document lists, Module graph paths, stage ids/order, or resolver arguments.\n\nUse --dry-run to resolve and persist the task package without executing its pipeline.\n`);
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

function resolveProviderTask(
  definition: TaskDefinition,
  config: ProviderPipelineConfig,
  registry: PatchRegistry,
  dependencyInput: unknown,
  moduleGraphs: Record<string, ModuleGraph>,
): ProviderResolvedTask {
  if (config.resolver === "figma-patch") {
    if (!definition.patch?.trim() || definition.checkpoint) {
      die(`task ${definition.id} routed to figma-patch must define patch only`);
    }
    try {
      return resolveTask(config, registry, dependencyInput, moduleGraphs, definition.patch);
    } catch (error) {
      die(error instanceof Error ? error.message : String(error));
    }
  }

  if (!definition.checkpoint?.trim() || definition.patch) {
    die(`task ${definition.id} routed to figma-integration must define checkpoint only`);
  }
  if (!config.stagePlan?.trim()) die(`pipeline ${config.id} is missing stagePlan`);
  const stagePlan = readJson<IntegrationStagePlan>(config.stagePlan, "integration stage plan");
  try {
    return resolveIntegrationTask(
      config,
      registry,
      dependencyInput,
      moduleGraphs,
      definition.checkpoint,
      stagePlan,
    );
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }
}

function resolvedInputDocs(task: ProviderResolvedTask): string[] {
  if ("inputDocs" in task) return task.inputDocs;
  return [...new Set(task.modules.flatMap((module) => module.inputDocs))];
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const taskRegistry = readJson<TaskRegistry>(taskRegistryPath, "task registry");
  const definition = resolveTaskDefinition(taskRegistry, options.task);

  const configPath = `tools/task-provider/pipelines/${definition.pipeline}.json`;
  const config = readJson<ProviderPipelineConfig>(configPath, "pipeline config");
  if (config.id !== definition.pipeline) {
    die(`pipeline config id mismatch: task ${definition.id} routes to ${definition.pipeline}, config declares ${config.id}`);
  }
  if (config.resolver !== "figma-patch" && config.resolver !== "figma-integration") {
    die(`pipeline ${config.id} declares unsupported resolver ${String((config as { resolver?: unknown }).resolver)}`);
  }

  const registry = readJson<PatchRegistry>(config.patchRegistry, "patch registry");
  const dependencyInput = readJson<unknown>(config.dependencyGraph, "dependency graph");
  const moduleGraphs = loadModuleGraphs(config);
  const resolved = resolveProviderTask(definition, config, registry, dependencyInput, moduleGraphs);

  const routing = definition.patch
    ? { patch: definition.patch }
    : { checkpoint: definition.checkpoint! };
  const task = {
    task: {
      id: definition.id,
      pipeline: definition.pipeline,
      ...routing,
    },
    ...resolved,
  };

  for (const doc of resolvedInputDocs(resolved)) {
    if (!existsSync(resolve(root, doc))) {
      die(`resolved input document not found: ${doc}`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(root, "artifacts", "task-provider");
  mkdirSync(runDir, { recursive: true });
  const taskPath = resolve(runDir, `${timestamp}-${definition.id}.json`);
  writeFileSync(taskPath, `${JSON.stringify(task, null, 2)}\n`, "utf8");

  console.log(`[task-provider] task=${definition.id}`);
  console.log(`[task-provider] resolved pipeline=${resolved.pipeline}`);
  console.log(`[task-provider] resolver=${config.resolver}`);

  if (config.resolver === "figma-patch") {
    const patchTask = resolved as ResolvedTask;
    console.log(`[task-provider] resolved patch=${patchTask.patch.id} (${patchTask.patch.label})`);
    console.log(`[task-provider] direct=${patchTask.dependency.directPatchModules.join(", ")}`);
    console.log(`[task-provider] affected=${patchTask.dependency.affectedModules.join(" -> ")}`);
    for (const module of patchTask.modules) {
      console.log(
        `[task-provider] ${module.id} mode=${module.mode} state=${module.state.id}` +
          (module.patch ? ` patch=${module.patch.id}` : ""),
      );
    }
  } else {
    const integrationTask = resolved as ResolvedIntegrationTask;
    console.log(
      `[task-provider] resolved checkpoint=${integrationTask.checkpoint.id} (${integrationTask.checkpoint.label})`,
    );
    console.log(`[task-provider] plan=${integrationTask.plan.id} (${integrationTask.plan.label})`);
    console.log(`[task-provider] modules=${integrationTask.dependency.modules.join(" -> ")}`);
    for (const module of integrationTask.modules) {
      console.log(`[task-provider] ${module.id} state=${module.state.id}`);
    }
    integrationTask.plan.stages.forEach((stage, index) => {
      console.log(
        `[task-provider] stage ${index + 1}. ${stage.id} mode=${stage.mode} mutation=${String(stage.mutation)}`,
      );
    });
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
