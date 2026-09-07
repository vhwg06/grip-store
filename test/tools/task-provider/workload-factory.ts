import type { TaskWorkload } from "./workload";
import { figmaWorkload } from "./workloads/figma";

const workloads: Record<string, TaskWorkload<any>> = {
  [figmaWorkload.type]: figmaWorkload,
};

export function createWorkload(type: string): TaskWorkload<any> {
  const key = type.trim().toLowerCase();
  const workload = workloads[key];
  if (!workload) throw new Error(`unsupported workload type: ${type}`);
  return workload;
}
