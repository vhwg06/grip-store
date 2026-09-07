import {
  resolveIntegrationTask,
  type IntegrationStagePlan,
  type ResolvedIntegrationTask,
} from "../../integration-resolver";
import { resolveTask, type ResolvedTask } from "../../resolver";
import type { TaskWorkload, WorkloadResolveContext } from "../../workload";
import { executeFigmaWorkload } from "./executor";
import { modulePatchPolicy } from "./policies/module-patch";
import { productIntegrationPolicy } from "./policies/product-integration";

export type FigmaResolverType = "patch" | "checkpoint";
export type FigmaPolicyType = "module-patch" | "product-integration";

interface FigmaPipelineConfig {
  workload: "figma";
  resolver: FigmaResolverType;
  policy: FigmaPolicyType;
  stagePlan?: string;
}

export type ResolvedFigmaTask = (ResolvedTask | ResolvedIntegrationTask) & {
  workload: "figma";
  policy: FigmaPolicyType;
};

function configOf(context: WorkloadResolveContext): WorkloadResolveContext["config"] & FigmaPipelineConfig {
  const config = context.config as WorkloadResolveContext["config"] & Partial<FigmaPipelineConfig>;
  if (config.workload !== "figma") throw new Error(`figma workload received workload=${String(config.workload)}`);
  if (config.resolver !== "patch" && config.resolver !== "checkpoint") {
    throw new Error(`figma workload has unsupported resolver ${String(config.resolver)}`);
  }
  if (config.policy !== "module-patch" && config.policy !== "product-integration") {
    throw new Error(`figma workload has unsupported policy ${String(config.policy)}`);
  }
  return config as WorkloadResolveContext["config"] & FigmaPipelineConfig;
}

function resolvePatch(context: WorkloadResolveContext): ResolvedTask {
  const { definition, config, registry, dependencyInput, moduleGraphs } = context;
  if (!definition.patch?.trim() || definition.checkpoint) {
    throw new Error(`task ${definition.id} routed to figma patch resolver must define patch only`);
  }
  return resolveTask(config, registry, dependencyInput, moduleGraphs, definition.patch);
}

function resolveCheckpoint(context: WorkloadResolveContext, config: FigmaPipelineConfig): ResolvedIntegrationTask {
  const { definition, registry, dependencyInput, moduleGraphs, readJson } = context;
  if (!definition.checkpoint?.trim() || definition.patch) {
    throw new Error(`task ${definition.id} routed to figma checkpoint resolver must define checkpoint only`);
  }
  if (!config.stagePlan?.trim()) throw new Error(`pipeline ${context.config.id} is missing stagePlan`);
  const stagePlan = readJson<IntegrationStagePlan>(config.stagePlan, "integration stage plan");
  return resolveIntegrationTask(
    context.config as Parameters<typeof resolveIntegrationTask>[0],
    registry,
    dependencyInput,
    moduleGraphs,
    definition.checkpoint,
    stagePlan,
  );
}

const resolvers: Record<FigmaResolverType, (context: WorkloadResolveContext, config: FigmaPipelineConfig) => ResolvedTask | ResolvedIntegrationTask> = {
  patch: (context) => resolvePatch(context),
  checkpoint: (context, config) => resolveCheckpoint(context, config),
};

export const figmaWorkload: TaskWorkload<ResolvedFigmaTask> = {
  type: "figma",

  resolve(context) {
    const config = configOf(context);
    if (config.resolver === "patch" && config.policy !== "module-patch") {
      throw new Error(`figma patch resolver requires module-patch policy`);
    }
    if (config.resolver === "checkpoint" && config.policy !== "product-integration") {
      throw new Error(`figma checkpoint resolver requires product-integration policy`);
    }
    const resolved = resolvers[config.resolver](context, config);
    return {
      ...resolved,
      workload: "figma",
      policy: config.policy,
    } as ResolvedFigmaTask;
  },

  validateResolved({ task }) {
    if (task.version !== 1 || task.provider !== "grip-task-provider" || task.workload !== "figma") {
      throw new Error("resolved Figma task must be version 1 from grip-task-provider with workload=figma");
    }
    if (task.policy === "module-patch" && !("patch" in task)) {
      throw new Error("module-patch policy requires a resolved patch task");
    }
    if (task.policy === "product-integration" && !("checkpoint" in task)) {
      throw new Error("product-integration policy requires a resolved checkpoint task");
    }
  },

  inputDocs(task) {
    if (task.policy === "product-integration") {
      return (task as ResolvedIntegrationTask).inputDocs;
    }
    return [...new Set((task as ResolvedTask).modules.flatMap((module) => module.inputDocs))];
  },

  describe(task) {
    if (task.policy === "module-patch") {
      const patchTask = task as ResolvedTask;
      return [
        `workload=figma policy=module-patch`,
        `patch=${patchTask.patch.id} (${patchTask.patch.label})`,
        `direct=${patchTask.dependency.directPatchModules.join(", ")}`,
        `affected=${patchTask.dependency.affectedModules.join(" -> ")}`,
        ...patchTask.modules.map(
          (module) =>
            `${module.id} mode=${module.mode} state=${module.state.id}` +
            (module.patch ? ` patch=${module.patch.id}` : ""),
        ),
      ];
    }

    const integrationTask = task as ResolvedIntegrationTask;
    return [
      `workload=figma policy=product-integration`,
      `checkpoint=${integrationTask.checkpoint.id} (${integrationTask.checkpoint.label})`,
      `plan=${integrationTask.plan.id} (${integrationTask.plan.label})`,
      `modules=${integrationTask.dependency.modules.join(" -> ")}`,
      ...integrationTask.modules.map((module) => `${module.id} state=${module.state.id}`),
      ...integrationTask.plan.stages.map(
        (stage, index) => `stage ${index + 1}. ${stage.id} mode=${stage.mode} mutation=${String(stage.mutation)}`,
      ),
    ];
  },

  execute({ root, taskPath, task }) {
    if (task.policy === "module-patch") {
      executeFigmaWorkload(root, taskPath, task as ResolvedTask, modulePatchPolicy);
      return;
    }
    executeFigmaWorkload(root, taskPath, task as ResolvedIntegrationTask, productIntegrationPolicy);
  },
};
