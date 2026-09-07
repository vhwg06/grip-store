import type { ModuleGraph, PatchRegistry, PipelineConfig } from "./resolver";

export interface TaskDefinition {
  id: string;
  pipeline: string;
  patch?: string;
  checkpoint?: string;
}

export interface WorkloadResolveContext {
  root: string;
  definition: TaskDefinition;
  config: PipelineConfig;
  registry: PatchRegistry;
  dependencyInput: unknown;
  moduleGraphs: Record<string, ModuleGraph>;
  readJson<T>(relativePath: string, label: string): T;
}

export interface WorkloadExecutionContext<TResolved = unknown> {
  root: string;
  taskPath: string;
  task: TResolved;
}

export interface TaskWorkload<TResolved = unknown> {
  readonly type: string;
  resolve(context: WorkloadResolveContext): TResolved;
  validateResolved(context: WorkloadExecutionContext<TResolved>): void;
  describe(task: TResolved): string[];
  execute(context: WorkloadExecutionContext<TResolved>): void;
  inputDocs(task: TResolved): string[];
}
