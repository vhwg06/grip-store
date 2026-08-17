export type SupervisionTimeoutReason = "run" | "idle" | null;

export function supervisionTimeoutReason(
  now: number,
  lastActivityAt: number,
  runDeadline: number,
  idleTimeoutMs: number,
): SupervisionTimeoutReason {
  if (now >= runDeadline) return "run";
  if (idleTimeoutMs > 0 && now - lastActivityAt >= idleTimeoutMs) return "idle";
  return null;
}

interface CodexEvent {
  type?: string;
  message?: string;
  error?: string | { message?: string };
}

function eventMessage(event: CodexEvent): string {
  if (typeof event.error === "string") return event.error;
  if (event.error && typeof event.error.message === "string") return event.error.message;
  if (typeof event.message === "string") return event.message;
  return event.type ?? "unknown Codex failure";
}

/**
 * Codex exec is an event stream, and its outer process exit status is not a
 * sufficient task-success signal. Return a terminal stream failure only when
 * the latest terminal turn event is failed/error; a later turn.completed means
 * the run recovered and completed normally.
 */
export function codexTerminalFailure(jsonl: string): string | null {
  let failure: string | null = null;

  for (const line of jsonl.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as CodexEvent;
      if (event.type === "turn.failed" || event.type === "error") {
        failure = `${event.type}: ${eventMessage(event)}`;
      } else if (event.type === "turn.completed") {
        failure = null;
      }
    } catch {
      // Non-JSON noise is diagnostic output, not a Codex terminal event.
    }
  }

  return failure;
}
