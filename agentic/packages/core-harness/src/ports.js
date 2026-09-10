import { assertPort } from "./contracts.js";

export function validateCorePorts({
  environment,
  evaluator,
  sessionStore,
  contextResolver = null,
  memoryConsolidator = null,
  supervisor = null
}) {
  assertPort(environment, "observe", "environment port");
  assertPort(environment, "act", "environment port");
  assertPort(evaluator, "evaluate", "evaluation port");
  assertPort(sessionStore, "load", "session store port");
  assertPort(sessionStore, "save", "session store port");

  if (contextResolver) assertPort(contextResolver, "resolve", "context resolver port");
  if (memoryConsolidator) assertPort(memoryConsolidator, "consolidate", "memory consolidator port");
  if (supervisor) assertPort(supervisor, "inspect", "supervisor port");
}
