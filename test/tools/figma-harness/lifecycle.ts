export type HarnessMode = "write" | "repair" | "verify";

export type VerificationDecision = "pass" | "repair" | "fail_budget" | "fail_verification";

export function initialWriterRequired(mode: HarnessMode): boolean {
  return mode === "write";
}

export function decideAfterVerification(
  verificationPassed: boolean,
  mode: HarnessMode,
  repairsUsed: number,
  maxRepairs: number,
): VerificationDecision {
  if (verificationPassed) return "pass";
  if (mode === "verify") return "fail_verification";
  if (repairsUsed >= maxRepairs) return "fail_budget";
  return "repair";
}

export function maximumReviewCount(mode: HarnessMode, maxRepairs: number): number {
  return mode === "verify" ? 1 : maxRepairs + 1;
}
