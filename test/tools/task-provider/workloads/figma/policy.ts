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
