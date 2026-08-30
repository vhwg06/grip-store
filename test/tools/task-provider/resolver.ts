import {
  buildFigmaPipelinePlan,
  parseFigmaPipelineGraph,
  type FigmaPipelineGraph,
} from "../figma-harness/dependency";

export interface PatchRegistryEntry {
  id: string;
  label: string;
  sequence: number;
}

export interface PatchRegistry {
  version: 1;
  patches: PatchRegistryEntry[];
}

export interface ModulePatchNode {
  id: string;
  parent: string;
  taskDoc: string;
  stateDocs: string[];
}

export interface ModuleGraph {
  version: 1;
  module: string;
  base: {
    id: "BASE";
    stateDocs: string[];
  };
  patches: ModulePatchNode[];
}

export interface PipelineConfig {
  version: 1;
  id: string;
  executor: string;
  dependencyGraph: string;
  patchRegistry: string;
  moduleGraphs: Record<string, string>;
  defaultMaxRepairs: number;
}

export interface ResolvedModuleTask {
  id: string;
  scope: string;
  mode: "PATCH" | "COMPATIBILITY";
  maxRepairs: number;
  state: {
    id: string;
    docs: string[];
  };
  patch?: {
    id: string;
    parent: string;
    taskDoc: string;
    stateDocs: string[];
  };
  inputDocs: string[];
}

export interface ResolvedTask {
  version: 1;
  provider: "grip-task-provider";
  pipeline: string;
  executor: string;
  patch: PatchRegistryEntry;
  dependency: {
    graph: string;
    directPatchModules: string[];
    affectedModules: string[];
  };
  modules: ResolvedModuleTask[];
  resolvedAt: string;
}

