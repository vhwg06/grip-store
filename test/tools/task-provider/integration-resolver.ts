import {
  resolveTask,
  type ModuleGraph,
  type PatchRegistry,
  type PatchRegistryEntry,
  type PipelineConfig,
} from "./resolver";

export type IntegrationStageMode = "ANALYZE" | "WRITE" | "REVIEW" | "REPORT";

export interface IntegrationStage {
  id: string;
  title: string;
  mode: IntegrationStageMode;
  dependsOn: string[];
  mutation: boolean;
  objective: string;
}

export interface IntegrationStagePlan {
  version: 1;
  id: string;
  label: string;
  inputDocs: string[];
  stages: IntegrationStage[];
}

export interface IntegrationPipelineConfig extends PipelineConfig {
  resolver: "figma-integration";
  stagePlan: string;
}

export interface ResolvedIntegrationModule {
  id: string;
  scope: string;
  maxRepairs: number;
  state: {
    id: string;
    docs: string[];
  };
  inputDocs: string[];
}

export interface ResolvedIntegrationTask {
  version: 1;
  provider: "grip-task-provider";
  pipeline: string;
  executor: string;
  checkpoint: PatchRegistryEntry;
  dependency: {
    graph: string;
    modules: string[];
  };
  modules: ResolvedIntegrationModule[];
  plan: IntegrationStagePlan;
  inputDocs: string[];
  maxRepairs: number;
  resolvedAt: string;
}

function fail(message: string): never {
  throw new Error(message);
}

function nonEmpty(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) fail(`${field} must be a non-empty string`);
  return value.trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function validateStagePlan(plan: IntegrationStagePlan): IntegrationStagePlan {
  if (plan.version !== 1) fail("integration stage plan must be version 1");
  nonEmpty(plan.id, "integration stage plan id");
  nonEmpty(plan.label, "integration stage plan label");
  if (!Array.isArray(plan.inputDocs) || plan.inputDocs.length === 0) {
    fail("integration stage plan inputDocs must be a non-empty array");
  }
  plan.inputDocs.forEach((doc, index) => nonEmpty(doc, `integration stage plan inputDocs[${index}]`));
  if (!Array.isArray(plan.stages) || plan.stages.length === 0) {
    fail("integration stage plan stages must be a non-empty array");
  }

  const byId = new Map<string, IntegrationStage>();
  for (const [index, stage] of plan.stages.entries()) {
    const id = nonEmpty(stage.id, `integration stage[${index}].id`);
    const key = id.toLowerCase();
    if (byId.has(key)) fail(`duplicate integration stage id: ${id}`);
    nonEmpty(stage.title, `integration stage ${id} title`);
    nonEmpty(stage.objective, `integration stage ${id} objective`);
    if (!["ANALYZE", "WRITE", "REVIEW", "REPORT"].includes(stage.mode)) {
      fail(`integration stage ${id} has unsupported mode ${String(stage.mode)}`);
    }
    if (!Array.isArray(stage.dependsOn)) fail(`integration stage ${id} dependsOn must be an array`);
    if (stage.mutation && stage.mode !== "WRITE") {
      fail(`integration stage ${id} may mutate only in WRITE mode`);
    }
    if (!stage.mutation && stage.mode === "WRITE") {
      fail(`integration WRITE stage ${id} must declare mutation=true`);
    }
    byId.set(key, stage);
  }

  for (const stage of plan.stages) {
    const seenDependencies = new Set<string>();
    for (const dependency of stage.dependsOn) {
      const key = nonEmpty(dependency, `integration stage ${stage.id} dependency`).toLowerCase();
      if (key === stage.id.toLowerCase()) fail(`integration stage ${stage.id} cannot depend on itself`);
      if (!byId.has(key)) fail(`integration stage ${stage.id} depends on unknown stage ${dependency}`);
      if (seenDependencies.has(key)) fail(`integration stage ${stage.id} has duplicate dependency ${dependency}`);
      seenDependencies.add(key);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (key: string, path: string[]): void => {
    if (visited.has(key)) return;
    if (visiting.has(key)) {
      const cycleStart = path.indexOf(key);
      const cycle = [...path.slice(cycleStart), key]
        .map((id) => byId.get(id)?.id ?? id)
        .join(" -> ");
      fail(`integration stage plan contains a cycle: ${cycle}`);
    }
    visiting.add(key);
    const stage = byId.get(key)!;
    for (const dependency of stage.dependsOn) visit(dependency.toLowerCase(), [...path, key]);
    visiting.delete(key);
    visited.add(key);
  };
  for (const key of byId.keys()) visit(key, []);

  return plan;
}

export function resolveIntegrationTask(
  config: IntegrationPipelineConfig,
  registry: PatchRegistry,
  dependencyInput: unknown,
  moduleGraphs: Record<string, ModuleGraph>,
  checkpointId: string,
  stagePlan: IntegrationStagePlan,
  resolvedAt = new Date().toISOString(),
): ResolvedIntegrationTask {
  if (config.resolver !== "figma-integration") fail(`integration pipeline resolver must be figma-integration`);
  if (!config.stagePlan?.trim()) fail("integration pipeline config requires stagePlan");

  const plan = validateStagePlan(stagePlan);
  const checkpointTask = resolveTask(
    config,
    registry,
    dependencyInput,
    moduleGraphs,
    checkpointId,
    resolvedAt,
  );

  const configuredModules = Object.keys(config.moduleGraphs);
  const resolvedModules = checkpointTask.modules.map((module) => module.id);
  const configuredKeys = new Set(configuredModules.map((module) => module.toLowerCase()));
  const resolvedKeys = new Set(resolvedModules.map((module) => module.toLowerCase()));

  if (configuredKeys.size !== resolvedKeys.size || [...configuredKeys].some((module) => !resolvedKeys.has(module))) {
    fail(
      `integration checkpoint ${checkpointTask.patch.id} must resolve the full configured product scope; resolved ${resolvedModules.join(", ")}`,
    );
  }

  const modules: ResolvedIntegrationModule[] = checkpointTask.modules.map((module) => ({
    id: module.id,
    scope: module.scope,
    maxRepairs: module.maxRepairs,
    state: module.state,
    inputDocs: unique(module.state.docs),
  }));

  const inputDocs = unique([
    ...plan.inputDocs,
    ...modules.flatMap((module) => module.inputDocs),
  ]);

  return {
    version: 1,
    provider: "grip-task-provider",
    pipeline: config.id,
    executor: config.executor,
    checkpoint: checkpointTask.patch,
    dependency: {
      graph: config.dependencyGraph,
      modules: resolvedModules,
    },
    modules,
    plan,
    inputDocs,
    maxRepairs: config.defaultMaxRepairs,
    resolvedAt,
  };
}
