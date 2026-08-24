export type HarnessMode = "write" | "repair" | "verify";

export type VerificationDecision = "pass" | "repair" | "fail_budget" | "fail_verification";

export const reviewerVisualFallbackPolicy = [
  "Use a bounded review: inspect only the supplied SRS and UI/UX research inputs plus the actual Figma scope; do not run repo-wide searches.",
  "Do not read Feature/Gherkin, frontend/backend code, or unrelated documents in this Figma phase.",
  "Do not use Playwright or PowerShell/cmd shell workarounds for visual evidence; use figma-mcp-go and the supplied node data.",
  "Visual sampling is bounded evidence, not a prerequisite for completing the independent review.",
  "Do not retry a timed-out screenshot call indefinitely; after one retry, continue with node inspection.",
  "Use search_nodes, get_nodes_info, bounds, text, styles, and state structure to assess the artifact when screenshots are unavailable.",
  "After the relevant evidence is sufficient, stop tool calls and return the JSON required by the schema.",
  "A screenshot timeout is not itself a pass or fail; complete the independent review and report evidence-backed defects.",
].join("\n");

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
