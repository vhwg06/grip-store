export type ReviewDecision = "pass" | "repair" | "fail_budget";

export function decideAfterReview(
  reviewPassed: boolean,
  repairsUsed: number,
  maxRepairs: number,
): ReviewDecision {
  if (reviewPassed) return "pass";
  if (repairsUsed >= maxRepairs) return "fail_budget";
  return "repair";
}

export function maximumReviewCount(maxRepairs: number): number {
  return maxRepairs + 1;
}
