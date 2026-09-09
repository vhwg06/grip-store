export type TargetResolution = "RESOLVED" | "NOT_FOUND" | "AMBIGUOUS" | "UNKNOWN";
export type ReviewDecision = "PASS" | "WRITE" | "DOC_GAP" | "FAIL";

export interface FigmaExecutionUnit {
  id: string;
  scope: string;
  docs: string[];
  maxRepairs: number;
  target: string;
  metadata?: Record<string, unknown>;
}

export interface FigmaExecutionPolicy<TTask = unknown> {
  readonly id: string;
  readonly artifactPrefix: string;
  units(task: TTask): FigmaExecutionUnit[];
  decideReview(task: TTask, unit: FigmaExecutionUnit, summary: string, exitCode: number | null): ReviewDecision;
  verifyAfterWrite(task: TTask, unit: FigmaExecutionUnit, summary: string, exitCode: number | null): boolean;
  /**
   * Number of independent writer invocations owned by the workload executor.
   * Defaults to 1. Use a policy-driven outer loop when policy-specific terminal
   * classifications must be re-evaluated after every mutation.
   */
  maxWriteAttempts?(task: TTask, unit: FigmaExecutionUnit): number;
  /**
   * Repair budget delegated to each child figma:harness writer invocation.
   * Defaults to unit.maxRepairs. A policy-driven outer loop can set this to 0
   * so every mutation is followed immediately by a policy-visible fresh review.
   */
  childRepairBudget?(task: TTask, unit: FigmaExecutionUnit): number;
  /**
   * Optional policy classification after a writer invocation. Defaults to
   * verifyAfterWrite => PASS/FAIL. Returning WRITE continues the bounded outer
   * loop; DOC_GAP stops immediately without another writer invocation.
   */
  decideAfterWrite?(
    task: TTask,
    unit: FigmaExecutionUnit,
    summary: string,
    exitCode: number | null,
  ): ReviewDecision;
  evidence(task: TTask, results: FigmaExecutionResult[]): Record<string, unknown>;
}

export interface FigmaExecutionResult {
  id: string;
  review: "PASS" | "NEEDS_UPDATE" | "DOC_GAP" | "FAILED" | "NOT_RUN";
  updated: boolean;
  status: "PASS" | "FAILED" | "NOT_RUN";
  reviewExitCode: number | null;
  updateExitCode: number | null;
  reviewRun: string | null;
  writeRun: string | null;
  message?: string;
}

export function targetResolution(summary: string): TargetResolution {
  const upper = summary.toUpperCase();
  if (upper.startsWith("TARGET_RESOLVED:")) return "RESOLVED";
  if (upper.startsWith("TARGET_NOT_FOUND:")) return "NOT_FOUND";
  if (upper.startsWith("TARGET_AMBIGUOUS:")) return "AMBIGUOUS";
  return "UNKNOWN";
}
