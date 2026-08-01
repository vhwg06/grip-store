export function readDomainState(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const value = payload as { state?: unknown; status?: unknown };
  if (typeof value.state === "string") return value.state;
  return typeof value.status === "string" ? value.status : undefined;
}
