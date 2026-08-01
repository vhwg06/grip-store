export type ProblemDetails = {
  status?: number;
  title?: string;
  detail?: string;
  code?: string;
};

export function readProblemDetails(payload: unknown): ProblemDetails {
  if (!payload || typeof payload !== "object") return {};
  return payload as ProblemDetails;
}