function fail(message: string): never {
  throw new Error(message);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function validatePatchRegistry(registry: PatchRegistry): Map<string, PatchRegistryEntry> {
  if (registry.version !== 1 || !Array.isArray(registry.patches)) {
    fail("patch registry must be version 1 with a patches array");
  }

  const byId = new Map<string, PatchRegistryEntry>();
  const sequences = new Set<number>();
  for (const patch of registry.patches) {
    if (!patch.id?.trim() || !patch.label?.trim()) fail("patch registry entries require id and label");
    if (!Number.isInteger(patch.sequence) || patch.sequence < 1) {
      fail(`patch ${patch.id} sequence must be a positive integer`);
    }
    const key = patch.id.toLowerCase();
    if (byId.has(key)) fail(`duplicate patch registry id: ${patch.id}`);
    if (sequences.has(patch.sequence)) fail(`duplicate patch registry sequence: ${patch.sequence}`);
    sequences.add(patch.sequence);
    byId.set(key, patch);
  }
  return byId;
}

function validateModuleGraph(
  graph: ModuleGraph,
  expectedModule: string,
  patchById: Map<string, PatchRegistryEntry>,
): void {
  if (graph.version !== 1) fail(`module graph ${expectedModule} must be version 1`);
  if (graph.module !== expectedModule) {
    fail(`module graph mismatch: expected ${expectedModule}, got ${graph.module}`);
  }
  if (graph.base?.id !== "BASE" || !Array.isArray(graph.base.stateDocs) || graph.base.stateDocs.length === 0) {
    fail(`module graph ${expectedModule} requires BASE stateDocs`);
  }
  if (!Array.isArray(graph.patches)) fail(`module graph ${expectedModule} patches must be an array`);

  const sorted = [...graph.patches].sort((a, b) => {
    const left = patchById.get(a.id.toLowerCase());
    const right = patchById.get(b.id.toLowerCase());
    if (!left) fail(`module ${expectedModule} references unknown patch ${a.id}`);
    if (!right) fail(`module ${expectedModule} references unknown patch ${b.id}`);
    return left.sequence - right.sequence;
  });

  let expectedParent = "BASE";
  const seen = new Set<string>();
  for (const node of sorted) {
    const key = node.id.toLowerCase();
    if (seen.has(key)) fail(`module ${expectedModule} contains duplicate patch ${node.id}`);
    seen.add(key);
    if (!node.taskDoc?.trim()) fail(`module ${expectedModule} patch ${node.id} requires taskDoc`);
    if (!Array.isArray(node.stateDocs) || node.stateDocs.length === 0) {
      fail(`module ${expectedModule} patch ${node.id} requires resulting stateDocs`);
    }
    if (node.parent !== expectedParent) {
      fail(
        `module ${expectedModule} patch ${node.id} parent must be ${expectedParent}, got ${node.parent}`,
      );
    }
    expectedParent = node.id;
  }
}

function stateBeforeOrAt(
  graph: ModuleGraph,
  targetSequence: number,
  patchById: Map<string, PatchRegistryEntry>,
): { id: string; docs: string[] } {
  let state = { id: graph.base.id, docs: graph.base.stateDocs };
  let bestSequence = 0;

  for (const node of graph.patches) {
    const meta = patchById.get(node.id.toLowerCase());
    if (!meta) fail(`module ${graph.module} references unknown patch ${node.id}`);
    if (meta.sequence <= targetSequence && meta.sequence > bestSequence) {
      state = { id: node.id, docs: node.stateDocs };
      bestSequence = meta.sequence;
    }
  }
  return state;
}

export function resolveTask(
  config: PipelineConfig,
  registry: PatchRegistry,
  dependencyInput: unknown,
  moduleGraphs: Record<string, ModuleGraph>,
  patchId: string,
  resolvedAt = new Date().toISOString(),
): ResolvedTask {
  if (config.version !== 1 || !config.id?.trim() || !config.executor?.trim()) {
    fail("pipeline config must be version 1 with id and executor");
  }
  if (!Number.isInteger(config.defaultMaxRepairs) || config.defaultMaxRepairs < 0 || config.defaultMaxRepairs > 10) {
    fail("pipeline defaultMaxRepairs must be an integer between 0 and 10");
  }

  const patchById = validatePatchRegistry(registry);
  const patch = patchById.get(patchId.toLowerCase());
  if (!patch) fail(`unknown patch: ${patchId}`);

  const dependencyGraph: FigmaPipelineGraph = parseFigmaPipelineGraph(dependencyInput);
  const dependencyModules = new Set(dependencyGraph.nodes.map((node) => node.id));
  const configuredModules = new Set(Object.keys(config.moduleGraphs));

  for (const module of dependencyModules) {
    if (!configuredModules.has(module)) fail(`pipeline ${config.id} is missing module graph for ${module}`);
    const moduleGraph = moduleGraphs[module];
    if (!moduleGraph) fail(`module graph was not loaded for ${module}`);
    validateModuleGraph(moduleGraph, module, patchById);
  }
  for (const module of configuredModules) {
    if (!dependencyModules.has(module)) fail(`pipeline ${config.id} config contains unknown module graph ${module}`);
  }

  const directPatchModules = dependencyGraph.nodes
    .map((node) => node.id)
    .filter((module) => moduleGraphs[module].patches.some((node) => node.id.toLowerCase() === patch.id.toLowerCase()));

  if (directPatchModules.length === 0) {
    fail(`patch ${patch.id} is not activated in any ${config.id} module graph`);
  }

  const plan = buildFigmaPipelinePlan(dependencyGraph, directPatchModules, config.defaultMaxRepairs);
  const modules = plan.map((item): ResolvedModuleTask => {
    const moduleGraph = moduleGraphs[item.id];
    const patchNode = moduleGraph.patches.find((node) => node.id.toLowerCase() === patch.id.toLowerCase());
    const state = stateBeforeOrAt(moduleGraph, patch.sequence, patchById);

    if (patchNode) {
      return {
        id: item.id,
        scope: item.scope,
        mode: "PATCH",
        maxRepairs: item.maxRepairs,
        state,
        patch: {
          id: patchNode.id,
          parent: patchNode.parent,
          taskDoc: patchNode.taskDoc,
          stateDocs: patchNode.stateDocs,
        },
        inputDocs: unique([patchNode.taskDoc, ...patchNode.stateDocs]),
      };
    }

    return {
      id: item.id,
      scope: item.scope,
      mode: "COMPATIBILITY",
      maxRepairs: item.maxRepairs,
      state,
      inputDocs: unique(state.docs),
    };
  });

  return {
    version: 1,
    provider: "grip-task-provider",
    pipeline: config.id,
    executor: config.executor,
    patch,
    dependency: {
      graph: config.dependencyGraph,
      directPatchModules,
      affectedModules: modules.map((module) => module.id),
    },
    modules,
    resolvedAt,
  };
}
