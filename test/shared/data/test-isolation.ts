import type { ScenarioWorld } from "../cucumber/world";

let runId: string | undefined;

export function testRunId(): string {
  runId ??= process.env.TEST_RUN_ID?.trim() || crypto.randomUUID();
  return runId;
}

export function scenarioNamespace(world: ScenarioWorld): string {
  const scenarioId = world.scenarioId ?? "unknown-scenario";
  return `e2e:${testRunId()}:${scenarioId}`;
}

export function isolatedReference(world: ScenarioWorld, value: string): string {
  return `${scenarioNamespace(world)}:${value}`;
}

export type CleanupTask = () => Promise<void>;

export async function runCleanup(tasks: CleanupTask[]): Promise<void> {
  const failures: unknown[] = [];
  for (const task of tasks.reverse()) {
    try {
      await task();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length > 0) {
    throw new Error(`Test data cleanup failed for ${failures.length} resource(s).`);
  }
}
